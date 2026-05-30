# SHOUTOUT_SYSTEM_CONSOLIDATION

Version: 0.1.0  
Stand: 2026-05-30  
Quelle: Batch D aus `project-state/`

## Zweck

Diese Datei konsolidiert die wichtigen Informationen aus:

```text
project-state/STEP483_SHOUTOUT_DASHBOARD_TABS.md
project-state/STEP484_SHOUTOUT_INBOUND_EVENTSUB_INTEGRATION.md
project-state/STEP485_SHOUTOUT_PRODUCTION_CHECK.md
project-state/STEP486_SHOUTOUT_LIVE_TEST_AND_DECISION_PREP.md
```

Die Datei ist ab jetzt die aktive Rescue-/Referenzdatei fuer den Shoutout-Systemstand aus Batch D, bevor die alten STEP-Dateien spaeter archiviert werden.

## Zentrale Architekturentscheidung

```text
backend/modules/twitch.js bleibt das zentrale Twitch-/EventSub-System.
backend/modules/clip_shoutout.js bleibt das zentrale Shoutout-System.
Es gibt kein neues Shoutout-Parallelmodul.
Es gibt kein neues EventSub-Parallelmodul.
Es gibt keine automatische produktive !so-Umstellung.
```

## Produktivregel fuer !so / !vso

Die Entscheidung fuer eine produktive `!so`-Umstellung darf nur nach Live-Test und Readiness-Pruefung erfolgen.

Gesichert gilt:

```text
- keine automatische produktive !so-Umstellung
- keine ungepruefte Umstellung von !vso auf !so
- keine neue Twitch-OAuth-Struktur nur fuer Shoutout
- keine neue EventSub-Verbindung nur fuer Shoutout
- Entscheidung erst nach Production-Check, Live-Test und echter EventSub-Beobachtung
```

## Dashboard-Struktur

Das Shoutout-Dashboard wurde in Tabs/Unterbereiche aufgeteilt.

Gesicherte Tabs:

```text
Übersicht
Queues
Statistik
Timeline
Settings/Test
Eingehend
Produktion
Live-Test
```

### Tab-Zwecke

```text
Übersicht      - kompakter Kurzstatus, Statistik-Kurzwerte, letzte Timeline-Eintraege
Queues         - Display-Queue und Official-Queue inklusive Retry-/Remove-Aktionen
Statistik      - bestehende Filter und Tabellen
Timeline       - vollstaendige Timeline-Tabelle
Settings/Test  - Testausloesung, Live-Gate, kompakte Settings-Anzeige
Eingehend      - eingehende Shoutouts, ausgehende EventSub-Bestaetigungen, letzte Events
Produktion     - Production-/Send-Readiness, Blocker, Warnungen, Scopes, Subscription-Details
Live-Test      - echte Test-/Entscheidungsansicht fuer spaetere !so-Entscheidung
```

## Inbound-/Outbound-Shoutout-Events

Eingehende und von uns erstellte offizielle Twitch-Shoutouts werden in vorhandene Zustaendigkeiten integriert:

```text
twitch.js empfaengt/verarbeitet Twitch/EventSub.
clip_shoutout.js speichert und aggregiert Shoutout-Events.
Dashboard zeigt die Daten im Tab Eingehend.
```

Neue/gesicherte Tabelle:

```text
clip_shoutout_inbound_events
```

Wichtig:

```text
CREATE TABLE IF NOT EXISTS
keine SQLite-Datei ersetzen
keine bestehende DB ueberschreiben
```

Neue/gesicherte Export-Funktion:

```text
recordTwitchShoutoutEvent(...)
```

Gesicherte EventBus-Actions:

```text
shoutout.inbound.received
shoutout.outbound.created
```

## Production-Check

Der Production-Check dient als Sicherheitspruefung vor einer spaeteren produktiven `!so`-Entscheidung.

Beteiligte Module:

```text
twitch.js liefert EventSub-Status inklusive Shoutout-Readiness.
clip_shoutout.js bewertet EventSub-Status und gespeicherten Twitch-User-OAuth-Token.
Dashboard-Tab Produktion zeigt die Bewertung.
```

Der Check prueft unter anderem:

```text
gespeicherter User-OAuth-Token gueltig
TWITCH_BROADCASTER_ID vorhanden
Token-User passt zur WebSocket-moderator_user_id-Logik
moderator:read:shoutouts oder moderator:manage:shoutouts vorhanden
moderator:manage:shoutouts fuer aktives Senden vorhanden
EventSub-WebSocket verbunden
channel.shoutout.create konfiguriert und in aktueller Session bekannt
channel.shoutout.receive konfiguriert und in aktueller Session bekannt
```

## Live-Test / Decision Prep

Der Live-Test bereitet die echte Entscheidungslage fuer eine spaetere produktive `!so`-Umstellung vor.

Die Auswertung kombiniert:

```text
production-check
gespeicherte Incoming-/Outgoing-Shoutout-EventSub-Daten
Debug-vs.-echte EventSub-Beobachtungen
sichere Empfehlung zur naechsten Aktion
```

Wichtig:

