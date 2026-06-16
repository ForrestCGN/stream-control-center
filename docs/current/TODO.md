# TODO – stream-control-center

Stand: 2026-06-16

## Erledigt / bestätigt

- [x] Eventsystem als aktueller Arbeitsblock wieder aufgenommen.
- [x] EVENTSYS-26A: Sound-Event Mehrfach-Schnipsel im Dashboard.
- [x] EVENTSYS-26B: getrennte Editor-Fenster für Sound-Schnipsel und Text-Spiel.
- [x] EVENTSYS-26B-FIX1: MediaPicker-State beim Öffnen/Neu-Rendern erhalten.
- [x] EVENTSYS-26B-FIX2: Sound-Editor-Summary nach Änderungen sofort aktualisieren.
- [x] EVENTSYS-26B-FIX3: konkrete Sound-Schnipsel-Validierung mit Live-Refresh.
- [x] EVENTSYS-26B-FIX4: Eventdetails nach Speichern neu laden.
- [x] EVENTSYS-27A: globale Sound-Defaults + Event-spezifisches Einstellungsfenster.
- [x] EVENTSYS-DOCS-1: Eventsystem 27A dokumentiert.
- [x] EVENTSYS-27B: Live-Statusfenster für laufende Events vorbereitet.
- [x] EVENTSYS-27C: Events kopieren.
- [x] EVENTSYS-27C-FIX1: Eventnamen bearbeiten + Kopie benennen.
- [x] EVENTSYS-27C-FIX2: Editor-Regressionsfix nach Umbenennen/Kopieren.
- [x] EVENTSYS-27D: manuelle Sound-Rundensteuerung vorbereitet.
- [x] EVENTSYS-27D-FIX1: Reload nach mutierenden Buttons.
- [x] EVENTSYS-27D-FIX2: Live-Bedienung in der Übersicht.

## Aktuell offen / als nächstes

- [ ] SOUND-SAFE-1: Sound-System prüfen und sicheren Erweiterungspunkt für EventSound + Countdown-PreRoll festlegen.
  - [ ] `backend/modules/sound_system.js` vollständig prüfen.
  - [ ] Sound-System Overlay prüfen.
  - [ ] `/api/sound/play` Payload prüfen.
  - [ ] Queue-/Busy-/Prioritätslogik prüfen.
  - [ ] Media-ID Playback prüfen.
  - [ ] Rückmeldung/Status/Bus-Events prüfen.
  - [ ] Kompatibilitätsregel dokumentieren: ohne neue Felder exakt altes Verhalten.

- [ ] SOUND-SAFE-2: optionalen Countdown-PreRoll im Sound-System additiv einbauen.
  - [ ] `preRoll` optional unterstützen.
  - [ ] `preRoll.enabled !== true` -> altes Verhalten.
  - [ ] Countdown als Teil desselben Queue-Jobs.
  - [ ] CGN-Stil Overlay 3 → 2 → 1.
  - [ ] Kein Eingriff in alte Sound-Flows.

- [ ] EVENTSYS-27E: Event-Sound-Playback über Sound-System-Queue.
  - [ ] `Nächsten Schnipsel vorbereiten` zu `Nächsten Schnipsel abspielen` erweitern.
  - [ ] Runde erstellen/vorbereiten.
  - [ ] Sound-System-Job mit Media-ID senden.
  - [ ] Countdown-Config aus Event/Defaults beachten.
  - [ ] Status & Punkte Fenster aktualisieren.

- [ ] EVENTSYS-27F: Antwortphase + Timer.
  - [ ] Antwortzeit aus Event-Einstellungen.
  - [ ] Restzeit anzeigen.
  - [ ] Timeout als ungelöst markieren.
  - [ ] manuelle Runde sauber beenden/überspringen.

- [ ] EVENTSYS-27G: Chat-Antworten über Twitch-Events prüfen.
  - [ ] `twitch.chat.message` weiter als einzige Chat-Quelle nutzen.
  - [ ] Antworten gegen aktive Sound-Runde prüfen.
  - [ ] Punkte buchen.
  - [ ] gelöste Schnipsel je nach Config aus Rotation entfernen.

- [ ] EVENTSYS-27H: Chat-Ausgaben.
  - [ ] Textkeys über helper_texts/helper_messages.
  - [ ] CGN-/Heimleitung-/Rentner-/Altersheim-Stil.
  - [ ] mehrere aktive Varianten.
  - [ ] Platzhalter: User, Punkte, Sekunden, Schnipsel.

- [ ] EVENTSYS-27I: Auflösungs-Video nach richtiger Antwort.
  - [ ] Video nur wenn vorhanden und Config aktiv.
  - [ ] über Media-/Sound-System bzw. vorhandene Overlaystruktur.
  - [ ] kein Parallel-Playback.

- [ ] EVENTSYS-27J: Auto-Rotation.
  - [ ] zufällig alle X ± Y Minuten.
  - [ ] Mindestabstand zwischen Schnipseln.
  - [ ] Wiederholschutz.
  - [ ] Auto-Weiter nur wenn manuelles Playback stabil ist.

- [ ] EVENTSYS-DOCS-2: Doku nach Sound-System-Anbindung aktualisieren.

## Dauerhafte Regeln

- [ ] Keine Funktionalität entfernen.
- [ ] Ersetzte Altlogik nach Tests gezielt entfernen, aber keine aktive Produktivlogik brechen.
- [ ] Bestehendes Sound-System muss unverändert weiterlaufen.
- [ ] Keine parallele Sound-Queue bauen.
- [ ] Countdown darf nicht am Sound-System vorbei laufen.
- [ ] Config über DB/Helper, nicht hart im Code.
- [ ] Chat-Auswertung über Twitch-Events, keine parallele Chat-Abfrage.
- [ ] Chattexte über helper_texts/helper_messages und dashboardfähige Varianten.
