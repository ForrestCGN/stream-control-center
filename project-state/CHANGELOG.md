# Changelog

## Version 0.2.14C - OBS read-only Online-Status-Fix

- Online-Backend-Status mit der sichtbaren OBS-read-only UI synchronisiert.
- `/api/remote/status` enthaelt OBS als `obsPage` in `moduleMetadata.pages`.
- `/api/remote/routes` enthaelt `/api/remote/local-dashboard/obs/status` und `/api/remote/local-dashboard/obs/model`.
- Neue Online-read-only OBS-Placeholder-Routen ergaenzt.
- `server.js` meldet `0.2.14C` und `RDAP_0.2.14C_OBS_READONLY_ONLINE_STATUS_FIX`.
- Webserver-Deploy wurde erfolgreich geprueft.
- Keine OBS-Kommandos, keine Agent-Actions, keine Writes.

## Version 0.2.14B - OBS read-only UI Label-Fix

- OBS-Seite bleibt read-only sichtbar.
- Roh angezeigte Label-/Title-Keys fuer OBS korrigiert.
- Keine grosse Navigation neu gebaut.
- Keine OBS-Kommandos, keine Agent-Actions, keine Writes.
