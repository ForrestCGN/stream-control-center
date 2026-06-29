# RDAP 0.2.55C - Media Full-Sync Build Marker Sync

## Zweck

0.2.55C korrigiert ausschliesslich inkonsistente Build-/Status-Marker nach 0.2.55B.

Der Full-Sync funktionierte bereits: 333 Items wurden in `remote_media_index` geschrieben, danach wurden die MEDIA_INDEX-Writes wieder deaktiviert. Der Status zeigte aber weiterhin 0.2.55A-Marker, wodurch Deploy-/Versionspruefung unklar war.

## Aenderung

- `MODULE_BUILD` in `agent-runtime.service.js` auf `RDAP_0.2.55C_MEDIA_FULL_SYNC_BUILD_MARKER_SYNC`.
- `MEDIA_FULL_SYNC_RECEIVER_BUILD` auf denselben Wert.
- Media-Readonly-Route und Routenuebersicht melden denselben 0.2.55C Build.
- Projektstatus/Doku auf 0.2.55C aktualisiert.

## Sicherheit

Keine Logik-Aenderung, keine Gate-Aktivierung, keine neuen DB-Writes, keine UI-Read-Source-Umstellung, keine Upload/Edit/Delete-Funktion, keine Datei-Inhalte, keine absoluten Pfade.
