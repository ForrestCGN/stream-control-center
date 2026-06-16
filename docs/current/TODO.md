# TODO – stream-control-center

Stand: 2026-06-16

## Erledigt / bestätigt

- [x] EVENTSYS-26A Sound-Event Dashboard unterstützt mehrere Sound-Schnipsel.
- [x] EVENTSYS-26B Sound-Schnipsel und Text-Spiel haben getrennte Editor-Fenster.
- [x] EVENTSYS-26B-FIX1 MediaPicker-State wird beim Öffnen/Neu-Rendern erhalten bzw. aufgelöst.
- [x] EVENTSYS-26B-FIX2 Sound-Schnipsel-Summary aktualisiert sich beim Bearbeiten.
- [x] EVENTSYS-26B-FIX3 Sound-Schnipsel werden konkret pro Schnipsel validiert.
- [x] EVENTSYS-26B-FIX4 Eventdetails/Eventliste/Startbereit-Status werden nach Speichern neu geladen.
- [x] EVENTSYS-27A globale Sound-Defaults erweitert.
- [x] EVENTSYS-27A eventbezogenes Fenster `Einstellungen bearbeiten` eingebaut.
- [x] EVENTSYS-27A Config- und Event-Einstellungen funktional geprüft.

## Aktuell offen / als nächstes bauen

- [ ] EVENTSYS-27B Live-Statusfenster für laufende Events:
  - [ ] Button `Status & Punkte öffnen` bei laufendem Event.
  - [ ] Eventstatus anzeigen.
  - [ ] Rangliste/Punkte anzeigen.
  - [ ] aktuelle Runde anzeigen, soweit Backenddaten vorhanden.
  - [ ] Rundenverlauf anzeigen, soweit Backenddaten vorhanden.
  - [ ] Sound-Rotation anzeigen, sobald Runtime-Daten vorhanden sind.
- [ ] EVENTSYS-27C Manuelle Sound-Rundensteuerung:
  - [ ] `Nächsten Schnipsel abspielen/vorbereiten`.
  - [ ] aktuelle Runde anzeigen.
  - [ ] Runde überspringen.
  - [ ] Runde als ungelöst markieren.
  - [ ] manuelle Auslösung dauerhaft behalten.
- [ ] EVENTSYS-27D Sound-/Media-Playback-Anbindung:
  - [ ] vorhandenes Sound-System prüfen.
  - [ ] vorhandenes Media-System prüfen.
  - [ ] Payload aus Sound-Runtime an vorhandenes System senden.
  - [ ] kein paralleles Playback-System bauen.
- [ ] EVENTSYS-27E Automatik:
  - [ ] zufälliges Abspielen alle X ± Y Minuten.
  - [ ] Intervall/Jitter aus Event-Einstellungen nutzen.
  - [ ] Wiederholschutz beachten.
  - [ ] Solved/Unresolved-Policies beachten.
- [ ] EVENTSYS-27F Auflösungs-Video:
  - [ ] Video nach Lösung abspielen, wenn vorhanden und aktiviert.
  - [ ] Media-System nutzen.
- [ ] EVENTSYS-27G Chat-Ausgaben:
  - [ ] helper_texts/helper_messages nutzen.
  - [ ] Zufallsvarianten.
  - [ ] CGN-/Heimleitung-/Rentner-/Altersheim-Stil.
  - [ ] keine harten Chattexte im Runtime-Code.
- [ ] EVENTSYS-27H Statistik-Ausbau:
  - [ ] pro Event.
  - [ ] optional global.
  - [ ] gespielt / erkannt / nicht erkannt / Lösungsquote / schnellste Antwort / Top-Spieler.

## Später / nicht vergessen

- [ ] Doku nach 27B erneut aktualisieren.
- [ ] docs/modules/stream_events.md bei jedem größeren Runtime-Step weiterführen.
- [ ] Dashboard weiterhin streamer-/modfreundlich halten.
- [ ] Technische Diagnose nicht in normale Bedienansicht kippen.
- [ ] Live-Chat-Ausgaben erst separat freigeben.
- [ ] Safety-/Audit-/Rollenprüfung bei produktiven Live-Aktionen beachten.

## Nicht wieder einführen

- [ ] Ein riesiges Event-Bearbeiten-Modal mit Sound, Text, Einstellungen und Live-Steuerung zusammen.
- [ ] Sound-Playback parallel zum vorhandenen Sound-/Media-System.
- [ ] Chat-Ausgaben direkt hart im Code.
- [ ] Automatik ohne manuelle Steuerungsmöglichkeit.
- [ ] Event-Defaults als hart codierte einzige Wahrheit statt Config/DB.
- [ ] Alte Loyalty/Raffle-Doku als aktueller Eventsystem-Startpunkt.
