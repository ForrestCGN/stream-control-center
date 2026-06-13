# NEXT_STEPS – stream_events / Event-System

Stand: 2026-06-13 nach EVS-21b

## Aktuell bestätigt

EVS-21 ergänzt den Event-Lifecycle für alte Events:

```text
- Archivieren: nur für status=finished; aktives Event wird blockiert
- Löschen: für jeden Status möglich, aber nur mit JSON-Body confirm=DELETE
- Archivieren behält Werte, Löschen entfernt Event + eventUid-Daten
- Eventliste kommt aus API-Feld rows
```

## Sofort sinnvoller nächster Schritt

### EVS-22 – Dashboard Safety View für ChatOutput + Event-Lifecycle

Ziel:

```text
Dashboard soll klar anzeigen:
- Chat-Ausgabe TESTMODUS / LIVE AKTIV
- warum vorbereitete ChatOutputs blockiert werden
- wie viele Outputs vorbereitet sind
- Event-Lifecycle-Aktionen: Archivieren/Löschen nur mit verständlicher Warnung
```

Scope:

- Keine echte Twitch-Ausgabe.
- Kein Sound-Playback.
- Keine Sound-System-Queue-Berührung.
- Archivieren/Löschen im Dashboard nur als sicherer UX-Plan bzw. vorbereitete UI.
- Delete immer mit Bestätigung.
- Archive nur für finished Events sichtbar/aktiv.

## Danach sinnvolle Schritte

### EVS-23 – ChatOutput Live-Schalter vorbereitet

- Config-/Dashboard-Schalter für Live-Chat vorbereiten.
- Weiterhin keine direkte Sendefunktion ohne finalen Go.
- Globaler Schalter + Event-Schalter + Dispatcher-Schalter müssen zusammen passen.

### EVS-24 – Sound-System Playback Integration Prep

- Vorbereitete Playback-Payloads an vorhandenes Sound-System anbinden.
- Anfangs geschützt per Config-Schalter.
- Kein zweiter Player.

### EVS-25 – Event Overlay Prep

- Aktives Event, Modus, aktive Runde, Textstatus und Ranking anzeigen.
- Nicht überladen, streamer-/modfreundlich.

## Offene Fachfragen

- Soll ein abgebrochenes Event später separat archiviert werden dürfen oder nur gelöscht bleiben? Aktuell: Archiv nur `finished`.
- Wie lange sollen archivierte Events im Dashboard sichtbar bleiben?
- Welche Rollen dürfen Hard-Delete ausführen?
