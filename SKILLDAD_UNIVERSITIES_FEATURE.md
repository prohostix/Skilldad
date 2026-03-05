# SkillDad Universities Feature

## Overview
Added a new feature to manage SkillDad-owned universities separately from regular university partners. This allows admins to maintain a list of universities that are directly managed by SkillDad.

## Changes Made

### 1. Frontend Changes

#### Sidebar Update (`client/src/components/layout/ModernSidebar.jsx`)
- Added dropdown functionality for "Universities" menu item
- Added ChevronDown and ChevronRight icons for dropdown indicator
- Universities menu now has two sub-items:
  - **Universities**: Links to existing university management page (`/admin/university`)
  - **SkillDad Universities**: Links to new SkillDad universities page (`/admin/skilldad-universities`)
- Dropdown state managed with `universitiesDropdownOpen` state
- Smooth animation for dropdown expand/collapse using Framer Motion

#### New Page (`client/src/pages/admin/SkillDadUniversities.jsx`)
- **Features**:
  - Grid layout displaying SkillDad universities as cards
  - Add new university button
  - Edit and delete functionality for each university
  - Modal form for creating/editing universities
  - Fields: Name, Location, Website, Phone, Email, Description
  - Responsive design with glass morphism UI
  - Toast notifications for success/error messages

#### Routing (`client/src/App.jsx`)
- Added lazy import for `SkillDadUniversities` component
- Added route: `/admin/skilldad-universities`

### 2. Backend Changes

#### Model (`server/models/skillDadUniversityModel.js`)
- Created new Mongoose schema for SkillDad universities
- Fields:
  - `name` (required)
  - `location`
  - `website`
  - `phone`
  - `email`
  - `description`
  - `isActive` (boolean, default: true)
  - `timestamps` (createdAt, updatedAt)

#### Controller (`server/controllers/skillDadUniversityController.js`)
- **getSkillDadUniversities**: GET all SkillDad universities (sorted by creation date)
- **createSkillDadUniversity**: POST create new university
- **updateSkillDadUniversity**: PUT update existing university
- **deleteSkillDadUniversity**: DELETE remove university

#### Routes (`server/routes/skillDadUniversityRoutes.js`)
- All routes protected with `protect` and `authorize('admin')` middleware
- Endpoints:
  - `GET /api/admin/skilldad-universities` - Get all
  - `POST /api/admin/skilldad-universities` - Create new
  - `PUT /api/admin/skilldad-universities/:id` - Update
  - `DELETE /api/admin/skilldad-universities/:id` - Delete

#### Server Registration (`server/server.js`)
- Registered new routes: `app.use('/api/admin/skilldad-universities', require('./routes/skillDadUniversityRoutes'))`

## Key Differences

### SkillDad Universities vs Regular Universities
- **SkillDad Universities**: Admin-managed list of universities owned/partnered directly with SkillDad
- **Regular Universities**: User accounts with role "university" that can log in and manage their own content

## Usage

### For Admins:
1. Navigate to Admin Panel
2. Click on "Universities" in sidebar
3. Dropdown appears with two options
4. Select "SkillDad Universities"
5. Click "Add University" button
6. Fill in university details
7. Save to add to the list
8. Edit or delete universities as needed

## API Endpoints

```
GET    /api/admin/skilldad-universities      - Get all SkillDad universities
POST   /api/admin/skilldad-universities      - Create new university
PUT    /api/admin/skilldad-universities/:id  - Update university
DELETE /api/admin/skilldad-universities/:id  - Delete university
```

## Security
- All endpoints require admin authentication
- Protected with JWT middleware
- Role-based authorization (admin only)

## UI/UX Features
- Smooth dropdown animation
- Glass morphism design
- Responsive grid layout
- Modal forms for add/edit
- Toast notifications
- Icon-based actions (edit/delete)
- Empty state message when no universities exist

## Future Enhancements
- Add logo upload for universities
- Add student count per university
- Add course associations
- Add analytics per university
- Export university list
- Bulk import functionality
