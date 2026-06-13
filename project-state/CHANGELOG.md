# CHANGELOG – stream_events / Event-System

Stand: 2026-06-13

## EVS-24 – Simple Active Event Runtime Gate

- EVS-23 als sichtbar bestätigt dokumentiert.
- Dashboard-Pfad `Event-System → Sicherheit` festgehalten.
- Sichtbarkeit von `Live-Schalter Konzept`, Status `gesperrt` und Hinweis `EVS-23 bleibt Testmodus` dokumentiert.
- Harte Grenze festgehalten: kein echtes Senden, kein Sound-Playback, keine Sound-System-Queue.
- Nächste EVS-24-Optionen dokumentiert.

## EVS-23 – Live-Schalter-Konzept Dashboard Prep

- Modulversion auf `0.5.18` erhöht.
- Build auf `STEP_EVS_24_SIMPLE_ACTIVE_EVENT_RUNTIME_GATE` gesetzt.
- Dashboard-Tab `Sicherheit` um `Live-Schalter Konzept` erweitert.
- Geplante Freigabe-Kette für spätere Chat-Ausgabe sichtbar gemacht.
- Schutzschalter als deaktivierte Anzeige-Checkboxen dargestellt.
- Safety-Tab lädt beim Öffnen den ChatOutput-Sicherheitsstatus.
- Lifecycle-Text korrigiert: Dashboard-Löschen nutzt eine normale Bestätigung.
- Keine Twitch-Ausgabe aktiviert.
- Kein Sound-Playback aktiviert.
- Keine Sound-System-Queue berührt.

## EVS-22c – Completion Documentation

- EVS-22b als bestätigt dokumentiert.
- Doku korrigiert: Dashboard-Löschen nutzt genau eine normale Bestätigung.
- Nächster Schritt EVS-23 als Live-Schalter-Konzept Dashboard Prep festgehalten.

## EVS-22b – Dashboard Single Delete Confirm UX

- Dashboard-Tab `Sicherheit` ergänzt.
- ChatOutput Safety View ergänzt.
- TESTMODUS/LIVE AKTIV sichtbar gemacht.
- Event-Lifecycle-Regeln sichtbar gemacht.
- Löschen im Dashboard auf eine normale Bestätigung ohne Texteingabe umgestellt.

## EVS-21 – Event Archive/Delete Lifecycle Prep

- Archive/Delete-Routen vorbereitet und fachlich bestätigt.
- Archivieren nur bei `finished`.
- Löschen mit JSON-Body `{ "confirm": "DELETE" }`.

## 2026-06-13 – EVS-24 Simple Active Event Runtime Gate

- `stream_events` auf einfache Aktiv/Inaktiv-Regel zurückgeschnitten.
- Stream-Status über vorhandenes `stream_status` berücksichtigt.
- Neuer Endpoint `GET /api/stream-events/runtime-gate/status`.
- Dashboard-Tab `Status` zeigt Aktiv/Inaktiv + Grund.
- Keine Live-Ausgabe, kein Sound-Playback, keine Queue-Berührung.
