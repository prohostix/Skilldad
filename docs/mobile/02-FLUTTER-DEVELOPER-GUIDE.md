# Flutter Developer Guide — SkillDad Mobile

Audience: a developer who knows this web app (React + Node) but has **never used Flutter/Dart**.
Read [01-ARCHITECTURE-AND-PLAN.md](01-ARCHITECTURE-AND-PLAN.md) first (15 min). This guide is the "how".

The approach: **learn by building, in small verified steps**. You already understand HTTP, JWT, components, state, routing. Flutter is the same ideas with different syntax. Don't try to learn all of Flutter first.

---

## 1. Your mental map: React → Flutter

| You know (React/web) | Flutter/Dart equivalent |
|---|---|
| JavaScript / JSX | **Dart** (typed, `class`, `final`, `async/await`, null-safety `?`) |
| Component (function returning JSX) | **Widget** (`StatelessWidget` / `ConsumerWidget`) — everything is a widget, including padding and centering |
| `useState` | `StatefulWidget` + `setState`, or a Riverpod provider (we use Riverpod) |
| `useContext` / Redux / Zustand | **Riverpod** providers |
| React Query / `useEffect` + fetch | `FutureProvider` / `AsyncNotifier` (gives loading / error / data for free) |
| `react-router-dom` | **go_router** |
| axios + interceptors (`utils/axiosConfig.js`) | **Dio** + interceptors |
| `localStorage` (token) | **flutter_secure_storage** |
| Tailwind / CSS | `ThemeData`, `Padding`, `Row`, `Column`, `Container`, `SizedBox` |
| flexbox | `Row` / `Column` / `Expanded` / `Flexible` |
| `<ul>.map()` | `ListView.builder` |
| `package.json` | `pubspec.yaml` |
| `npm install x` | `flutter pub add x` |
| `npm run dev` (hot reload) | `flutter run` (press `r` hot reload, `R` restart) |
| Chrome DevTools | Flutter DevTools (Inspector, Network) |
| `.env` / `import.meta.env.VITE_*` | `--dart-define=API_BASE_URL=...` |
| ESLint | `flutter analyze` (run it constantly) |
| Vitest | `flutter test` |

Where to look in the web code when you need the "real" behaviour: it's the spec.
- Login/token/401 behaviour → `client/src/utils/axiosConfig.js`, `client/src/pages/Login.jsx`
- Role routing → `client/src/App.jsx`
- Student data → `client/src/pages/student/StudentDashboard.jsx`, `MyCourses.jsx`, `CoursePlayer.jsx`
- Recording playback → `client/src/components/MeetingRecordingPlayer.jsx`
- Media URL fixing → `client/src/utils/media.js`
- Server side → `server/routes/*.js` → `server/controllers/*.js`

---

## 2. Week 0 (≈1 week): setup + just enough Dart/Flutter

### 2.1 Install
1. Install Flutter (stable) from flutter.dev, then run `flutter doctor` until it's green for Android (and Xcode if you're on a Mac).
2. Android Studio → SDK Manager → install an SDK + create an **emulator** (Pixel, API 34).
3. VS Code + **Flutter** and **Dart** extensions (or Android Studio).
4. Enable USB debugging on a real Android phone and confirm `flutter devices` lists it. Real-device testing matters for video.

### 2.2 Learn (in this order, time-boxed)
| Topic | Resource | Time |
|---|---|---|
| Dart syntax for JS devs | dart.dev/language (skim: variables, functions, classes, null safety, async/await, collections) and "Dart for JavaScript developers" | 3 h |
| Widgets & layout | flutter.dev → Learn → "Layouts in Flutter" and "Widget catalog" (Row, Column, Container, ListView, Card, Padding) | 3 h |
| Build the codelab app | flutter.dev "Write your first Flutter app" | 2 h |
| State basics | `setState` vs Riverpod (riverpod.dev "Getting started") | 3 h |
| Networking | flutter.dev cookbook: "Fetch data from the internet" — then swap `http` for Dio | 2 h |

You do **not** need: animations, custom painters, platform channels, Bloc, GetX, code-gen. Skip them.

