# NEXT_STEPS – stream_events / Event-System

Stand: 2026-06-13 nach EVS-18c

## Sofort sinnvoller nächster Schritt

### EVS-19 – Sound/Text Runtime Koexistenz + Stealth-Testevent

Ziel:

```text
Sound- und Text-Runtime sollen im selben Event echte bzw. simulierte Chatnachrichten sauber auswerten, ohne sich gegenseitig zu stören.
```

Scope:

- Vorhandenen CommunicationBus nutzen.
- Keine neue Bus-Struktur.
- Keine direkte Twitch-Chat-Ausgabe.
- Kein direktes Playback.
- Keine Sound-System-Queue-Berührung.
- Stealth-Testevent mit unauffälligen Antworten vorbereiten.
- Falsche Soundantwort soll keine Chat-Ausgabe erzeugen und Textprüfung nicht blockieren.
- Richtige Soundantwort soll Soundrunde lösen und nicht zusätzlich Textpunkte für dieselbe Nachricht erzeugen.
- Reports sollen klar zeigen, ob Sound oder Text reagiert hat.

Tests:

```powershell
node -c .\backend\modules\stream_events.js
.\stepdone.cmd "EVS-19 Sound Text Runtime Koexistenz Stealth Testevent"
```

Danach erst API-/Dashboard-Tests, dann optional echter Chat-Stealth-Test.

## Danach sinnvolle Schritte

### EVS-20 – ChatOutput Dispatcher Prep

Ziel:

- Vorbereitete ChatOutputs aus Text- und Sound-Spiel an vorhandenes Chat-/Bot-Ausgabesystem anschließbar machen.
- Noch nicht zwingend direkt senden.
- Dashboard-Schalter/Config für direkte Ausgabe vorbereiten.
- Rate-Limit/Spam-Schutz beachten.
- Live-Ausgabe nur mit klarer Config und sichtbarem Warnstatus.

### EVS-21 – Sound-System Playback Integration Prep

Ziel:

- Vorbereitete Playback-Payloads an vorhandenes Sound-System anbinden.
- Anfangs weiterhin geschützt per Config-Schalter.
- Sound-System-Queue nur kontrolliert und optional berühren.
- Kein zweiter Player.

### EVS-22 – Event Overlay Prep

Ziel:

- Ein zentrales Event-Overlay vorbereiten.
- Anzeige aktiver Eventname, Modus, aktive Soundrunde/Textstatus, Punkte/Ranking.
- Noch keine überladene Show.
- Debug-Antworten niemals im Overlay anzeigen.

### EVS-23 – Event-Ende / Top 3 / Abschluss

Ziel:

- Event sauber beenden.
- Top 3 Ranking ausgeben/vorbereiten.
- Textvarianten für Abschluss nutzen.
- Dashboard/Overlay/ChatOutput vorbereitet.

### EVS-24 – Event Archiv / History / Delete-Safety

Ziel:

- Archiv-/History-Ansicht für alte Events vorbereiten.
- Standardansichten auf aktives Event fokussieren.
- Alte Eventwerte nicht in aktive Reports mischen.
- Geschütztes Hard-Delete planen: Owner/Admin, Bestätigung, Audit, konsistentes Löschen zugehöriger Eventdaten.

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
- Aktive Eventdaten und Archivdaten im Dashboard klar trennen.

## Offene Fachfragen

- Wann soll ein Sound-Snippet als ungelöst gelten? Timer? Manueller Button? Beides?
- Wie lange läuft eine Soundrunde standardmäßig?
- Sollen falsche Antworten gezählt, aber unsichtbar bleiben? Aktuell ja.
- Soll es bei Sound mehrere Gewinner geben oder nur erster richtiger User? Aktuell erster/aktive Resolve-Logik.
- Soll Text-Spiel und Sound-Spiel im selben Event parallel oder abwechselnd laufen? Für EVS-19 gezielt testen.
- Soll Event-Löschung später wirklich physisch löschen oder standardmäßig nur archivieren? Empfehlung: Standard archivieren, Hard-Delete nur geschützt.
