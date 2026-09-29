# SkillDad Mobile App — Architecture & Plan

Status: Draft v1 · Owner: Adithyan · Developer: (colleague, Flutter beginner)
Companion doc: [02-FLUTTER-DEVELOPER-GUIDE.md](02-FLUTTER-DEVELOPER-GUIDE.md)

---

## 1. Goal and scope

Build a native Flutter app (Android first, iOS after) that **reuses the existing web backend unchanged wherever possible**. No new backend, no new database.

### MVP scope (v1)

| Role | What they get in v1 |
|---|---|
| **Student** (primary) | Login, dashboard, My Courses, course player for **recorded lessons and recorded live-session recordings**, mark lesson complete / progress, certificates list, notifications list, profile + logout |
| **Admin** | Login, dashboard stats, users list, students list (read-only), live sessions list |
| **University / Partner / Finance / Sales** | Login + a **basic read-only dashboard** (the stat cards their web dashboard already shows) + profile + logout |

### Explicitly out of scope for v1

Payments/enrolment checkout (Razorpay; also triggers App Store/Play billing rules — see §9), exams and proctoring (`/api/exams`, WebSocket integrity), live class joining (Jitsi), whiteboard, course creation/editing, CMS, study abroad, course finder, placements, discussions, admin payment/reconciliation/monitoring screens. These are all candidates for v2+.

Rule for scope: **if it isn't in the table above, the answer is "v2".**

---

## 2. What we found in the existing project

| Area | Finding | Impact on mobile |
|---|---|---|
| Backend | Node + Express 5, **PostgreSQL** (`pg`), Redis, Socket.io, in `server/` | Reuse as-is |
| Base URL | Production: `https://skilldad.com/api/...` (nginx in front) | Mobile base URL = `https://skilldad.com` |
| Auth | `POST /api/users/login` → `{_id, name, email, role, token, ...}`. Token is a JWT, **30 days, no refresh token**. Sent as `Authorization: Bearer <token>`. Server re-reads the user from DB on every request. | Easy. Store token in secure storage; on any `401` → log out. |
| CSRF | Only applied to `/api/payment` and admin-payment routes | Not relevant to v1 |
| CORS | Allows requests with **no Origin** (native apps send none) | No change needed |
| Roles | `student, admin, university, partner, finance, sales` (checked lowercase server-side via `protect` + `authorize(...)`) | Role from login response drives which dashboard opens |
| Rate limiting | `apiLimiter` on several routers | Avoid chatty polling; cache; don't call in loops |
| Media | Uploaded files served **unauthenticated** at `/uploads/...`; DB often stores relative paths (`/uploads/x.mp4`) | Mobile must prefix base URL (port `client/src/utils/media.js` `getMediaUrl`) |
| Video types | Lesson `videoType` can be direct file (`/uploads/*.mp4`), `zoom-recording` / `live-recording` (`recordingUrl` or `zoomRecording.playUrl`), external embeds (Zoom rec / Vimeo / YouTube), or empty | Player must handle: direct mp4 → native player; embed URLs → WebView |
| Session recording | `GET /api/sessions/:id/recording/playback` → `{playUrl}` | Use for the "recorded sessions" list |
| Existing mobile work | `client/capacitor.config.json` — a Capacitor wrapper that just loads `https://skilldad.com` in a shell | It is **not** a real app. Keep as a fallback demo only; don't build on it. |
| Data shapes | Legacy Mongo→Postgres migration: responses mix `_id`/`id`, snake_case and camelCase, JSON columns sometimes arrive as **strings** | Parse defensively (see guide §7). Verify every endpoint with `curl` before modelling it. |

### API endpoints the MVP will use

> These come from reading the route files and web pages. **Response shapes are not verified** — Week 1 task is to hit each one with curl/Postman and save a sample JSON in `mobile/docs/api-samples/`.

**Common:** `POST /api/users/login`, `GET /api/users/me`, `PUT /api/users/profile`, `POST /api/users/forgotpassword`, `GET /api/notifications/my`, `PUT /api/notifications/read`

**Student:** `GET /api/enrollment/my-courses`, `GET /api/courses/:id`, `PUT /api/enrollment/progress`, `GET /api/progress/:userId/:courseId`, `GET /api/sessions` , `GET /api/sessions/course/:courseId`, `GET /api/sessions/:id/recording/playback`, `GET /api/certificates/my`

**Admin:** `GET /api/admin/stats`, `GET /api/admin/analytics`, `GET /api/admin/users`, `GET /api/admin/students`, `GET /api/sessions`

**University:** `GET /api/university/stats`, `GET /api/university/courses` · **Partner:** `GET /api/partner/stats`, `GET /api/partner/students` · **Finance:** `GET /api/finance/stats` · **Sales:** `GET /api/sales/applications`

