# COMMANDS_CURRENT_STATE

Version: 0.1.0  
Stand: 2026-05-29  
Quelle: Konsolidiert aus `project-state/COMMANDS_*.md` im Repo-Stand `dev`.

## Scope

Diese Datei fasst den aktiven Wissensstand zum Commands-System zusammen.

Sie ersetzt noch keine Einzeldateien.  
Sie dient als aktive Sammelstatus-Datei fuer die weitere Arbeit.

## Aktueller Hauptstand

Aktuell hoechster dokumentierter Stand:

```text
Commands Dashboard v0.1.9
Build/Schwerpunkt: preserve modal draft state
```

Einordnung:

```text
Status: ACTIVE / VERIFY_AGAINST_CODE
```

Der Stand beschreibt einen Fix fuer den Command-Modal-Editor: Beim Auswaehlen eines Mediums ueber den MediaPicker duerfen ungespeicherte Formularwerte nicht verloren gehen.

## Sicherheitsgrundsatz

Fuer alle konsolidierten Stufen gilt:

```text
Keine DB-Migration ohne expliziten Migrationsstep.
Keine bestehende Command-Logik entfernen.
Keine Funktionalitaet entfernen.
Gespeicherte Command-Routings bleiben massgeblich.
Katalogwerte sind Vorlagen, nicht Wahrheit.
```

## Dokumentierte Versionen / Staende

```text
0.1.2 status-no-schema-touch
0.1.3 media-playback-payload-bridge
0.1.4 safe modal editor
0.1.5 backend safe-edit-param-fix
0.1.5 exact saved command editor
0.1.6 unified action dropdown + text output
0.1.7 action-type driven editor
0.1.8 separated action + optional chat output
0.1.9 preserve modal draft state
```

Aktive Modul-/UI-Dateien laut Notizen:

```text
backend/modules/commands.js
htdocs/dashboard/modules/commands.js
```

## Backend / Status

### Status ohne Schema-Touch

v0.1.2 dokumentiert:

```text
/api/commands/status darf keine schwere Arbeit mehr ausloesen.
Statusroute ruft kein ensureSchema() mehr auf.
Status zeigt schemaTouchOnStatus=false.
Catalog nutzt Version/Build statt oeffentlichem STEP-Feld.
```

Nicht geaendert:

```text
Keine DB-Migration.
Keine Dashboard-Aenderung.
Keine Command-Ausfuehrungslogik.
Keine Routen entfernt.
```

