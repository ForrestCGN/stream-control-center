# CURRENT CHAT HANDOFF – EVS52.14 getestet/stabil

Stand: 2026-06-18

## Kontext

Wir haben das Event-System mit kombiniertem Sound- und Satz-/Text-Spiel repariert und live getestet. Der kritische Fehler war ursprünglich, dass echte Twitch-Chatnachrichten nicht zuverlässig im Satz-System ankamen bzw. später im Chat-Handler falsch abgefangen wurden.

## Aktueller stabiler Stand

```text
stream_events moduleVersion : 0.5.85
stream_events moduleBuild   : STEP_EVS52_14_NEUTRAL_UNIQUE_TEXT_HINTS
```

Dieser Stand ist getestet und soll als aktuelle Basis gelten.

## Was umgesetzt wurde

### EVS52.9

- Chatquelle aufgeräumt.
- `stream_events` hört zentral auf `twitch.chat.message` über den Communication-Bus.
- Alte Direct-/Wildcard-Fallback-Wege aus EVS52.6–EVS52.8 aus dem produktiven Runtime-Pfad entfernt.

### EVS52.10

- Active-Event-Guard repariert.
- Dashboard-/Test-Start nutzt wieder normalen Startpfad.
- `skip-wait` gegen mehrere aktive Events abgesichert.

### EVS52.11

- Async-Command-Bug im Chat-Handler behoben.
- Normale Chatnachrichten werden nur noch als `!event` behandelt, wenn sie wirklich mit `!event` beginnen.
- Sonst laufen sie in `processParallelChatMessage()`.

### EVS52.12

- Bot-/Self-Message-Filter ergänzt.
- Ignoriert aktuell: `heimaufsichtcgn`, `kofistreambot`, `streamstickers`, `streamelements`.
- Engel, Roxxy, Tronic und Forrest bleiben spielberechtigt.

### EVS52.13

- Teiltreffer-Chatmeldungen pro Usernachricht gebündelt.

### EVS52.14

- Teiltreffer-Chatmeldungen neutralisiert.
- Keine Satznummer, keine Satz-Zuordnung.
- Anzahl zählt eindeutige gefundene Wörter/Teile aus der Usernachricht, nicht Satz-Treffer.
- Mehrere Zufallstexte für `text.word_hit.neutral.chat` ergänzt.

## Letzter Live-Test

```text
twitchChatMessages               : 54
twitchChatSelfSkipped            : 14
textMessagesProcessed            : 18
soundChatMessagesProcessed       : 2
soundAnswerMatches               : 2
soundAnswerMisses                : 0
textWordHits                     : 14
textPhraseSolves                 : 1
chatOutputsLiveRequested         : 12
chatOutputsLiveSent              : 12
soundWaitsSkipped                : 2
activeEventGuard.activeCount     : 1
```

Ranking:

```text
EngelCGN – 50 Punkte – 2 Einträge
```

## Bestätigt

- Chat kommt an.
- Soundantworten funktionieren.
- Satz-Teiltreffer funktionieren.
- Satzlösung funktioniert.
- Duplicate funktioniert.
- Bot-/Self-Loop ist weg.
- Skip-Wait funktioniert.
- Nur ein aktives Event.

## Offene Punkte für nächsten Chat

1. Diagnosezähler `textWordHitChatOutputsBundled` prüfen.
2. `phraseSolves.points` im Report prüfen.
3. Bot-/Ignore-Liste später ins Dashboard verschieben.
4. Textvarianten `text.word_hit.neutral.chat` im Dashboard pflegbar machen.
5. Satzlösungs-Overlay optisch verbessern.

## Harte Arbeitsregeln für Fortsetzung

- Nicht raten.
- Vor Codeänderung echte Dateien prüfen.
- Fehlende Dateien exakt anfordern.
- Keine Apply-/Patch-Scripte.
- Vollständige Ersatzdateien liefern.
- ZIPs mit echten Zielpfaden ab Repo-Root.
- StepDone nach Einspielen, danach testen.
- Keine Chatquelle erneut umbauen, solange kein konkreter Fehler bewiesen ist.
- Keine alten Direct-/Wildcard-Hooks zurückholen.
