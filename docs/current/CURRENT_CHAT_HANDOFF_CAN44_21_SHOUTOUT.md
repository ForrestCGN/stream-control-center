# CURRENT CHAT HANDOFF – CAN-44.21 Shoutout

## Kurzstand

Der aktuelle Arbeitsstand betrifft das Shoutout-System im `stream-control-center`.

Aktueller Code-/Dashboard-Stand:

- `clip_shoutout` Modulversion: **0.2.40**
- Stand: **CAN-44.21.41 – AutoShoutout Instant Trigger Messages**
- Dashboard-Doku-Update: **CAN-44.21.42**

## Was stabil ist

- `!so` ist Hauptcommand.
- `!vso` ist Alias.
- Commands kommen aus `command_definitions`.
- Direct-Intake funktioniert mit `so`/`vso`.
- alte `clipso`/`videoso`-Trigger sind nicht mehr aktiv.
- altes Shoutout-Dashboard ist deaktiviert.
- Shoutout V2 ist jetzt das produktive Shoutout-Dashboard unter dem Namen **Shoutout**.
- Shoutout-Settings sind editierbar und speichern über `/api/clip-shoutout/settings`.
- Settings-Save-Bug wurde in CAN-44.21.40 behoben.
- AutoShoutout hat Sofort-Auslöser für Lurk-Kommandos erhalten.

## Wichtiges Verhalten AutoShoutout

Normale Nachrichten:

- erste Nachricht zählt als 1.
- wenn Mindestnachrichten 3 eingestellt ist, müssen noch zwei weitere Nachrichten folgen.

Sofort-Auslöser:

- `!lurk`
- `!lurke`
- `lurk`

Diese können Mindestnachrichten umgehen, damit Streamer, die nur kurz lurken, trotzdem berücksichtigt werden können.

## Noch nicht abschließend getestet

- CAN-44.21.41 konnte nicht im echten Streambetrieb getestet werden.
- AutoShoutout-Zählung und Sofort-Auslöser müssen im nächsten möglichen Test beobachtet werden.
- Dashboard-Save nach CAN-44.21.40/41 erneut prüfen.

## Nächste Aktion im neuen Chat

Nicht sofort weiter umbauen. Erst Status und Verhalten prüfen:

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/status"
$s | Select-Object module,moduleVersion,enabled,lastError,command
$s.effectiveCommandTriggers
```

Erwartung:

```text
moduleVersion : 0.2.40
command       : so
effectiveCommandTriggers: so, vso
lastError     : leer
```

Danach Dashboard-Save-Test und AutoShoutout-Test, sobald möglich.
