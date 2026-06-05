# CURRENT CHAT HANDOFF – CAN-44.21 Shoutout Direct Intake stabil

Stand: 2026-06-05  
Projekt: `ForrestCGN/stream-control-center`  
Branch/Zielstand: `dev` / Live-System `D:\Streaming\stramAssets`  
Modul: `backend/modules/clip_shoutout.js`  
Aktuelle stabile Modulversion: `0.2.38`  
Aktueller CAN-Stand: `CAN-44.21.34` stabil getestet, danach Doku-Update `CAN-44.21.36`

## Ergebnis

Der Direct-Intake-/Command-Bereich des Shoutout-Systems ist stabil.

Bestätigter Status:

```text
module        : clip_shoutout
moduleVersion : 0.2.38
enabled       : True
lastError     :
command       : so
```

Effektive Trigger:

```text
so
vso
```

Direct-Intake:

```text
enabled                : True
source                 : command_definitions
commandDefinitionCount : 1
fallbackUsed           : False
```

Damit gilt:

```text
!so  = Hauptbefehl
!vso = Alias
clipso/videoso = entfernt / nicht mehr aktiv
command_definitions = Source of Truth
Direct-Intake nutzt keine DefaultTrigger mehr
```

## Durchgeführte CAN-Schritte

### CAN-44.21.29 – Manual SO Intake / Official Retry Dedup

- Manuelle Shoutouts wurden sauberer mit OfficialQueue gekoppelt.
- Bereits vorhandene OfficialQueue-Einträge für denselben Streamer werden wiederverwendet.
- Automatische OfficialQueue-Retrys sollen keine Chat-Spam-Meldungen erzeugen.
- Neue Text-Keys ergänzt, unter anderem:
  - `shoutout.chat.alreadyActive`
  - `shoutout.chat.alreadyWaiting`
  - `shoutout.chat.alreadyWaitingForce`
  - `shoutout.official.waiting`
  - `shoutout.official.sent`

### CAN-44.21.30 – Direct Intake Trigger Fix

- Problem: `!so` wurde im Direct-Bypass nicht zuverlässig erkannt.
- Fix: `!so` und `!vso` wurden wieder erkannt.
- Ergebnis: Silent-Drop beim zweiten Streamer wurde behoben.

### CAN-44.21.31 – Configurable Direct Intake Triggers

- Trigger wurden konfigurierbarer gemacht.
- Erkenntnis: `includeDefaultTriggers` und zusätzliche Default-Aliase waren fachlich nicht sauber, weil Trigger ausschließlich aus Commands kommen sollen.

### CAN-44.21.32 – Direct Intake Command Definition Cleanup

- Direct-Intake wurde auf `command_definitions` umgestellt.
- Status-Routenliste wurde erweitert und Legacy-Routen markiert.
- Erkenntnis: alte Modul-Config konnte noch einen separaten `vso`-Command neu erzeugen.

### CAN-44.21.33 – Real Cleanup / Shrink

- Datei wurde leicht verkleinert und alte Trigger-Logik reduziert.
- Fehler: `registerCommand()` nutzte noch alte Modul-Config als Wahrheit und konnte dadurch wieder `vso` statt `so` registrieren.

### CAN-44.21.34 – Command Definitions Source of Truth Fix

- Finaler Fix für den Command-Bereich.
- `command_definitions` ist jetzt führend.
- Vorhandene Commands werden nicht mehr blind aus alter Modul-Config überschrieben.
- Alte falsche `vso`-Command-Zeilen werden bereinigt/migriert.
- Status-`command` kommt aus `command_definitions`.
- Stabil bestätigt mit `clip_shoutout v0.2.38`.

## Stabiler Test

Nicht-live Live-Test wurde erfolgreich durchgeführt:

```text
!so @pretos1 --force
!so @together_not_alone --force
!so @pretos1 --force
```

Trace-Ergebnis:

```text
!so @pretos1 --force
→ matched: true
→ trigger: so
→ queued
→ displayQueueId: 117

!so @together_not_alone --force
→ matched: true
→ trigger: so
→ queued
→ displayQueueId: 118

!so @pretos1 --force
→ matched: true
→ trigger: so
→ already_active
→ reason: already_active_same_target
```

Zusätzlich bestätigt:

```text
!vso funktioniert als Alias
clipso/videoso funktionieren nicht mehr als Shoutout-Trigger
```

## Aktueller DB-Zielzustand

In `command_definitions` soll nur ein aktiver Eintrag für `clip_shoutout` existieren:

```text
trigger      : so
aliases_json : ["vso"]
module_key   : clip_shoutout
action_key   : run
target_url   : /api/clip-shoutout/run
enabled      : 1
permission   : mod
```

Prüfbefehl:

```powershell
node -e "const db=require('./backend/core/database'); db.ensureReady(); console.table(db.all('SELECT trigger, aliases_json, module_key, action_key, target_url, enabled, permission_level, cooldown_global_ms, cooldown_user_ms FROM command_definitions WHERE module_key=:m ORDER BY trigger', {m:'clip_shoutout'}));"
```

## Wichtige Regeln für kommende Änderungen

- Keine Funktionalität entfernen.
- `command_definitions` bleibt Source of Truth für Chat-Commands.
- Keine versteckten DefaultTrigger mehr im Direct-Intake.
- Keine separaten `vso`, `clipso` oder `videoso`-Command-Zeilen für `clip_shoutout`.
- `!so` bleibt Hauptbefehl.
- `!vso` bleibt Alias.
- Produktive SQLite niemals ersetzen oder überschreiben.
- Clip-Player und `sound_system_overlay.html` nicht anfassen, solange nicht ausdrücklich nötig.
- OfficialQueue- und DisplayQueue-Ablauf nicht ohne separate Analyse ändern.