Testidee:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/commands/status" | Select-Object ok,module,moduleVersion,moduleBuild,lightStatus,schemaTouchOnStatus
Measure-Command { Invoke-RestMethod "http://127.0.0.1:8080/api/commands/status" | Out-Null }
```

Status:

```text
ACTIVE / VERIFY_AGAINST_CODE
```

### Backend Safe Edit Param Fix

v0.1.5 dokumentiert:

```text
Behebt Unknown named parameter 'createdAt' beim Speichern bestehender Commands.
```

Status:

```text
DONE / VERIFY_AGAINST_CODE
```

## Command Execution / Media Bridge

v0.1.3 dokumentiert die Media Playback Payload Bridge.

Ziel:

```text
Ein gespeicherter Command wie !test mit Action-Typ video_play soll nicht nur eine Media-ID speichern,
sondern diese beim Execute auch wirklich an das Sound-System uebergeben.
```

Aenderungen:

```text
- buildTargetPayload() ergaenzt Media-Felder aus command.config.
- executeCommand() schreibt Legacy /api/sound/play-media auf /api/sound/play um.
- media-command-check zeigt effektives Routing und Payload-Vorschau.
```

Nicht geaendert:

```text
Keine DB-Migration.
Keine Command-Logik entfernt.
Keine Kanalpunkte-Aenderung.
Kein neues Upload-System.
```

Status:

```text
ACTIVE / VERIFY_AGAINST_CODE
```

## Dashboard / Editor

### Safe Modal Editor

v0.1.4 dokumentiert:

```text
Dieser Stand behebt das versehentliche Neu-Anlegen beim Bearbeiten von Commands.
```

Wichtig:

```text
Steps bleiben intern.
Runtime-Version ist moduleVersion/moduleBuild.
Nur Live ist nicht mehr Teil der normalen UI.
```

Status:

```text
ACTIVE / VERIFY_MANUAL
```

### Exact Saved Command Editor

v0.1.5 dokumentiert:

```text
Fix fuer bestehende Commands, die keinem aktuellen Katalogeintrag entsprechen oder eigene gespeicherte Routings besitzen.
Der Editor zeigt die gespeicherten technischen Werte an und nutzt den Katalog nur als Vorlage.
```

Status:

```text
ACTIVE / VERIFY_MANUAL
```

### Unified Action Dropdown + Text Output

v0.1.6 dokumentiert:

```text
Benutzerdefinierte Aktionen sind direkt in die normale Aktion-Auswahl integriert.
Textausgaben sind vorbereitet.
```

Wichtig:

```text
Bestehende gespeicherte Command-Routings bleiben massgeblich.
Katalogwerte sind weiterhin nur Vorlagen.
Textausgabe wird als Config vorbereitet.
Finale zentrale Textverwaltung folgt separat.
```

Status:

```text
ACTIVE / OPEN: zentrale Textverwaltung
```

### Action-Type Driven Editor

v0.1.7 dokumentiert:

```text
- Neuer Command startet mit: Song, Video, Text, Modul-Befehl, Benutzerdefiniert.
- Bestehender Command zeigt die gespeicherte Aktionsart als ersten Dropdown-Eintrag.
- Die Maske richtet sich nach gespeicherter bzw. ausgewaehlter Aktionsart.
- Gespeicherte technische Werte werden unter Erweitert angezeigt.
- Katalogwerte werden erst mit Ausgewaehlte Aktion uebernehmen ins Formular geschrieben.
- Textausgabe bleibt vorbereitet fuer spaetere zentrale Textverwaltung.
```

Status:

```text
ACTIVE / VERIFY_MANUAL
```

### Separated Action + Optional Chat Output

v0.1.8 dokumentiert:

```text
Aktion und Chat-Ausgabe sind im Editor getrennt.
```

Wichtig:

```text
- Chat-Ausgabe ist kein Aktionsunterblock mehr.
- Text anzeigen ist eine eigene Hauptaktion.
- Zusaetzlicher Chattext ist ein optionaler eigener Bereich.
- Song/Video haben eigene Medien-Masken.
- MediaPicker wird direkt aus dem Modal aufgerufen.
- Technische Werte bleiben unter Erweitert.
- Sichere Edit-/Upsert-Logik aus Commands v0.1.4+ bleibt unveraendert.
```

Status:

```text
ACTIVE / VERIFY_MANUAL
```

### Preserve Modal Draft State

v0.1.9 dokumentiert:

```text
Beim Auswaehlen eines Mediums ueber den MediaPicker duerfen ungespeicherte Formularwerte nicht verloren gehen.
```

Fix:

```text
- Modal-Entwurf wird vor MediaPicker-Auswahl/Action-Wechsel synchronisiert.
- Trigger, Aliase, Rechte, Cooldowns, Aktiv-Status und technische Felder bleiben erhalten.
- Sound-/Video-Auswahl aktualisiert nur Medien-/Routing-Daten.
- Speichern synchronisiert den aktuellen Entwurf erneut vor dem API-Request.
```

Keine Aenderung:

```text
Keine DB-Migration.
Keine Backend-Aenderung.
Keine bestehende Funktionalitaet entfernt.
```

Status:

```text
ACTIVE / VERIFY_MANUAL
```

## Textausgabe / Textverwaltung

Dokumentierte Lage:

```text
Textausgabe ist vorbereitet.
Text anzeigen ist eigene Hauptaktion.
Zusaetzlicher Chattext ist optionaler eigener Bereich.
Finale zentrale Textverwaltung folgt separat.
```

Einordnung:

```text
OPEN: zentrale Textverwaltung anbinden.
OPEN: spaeter mit module_texts/Textvarianten-System abgleichen.
```

## Media / Sound Integration

Dokumentierte Lage:

```text
Commands uebergeben Media-Felder aus command.config an das Sound-System.
Legacy /api/sound/play-media wird auf /api/sound/play umgeschrieben.
media-command-check zeigt Routing und Payload-Vorschau.
Song/Video haben eigene Medien-Masken im Dashboard.
MediaPicker wird direkt aus dem Modal aufgerufen.
```

Einordnung:

```text
ACTIVE / VERIFY_AGAINST_CODE
```

## Bekannte Risiken / Schutzlinien

```text
- Statusroute darf keine Schema-/DB-Schwerarbeit ausloesen.
- Gespeicherte Command-Routings duerfen nicht durch Katalogdefaults ueberschrieben werden.
- MediaPicker darf keine Formularwerte verlieren.
- Editor darf beim Bearbeiten keine Commands versehentlich neu anlegen.
- Keine DB-Migration ohne separaten Migrationsstep.
- Textverwaltung ist vorbereitet, aber noch nicht final zentral angebunden.
```

## Offene Punkte

```text
VERIFY: aktuelle Code-Version gegen dokumentierte v0.1.9 pruefen.
VERIFY: /api/commands/status bleibt schemaTouchOnStatus=false.
VERIFY: media-command-check und /api/sound/play Payload pruefen.
VERIFY: Safe Modal Editor und Preserve Modal Draft State manuell testen.
VERIFY: gespeicherte Routings haben Vorrang vor Katalogwerten.
OPEN: finale zentrale Textverwaltung anbinden.
OPEN: Chat-Ausgabe/Textanzeigen gegen module_texts/Textvarianten-System abgleichen.
```

## Historische Einzeldateien

Konsolidiert aus:

```text
project-state/COMMANDS_PRESERVE_MODAL_DRAFT_STATE_v0.1.9.md
project-state/COMMANDS_ACTION_TYPE_DRIVEN_EDITOR_v0.1.7.md
project-state/COMMANDS_BACKEND_SAFE_EDIT_PARAM_FIX_v0.1.5.md
project-state/COMMANDS_EXACT_SAVED_COMMAND_EDITOR_v0.1.5.md
project-state/COMMANDS_MEDIA_PLAYBACK_PAYLOAD_BRIDGE_v0.1.3.md
project-state/COMMANDS_SAFE_MODAL_EDITOR_v0.1.4.md
project-state/COMMANDS_SEPARATED_ACTION_CHAT_MEDIA_PICKER_v0.1.8.md
project-state/COMMANDS_STATUS_NO_SCHEMA_TOUCH_v0.1.2.md
project-state/COMMANDS_UNIFIED_ACTION_DROPDOWN_TEXT_OUTPUT_v0.1.6.md
```

## Review-Status je Quelle

```text
COMMANDS_STATUS_NO_SCHEMA_TOUCH_v0.1.2.md
Status: ACTIVE / VERIFY_AGAINST_CODE
Grund: Statusroute darf kein ensureSchema() ausloesen.