```text
STEP486 stellt nichts automatisch produktiv um.
backend/modules/twitch.js wurde in STEP486 nicht veraendert.
Keine neue Moduldatei.
Keine neue Tabelle.
Keine Aenderung an .env, Tokens oder Secrets.
Keine SQLite-Datei ersetzt oder ueberschrieben.
```

## Gesicherte Routen

```text
GET  /api/clip-shoutout/status
GET  /api/clip-shoutout/queue
GET  /api/clip-shoutout/timeline
GET  /api/clip-shoutout/stats
GET  /api/clip-shoutout/inbound
GET  /api/clip-shoutout/inbound/stats
POST /api/clip-shoutout/inbound/debug
GET  /api/clip-shoutout/production-check
GET  /api/clip-shoutout/live-test
GET  /api/clip-shoutout/decision-prep
GET  /api/twitch/eventsub/status
```

## Test-/Pruefregeln

Syntaxchecks:

```powershell
node --check backend\modules\twitch.js
node --check backend\modules\clip_shoutout.js
node --check htdocs\dashboard\modules\shoutout.js
```

Runtime-Checks:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/status"
Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/queue"
Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/timeline"
Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/stats"
Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/inbound"
Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/inbound/stats"
Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/production-check"
Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/eventsub/status"
Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/live-test"
Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/decision-prep"
```

Dashboard-Pruefung:

```text
/dashboard/ oeffnen -> Shoutout-System -> alle Tabs pruefen
```

Debug-Event lokal:

```powershell
curl -X POST http://127.0.0.1:8080/api/clip-shoutout/inbound/debug -H "Content-Type: application/json" -d "{\"direction\":\"incoming\",\"from\":\"testsender\",\"to\":\"forrestcgn\",\"viewerCount\":12}"
```

## Archivierungsfreigabe nach Konsolidierung

Nach Commit dieser Datei duerfen folgende alten STEP-Dateien per Dry-Run/Apply archiviert werden:

```text
project-state/STEP483_SHOUTOUT_DASHBOARD_TABS.md
project-state/STEP484_SHOUTOUT_INBOUND_EVENTSUB_INTEGRATION.md
project-state/STEP485_SHOUTOUT_PRODUCTION_CHECK.md
project-state/STEP486_SHOUTOUT_LIVE_TEST_AND_DECISION_PREP.md
```

Geplanter Zielordner:

```text
project-state/archive/2026-05-30-step568-shoutout-state/
```

## Nicht betroffen

Diese Konsolidierung ist Dokumentation.

Nicht geaendert:

```text
backend/**
htdocs/**
config/**
data/**
SQLite
Dashboard-Code
Overlay-Code
Runtime-Dateien
.env
secrets/**
Tokens
```

## Keine Funktionalitaet entfernen

Bestehende Shoutout-, Twitch-, EventSub-, Dashboard-, Queue-, Timeline-, Statistik- und Debug-Funktionalitaet darf durch diese Konsolidierung nicht entfernt oder ungeprueft ersetzt werden.

<!-- STEP609_SHOUTOUT_CLIP_FEATURES_DOCS_BATCH_START -->

## STEP609 Shoutout / Clip Features Module Docs Batch

Stand: 2026-05-30

Dieser Abschnitt dokumentiert den Shoutout-/Clip-Feature-Anteil aus dem von STEP608 bestimmten naechsten Modul-Doku-Batch.

### Batch

Batch: E_shoutout_clip_features
Ziel-Doku: docs/system-inspection/SHOUTOUT_SYSTEM_CONSOLIDATION.md
Module im Batch: 1
High Priority: 0
Review Priority: 0
Route Hits: 8
Quelle: system-scan-output/step608_next_real_module_doc_batch_rows.tsv
Generated: 2026-05-30 11:56:01

### Arbeitsregel

1. Diese Eintraege sind scan-/triagebasiert.
2. Sie beschreiben Doku-Bedarf fuer Shoutout-/Clip-nahe Module, keine neue Funktionalitaet.
3. Bestehende produktive Shoutout-/Clip-Flows duerfen dadurch nicht geaendert werden.
4. Keine produktive Route ungeprueft aus Scan-Treffern ableiten.
5. Echte Moduldatei und Router-Kontext bleiben massgeblich.

### Shoutout-/Clip-nahe Module in diesem Batch

| Priority | Module | File | Route Hits | Action |
|---|---|---|---:|---|
| normal | clip_shoutout | backend/modules/clip_shoutout.js | 8 | review_existing_doc_section |

### Abgrenzung

Dieser Abschnitt ist eine Doku-/Review-Zwischenablage fuer Shoutout-/Clip-nahe Scan-Kandidaten.

Er ersetzt keine fachliche Shoutout- oder Clip-System-Doku und trifft keine Aussage darueber, ob eine Route produktiv, intern, diagnostisch oder historisch ist.

### Naechster Schritt

STEP610 - Shoutout / Clip Features Batch Verification

Ziel: Pruefen, ob der STEP609-Abschnitt sauber in der Shoutout-System-Konsolidierungsdoku steht und danach die verbleibenden Doku-Batches bestimmen.

<!-- STEP609_SHOUTOUT_CLIP_FEATURES_DOCS_BATCH_END -->

