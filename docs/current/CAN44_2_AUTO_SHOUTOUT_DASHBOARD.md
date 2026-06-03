# CAN-44.2 Auto-Shoutout Dashboard

Stand: 2026-06-03

## Ziel

CAN-44.2 ergänzt die Dashboard-Verwaltung für das Auto-Shoutout-System.

Die Backend-Logik aus CAN-44.1 bleibt unverändert: Auto-Shoutout-Settings und Streamer werden über die Datenbank verwaltet. Die Dashboard-Seite nutzt nur die vorhandenen API-Routen.

## Dateien

- `htdocs/dashboard/index.html`
  - lädt `auto_shoutout.css`
  - ergänzt das Panel `autoShoutoutModule`
  - lädt `auto_shoutout.js`
- `htdocs/dashboard/modules/auto_shoutout.js`
  - registriert das Dashboard-Modul `auto_shoutout`
  - zeigt Auto-SO-Status, Live-Status, globale Settings, Streamer-Liste und letzte Events
  - erlaubt Streamer hinzufügen/bearbeiten/deaktivieren/entfernen
  - erlaubt Test-Chat pro Streamer
- `htdocs/dashboard/modules/auto_shoutout.css`
  - Styling im bestehenden CGN/Neon-Dashboard-Stil

## Genutzte API-Routen

- `GET /api/clip-shoutout/auto`
- `GET /api/clip-shoutout/auto/settings`
- `POST /api/clip-shoutout/auto/settings`
- `GET /api/clip-shoutout/auto/streamers`
- `POST /api/clip-shoutout/auto/streamers`
- `POST /api/clip-shoutout/auto/streamers/remove`
- `POST /api/clip-shoutout/auto/test-chat`
- `GET /api/clip-shoutout/queue`

## Wichtig

- Die Live-Anzeige im Dashboard ist informativ.
- Auto-SO blockiert weiterhin nur dann anhand Live-Status, wenn `onlyWhenLive` ausdrücklich aktiviert wird.
- Es wurde keine Backend-Queue, kein Clip-System und kein offizielles Twitch-Shoutout-System verändert.
- Keine bestehende Funktionalität wurde entfernt.

## Test

```powershell
cd D:\Git\stream-control-center
node -c htdocs\dashboard\modulesuto_shoutout.js
.\stepdone.cmd "CAN-44.2 Auto-Shoutout Dashboard"
```

Danach Node/Webserver neu starten bzw. Dashboard hart neu laden:

```text
http://127.0.0.1:8080/dashboard/
```

Im Dashboard sollte unter Community/Favoriten das Modul „Auto-Shoutouts“ erscheinen.
