# CURRENT_STATUS – EVS-8

Stand: EVS-8 / Config-Dashboard Vorbereitung

## Aktueller Stand

Das Event-System-Dashboard hat jetzt die Haupttabs:

- Übersicht
- Events
- Texte
- Config
- Statistik
- Overlay

Übersicht zeigt laufende Events. Events zeigt die konfigurierten Events mit Status. Bearbeitung läuft über ein separates Editor-Fenster.

Der Config-Tab ist jetzt als erster echter Einstellbereich vorbereitet. Globale Defaults können geladen und gespeichert werden.

## Config umfasst

- Allgemeine Event-Defaults
- Sound-Spiel Defaults
- Text-Spiel Defaults
- Wortpunkte Defaults
- Overlay Defaults

## Unverändert

Keine produktive Runtime für Chat, Worterkennung, Sound-Playback oder Overlay.

## Offen

- Rechte/Freigaben für Config.
- Event-Statistik pro Event.
- Sound-/Text-Runtime.
- Chat-Auswertung.
- Overlay.


## EVS-9 – EventBus / Heartbeat Integration

Aktueller Stand: `stream_events` hat nun einen eigenen sichtbaren EventBus-/Heartbeat-Step. Das Modul nutzt den vorhandenen `communication_bus`, registriert sich dort als Backend-Modul, sendet Heartbeats und publisht Modulstatus. Zusaetzlich gibt es `GET /api/stream-events/bus-status` fuer Diagnose/Monitoring.

Nicht enthalten: Chat-Runtime, Sound-Playback, Worterkennung, automatische Punktevergabe, Overlay.

EVS-10 Text Chat Runtime Prep ist vorbereitet. Text-Spiel kann aktive Events ueber twitch.chat.message aus dem bestehenden Communication-Bus auswerten; Worttreffer und Satzloesungen werden gespeichert und Punkte optional gebucht. Kein Sound-Playback, Overlay oder direkter Chat-Send in diesem Step.


## EVS-10b – Text Runtime Test Helpers

- Build: `STEP_EVS_10B_TEXT_RUNTIME_TEST_HELPERS`
- Backend-Version: `stream_events` 0.4.1
- Sichere Testhelfer fuer Text-Runtime hinzugefuegt.
- Neue Route: `GET /api/stream-events/text-runtime/report`
- Neue Route: `POST /api/stream-events/text-runtime/create-test-event?confirm=1`
- Keine direkte Chat-Ausgabe, kein Sound-Playback, kein Overlay.


## EVS-11 – Text Chat Output Prep

- Build: `STEP_EVS_11_TEXT_CHAT_OUTPUT_PREP`
- Backend-Version: `stream_events` 0.4.2
- Chattexte werden fuer Text-Worttreffer, Wortpunkte und Satzloesungen als Bus-Payload vorbereitet.
- Keine direkte Twitch-Chat-Ausgabe.
- Textvarianten: je 5 Altersheim-/CGN-/Rentner-/Heimleitungs-Varianten pro relevantem Key.


## EVS-11b – Text Chat Output Test Visibility

Aktueller Zusatzstand: vorbereitete Text-Chat-Ausgaben sind in den Test-Responses sichtbar. Direkte Twitch-Ausgabe bleibt deaktiviert.


## EVS-11c – SafeJson Chat Output Fix

Der Fehler `safeJson is not defined` im vorbereiteten Text-Chat-Output wurde behoben. Direkte Twitch-Chat-Ausgabe bleibt weiterhin deaktiviert.