### 2.3 Week 0 exercises (must finish before Phase 1)
1. Create a throwaway app: `flutter create scratch_app`. Change the counter to a screen showing a hard-coded list of 5 courses using `ListView.builder` and `Card`. Run on emulator **and** phone.
2. In the same app, fetch `https://jsonplaceholder.typicode.com/posts` and show the titles with loading + error states.
3. Collect API samples (§5 below). This teaches you the real data.

> ✅ **Explain-back #1:** In 10 minutes, explain to Adithyan what a Widget is, what hot reload does, and what `async/await` does in your fetch.

---

## 3. How to use AI properly (this is what makes you *capable*, not just fast)

AI is great here; used badly it produces an app you can't maintain. Ground rules:

1. **Ask for one small thing at a time.** "Make a login screen" ✗ → "Create a `LoginScreen` with email + password `TextFormField`s and a submit button; no networking yet" ✓.
2. **Give context every time:** paste the relevant existing file, the pinned package versions from `pubspec.yaml`, and say "Flutter stable, Riverpod, go_router, Dio, no code generation".
3. **Read every line before pasting.** If you can't explain a line, ask the AI: "Explain this line as if I know React but not Dart." Then write the explanation in a `// comment` if it's non-obvious.
4. **Run it, then run `flutter analyze`.** Zero warnings before commit.
5. **AI versions drift.** Riverpod/go_router/Dio APIs change between major versions. If code doesn't compile, check the package's changelog on pub.dev before "fixing" by guesswork. Pin versions in `pubspec.yaml`.
6. **Never let AI invent API shapes.** Paste a real sample JSON from `docs/api-samples/` and generate the model from it.
7. **Don't paste secrets** (JWT_SECRET, DB URLs, real user passwords, tokens) into any AI tool.
8. **Learning loop per feature:** ask AI to build → you rewrite one part from scratch without AI → explain it back. Do the rewrite on the *simplest* piece each time (a model, a list tile, a provider).
9. When stuck > 30 minutes, ask Adithyan. Don't grind alone.

Good prompt template:
```
Context: Flutter stable, flutter_riverpod <version>, go_router <version>, dio <version>. No codegen.
Existing file: <paste>
Sample API JSON: <paste>
Task: <one small thing>
Constraints: follow the folder structure in docs/mobile/01 §3; handle loading/error/empty; explain new Dart concepts briefly.
```

---

## 4. Phase 1 — Project skeleton + auth (Week 2)

