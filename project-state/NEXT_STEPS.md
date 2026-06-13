# NEXT_STEPS – stream_events / Event-System

Stand: 2026-06-13 nach EVS-17b

## Sofort sinnvoller nächster Schritt

### EVS-18 – Echter Twitch-Chat für Sound-Antworten

Ziel:

```text
Aktive Sound-Runde soll echte `twitch.chat.message` Bus-Events auswerten.
```

Scope:

- Vorhandenen CommunicationBus nutzen.
- Keine neue Bus-Struktur.
- Sound-Testchat-Logik als Basis verwenden.
- Bei aktiver Sound-Runde echte Twitch-Chatnachricht prüfen.
- Richtige Antwort löst aktive Soundrunde.
- Punkte buchen.
- `sound.solved` ChatOutput vorbereiten.
- Falsche Antwort still zählen/ignorieren, keine Chat-Spam-Ausgabe.
- Weiterhin keine direkte Twitch-Chat-Ausgabe.
- Weiterhin kein direktes Playback.
- Weiterhin keine Sound-System-Queue-Berührung.

Tests:

```powershell
node -c .\backend\modules\stream_events.js
.\stepdone.cmd "EVS-18 Sound Twitch Chat Answer Runtime"
```

Danach mit aktivem Sound-Testevent und aktiver Runde im echten Chat testen.

## Danach sinnvolle Schritte

### EVS-19 – ChatOutput Dispatcher Prep

Ziel:

- Vorbereitete ChatOutputs aus Text- und Sound-Spiel an vorhandenes Chat-/Bot-Ausgabesystem anschließbar machen.
- Noch nicht zwingend direkt senden.
- Dashboard-Schalter/Config für direkte Ausgabe vorbereiten.
- Rate-Limit/Spam-Schutz beachten.

### EVS-20 – Sound-System Playback Integration Prep

Ziel:

- Vorbereitete Playback-Payloads an vorhandenes Sound-System anbinden.
- Anfangs weiterhin geschützt per Config-Schalter.
- Sound-System-Queue nur kontrolliert und optional berühren.
- Kein zweiter Player.

### EVS-21 – Event Overlay Prep

Ziel:

- Ein zentrales Event-Overlay vorbereiten.
- Anzeige aktiver Eventname, Modus, aktive Soundrunde/Textstatus, Punkte/Ranking.
- Noch keine überladene Show.

### EVS-22 – Event-Ende / Top 3 / Abschluss

Ziel:

- Event sauber beenden.
- Top 3 Ranking ausgeben/vorbereiten.
- Textvarianten für Abschluss nutzen.
- Dashboard/Overlay/ChatOutput vorbereitet.

### EVS-23 – Statistik langfristig

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

- Wann soll ein Sound-Snippet als ungelöst gelten? Timer? Manueller Button? Beides?
- Wie lange läuft eine Soundrunde standardmäßig?
- Sollen falsche Antworten gezählt, aber unsichtbar bleiben? Aktuell ja.
- Soll es bei Sound mehrere Gewinner geben oder nur erster richtiger User? Aktuell erster/aktive Resolve-Logik.
- Soll Text-Spiel und Sound-Spiel im selben Event parallel oder abwechselnd laufen? Bisher vorbereitet, Runtime bisher separat.
