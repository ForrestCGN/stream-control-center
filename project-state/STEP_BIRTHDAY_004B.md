# STEP_BIRTHDAY_004B – Birthday Upload-Fix

## Problem

Im Party-Show-Tab schlug der Upload mit `upload_file_missing` fehl.

## Ursache

`helper_routes.registerPost()` erwartet den finalen Handler als drittes Argument und optionale Middlewares danach.
Die Route `/api/birthday/admin/show/upload` hatte `upload.single('file')` fälschlich als Handler übergeben. Dadurch lief der eigentliche Upload-Handler vor Multer und `req.file` war leer.

## Änderung

In `backend/modules/birthday.js` wurde die Route korrigiert:

```js
routes.registerPost(app, [`${API_PREFIX}/admin/show/upload`], handler, upload.single('file'));
```

## Betroffene Dateien

- `backend/modules/birthday.js`
- `project-state/STEP_BIRTHDAY_004B.md`
- Projektstatus-/Doku-Dateien aktualisiert

## Tests

```powershell
node --check backend\modules\birthday.js
```

Danach im Dashboard erneut im Party-Show-Tab eine Datei auswählen und hochladen.
