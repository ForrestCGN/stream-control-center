# Übergabe für neuen Chat — stream-control-center

Stand: 2026-05-26

## Bitte im neuen Chat zuerst beachten

Forrest arbeitet am `stream-control-center`.

Repo:

```text
https://github.com/ForrestCGN/stream-control-center
Branch: dev
Lokales Repo: D:\Git\stream-control-center
Live-Ziel: D:\Streaming\stramAssets
```

Arbeitsregeln:

```text
- keine Funktionalität entfernen
- echte Dateien/GitHub/dev als Single Source of Truth nehmen
- Versionen bei Änderungen erhöhen
- EventBus für Module nutzen
- Doku bei neuen Modulen/Features aktualisieren
- produktive SQLite DB niemals überschreiben
- ZIPs immer mit echten Zielpfaden bauen
```

## Aktueller Schwerpunkt

Kanalpunkte-System fertigstellen.

Textverwaltung ist bewusst geparkt. Fokus bleibt Kanalpunkte.

## Bestätigter Kanalpunkte-Stand

```text
backend/modules/channelpoints.js
moduleVersion = 0.8.0
moduleBuild = twitch-auth-scope-check

htdocs/dashboard/modules/channelpoints.js
UI_VERSION = 0.8.0
UI_BUILD = twitch-auth-scope-check
```

Status:

- lokale Rewards stehen.
- Modal-Editor analog Commands steht.
- Sound/Video/Text lokal testbar.
- Redemption-Test/Verlauf stehen.
- EventBus-Domain-Events aktiv.
- Twitch Auth-/Scope-Check steht.
- Token passt zu ForrestCGN.
- Read-only Sync ist möglich.
- Twitch-Schreibzugriffe sind weiterhin aus.

## Letzter Test

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/channelpoints/status" |
  Select-Object ok,module,moduleVersion,moduleBuild
```

Ergebnis:

```text
True channelpoints 0.8.0 twitch-auth-scope-check
```

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/channelpoints/twitch/auth-check" |
  Select-Object ok,module,moduleVersion,moduleBuild,status,auth,scopeCheck,readiness,safety
```

Ergebnis:

```text
ok = True
status = twitch_auth_scope_check
auth.login = forrestcgn
auth.userId = 127709954
auth.broadcasterId = 127709954
auth.tokenUserMatchesBroadcaster = True
readiness.readyForReadOnlySync = True
readiness.readyForFutureWriteActions = False
safety.noTwitchWrite = True
```

## Direkt nächster Schritt

Baue:

```text
Kanalpunkte v0.8.1 — Twitch Rewards Read-Only Sync
```

Ziele:

```text
GET /api/channelpoints/twitch/rewards
GET /api/channelpoints/twitch/sync-preview
```

- echte Twitch Custom Rewards lesen.
- lokale Rewards mit Twitch Rewards vergleichen.
- nur Anzeige/Synchronisationsvorschau.
- keine Twitch-Schreibzugriffe.
- keine DB-Schemaänderung, außer absolut notwendig und dann nur additiv.

## Danach

- lokale Reward ↔ Twitch Reward Verknüpfung vorbereiten.
- Controlled Create/Update/Disable mit Rückfrage.
- EventSub Redemption Ingest.

