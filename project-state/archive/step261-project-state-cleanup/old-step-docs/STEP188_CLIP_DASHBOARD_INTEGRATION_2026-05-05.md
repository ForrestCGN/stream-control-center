# STEP188 - Clip Dashboard Integration

Stand: 2026-05-05

## Ziel

Clip-System im bestehenden Control-Center/Dashboard integrieren.

Basis laut GitHub/dev:

- `project-state/STEP186_CLIP_BACKEND_CREATE_TWITCH_DISCORD_2026-05-05.md`
- `backend/modules/clips.js`
- vorhandene Dashboard-Struktur mit `todo.js`, `tagebuch.js`, `hug.js`, `vip.js`

Wichtig: In GitHub/dev ist `backend/modules/clips.js` bereits weiter als STEP186 und trägt oben `STEP187 — Clip Backend-Create: lokales OBS-Replay-Dateihandling`. Das Dashboard-Modul ist deshalb auf STEP187-kompatible Status-/History-Daten ausgelegt.

## Neue Dateien

Diese Dateien direkt in die Zielpfade legen:

- `htdocs/dashboard/modules/clips.js`
- `htdocs/dashboard/modules/clips.css`

## Änderung: htdocs/dashboard/index.html

### CSS einfügen

Im `<head>` bei den anderen Dashboard-Modul-CSS-Dateien ergänzen:

```html
<link rel="stylesheet" href="/dashboard/modules/clips.css" />
```

Empfohlene Position nach `streamdesk.css` oder bei den Community-/Systemmodulen. Wichtig ist nur: vor `</head>`.

### Modul-Section einfügen

Bei den vorhandenen `<section ...>` Modulen ergänzen:

```html
<section id="clipsModule" class="dashboard-module clips-admin" data-module-panel="clips" hidden></section>
```

Empfohlene Position direkt nach:

```html
<section id="streamdeskModule" class="dashboard-module streamdesk-admin" data-module-panel="streamdesk" hidden></section>
```

### Script einfügen

Bei den Dashboard-Modul-Scripts ergänzen:

```html
<script src="/dashboard/modules/clips.js"></script>
```

Empfohlene Position direkt nach:

```html
<script src="/dashboard/modules/streamdesk.js"></script>
```

## Änderung: htdocs/dashboard/app.js

### In `window.CGN.modules` ergänzen

Direkt nach `streamdesk` einfügen:

```js
clips: {
  title: 'Clip-System',
  panelId: 'clipsModule',
  group: 'live',
  overlayLink: '',
  reload() { return window.ClipsModule?.loadAll?.(true); }
},
```

### In `moduleCatalog` vorhandenen Clips-Eintrag aktivieren

Bestehenden Eintrag:

```js
clips: { label: 'Clips', icon: '✂️', enabled: false, description: 'Clip-Erstellung und Clip-Verwaltung.' },
```

ersetzen durch:

```js
clips: { label: 'Clips', icon: '✂️', enabled: true, description: 'Clip-Status, Settings, Textvarianten, Discord-Ziel und History.' },
```

### In `favorites` Clips ergänzen

Bestehend:

```js
favorites: ['alerts', 'vip', 'hug', 'tagebuch', 'todo', 'obs', 'sound_system'],
```

ersetzen durch:

```js
favorites: ['clips', 'alerts', 'vip', 'hug', 'tagebuch', 'todo', 'obs', 'sound_system'],
```

## Genutzte Backend-APIs

Das Dashboard greift nicht direkt auf Dateien oder DB zu.

Genutzt werden ausschließlich:

- `GET /api/clip/status`
- `GET /api/clip/admin/settings`
- `POST /api/clip/admin/settings`
- `GET /api/clip/admin/texts`
- `POST /api/clip/admin/texts`
- `GET /api/clip/history?limit=50`

## Dashboard-Funktionen

### Übersicht

Zeigt:

- Clip-System aktiv/inaktiv
- Backend-Create bereit/blockiert
- Twitch clips:edit Readiness
- OBS Replay Buffer Readiness
- Discord Bridge / Channel Readiness
- DB-Settings / DB-Texte vorbereitet
- aktuelle Stream-/Game-/Titel-Infos
- Backend-Blocker

### Settings

Bearbeitbare Gruppen:

- Basis
- Twitch
- OBS Replay
- Discord
- Chat-Ausgaben
- Erweitert

Discord-Ziel kann gesammelt gespeichert werden:

- `discordChannelMode`
- `discordChannelKey`
- `discordChannelId`
- `discordPostEnabled`
- `postOnlyWhenLive`

### Texte

Kategorisierter Varianten-Editor wie Todo/Tagebuch:

- Kategorie wählen
- Varianten bearbeiten
- aktiv/inaktiv setzen
- Gewicht setzen
- Varianten hinzufügen
- Varianten löschen

### History

Zeigt letzte Clips:

- Zeit
- Titel
- User
- Twitch-Status
- OBS-Status
- Discord-Status
- Clip-/Edit-/Lokal-Hinweise

Repost/Details sind bewusst vorbereitet, aber noch nicht aktiv umgesetzt.

## Tests nach Einbau

Nach Deploy/Einbau:

```powershell
cd D:\Streaming\stramAssets
Invoke-RestMethod "http://127.0.0.1:8080/api/clip/status" | ConvertTo-Json -Depth 30
Invoke-RestMethod "http://127.0.0.1:8080/api/clip/admin/settings" | ConvertTo-Json -Depth 30
Invoke-RestMethod "http://127.0.0.1:8080/api/clip/admin/texts" | ConvertTo-Json -Depth 30
Invoke-RestMethod "http://127.0.0.1:8080/api/clip/history?limit=5" | ConvertTo-Json -Depth 30
```

Danach Dashboard öffnen:

```text
http://127.0.0.1:8080/dashboard/
```

Navigation:

```text
Live -> Clips
```

## Offene Punkte für nächsten STEP

- Repost-Button pro History-Eintrag erst ergänzen, wenn Backend-Route vorhanden ist.
- Detailansicht pro Clip/Job kann später über `GET /api/clip/job/:jobId` ergänzt werden.
- Optional: History sortierbar/filterbar machen.
- Optional: manuelle Clip-Erstellung im Dashboard nur für Admin/Owner und nur nach Rollenprüfung.
