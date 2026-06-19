# NEXT_STEPS

Stand: 2026-06-19

## Nächster empfohlener Schritt: SHOT-ALARM-2F Cleanup / Feinschliff

Ziel:

- Kleine Inkonsistenzen und Live-Feinschliff bereinigen, ohne neue Hauptlogik zu bauen.

Vor Umsetzung prüfen:

- `backend/modules/shot_alarm.js`
- `htdocs/dashboard/modules/stream_events.js`
- `htdocs/dashboard/modules/shot_alarm.js`
- `docs/modules/shot_alarm.md`

Konkrete Punkte:

1. Audit-Action-Namen vereinheitlichen:
   - Ziel: `shot_alarm.resolve_pending`
   - aktuell im Test einmal mit `_`, einmal mit `-` gesehen.
2. Dashboard-Audit-Anzeige prüfen/ggf. im Shot-Alarm-Tab sichtbarer machen.
3. OBS-Overlay im echten Livebild prüfen und optisch feinjustieren.
4. Echte Chat-Tests mit `!shotdone` und `!shotgetrunken`.
5. Echte Ko-fi/Tipeee-Testevents über Anbieter-Dashboard gegen Webhook prüfen, sofern Webhooks aktiv eingerichtet sind.

## Danach sinnvolle Schritte

1. Shot-Alarm-Soundpool im Dashboard an vorhandenes Sound-/Media-System anbinden.
2. Persistente Counter nach Neustart planen/umsetzen.
3. Statistik-/History-Ansicht im Dashboard erweitern.
4. Dashboard-Aktionen später an zentrales Audit-/Rechtesystem anbinden, wenn dieses final freigegeben ist.
5. Optional: Payment-Bus-Events in zentraler Diagnose/Bus-Ansicht sichtbarer machen.

## Aktuell abgeschlossen

- SHOT-ALARM-2C `!shotdone` Command.
- SHOT-ALARM-2D Dashboard Audit Safety.
- SHOT-ALARM-2E Ko-fi/Tipeee Payment-Bus Integration.
- SHOT-ALARM-2E Payment History ID Fix.
- End-to-End-Test Payment → Shot-Alarm → `!shotdone`.