---

## 3. Architecture

```
┌──────────────────────────── Flutter app ────────────────────────────┐
│  Presentation   Screens + Widgets (per feature)                     │
│       │           watches ↓                                          │
│  State          Riverpod providers (loading / data / error)         │
│       │           calls ↓                                           │
│  Data           Repositories → ApiClient (Dio) → Models (fromJson)  │
│       │                                                             │
│  Core           auth token store · router · theme · error handling  │
└───────────────────────────────┬─────────────────────────────────────┘
                                │ HTTPS + Bearer JWT
                    https://skilldad.com/api  (existing Express + Postgres)
```

### Decisions (and why — so she can defend/learn them)

| Decision | Choice | Why |
|---|---|---|
| Framework | **Flutter (stable), Dart 3** | Team decision |
| State management | **Riverpod** (`flutter_riverpod`) | Closest mental model to React hooks/context + React Query; compile-safe; very well covered by AI assistants |
| Navigation | **go_router** | URL-style routes (like react-router), built-in auth redirect |
| HTTP | **Dio** with interceptors | Same idea as her axios interceptor in `axiosConfig.js` |
| Token storage | **flutter_secure_storage** | Keychain/Keystore, not `localStorage` equivalent |
| Models | **Hand-written Dart classes with `fromJson`** for v1 | No code-gen (`freezed`/`build_runner`) while learning; can migrate later |
| Video | **video_player + chewie** (mp4), **webview_flutter** (embeds) | Standard, stable |
| Folder layout | **Feature-first** (see below) | Each role/feature is self-contained; matches how web `pages/student`, `pages/admin` are split |
| Env config | `--dart-define=API_BASE_URL=...` | Different URLs for local/staging/prod without code edits |
| Testing | `flutter_test` for models + repositories (mock Dio) | Start small; models are where the data-shape bugs are |
| Push notifications | **Phase 2** (FCM) — needs a small backend addition | Not needed for MVP |

### Project structure

```
skilldad_mobile/            (new repo or /mobile in monorepo — see §8)
  lib/
    main.dart
    app.dart                      # MaterialApp.router + theme
    core/
      config/env.dart             # API_BASE_URL
      network/api_client.dart     # Dio + auth interceptor
      network/api_exception.dart
      storage/token_store.dart
      router/app_router.dart      # go_router + role redirect
      theme/app_theme.dart        # colours from web (#4C1D95, #6D28FF)
      utils/media_url.dart        # port of getMediaUrl
      widgets/                    # shared: LoadingView, ErrorView, StatCard
    features/
      auth/        (data/ domain/ presentation/)   login, forgot password, session
      student/
        dashboard/ courses/ player/ sessions/ certificates/
      admin/
        dashboard/ users/ students/ sessions/
      roles_basic/                # university, partner, finance, sales dashboards
      notifications/
      profile/
  test/
  docs/api-samples/
```

Rule of thumb inside a feature: `data/` (models + repository) never imports from `presentation/`.

### Auth & role routing flow

1. App start → read token from secure storage → if none, go to `/login`.
2. Login → `POST /api/users/login` → save `token` + `role` + basic user → route by role:
   `student → /student`, `admin → /admin`, `university|partner|finance|sales → /home/<role>`.
3. Dio interceptor adds `Authorization: Bearer`. On **401** → clear storage → `/login`.
4. `go_router` `redirect` guards each role's route tree (a student can't open `/admin/*` by deep link).
5. Server is still the real authority (`authorize(...)`); the app's role check is UX only.

---

## 4. Backend changes

**Needed for MVP: none required to start.** Recommended small hardening, in priority order:

| # | Change | When | Effort |
|---|---|---|---|
| 1 | Confirm production is HTTPS-only and reachable from mobile networks (no reliance on the `13.127.134.120` HTTP origin) | Week 1 | Verify only |
| 2 | Add `GET /api/app/config` → `{minVersion, maintenance}` so old app versions can be forced to update | Before release | Small |
| 3 | Refresh-token or shorter token + silent re-login (30-day token with no revocation is weak on lost phones) | v1.1 | Medium |
| 4 | `POST /api/users/device-token` + FCM send in `NotificationService` | Phase 2 | Medium |
| 5 | Auth-protect or sign `/uploads` recordings (currently anyone with URL can watch) | v1.1 | Medium — affects web too |
| 6 | Consistent response shapes / `{data, error}` envelope | Never as a big-bang; add only on new endpoints | — |

Any backend change must be reviewed by whoever owns the server and must **not break the web client**.

---

## 5. Phased plan

