# TODO – EVS-8

## Erledigt bis EVS-8

- Backend Foundation.
- Dashboard Skeleton.
- MediaPicker Vorbereitung.
- Sound-/Text-Konfiguration im Event-Editor.
- Multi-Satz-Text-Spiel vorbereitet.
- Text-Config / Multi-Texte vorbereitet.
- Dashboard-Flow korrigiert:
  - Übersicht = laufende Events.
  - Events = konfigurierte Events mit Status.
  - Bearbeitung = separates Modal.
- Config-Tab mit globalen Defaults vorbereitet.

## Offen: Config

- Rechte/Freigaben für Config.
- Weitere Streamer-/Mod-freundliche Labels.
- Prüfen, welche Defaults automatisch in neue Events übernommen werden sollen.
- Config ggf. in Kategorien/Tabs weiter verfeinern.

## Offen: Runtime

- Sound-Rotation.
- Text-Rotation.
- Chat-Auswertung.
- Teiltreffer/Wortpunkte.
- Punktevergabe.
- Eventabschluss / Top 3.

## Offen: Statistik / Overlay

- Statistik pro Event.
- Sound-Statistik.
- Text-Statistik.
- Overlay-Anzeige.


## TODO nach EVS-9

- [ ] Bus-Status im Dashboard spaeter schoener anzeigen.
- [ ] Runtime-Events bei echter Chat-Auswertung konkretisieren.
- [ ] Sound-Runden-Events final festlegen.
- [ ] Text-Worttreffer-Events final festlegen.
- [ ] Punkte-/Ranking-Events mit Statistik verbinden.
- [ ] Keine parallele Bus-Struktur bauen; weiterhin `communication_bus` nutzen.

- [ ] EVS-10 mit aktivem Testevent testen
- [ ] Chat-Ausgabe fuer Teiltreffer/Loesungen sauber ueber vorhandene Twitch-/Message-Struktur planen
- [ ] Text-Runtime-Statistik im Dashboard anzeigen
- [ ] Sound-Runtime/Rotation vorbereiten
- [ ] Overlay-Runtime vorbereiten


## EVS-10b – Text Runtime Test Helpers

- Build: `STEP_EVS_10B_TEXT_RUNTIME_TEST_HELPERS`
- Backend-Version: `stream_events` 0.4.1
- Sichere Testhelfer fuer Text-Runtime hinzugefuegt.
- Neue Route: `GET /api/stream-events/text-runtime/report`
- Neue Route: `POST /api/stream-events/text-runtime/create-test-event?confirm=1`
- Keine direkte Chat-Ausgabe, kein Sound-Playback, kein Overlay.
