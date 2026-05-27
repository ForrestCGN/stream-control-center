# Channelpoints STEP517 bis STEP527 – Zusammenfassung

Stand: 2026-05-27

## STEP517 – Unified Activation Twitch Sync

Aktivieren/Deaktivieren sollte einheitlich System + Twitch betreffen. Später wurde diese UI-Logik vereinfacht, weil lokale Aktivität und Twitch-Aktivität zu verwirrend waren.

## STEP518 – Action Helper Fix

Fehler behoben:

```text
rewardHasExecutableAction is not defined
```

Korrektur: vorhandenen Helper verwenden.

## STEP519 – Redemption Completion Store Scope Fix

Fehler behoben:

```text
completion is not defined
```

Redemption-Ausführung und Completion-Store wurden auf korrekten Scope gebracht.

## STEP520 – Media Queue Policy Strict Result

Sound-/Video-Rewards werden standardmäßig in die Sound-System-Queue eingereiht. `dropped=true` darf nicht als erfolgreiche Ausführung gelten.

## STEP521 – Defer Output Target to Sound System

Channelpoints setzt nicht mehr automatisch `outputTarget=overlay`. Standard: Auto / Sound-System entscheidet.

## STEP522 – Sound-System Routing Defaults

Channelpoints reiht Media-Aufträge beim Sound-System ein. Sound-System entscheidet Queue, Device/Overlay und Discord-Ziel.

## STEP523 – Sound-System Auto Output Defaults Fix

Sound-System-Default auf Device korrigiert, damit Auto nicht weiter auf Overlay fällt.

Aktuell wichtig:

```text
output.defaultTarget  = device
defaults.outputTarget = device
Ziel-Standard         = both / Stream + Discord
```

## STEP524 – Media Asset UTF8 Filename Cleanup Real

Zurückgezogen:

```text
STEP524_MEDIA_ASSET_FILENAME_ENCODING_CLEANUP_v0.1.0
```

Verwendbarer Real-Fix:

```text
STEP524_MEDIA_ASSET_UTF8_FILENAME_CLEANUP_REAL_v0.1.0
```

Ziel: lesbare Anzeigenamen und ASCII-sichere technische Dateinamen.

## STEP525 – zurückgezogen

Beide STEP525-Zwischenstände nicht mehr verwenden:

```text
STEP525_CHANNELPOINTS_SAVE_ACTIVE_SYNCS_TWITCH_v0.9.11
STEP525_CHANNELPOINTS_SIMPLIFIED_TWITCH_ACTIVATION_FLOW_v0.9.11
```

Grund: Bedienkonzept wurde geändert und ein Backend-Startfehler war enthalten.

## STEP526 – Hotfix

Behebte den Startfehler:

```text
deleteRewardFromTwitch is not defined
```

Wurde danach durch STEP527 fachlich ersetzt.

## STEP527 – aktueller Stand

Aktuell gültig:

```text
STEP527_CHANNELPOINTS_CREATE_SAVE_TWITCH_INACTIVE_DEFAULT_v0.9.13
```

Neues Bedienkonzept:

```text
Editor:
- kein Aktiv-Häkchen
- Speichern legt lokal an/ändert lokal
- Speichern erstellt/aktualisiert Twitch
- neuer Twitch-Reward standardmäßig inaktiv

Übersicht:
- Aktiv/Inaktiv-Schalter steuert nur Twitch
```