Assumes one developer, part-time learning + building, AI-assisted, with Adithyan reviewing. Adjust dates after Phase 0.

| Phase | Duration | Outcome | Exit check |
|---|---|---|---|
| **0 — Foundations** | Week 1 | Flutter installed, Dart basics, Flutter "counter" + a hand-built static list screen, API samples collected via curl | Runs on emulator + a real phone; `docs/api-samples/` filled |
| **1 — Skeleton + Auth** | Week 2 | Project structure, theme, Dio client, login screen, secure token, role-based redirect, logout | Each of 6 role accounts logs in and lands on the right placeholder |
| **2 — Student dashboard** | Weeks 3–4 | Dashboard, My Courses, course detail (modules/lessons), progress bars, pull-to-refresh, error/empty states | Matches web numbers for the same student |
| **3 — Recorded playback** | Weeks 4–5 | Player for mp4 + recorded sessions + embeds, mark complete, resume, certificates list | Play 3 real lessons of each `videoType`; progress persists on web too |
| **4 — Admin** | Week 6 | Stats, users, students, sessions lists with search + pagination | Numbers match web admin |
| **5 — Other roles** | Week 7 | University/Partner/Finance/Sales basic dashboards | Match web stat cards |
| **6 — Polish & release** | Week 8 | App icon/splash, offline/error handling, min-version gate, Android release build, internal testing track | Signed AAB on Play Internal Testing |
| iOS | +1–2 wks | Needs Mac, Apple Developer account ($99/yr) | TestFlight build |

**Learning is built in:** every phase ends with a 30-minute review where she explains (not just shows) what she built. See the guide.

### Definition of done for any screen
Loading state · error state with retry · empty state · works on small phone · no hard-coded URLs · reviewed PR.

---

## 6. Risks

| Risk | Mitigation |
|---|---|
| Inconsistent API shapes crash the app | Save real sample JSON first; write model tests against those samples; every `fromJson` tolerates missing/renamed fields |
| Video formats fail (Zoom embed, `.mov`) | Phase 3 tests each `videoType` early; WebView fallback; "Open in browser" last resort |
| Beginner over-relies on AI and can't debug | Rules in guide §9: small steps, read every generated line, weekly explain-back |
| Scope creep from web feature list | §1 table is the contract; new asks go to a v2 list |
| Rate limits / chatty screens | One request per screen load, cache in providers, no polling |
| Store review (payments, login-required apps, privacy) | See §9 |

---

## 7. Test accounts & environments

Create (on a **non-production** DB if one exists, otherwise clearly-named prod test users): one account per role — student (enrolled in 2 courses incl. one with recordings), admin, university, partner, finance, sales. Keep credentials in the team password manager, **never in the repo**.

Local backend: `cd server && npm run dev` (needs `.env` per `server/docs/ENVIRONMENT_VARIABLES.md`). Android emulator reaches host at `http://10.0.2.2:<PORT>`; real phone needs LAN IP or the staging URL. Cleartext HTTP needs an Android network-security exception **in debug only**.

---

## 8. Repo layout recommendation

Put the Flutter app in **`/mobile`** inside the existing repo (monorepo): shared history, she can read `server/` and `client/` next to it, and API changes + app changes ship in one PR. Add `mobile/` to any deploy scripts' ignore list (`update-aws.sh`, `server-setup.sh`) so it isn't shipped to the server.

Branching: `main` protected; feature branches `mobile/<feature>`; small PRs (<400 lines) reviewed by Adithyan.

---

## 9. Store & compliance notes (decide early)

- **Payments:** Selling course access inside iOS/Android apps can require Apple/Google in-app billing (30% cut). v1 has no purchase flow — students sign in to already-enrolled content. Keep it that way until a decision is made.
- **Login-required apps** need working **demo credentials** in the review notes.
- **Account deletion:** Apple requires an in-app path to delete/request deletion of the account if you can create accounts in-app. Since v1 has no in-app registration, this is likely not triggered, but confirm before adding Register.
- **Privacy policy URL** (exists on web: `/privacy`) is required in both stores.
- **Google Play** needs a Play Developer account ($25 one-time); new personal accounts must run a closed test with testers before production. Use an organisation account if possible.
- App id already used by the Capacitor stub: `com.skilldad.app` — reuse it for the Flutter app so it isn't wasted.

---

## 10. Open questions for Adithyan

1. Is there a staging backend/DB, or do we develop against production with test users?
2. Can students' recordings stay publicly reachable via `/uploads` for v1 (see §4 #5)?
3. Which Play/Apple accounts exist, and under whose name?
4. Do we want the app name/branding assets (icon, splash) from the web team?
5. Target Android version / device floor? (Suggest Android 8+, iOS 13+.)
