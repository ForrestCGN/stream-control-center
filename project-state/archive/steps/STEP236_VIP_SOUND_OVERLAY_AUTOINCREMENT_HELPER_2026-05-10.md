# STEP236 - VIP Sound Overlay AUTOINCREMENT Helper - 2026-05-10

## Ziel

`vip_sound_overlay.js` technisch weiter in Richtung DB-Portabilitaet bringen, ohne bestehende VIP-Sound-/Overlay-/Twitch-/Upload-/Dashboard-Logik zu veraendern.

## Geaendert

- `vip_sound_message_templates.id` nutzt jetzt `database.primaryKeyAutoIncrementSql()`.
- `vip_sound_events.id` nutzt jetzt `database.primaryKeyAutoIncrementSql()`.
- Direkte `INTEGER PRIMARY KEY AUTOINCREMENT`-DDL-Stellen in `vip_sound_overlay.js` entfernt.

## Anzahl

- Vorher direkte AUTOINCREMENT-Treffer: 2
- Nachher Helper-Treffer: 2

## Bewusst nicht geaendert

- Keine VIP-Sound-Fachlogik.
- Keine Daily-Usage-Logik.
- Keine Message-Template-Seeding-Logik.
- Keine Twitch-VIP-/Mod-Sync-Logik.
- Keine Upload-/Multer-Logik.
- Keine Overlay-/Sound-System-Weiterleitung.
- Keine `INSERT OR IGNORE`-Stellen.
- Keine `ON CONFLICT`-Stellen.
- Keine Tabellenstruktur-Migration.
- Keine Datenmigration.
- Kein MySQL/MariaDB aktiv.
- Keine Aenderung an `database.js`.
- Keine Aenderung an `sqlite_core.js`.

## Tests

Syntaxcheck lokal ausgefuehrt:

```powershell
node --check backend\modules\vip_sound_overlay.js
```

## Empfohlene Tests nach dem Entpacken

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/status" | ConvertTo-Json -Depth 100
Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/routes" | ConvertTo-Json -Depth 100
Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/integration-check" | ConvertTo-Json -Depth 100
Invoke-RestMethod "http://127.0.0.1:8080/api/database/status" | ConvertTo-Json -Depth 80
```

Falls einzelne VIP-Routen anders benannt sind, zuerst `/api/vip-sound/status` testen und die Routenuebersicht nutzen.

## Commit-Vorschlag

```powershell
.\stepdone.cmd "db: use core autoincrement helper in vip sound overlay schema"
```
