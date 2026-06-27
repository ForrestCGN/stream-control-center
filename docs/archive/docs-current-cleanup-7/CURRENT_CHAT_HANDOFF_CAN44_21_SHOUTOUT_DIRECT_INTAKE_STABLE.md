# CURRENT CHAT HANDOFF – CAN-44.21 Shoutout Direct Intake Stable

Stand: CAN-44.21.34 / clip_shoutout v0.2.38

## Ergebnis

Der Command-/Direct-Intake-Bereich des Clip-Shoutout-Systems ist stabil getestet.

Aktiver Zustand:

- `!so` ist der Hauptbefehl.
- `!vso` ist Alias.
- `clipso` und `videoso` sind entfernt und werden nicht mehr als effektive Trigger geführt.
- `command_definitions` ist Source of Truth für Direct-Intake-Trigger.
- Es gibt nur noch einen aktiven Command-Eintrag für `clip_shoutout`.
- Direct-Intake nutzt `command_definitions` ohne Fallback.
- Alte `cfg.command=vso`-Reste überschreiben den aktiven Command nicht mehr.

## Bestätigte Status-Ausgabe

```text
module        : clip_shoutout
moduleVersion : 0.2.38
enabled       : True
lastError     :
command       : so

effectiveCommandTriggers:
so
vso

directIntake:
enabled                : True
source                 : command_definitions
commandDefinitionCount : 1
fallbackUsed           : False
```

## Bestätigter Ablauf-Test

Getestet im Nicht-Live-Live-Test:

```text
!so @pretos1 --force
!so @together_not_alone --force
!so @pretos1 --force
```

Ergebnis:

- Erstes `!so @pretos1 --force`: erkannt, queued, `displayQueueId: 117`.
- Zweites `!so @together_not_alone --force`: erkannt, queued, `displayQueueId: 118`.
- Drittes `!so @pretos1 --force`: erkannt, aber korrekt als `already_active_same_target` blockiert.

Zusätzlich vom Nutzer bestätigt:

- `!vso` funktioniert.
- Alte Trigger `clipso`/`videoso` funktionieren nicht mehr als Shoutout-Trigger.

## Aktueller stabiler Bereich

Dieser Teil gilt als abgeschlossen:

- Command-Definitionen
- Direct-Intake-Erkennung
- `!so`/`!vso`-Routing
- Vermeidung alter Doppel-Command-Pfade
- Entfernung der alten effektiven Trigger `clipso`/`videoso`

## Wichtig für nächste Chats

Nicht wieder einbauen:

- DefaultTrigger-Logik im Direct-Intake
- `extraTriggers`
- `includeDefaultTriggers`
- Separate `vso`-Command-Zeile
- `clipso`/`videoso` als automatisch aktive Trigger

Nicht anfassen ohne expliziten Auftrag:

- Clip-Player
- `sound_system_overlay.html`
- DisplayQueue-Ablauf
- OfficialQueue-Ablauf
- Chattexte
- produktive SQLite-Datenbank außer gezielte Migrationen/Reads

## Nächste sinnvolle Themen

1. Dashboard-/Settings-Seite prüfen: Sind Command, Aliase, Direct-Intake und relevante Shoutout-Settings vollständig und sauber einstellbar?
2. OfficialQueue-Verhalten weiter testen: manueller Retry darf chatten, automatische Worker-Retrys nicht.
3. Dokumentation aktualisieren, wenn Forrest „dokumentieren und aktualisieren“ sagt.
