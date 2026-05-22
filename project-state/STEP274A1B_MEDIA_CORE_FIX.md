# STEP274A1B – Media Core Fix

Fix für STEP274A1 Apply-Script.

## Grund

Das vorherige Apply-Script enthielt verschachtelte Template-Literals und brach mit `SyntaxError: Unexpected token '{'` ab.

## Änderungen

- `tools/easy/STEP274A1B_APPLY_MEDIA_CORE_FIX.cjs`
- repariert `listAssets()` in `backend/modules/media.js`
- setzt Media-Core-Step auf `STEP274A1B`
- reduziert laute ffprobe-Fehler in `helper_media.js`

## Tests

```bat
node tools\easy\STEP274A1B_APPLY_MEDIA_CORE_FIX.cjs
node --check backend\modules\media.js
node --check backend\modules\helpers\helper_media.js
node --check tools\easy\STEP274A1B_APPLY_MEDIA_CORE_FIX.cjs
```
