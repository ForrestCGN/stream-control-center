# NEXT_STEPS – stream_events / Event-System

Stand: 2026-06-13 nach EVS-19e

## Nächster sinnvoller Schritt

### EVS-20 – ChatOutput Dispatcher Prep / Live-Schalter-Konzept

Ziel:

```text
Vorbereitete ChatOutputs aus Text- und Sound-Spiel an das vorhandene Chat-/Bot-Ausgabesystem anschließbar machen, aber weiterhin geschützt und konfigurierbar.
```

Scope:

- Vorhandene Chat-/Bot-Ausgabe verwenden, keine zweite Ausgabestruktur bauen.
- `directSend=false` bleibt Default.
- Config-/Dashboard-Schalter vorbereiten.
- Rate-Limit und Spam-Schutz einplanen.
- Gleichzeitige Sound+Text-Lösung berücksichtigen.
- Option für gebündelte Chat-Ausgabe planen, damit nicht zwei Nachrichten gleichzeitig spammen.
- Debug-Antworten bleiben nur API-/Dashboard-Test und dürfen nie in Chat/Overlay.
- Live-Schalter sichtbar als gefährlicher Status: „LIVE-AUSGABE AKTIV“.

Nicht Ziel von EVS-20:

- Kein automatisches Direkt-Senden ohne Config.
- Kein Sound-Playback.
- Keine Sound-System-Queue-Berührung.
- Kein Overlay-Livebetrieb.

## Danach sinnvolle Schritte

### EVS-21 – Sound-System Playback Integration Prep

Ziel:

- Vorbereitete Playback-Payloads an vorhandenes Sound-System anbinden.
- Anfangs weiterhin geschützt per Config-Schalter.
- Sound-System-Queue nur kontrolliert und optional berühren.
- Kein zweiter Player.

### EVS-22 – Dashboard Live Safety / Admin-Schalter

Ziel:

- Live-Schalter im Dashboard streamer-/modfreundlich darstellen.
- Klare Warnungen und Statusanzeigen.
- Rechte/Freigaben berücksichtigen.
- Audit-Log für Aktivierungen vorbereiten.

### EVS-23 – Event Overlay Prep

Ziel:

- Ein zentrales Event-Overlay vorbereiten.
- Anzeige aktiver Eventname, Modus, aktive Soundrunde/Textstatus, Punkte/Ranking.
- Noch keine überladene Show.

### EVS-24 – Event-Ende / Top 3 / Abschluss

Ziel:

- Event sauber beenden.
- Top 3 Ranking ausgeben/vorbereiten.
- Textvarianten für Abschluss nutzen.
- Dashboard/Overlay/ChatOutput vorbereitet.

### EVS-25 – Statistik langfristig

Ziel:

- User-/Event-/Sound-/Text-Statistiken langfristig auswertbar machen.
- „User X: wann, wo, welcher Sound, welches Wort, welcher Satz, Punkte“.
- Sound-Snippet-Erkennungsquote und Text-Lösungsquote.

## Offene UX-/Dashboard-Aufgaben

- Statistik-Untertabs weiter glätten, falls Bedienung noch hakelt.
- User-Popup scrollbar und AutoReload weiter testen.
- Texte-Tab Filter weiter verfeinern.
- Event-Editor später für echte Sound-/Text-Konfiguration produktionsreif machen.
- Sound-Antworten im Test-/Debugbereich sichtbar lassen, aber niemals im Overlay/Chat.

## Offene Fachfragen

- Sollen Sound-Misses bei jedem Chat gezählt werden oder nur bei Nachrichten mit Mindestähnlichkeit?
- Soll eine kombinierte ChatOutput-Zusammenfassung gebaut werden, wenn Sound und Text gleichzeitig gelöst werden?
- Wie sollen Live-Schalter im Dashboard exakt heißen und wer darf sie aktivieren?
- Soll eine gleichzeitig gelöste Sound+Text-Nachricht später eine gemeinsame Chatmeldung oder zwei getrennte Meldungen erzeugen?
