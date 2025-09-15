# Modal Testing Guide

## 1. Schedule Live Class Modal (WORKING ✅)
**Location:** `/teacher/classes/live`
**Button:** "Schedule Live Class"
**Functionality:** 
- Opens modal to schedule a new live session
- Connects to `POST /api/live-sessions`
- Form fields: Subject, Title, Description, Start/End Time, Meeting URL
- Shows success toast on creation
- Updates list automatically

## 2. Upload Material Modal (WORKING ✅)
**Location:** `/teacher/classes/materials`
**Button:** "Upload Material"
**Functionality:**
- Opens modal with drag-and-drop file upload
- Connects to `POST /api/materials` (multipart/form-data)
- Form fields: File, Subject, Title, Description, Type
- 10MB file size limit
- Shows success toast on upload
- Updates materials grid

## 3. Add Class Schedule Modal (PLACEHOLDER ⚠️)
**Location:** `/teacher/classes/schedule`
**Button:** "Add Class"
**Functionality:**
- Opens placeholder modal
- Shows "Coming Soon" message
- No backend API yet (needs ClassSchedule model)

## Testing Steps

### Prerequisites
1. Login as a teacher account
2. Navigate to Teacher Dashboard

### Test Live Sessions:
1. Go to My Classes → Live Classes
2. Click "Schedule Live Class" button
3. Fill form with:
   - Select a subject
   - Title: "Test Live Session"
   - Description: "Testing modal functionality"
   - Start Time: (future date/time)
   - End Time: (after start time)
   - Meeting URL: https://meet.google.com/test
4. Click "Schedule Session"
5. Verify session appears in list

### Test Material Upload:
1. Go to My Classes → Materials
2. Click "Upload Material" button
3. Drag and drop or select a file (< 10MB)
4. Fill form with:
   - Select a subject
   - Title: "Test Material"
   - Description: "Testing upload"
   - Type: Document
5. Click "Upload Material"
6. Verify material appears in grid

### Test Schedule Modal:
1. Go to My Classes → Schedule
2. Click "Add Class" button
3. Verify placeholder modal opens
4. Click "Got it"
5. Verify info toast appears

## Common Issues & Solutions

### If modals don't open:
1. Check browser console for errors
2. Verify you're logged in as teacher
3. Clear browser cache
4. Check network tab for API errors

### If API calls fail:
1. Verify backend is running on port 3001
2. Check teacher has assigned subjects
3. Verify authentication token is valid
4. Check CORS settings

## API Endpoints Used

- `GET /api/subjects` - Fetch teacher's subjects
- `POST /api/live-sessions` - Create live session
- `GET /api/live-sessions` - List live sessions
- `DELETE /api/live-sessions/:id` - Delete session
- `POST /api/materials` - Upload material (multipart)
- `GET /api/materials` - List materials
- `DELETE /api/materials/:id` - Delete material

## Database Requirements

Teacher must have:
- Active account with TEACHER role
- At least one assigned subject (TeacherSubject relation)
- Valid authentication token