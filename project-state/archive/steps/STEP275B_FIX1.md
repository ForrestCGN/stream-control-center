# STEP275B FIX1 - MediaPicker Upload Field Order

## Inhalt

- Fix für neue Uploads im MediaPicker.
- `type`, `moduleKey`, `categoryKey` werden vor `file` in FormData gesetzt.
- Zusätzlich Query-Fallback an `/api/media/upload`.
- Ziel: neue Birthday-User-Songs landen wirklich unter `assets/media/birthday/user-songs`.

## Test

1. Script ausführen.
2. Backend nicht zwingend nötig, aber Dashboard mit Strg+F5 neu laden.
3. Birthday → Show/Medien → User-Song → im Picker neues Medium hochladen.
4. Danach prüfen:
   - `D:\Streaming\stramAssets\htdocs\assets\media\birthday\user-songs\`
   - `/api/media/list?moduleKey=birthday&categoryKey=user-songs&status=active&limit=20`
