# STEP201.5 – VIP Diagnose-Endpunkte / Modulstandard-Nachzug

Stand: 2026-05-08  
Projekt: stream-control-center  
Typ: Backend-Minimalpatch + Doku  
Status: vorbereitet

## Ausgangslage

Die STEP201.5-Pruefung ueber `D:\gpt\last_api.json` zeigte:

```text
/api/vip               0/6
/api/vip-sound-overlay 3/6
/api/vip-sound         3/6
```

Bei den produktiven Prefixen fehlten jeweils:

```text
/routes
/integration-check
/reload
```

Die Datei-/Routenpruefung zeigte ausserdem:

```text
backend/modules/vip_sound_overlay.js
htdocs/dashboard/modules/vip.js
htdocs/dashboard/modules/vip.css
htdocs/overlays/vip_sound_overlay.html
htdocs/overlays/vip_sound_overlay_v2.html
config/vip_sound_roles.json
```

Dashboard nutzt aktuell:

```text
/api/vip-sound
```

Backend registriert aktuell:

```text
/api/vip-sound-overlay
/api/vip-sound
```

## Entscheidung

`/api/vip` wird bewusst nicht ergaenzt.

Grund:

- `/api/vip-sound` ist der produktive Dashboard-Prefix.
- `/api/vip-sound-overlay` bleibt als bestehender Legacy-/Overlay-Prefix erhalten.
- Ein zusaetzlicher `/api/vip`-Alias waere aktuell unnoetig und koennte spaeter mit einem echten allgemeinen VIP-Modul kollidieren.

## Geaenderte Datei

```text
backend/modules/vip_sound_overlay.js
```

## Ergaenzte Endpunkte

Fuer beide bestehenden Prefixe:

```text
GET  /api/vip-sound/routes
GET  /api/vip-sound-overlay/routes
GET  /api/vip-sound/integration-check
GET  /api/vip-sound-overlay/integration-check
POST /api/vip-sound/reload
POST /api/vip-sound-overlay/reload
```

## Verhalten

### /routes

Gibt die bekannten VIP-Routen fuer den jeweiligen Prefix aus.

Enthaelt auch:

```text
canonicalPrefix: /api/vip-sound
aliases: /api/vip-sound-overlay, /api/vip-sound
intentionallyNotRegistered: /api/vip
```

### /integration-check

Fuehrt nur nicht-destruktive Pruefungen aus:

- Schema initialisiert
- relevante Tabellen zaehlbar
- Settings vorhanden
- JSON-Fallback `vip_sound.json` als Warnung, wenn fehlend
- `vip_sound_roles.json` vorhanden
- Sound-Basisordner vorhanden
- Upload-Middleware `multer` geladen
- Routenliste vorhanden
- Sound-System-Ziel konfiguriert

Wichtig:

- Fehlender `vip_sound.json`-Fallback ist kein harter Fehler, sondern Warnung.
- DB-Settings sind Hauptquelle.
- Keine Sound-Ausloesung.
- Keine DB-Daten werden geloescht.

### /reload

Nicht-destruktiv:

- stellt Schema sicher
- aktualisiert DB-Stats
- sendet WebSocket-State `reload`
- loescht keine Queue
- setzt kein Overlay zurueck
- schreibt keine Config

## Nicht geaendert

- keine Dashboard-Datei geaendert
- keine Overlay-Datei geaendert
- keine DB-Migration neu eingefuehrt
- keine bestehende Route entfernt
- keine Queue-/Command-/Upload-/Twitch-Sync-Logik umgebaut
- kein `/api/vip`-Alias eingefuehrt

## Tests lokal

Ausgefuehrt:

```powershell
node -c backend/modules/vip_sound_overlay.js
```

Ergebnis:

```text
Syntax OK
```

## Nach Entpacken testen

```powershell
cd D:\Git\stream-control-center
node -c .ackend\modulesip_sound_overlay.js
```

Nach `stepdone.cmd` und Live-Deploy:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/routes" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound-overlay/routes" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/integration-check" | ConvertTo-Json -Depth 30
Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound-overlay/integration-check" | ConvertTo-Json -Depth 30
Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/reload" -Method POST | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound-overlay/reload" -Method POST | ConvertTo-Json -Depth 20
```

Erwartung:

```text
/api/vip-sound/routes                    OK
/api/vip-sound-overlay/routes            OK
/api/vip-sound/integration-check         OK oder Warnungen ohne harte Fehler
/api/vip-sound-overlay/integration-check OK oder Warnungen ohne harte Fehler
/api/vip-sound/reload                    OK, destructive=false
/api/vip-sound-overlay/reload            OK, destructive=false
```

`/api/vip/*` bleibt bewusst 404.

## Commit-Befehl

Nach Entpacken in `D:\Git\stream-control-center`:

```powershell
cd D:\Git\stream-control-center
.\stepdone.cmd "feat: add vip diagnostics endpoints"
```

## Offen

- Nach Live-Deploy Matrix neu laufen lassen.
- Danach pruefen, ob VIP damit fuer die echten Prefixe 6/6 ist.
- `/api/vip` bleibt weiterhin nicht als Zielstandard zu zaehlen, solange kein allgemeines VIP-Modul existiert.
