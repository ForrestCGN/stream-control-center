# FILES – VIP30 / 30-Tage-VIP-System

## Aktueller Arbeitsbereich

Aktiver Bereich: **VIP30 / 30-Tage-VIP-System**

Stand:

- `backend/modules/vip30.js` – Version `0.8.30`, Build `step8.19.43-status-command`
- `backend/modules/commands.js` – Version `0.1.8`, Build `vip30-command-catalog`
- Dashboard-Slotfilter aus `STEP8.19.40` ist aktiv.

## Zuletzt betroffene Dateien

### Backend

- `backend/modules/vip30.js`
  - Hauptmodul für VIP30.
  - Verarbeitet Channelpoints-Redemptions vollständig über Node.
  - Prüft Broadcaster/Moderator/VIP30/Twitch-VIP vor Grant.
  - Führt Twitch-VIP-Grant aus.
  - Schreibt VIP30-Slots.
  - Fulfilled/canceled Redemptions nach Ergebnis.
  - Triggert Alert/Sound über das bestehende Sound-/Alert-System.
  - Enthält seit STEP8.19.43 den VIP30-Status-Command.

- `backend/modules/helpers/helper_twitch_roles.js`
  - Rollenprüfung für Twitch-VIPs und Moderatoren.
  - Relevante Funktionen:
    - `listChannelVips`
    - `listChannelModerators`
    - `isTargetModerator`
    - `isTargetVip`
    - `getChannelUserRoleState`
    - `tokenStatus`
    - `clearCache`
  - Wichtiger Fix aus STEP8.19.39: VIP-Precheck nutzt Fallback über komplette VIP-Liste, falls Einzelcheck nicht ausreicht.

- `backend/modules/commands.js`
  - Command-Katalog / Command-Definitionen.
  - Seit STEP8.19.43 enthält es die VIP30-Command-Zuordnung.
  - Aktueller Build: `vip30-command-catalog`.

### Dashboard

- `htdocs/dashboard/modules/vip30.js`
  - VIP30-Dashboardmodul.
  - STEP8.19.40: Slot-Ansicht trennt aktive Slots von Verlauf/Freigaben/Fehlern.
  - Hauptliste zeigt nur `active`.

- `htdocs/dashboard/modules/vip30.css`
  - Styles für VIP30-Dashboard.
  - Enthält Layout für Settings, Texte, Sounds, Live-Readiness und Slot-/Verlaufsdarstellung.

### Weitere relevante Dateien / Systeme

- Sound-/Alert-System bleibt eigenständig und wurde in STEP8.19.41 nicht grundsätzlich geändert.
- VIP30 nutzt das bestehende Sound-/Alert-System nur über Bundle/Queue-Aufruf.
- Produktive SQLite-DB liegt im Live-System und darf nicht ersetzt werden.

## Wichtige APIs / Endpunkte

### VIP30

- `GET /api/vip30/status`
  - Status, Slots, Version, Build, Livebereitschaft.

- `GET /api/vip30/logs?user=<login>&limit=<n>`
  - VIP30-eigene Logs gezielt abfragen.
  - Für Tests bevorzugt nutzen, statt allgemeine Node-Logs zu durchsuchen.

Weitere VIP30-Endpunkte hängen vom aktuellen Modulstand ab und sind in `backend/modules/vip30.js` die Source of Truth.

### Commands

- `GET /api/commands/status`
  - Status des Command-Moduls.

## Chatcommands

Neu seit STEP8.19.43:

- `!vip30`
- `!vip30 me`
- `!vip30 slots`
- `!vip30 help`
- `!vip30 @user` nur für Mods/Broadcaster

Die Commands sind lesend und dürfen keinen VIP-Grant, Slot-Write oder Redemption-Update auslösen.

## Sound-/Media-Fix aus STEP8.19.41

Fehlerbild vor Fix:

```text
vip30_alert_sound_bundle_failed
Sound wurde nicht gefunden
soundId: vip30_default-media
mediaId: 1459
```

Ursache:

- VIP30 hat bei Media-Registry-Sounds gleichzeitig eine interne SoundPool-ID als `soundId` gesendet.
- Das Sound-System hat diese Fake-ID als Preset-Sound interpretiert und vor der Media-Auflösung abgebrochen.

Fix:

- Wenn `mediaId` oder `mediaPath` vorhanden ist, sendet VIP30 keinen Fake-`soundId` mehr.
- Der alte SoundKey/Preset-Fallback bleibt nur für echte Preset-Fälle erhalten.

## Datenquellen / DB-Regeln

- Aktive SQLite-DB niemals ersetzen, löschen oder neu bauen.
- Schemaänderungen nur mit sanften Migrationen.
- VIP30-Slots werden im bestehenden produktiven System verwaltet.
- `external_removed`, `expired`, `failed`, `revoked` usw. sind Verlauf/Status und dürfen nicht durch Dashboard-Filter gelöscht werden.

## Tests / hilfreiche Kommandos

### Status prüfen

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/vip30/status"
$s | Select-Object ok,moduleVersion,moduleBuild,lastError

$c = Invoke-RestMethod "http://127.0.0.1:8080/api/commands/status"
$c | Select-Object ok,moduleVersion,moduleBuild,lastError
```

Erwartung aktueller Stand:

```text
VIP30:    0.8.30 / step8.19.43-status-command
Commands: 0.1.8  / vip30-command-catalog
```

### VIP30-Logs gezielt prüfen

```powershell
$r = Invoke-RestMethod "http://127.0.0.1:8080/api/vip30/logs?user=younecraft&limit=10"
$r.logs | Select-Object createdAt,eventType,success,reason,message | Format-Table -AutoSize
```

## Wichtige Arbeitsregel

Bei VIP30-Problemen zuerst diese Source-of-Truth nutzen:

1. `backend/modules/vip30.js`
2. `backend/modules/helpers/helper_twitch_roles.js`
3. `backend/modules/commands.js`
4. `htdocs/dashboard/modules/vip30.js`
5. `htdocs/dashboard/modules/vip30.css`
6. `GET /api/vip30/status`
7. `GET /api/vip30/logs?...`

Nicht wieder allgemeine Node-Logs oder DB-Tabellen blind raten, wenn der VIP30-eigene Logs-Endpunkt ausreicht.