### 4.1 Create the project
```bash
cd /path/to/Skilldad
flutter create --org com.skilldad --project-name skilldad_mobile mobile
cd mobile
flutter pub add flutter_riverpod go_router dio flutter_secure_storage
flutter run
```
(Android package will be `com.skilldad.skilldad_mobile`; change to `com.skilldad.app` in `android/app/build.gradle*` `applicationId` before the first Play upload — decide now, it can't change after release.)

Create the folders from architecture doc §3.

### 4.2 Config
`lib/core/config/env.dart`
```dart
class Env {
  // flutter run --dart-define=API_BASE_URL=https://skilldad.com
  static const apiBaseUrl =
      String.fromEnvironment('API_BASE_URL', defaultValue: 'https://skilldad.com');
}
```
Android emulator → local server: `--dart-define=API_BASE_URL=http://10.0.2.2:5000` (check `PORT` in server `.env`). Cleartext needs `android:usesCleartextTraffic="true"` in **debug** manifest only (`android/app/src/debug/AndroidManifest.xml`).

### 4.3 Token store
`lib/core/storage/token_store.dart`
```dart
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class TokenStore {
  final _s = const FlutterSecureStorage();
  static const _kToken = 'token';
  static const _kRole = 'role';

  Future<void> save(String token, String role) async {
    await _s.write(key: _kToken, value: token);
    await _s.write(key: _kRole, value: role);
  }
  Future<String?> token() => _s.read(key: _kToken);
  Future<String?> role() => _s.read(key: _kRole);
  Future<void> clear() => _s.deleteAll();
}
```

### 4.4 API client (mirror of `axiosConfig.js`)
`lib/core/network/api_client.dart`
```dart
import 'package:dio/dio.dart';
import '../config/env.dart';
import '../storage/token_store.dart';

Dio buildDio(TokenStore store, {required void Function() onUnauthorized}) {
  final dio = Dio(BaseOptions(
    baseUrl: '${Env.apiBaseUrl}/api',
    connectTimeout: const Duration(seconds: 15),
    receiveTimeout: const Duration(seconds: 30),
    headers: {'Content-Type': 'application/json'},
  ));

  dio.interceptors.add(InterceptorsWrapper(
    onRequest: (options, handler) async {
      final t = await store.token();
      if (t != null) options.headers['Authorization'] = 'Bearer $t';
      handler.next(options);
    },
    onError: (e, handler) async {
      if (e.response?.statusCode == 401) {
        await store.clear();
        onUnauthorized(); // -> app state becomes "logged out" -> router redirects to /login
      }
      handler.next(e);
    },
  ));
  return dio;
}
```
Note: the login endpoint itself returns 401 for wrong password. Handle that in the auth repository (don't treat login 401 as "session expired" — the web app has the same subtlety: it skips redirect when already on `/login`).

### 4.5 Auth repository + state (sketch)
```dart
class AuthUser {
  final String id, name, email, role;
  AuthUser({required this.id, required this.name, required this.email, required this.role});
  factory AuthUser.fromJson(Map<String, dynamic> j) => AuthUser(
    id: (j['_id'] ?? j['id']).toString(),
    name: (j['name'] ?? '').toString(),
    email: (j['email'] ?? '').toString(),
    role: (j['role'] ?? '').toString().toLowerCase(),
  );
}
```
- `AuthRepository.login(email, password)` → `dio.post('/users/login', data: {...})` → save `token` + `role` → return `AuthUser`.
- `authProvider` (a Riverpod `AsyncNotifier<AuthUser?>`): on build, if a token exists call `GET /users/me`; if it fails, clear. Expose `login()` and `logout()`.
- Show server error text from `e.response?.data['message']` (the server returns `{message: '...'}`), map network errors to "No internet connection".

### 4.6 Router with role guard
`go_router` with `redirect`: not logged in → `/login`; logged in on `/login` → the role's home; a role opening another role's prefix → its own home. Drive re-evaluation with `refreshListenable` tied to the auth provider. Routes:
```
/login
/student  (+ /student/courses, /student/course/:id, /student/sessions, /student/certificates)
/admin    (+ /admin/users, /admin/students, /admin/sessions)
/home/university | /home/partner | /home/finance | /home/sales
/profile
```
Use a `ShellRoute` with a bottom `NavigationBar` for the student and admin sections.

### 4.7 Phase 1 done when
- Login works for all 6 roles, wrong password shows the server message.
- Kill and reopen the app → still logged in.
- Logout clears storage. A tampered/expired token → bounced to login.
- ✅ **Explain-back #2:** walk through the token's life: login → storage → interceptor → 401 → logout.

---

## 5. API discovery (do this in Week 0/1 — it prevents most bugs)

For each endpoint in the architecture doc §2:

```bash
# login, copy the token
curl -s -X POST https://skilldad.com/api/users/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"<test student>","password":"<pw>"}' | jq .

TOKEN=...
curl -s https://skilldad.com/api/enrollment/my-courses -H "Authorization: Bearer $TOKEN" | jq . > mobile/docs/api-samples/student_my_courses.json
```
(Or use Postman/Bruno.) Use **test accounts only**, strip any personal data before committing samples.

For each sample write a short note: which fields you'll use, which can be `null`, which are strings-that-should-be-JSON.

Things already known (see `server/controllers/enrollmentController.js`, `getMyCourses`): the response spreads the raw DB row and adds camelCase fields (`completedVideos`, `totalModules`, `course: {...}`), so both `course_id` and `course._id` exist. **Pick one field per value and document it.**

---

## 6. Phase 2 — Student dashboard (Weeks 3–4)

Build in this order (each is a PR):
1. `StudentShell` with bottom nav: Home · My Courses · Sessions · Profile.
2. **My Courses** — `GET /enrollment/my-courses` → `ListView` of course cards (thumbnail, title, instructor, progress bar = `completedModules/totalModules`). Pull-to-refresh (`RefreshIndicator`).
3. **Home** — greeting + a few summary cards (courses in progress, certificates count from `/certificates/my`, upcoming session). Reuse what `StudentDashboard.jsx` shows; copy the *logic*, not the layout.
4. **Course detail** — `GET /courses/:id` → modules (expandable) → lessons with a completed tick from `completedVideos`.
5. Shared widgets: `LoadingView`, `ErrorView(retry)`, `EmptyView`. Every screen uses them.

### The one pattern to master
```dart
final myCoursesProvider = FutureProvider.autoDispose<List<EnrolledCourse>>((ref) {
  return ref.watch(courseRepositoryProvider).myCourses();
});

class MyCoursesScreen extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final async = ref.watch(myCoursesProvider);
    return async.when(
      loading: () => const LoadingView(),
      error: (e, _) => ErrorView(message: e.toString(), onRetry: () => ref.invalidate(myCoursesProvider)),
      data: (list) => list.isEmpty ? const EmptyView('No courses yet') : CourseList(list),
    );
  }
}
```
Every list/dashboard screen in the app (student, admin, others) is this pattern. Learn it once.

### Defensive model parsing (important here)
```dart
List<dynamic> asList(dynamic v) {
  if (v is List) return v;
  if (v is String && v.isNotEmpty) return jsonDecode(v) as List; // JSON columns sometimes arrive as strings
  return const [];
}
int asInt(dynamic v) => v is int ? v : int.tryParse('$v') ?? 0;
```
Write a unit test per model using the saved sample JSON (`test/models/...`). This is the single highest-value test in the project.

✅ **Explain-back #3:** what does `.when` do, and what happens when the API returns `modules` as a string?

---

## 7. Phase 3 — Recorded playback (Weeks 4–5)

Packages: `flutter pub add video_player chewie webview_flutter`.

`lib/core/utils/media_url.dart` — port of `getMediaUrl`:
```dart
String mediaUrl(String? path) {
  if (path == null || path.isEmpty) return '';
  if (path.startsWith('http')) return path;
  final p = path.startsWith('/') ? path : '/$path';
  final withUploads = p.startsWith('/uploads') ? p : '/uploads$p';
  return '${Env.apiBaseUrl}$withUploads';
}
```
(Read `client/src/utils/media.js` fully first and match its rules — e.g. what it does for paths that already start with `/uploads`.)

### Player decision table (mirrors `CoursePlayer.jsx` ~line 1386)
| Lesson data | Play with |
|---|---|
| `videoType` is `zoom-recording` or `live-recording` with `recordingUrl` / `zoomRecording.playUrl` | If URL is `.mp4/.webm` → chewie. If it contains `zoom.us/rec`, `vimeo.com`, `youtube.com` → WebView (same rule as `MeetingRecordingPlayer.jsx:147`). |
| `url` is `.mp4/.webm/.mov` or contains `/uploads/` | `VideoPlayerController.networkUrl(Uri.parse(mediaUrl(url)))` + chewie |
| No `url` | Placeholder "Video not available yet" |
| Session recording (from `/sessions`) | `GET /sessions/:id/recording/playback` → `{playUrl}` → same rules |

Build a single `LessonPlayer` widget that takes a lesson and picks the branch. Test all three branches on a **real device** and on mobile data (not only Wi-Fi).

Also:
- Mark complete: `PUT /enrollment/progress` — read `enrollmentController.updateProgress` and how `CoursePlayer.jsx` calls it (payload shape) before implementing. Verify the web app then shows the lesson as completed.
- Resume position: store last position locally (`shared_preferences`) — optional nice-to-have.
- Always dispose controllers in `dispose()`. Handle lifecycle: pause on app background.
- Known gotcha: `.mov` (HEVC) may not play on Android; fall back to "Open in browser" (`url_launcher`).
- Certificates: list from `/certificates/my`; open PDFs with `url_launcher` for v1.

✅ **Explain-back #4:** why do we need `dispose()` on the video controller?

---

## 8. Phases 4–5 — Admin and other roles (Weeks 6–7)

Admin and role dashboards are **read-only stat cards + lists**, so they are quick once you have the pattern in §6:

- `StatCard(title, value, icon)` shared widget.
- Admin Home: `GET /admin/stats` (+ `/admin/analytics` optional). Map the fields `AdminDashboard.jsx` displays.
- Lists (users, students, sessions): `ListView.builder`, search box (debounced), simple pagination/infinite scroll if the endpoint supports it — check `getAllUsers`/`getAllStudents` controllers for query params. **Don't load thousands of rows at once.**
- University / Partner / Finance / Sales: one generic `RoleDashboardScreen` fed by a small per-role config (endpoint + which fields to show). Do not build 4 separate screens.
- Actions that change data (deactivate user, approve payout) are **out of scope** for v1. Read-only avoids permission bugs.

---

## 9. Phase 6 — Polish & release (Week 8)

- App icon + splash: `flutter_launcher_icons`, `flutter_native_splash`. Colours: primary `#4C1D95`, accent `#6D28FF` (from web).
- Error handling pass: offline, timeout, 500, empty.
- Version gate (needs backend `GET /api/app/config`, see architecture §4).
- Android: create keystore (**back it up and never commit it**), configure signing, `flutter build appbundle --release`, upload to **Internal testing** in Play Console.
- Add `mobile/` build artefacts (`build/`, `*.jks`, `key.properties`) to `.gitignore`.
- Provide demo credentials + privacy URL in store listing.
- iOS later: Mac + Xcode, Apple Developer account, bundle id `com.skilldad.app`.

---

## 10. Working agreement

- **Git:** branch `mobile/<feature>` → small PR → Adithyan reviews → squash merge. Commit messages like the repo's (`feat(mobile): ...`).
- **Daily:** 5-line note in the PR/Slack — done, doing next, blocked. 
- **Weekly:** 30-min demo + explain-back (the 4 numbered ones above). Explaining is the check that you're learning, not just shipping.
- **Never commit:** tokens, passwords, keystores, `.env`, real user data in API samples.
- **Don't touch `server/` or `client/`** without agreeing first — the web app is live.
- Run before every PR: `dart format .` · `flutter analyze` · `flutter test`.

## 11. Quick command cheat sheet

```bash
flutter doctor                 # environment health
flutter devices                # connected devices/emulators
flutter run --dart-define=API_BASE_URL=https://skilldad.com
flutter pub add <pkg>          # like npm i
flutter pub get                # like npm install
flutter analyze                # lint
flutter test                   # tests
flutter clean && flutter pub get   # when things get weird
flutter build appbundle --release  # Play Store bundle
```
In the running terminal: `r` hot reload · `R` hot restart · `q` quit.

## 12. Common beginner problems

| Symptom | Likely cause |
|---|---|
| "RenderFlex overflowed" yellow/black stripes | Row/Column content too big → wrap in `Expanded`/`Flexible` or `SingleChildScrollView` |
| "Vertical viewport was given unbounded height" | `ListView` inside `Column` → wrap `ListView` in `Expanded` |
| Emulator can't reach local server | Use `10.0.2.2`, not `localhost`; check cleartext debug manifest |
| Data shows `null` / crashes on `fromJson` | Field is missing/renamed/string-encoded → check the saved sample and use the safe helpers |
| Login works on Wi-Fi, fails on mobile data | HTTP vs HTTPS, or server firewall — test the URL in the phone browser |
| Video black screen | Wrong URL (missing base URL prefix), unsupported codec, or needs WebView |
| Code from AI won't compile | Package version mismatch — check pub.dev changelog; give AI the exact version |

## 13. Checklists

**Before starting each feature:** sample JSON saved · model + unit test written · screen has loading/error/empty · router path added.
**Before each PR:** analyze clean · tests pass · tested on real device · no hard-coded URLs · screenshots in PR.
**Before release:** all 6 roles tested · offline behaviour checked · versionName/versionCode bumped · keystore backed up · store listing complete.
