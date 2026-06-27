# CURRENT CHAT HANDOFF – EVS-8 Config Dashboard Prep

Stand: EVS-8 / Config-Dashboard Vorbereitung

## Ziel

Der Config-Tab ist nicht mehr nur Platzhalter. Globale Standardwerte für das Event-System können im Dashboard angezeigt, bearbeitet und per Backend gespeichert werden.

## Geändert

- `backend/modules/stream_events.js`
  - `GET /api/stream-events/config`
  - `POST /api/stream-events/config`
  - `stream_events_config` als globale Config-Tabelle
  - Normalisierung/Fallbacks für Config-Werte
- `htdocs/dashboard/modules/stream_events.js`
  - Config-Tab mit Formularen für Allgemein, Sound, Text, Wortpunkte und Overlay Defaults
  - Config laden/speichern
  - neue Events nutzen erste Defaults aus der Config
- `htdocs/dashboard/modules/stream_events.css`
  - Config-Layout ergänzt

## Wichtig

Die Config ist global und nicht eventbezogen. Events selbst bleiben im Events-Tab sichtbar und werden im separaten Editor-Fenster bearbeitet.

## Nicht enthalten

- Keine Chat-Runtime
- Keine Worterkennung
- Keine automatische Punktevergabe
- Kein Sound-Playback
- Kein Overlay
- Keine Rechte-/Rollenlogik

## Test

```powershell
node -c .\backend\modules\stream_events.js
node -c .\htdocs\dashboard\modules\stream_events.js
.\stepdone.cmd "EVS-8 Config Dashboard Prep"
```

Danach Dashboard testen: Tab Config öffnen, Werte ändern, speichern, neu laden.
