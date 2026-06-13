# CURRENT_STATUS – EVS-12

Stand: EVS-12 / Text Runtime Dashboard Report

## Aktueller Stand

Das Event-System hat nun eine erste echte Dashboard-Auswertung fuer die Text-Runtime.

Sichtbar im Dashboard:

- Ranking fuer das ausgewaehlte Event
- Worttreffer
- Satzloesungen
- vorbereitete Chatmeldungen (`directSend=false`, `via=bus_payload`)
- Zaehler auf laufenden Event-Karten

## Backend

`GET /api/stream-events/text-runtime/report` liefert neben Worttreffern, Satzloesungen und Ranking jetzt auch `chatOutputs` als Report-Vorschau.

## Unveraendert

- Keine direkte Twitch-Chat-Ausgabe.
- Kein Sound-Playback.
- Kein Overlay.
- Keine neue Bus-Struktur.
- Keine destruktive DB-Aenderung.

## Naechste sinnvolle Schritte

- Dashboard-Test mit aktivem Text-Testevent.
- Danach optional Chat-Ausgabe-Bruecke planen: Chat-/Bot-Modul uebernimmt vorbereitete Bus-Payloads.
- Oder Sound-Runtime vorbereiten.
