# STEP274A1C - Media Core Syntax Fix

Replaces `backend/modules/media.js` with a clean, syntax-valid Media Core version.

Fixes:
- removes broken syntax around line 396 from previous patch
- keeps `/api/media/status`, `/api/media/list`, `/api/media/scan`, `/api/media/upload`, `/api/media/update`, `/api/media/delete`
- fixes optional SQL parameter handling in list endpoint
- keeps scan non-destructive
- keeps existing assets in place
