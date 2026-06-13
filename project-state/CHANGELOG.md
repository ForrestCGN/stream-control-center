# CHANGELOG

## EVS-3 / Stream Events Dashboard Skeleton – 2026-06-13

- Neues Dashboard-Modul `htdocs/dashboard/modules/stream_events.js` erstellt.
- Neues Styling `htdocs/dashboard/modules/stream_events.css` erstellt.
- `htdocs/dashboard/index.html` um CSS, Panel und Script fuer `stream_events` erweitert.
- Event-System wird im Community-Bereich als Dashboard-Kachel registriert.
- Eventliste, Details, Erstellen/Bearbeiten, Validierung, Start/Finish/Cancel und Ranking-Anzeige vorbereitet.
- Einfache Sound-/Text-Konfiguration fuer erste gueltige Events vorbereitet.
- Keine Backend-Aenderung.
- Keine DB-Aenderung.
- Keine Twitch-Chat-Auswertung.
- Kein Sound-/Video-Playback.
- Kein Overlay.
- Keine bestehende Funktionalitaet entfernt.

## EVS-2 / Stream Events Backend Foundation – 2026-06-13

- Neues Backend-Modul `backend/modules/stream_events.js` erstellt.
- API-Prefix `/api/stream-events` eingeführt.
- Event-Entwürfe, Spieltyp-Auswahl Sound/Text und Validierung vorbereitet.
- Regel umgesetzt: nur ein aktives Event gleichzeitig.
- Score-Ledger und Ranking/Top 3 vorbereitet.
- DB-Schema-Skeleton für Events, Score-Einträge und Runden ergänzt.
- Communication-Bus-Registrierung, Heartbeat und Status-Publishing ergänzt.
- Erste Textvarianten für `stream_events` über `helper_texts` vorbereitet.

## EVS-1 / Event System Planning – 2026-06-13

- Architektur für Event-System geplant.
- Regeln festgelegt: mehrere Events vorbereitbar, nur ein aktives Event, Sound und/oder Text pro Event.
- DB-/Dashboard-Config, Multi-Texte, Bus, Twitch-Events, Sound-/Media-System und Helper-Nutzung als Pflicht festgelegt.

