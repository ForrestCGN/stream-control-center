# STEP245 – DeathCounter Streamer.bot Minimal-Bridge

Stand: 2026-05-11

## Ziel

DeathCounter ist ab diesem Stand praktisch als Backend-gesteuertes System nutzbar.

Streamer.bot soll für `!rip`, `!tode` und `!dcount` nur noch den Chatbefehl annehmen und die zentrale API aufrufen:

```text
/api/deathcounter/v2/command
```

Die eigentliche Logik liegt im Backend:

```text
Streamer.bot Chat-Command
  -> FetchURL /api/deathcounter/v2/command
  -> Backend parst Command/Input
  -> Backend schreibt Counts/Overlay-State
  -> Backend sendet Chat-Antworten primär über helper_chat_output / Bot
  -> Streamer.bot macht im Normalfall nichts weiter
```

## Primärer Zielzustand

Streamer.bot führt nur noch eine FetchURL-Subaction aus.

Keine C#-Parsing-Skripte mehr für:

```text
!rip
!tode
!dcount
```

Keine Twitch-Chat-Ausgabe mehr in Streamer.bot, solange Backend-Chat-Output funktioniert.

## Fallback-Regel

Der Backend-Chatversand bleibt primär.

Wenn der Backend-Chatversand fehlschlägt, liefert die API weiterhin:

```json
{
  "streamerbot_send": "1",
  "streamerbot_message": "..."
}
```

Dieser Fallback ist bewusst erhalten.

Für die einfache Minimal-Bridge kann Streamer.bot die Antwort aber erstmal ignorieren, weil `helper_chat_output` produktiv funktioniert.

Optional kann später eine allgemeine Streamer.bot-Fallback-Subaction gebaut werden:

```text
Wenn result.streamerbot_send = "1":
  result.streamerbot_message in Twitch Chat senden
```

Das ist optional und nicht mehr die normale Logik.

---

# Ziel-URLs für Streamer.bot

## !rip

Command:

```text
!rip
```

FetchURL:

```text
http://127.0.0.1:8080/api/deathcounter/v2/command?command=rip&actorUserId=%userId%&actorLogin=%userName%&actorDisplay=%user%&input0=%input0%&input1=%input1%
```

Beispiele:

```text
!rip @ForrestCGN
!rip @ForrestCGN del
```

Wichtig:

```text
@-Pflicht kommt aus deathcounter_settings.requireMentionForPlayerCommands.
Kein requireMention=1 mehr in der URL nötig.
```

## !tode

Command:

```text
!tode
```

FetchURL:

```text
http://127.0.0.1:8080/api/deathcounter/v2/command?command=tode&actorUserId=%userId%&actorLogin=%userName%&actorDisplay=%user%&input0=%input0%
```

Beispiele:

```text
!tode
!tode @ForrestCGN
```

## !dcount

Command:

```text
!dcount
```

FetchURL:

```text
http://127.0.0.1:8080/api/deathcounter/v2/command?command=dcount&actorUserId=%userId%&actorLogin=%userName%&actorDisplay=%user%&input0=%input0%&input1=%input1%&input2=%input2%
```

Beispiele:

```text
!dcount
!dcount show
!dcount hide
!dcount reset
!dcount replace @EngelCGN @RoxxyFoxxyCGN
```

---

# Empfohlene Streamer.bot Action-Struktur

## Action: DCV2 - Command - RIP

Subactions:

```text
1. Fetch URL
   URL: http://127.0.0.1:8080/api/deathcounter/v2/command?command=rip&actorUserId=%userId%&actorLogin=%userName%&actorDisplay=%user%&input0=%input0%&input1=%input1%
   Method: GET
   Parse Response: optional
```

Keine weiteren Subactions nötig.

## Action: DCV2 - Command - TODE

Subactions:

```text
1. Fetch URL
   URL: http://127.0.0.1:8080/api/deathcounter/v2/command?command=tode&actorUserId=%userId%&actorLogin=%userName%&actorDisplay=%user%&input0=%input0%
   Method: GET
   Parse Response: optional
```

Keine Twitch-Chat-Subaction, weil das Backend selbst sendet.

## Action: DCV2 - Command - DCOUNT

Subactions:

```text
1. Fetch URL
   URL: http://127.0.0.1:8080/api/deathcounter/v2/command?command=dcount&actorUserId=%userId%&actorLogin=%userName%&actorDisplay=%user%&input0=%input0%&input1=%input1%&input2=%input2%
   Method: GET
   Parse Response: optional
```

Keine C#-Parsing-Logik mehr.

---

# Optionaler Fallback in Streamer.bot

Nur falls gewünscht:

```text
Nach FetchURL:
Wenn result.streamerbot_send == "1":
  Send Message: %result.streamerbot_message%
```

Aber normal soll das nicht nötig sein, weil Backend/Bot sendet.

## Nicht mehr benötigt

Diese alten Inline-Skripte werden langfristig nicht mehr gebraucht:

```text
DCV2 - RIP Prepare
DCV2 - TODE Prepare
DCV2 - DCOUNT Parse/Prepare
```

Wichtig: Erst entfernen, wenn die neuen Minimal-Actions live getestet wurden.

## Streamstart / Sync

Bestehende zentrale Stream-Start-Action kann weiter die vorhandene Sync-Route nutzen:

```text
http://127.0.0.1:8080/api/deathcounter/v2/stream-online-sync
```

Die Settings für Streamstart-Verhalten liegen jetzt in:

```text
deathcounter_settings
```

Wichtige Keys:

```text
resetSessionOnStreamStart
resetOverlayPlayersOnStreamStart
defaultSelectedIds
```

## Tests nach Umbau in Streamer.bot

Im Chat testen:

```text
!tode
!tode @ForrestCGN
!rip ForrestCGN
!rip @ForrestCGN
!rip @ForrestCGN del
!dcount
!dcount show
!dcount hide
!dcount reset
!dcount replace @EngelCGN @RoxxyFoxxyCGN
!dcount replace @RoxxyFoxxyCGN @EngelCGN
```

Erwartung:

```text
!tode sendet Antwort über Bot.
!rip ohne @ wird wegen @-Pflicht blockiert und sendet Fehler über Bot.
!rip @Name zählt ohne Chatspam.
!rip @Name del zieht wieder ab.
!dcount steuert Overlay.
replace tauscht sichtbare Spieler und kann zurückgetauscht werden.
```

## Nicht geändert in STEP245

```text
backend/modules/deathcounter_v2.js
htdocs/dashboard/**
app.sqlite
data/deathcounter/deathcounter.v2.json
htdocs/overlays/_overlay-deathcounter-v2.html
Streamer.bot Exportdateien
```

STEP245 ist reine Doku-/Übergabevorbereitung.
