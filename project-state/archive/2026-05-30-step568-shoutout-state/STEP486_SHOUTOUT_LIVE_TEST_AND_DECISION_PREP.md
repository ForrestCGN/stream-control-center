# STEP486_SHOUTOUT_LIVE_TEST_AND_DECISION_PREP

Stand: 2026-05-26

## Ziel

STEP486 bereitet den echten Live-Test des Shoutout-Systems vor und fasst die Entscheidungslage für eine spätere produktive `!so`-Umstellung zusammen.

Wichtig: Dieser STEP stellt nichts automatisch produktiv um.

## Architekturentscheidung

Es wurde kein neues Modul erstellt.

- `backend/modules/twitch.js` bleibt das zentrale Twitch-/EventSub-System.
- `backend/modules/clip_shoutout.js` bleibt das zentrale Shoutout-System.
- STEP486 erweitert nur das bestehende Shoutout-System um Live-Test-/Decision-Readiness.

## Backend

Geändert:

- `backend/modules/clip_shoutout.js`
  - Version auf `0.2.13` erhöht.
  - Neue Funktion `buildShoutoutLiveTestDecision()`.
  - Neue Routen:
    - `GET /api/clip-shoutout/live-test`
    - `GET /api/clip-shoutout/decision-prep`

Die neue Auswertung kombiniert:

- `production-check`
- gespeicherte Incoming-/Outgoing-Shoutout-EventSub-Daten
- Debug-vs.-echte EventSub-Beobachtungen
- sichere Empfehlung zur nächsten Aktion

## Dashboard

Geändert:

- `htdocs/dashboard/modules/shoutout.js`
- `htdocs/dashboard/modules/shoutout.css`

Neu:

- Tab `Live-Test`
- Anzeige für:
  - Production-Readiness
  - Send-Readiness
  - Debug-Events
  - echte `channel.shoutout.receive` Events
  - echte `channel.shoutout.create` Events
  - empfohlenen nächsten Schritt
  - Testplan mit Curl-Kommandos
  - Sicherheitsentscheidung gegen automatische Produktivumstellung

## Neue Route

```text
GET /api/clip-shoutout/live-test
GET /api/clip-shoutout/decision-prep
```

Beide liefern dieselbe Entscheidungs-/Live-Test-Auswertung.

## Nicht geändert

- Keine produktive `!so`-Umstellung.
- Keine neue Moduldatei.
- Keine neue Tabelle.
- Keine Änderung an `.env`, Tokens oder Secrets.
- Keine SQLite-Datei ersetzt oder überschrieben.
- `backend/modules/twitch.js` wurde in STEP486 nicht verändert.

## Tests

```bat
node --check backend\modules\clip_shoutout.js
node --check htdocs\dashboard\modules\shoutout.js
```

## Nächster sinnvoller Schritt

`STEP487_SHOUTOUT_REAL_EVENT_TEST_RESULTS`

Dort sollten die echten Runtime-Ergebnisse aus `/api/clip-shoutout/production-check`, `/api/clip-shoutout/live-test` und echten Twitch-Shoutout-Events dokumentiert und bewertet werden.