COMMANDS_MEDIA_PLAYBACK_PAYLOAD_BRIDGE_v0.1.3.md
Status: ACTIVE / VERIFY_AGAINST_CODE
Grund: Media-Payload und /api/sound/play Routing relevant.

COMMANDS_SAFE_MODAL_EDITOR_v0.1.4.md
Status: ACTIVE / VERIFY_MANUAL
Grund: Schutz gegen versehentliches Neu-Anlegen beim Bearbeiten.

COMMANDS_BACKEND_SAFE_EDIT_PARAM_FIX_v0.1.5.md
Status: DONE / VERIFY_AGAINST_CODE
Grund: createdAt Param-Fix.

COMMANDS_EXACT_SAVED_COMMAND_EDITOR_v0.1.5.md
Status: ACTIVE / VERIFY_MANUAL
Grund: gespeicherte Routings haben Vorrang vor Katalogwerten.

COMMANDS_UNIFIED_ACTION_DROPDOWN_TEXT_OUTPUT_v0.1.6.md
Status: ACTIVE / OPEN
Grund: Textausgabe vorbereitet, zentrale Textverwaltung offen.

COMMANDS_ACTION_TYPE_DRIVEN_EDITOR_v0.1.7.md
Status: ACTIVE / VERIFY_MANUAL
Grund: Action-Type steuert Editor-Maske.

COMMANDS_SEPARATED_ACTION_CHAT_MEDIA_PICKER_v0.1.8.md
Status: ACTIVE / VERIFY_MANUAL
Grund: Aktion und optionale Chat-Ausgabe getrennt.

COMMANDS_PRESERVE_MODAL_DRAFT_STATE_v0.1.9.md
Status: ACTIVE / VERIFY_MANUAL
Grund: hoechster dokumentierter UI-Stand; Draft-Schutz wichtig.
```

## Naechster sinnvoller Schritt

```text
STEP549 - Feature State Archive Plan
```

Danach koennen `CHANNELPOINTS_*.md` und `COMMANDS_*.md` als historische Einzeldateien bewertet und ggf. archiviert werden.
