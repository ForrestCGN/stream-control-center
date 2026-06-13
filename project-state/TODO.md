# TODO

Stand: EVS-5d / Text Multi-Phrase + Word Points Documentation  
Datum: 2026-06-13

## Event-System – erledigt / dokumentiert

- [x] Backend-Basis `stream_events` erstellt.
- [x] Dashboard-Skeleton erstellt.
- [x] MediaPicker für Audio-Schnipsel vorbereitet.
- [x] MediaPicker für optionales Auflösungs-Video vorbereitet.
- [x] Sound-Konfiguration optisch in Audio/Video-Karten aufgeteilt.
- [x] Text-Spiel-Regel festgelegt: erster kompletter Löser eines Satzes gewinnt.
- [x] Teiltreffer-Hinweise als Konfiguration vorbereitet.
- [x] Mehrere geheime Sätze als fachliche Regel dokumentiert.
- [x] Teiltreffer-Meldung allgemein oder mit Satznummer dokumentiert.
- [x] Optionale Anzeige der gefundenen Wortanzahl dokumentiert.
- [x] Optionale Wortpunkte dokumentiert.
- [x] Config-Dashboard und Text-Config/Multi-Texte als spätere Pflicht festgehalten.

## Text-Spiel Backend-/Runtime-TODO

- [ ] Text-Spiel als Satz-Pool statt Einzelsatz umsetzen.
- [ ] Anzahl geheimer Sätze konfigurierbar machen.
- [ ] Pro Satz eigene Antwortvarianten ermöglichen.
- [ ] Pro Satz eigene Lösungspunkte ermöglichen.
- [ ] Satzstatus speichern: offen / gelöst / übersprungen / entfernt.
- [ ] Nach kompletter Lösung nur diesen Satz aus der Rotation entfernen.
- [ ] Andere Sätze weiter offen lassen.
- [ ] Teiltreffer pro Event/Satz/User/Wort speichern.
- [ ] Ein Wort pro User und Satz nur einmal melden/zählen.
- [ ] Teiltreffer-Hinweis-Modi umsetzen: aus / allgemein / mit Satznummer.
- [ ] Optionale Anzeige der gefundenen Wortanzahl umsetzen.
- [ ] Optionales Wortpunkte-System umsetzen.
- [ ] Punkte pro neuem Wort konfigurierbar machen.
- [ ] Optionales Wortpunkte-Limit pro User und Satz umsetzen.
- [ ] Wortpunkte und Lösungspunkte sauber in die gemeinsame Eventwertung schreiben.

## Sound-Spiel TODO

- [ ] Mehrere Sound-Schnipsel pro Event planen/umsetzen.
- [ ] Antwortvarianten pro Sound-Schnipsel ermöglichen.
- [ ] Punkte pro Sound-Schnipsel ermöglichen.
- [ ] Status/Rotation pro Sound-Schnipsel speichern.
- [ ] Regel für nicht erkannte Schnipsel konfigurieren: später erneut / entfernen / manuell.
- [ ] Sound-Playback über vorhandenes Sound-/Media-System anbinden.

## Dashboard-/Config TODO

- [ ] Config-Dashboard für Event-System planen/einbauen.
- [ ] Text-Config / Multi-Texte im Dashboard planen/einbauen.
- [ ] Satzverwaltung im Dashboard planen: hinzufügen/bearbeiten/löschen/aktivieren.
- [ ] Sound-Schnipsel-Verwaltung im Dashboard planen.
- [ ] Teiltreffer-Regeln streamer-/modfreundlich darstellen.
- [ ] Wortpunkte-Regeln streamer-/modfreundlich darstellen.
- [ ] Chatmeldungen über `helper_texts` / `module_text_variants` pflegen.
- [ ] Keine parallele Textstruktur bauen.

## Spätere Runtime TODO

- [ ] Chat-Auswertung über bestehendes `twitch.chat.message` / Communication Bus.
- [ ] Event-Overlay.
- [ ] Ranking-/Top3-Anzeige.
- [ ] Sound-/Text-Statistiken.
- [ ] Audit-/Diagnose-Status für Event-System.
