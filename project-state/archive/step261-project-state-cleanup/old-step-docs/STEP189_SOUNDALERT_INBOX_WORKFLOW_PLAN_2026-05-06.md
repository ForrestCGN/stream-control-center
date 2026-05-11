# STEP189 - SoundAlert Inbox / Import Workflow Plan

Stand: 2026-05-06

## Zweck

Plan fuer den neuen SoundAlert-Inbox-Workflow im `stream-control-center`.

Dieser STEP beschreibt die Fachlogik, noch keine Code-/DB-Aenderung.

## Grundidee

Neue SoundAlerts sollen nicht zwingend vorher manuell im Dashboard angelegt werden.

Stattdessen:

```text
SoundAlert wird ausgelöst -> Backend erkennt unbekannten SoundAlert-Key -> Dashboard-Inbox-Eintrag entsteht automatisch.
```

Der Eintrag bleibt inaktiv, bis Forrest ihn im Dashboard fertig eingerichtet hat.

## Ziel-Workflow

### 1. SoundAlert wird erstmalig ausgelöst

Beispiel:

```text
SoundAlert-Key: fart
Quelle: Chat / Kanalpunkte / SoundAlerts-Event
Ausloeser: UserXY
```

Backend prueft:

```text
Existiert bereits ein aktiver SoundAlert-Eintrag fuer key=fart?
```

Falls nein:

```text
Neuen Inbox-Eintrag erstellen oder vorhandenen Inbox-Eintrag aktualisieren.
```

Wichtig:

- Es wird kein kaputter aktiver Alert erzeugt.
- Es wird kein fehlerhafter Sound abgespielt.
- Es wird nachvollziehbar geloggt, dass ein neuer SoundAlert erkannt wurde.

### 2. Dashboard zeigt neuen SoundAlert

Dashboard-Bereich:

```text
SoundAlerts -> Neu erkannt
```

Eintrag zeigt:

```text
Key / Name
Quelle
Ausloeser
erste Ausloesung
letzte Ausloesung
Anzahl Ausloesungen
Dateistatus
Status
```

Aktionen:

```text
Datei hochladen
Vorhandene Datei zuweisen
Eintrag bearbeiten
Ignorieren
```

### 3. Datei ist vorhanden

Wenn Backend beim Trigger oder beim Scan eine passende Datei findet:

```text
htdocs/assets/sounds/soundalerts/<key>.mp3
htdocs/assets/sounds/soundalerts/<key>.wav
htdocs/assets/sounds/soundalerts/<key>.ogg
htdocs/assets/sounds/soundalerts/<key>.webm
htdocs/assets/sounds/soundalerts/<key>.m4a
```

dann:

```text
Inbox-Eintrag Status: file_matched / Datei gefunden
Datei wird vorgeschlagen oder zugewiesen
Dauer wird per ffprobe erkannt
```

Forrest kann im Dashboard danach:

```text
Label setzen
Kategorie setzen
Prioritaet setzen
OutputTarget setzen
Lautstaerke setzen
Aktivieren
```

### 4. Datei fehlt

Wenn keine Datei gefunden wird:

```text
Status: missing_file / Datei fehlt
```

Dashboard-Aktionen:

```text
Datei hochladen
Vorhandene Datei manuell wählen
Ignorieren
```

### 5. Manuell komplett erstellen

Im Dashboard soll weiterhin moeglich sein:

```text
Neuer SoundAlert
- Key / Name
- Label
- Datei hochladen oder vorhandenes Asset wählen
- Kategorie
- Prioritaet
- Ausgabeziel
- Lautstaerke
- Aktiv/Inaktiv
```

## Statusmodell

Technische Statuswerte:

```text
new_detected
missing_file
file_matched
ready
active
ignored
disabled
```

UI-Labels:

```text
Neu erkannt
Datei fehlt
Datei gefunden
Bereit
Aktiv
Ignoriert
Inaktiv
```

## Fachregeln

### Unbekannte SoundAlerts

```text
Unbekannter SoundAlert-Trigger erzeugt automatisch einen Dashboard-Inbox-Eintrag.
Der Eintrag bleibt inaktiv, bis er im Dashboard fertig eingerichtet wurde.
```

### Datei vorhanden, Eintrag fehlt

```text
Wenn ein unbekannter SoundAlert ausgelöst wird und die Datei bereits existiert,
wird ein neuer Eintrag mit Status Datei gefunden / file_matched erstellt.
```

### Datei fehlt

```text
Wenn die Datei fehlt, entsteht ein Inbox-/Log-Eintrag mit Status missing_file.
Von dort aus kann Forrest Datei hochladen und den SoundAlert aktivieren.
```

### Aktivierung

Ein SoundAlert darf erst aktiv werden, wenn mindestens gesetzt ist:

```text
key
label
asset/file
sound_category
sound_priority
output_target
volume
enabled/active
```

### Prioritaeten

Kanalpunkte-/Community-SoundAlerts sind niedriger als Geld-/Support-Alerts.

Empfohlene Defaults:

```text
SoundAlert / Channel Reward: category=channel_reward, priority=60-70
Support/Geld-Alert: category=alert, priority=80-85
Critical: category=alert_critical, priority=90
Admin/System: category=admin/system, priority=100
```

### Ausgabeziel

```text
Videos bleiben immer Overlay.
Audio-Dateien folgen der Konfiguration: device / overlay.
```

## Mögliche technische Tabellen

Noch nicht umgesetzt.

### sound_alert_inbox

Zweck:

- unbekannte/noch nicht eingerichtete SoundAlerts sammeln
- fehlende Dateien sichtbar machen
- Trigger-Zaehlung/letzte Ausloesung speichern

Felder:

```text
id
key
label
source
trigger_type
trigger_user_login
trigger_user_display
trigger_count
first_triggered_at
last_triggered_at
status
expected_file
matched_file
asset_id
note
created_at
updated_at
```

### sound_alert_entries

Zweck:

- verwaltbare aktive/inaktive SoundAlert-Eintraege
- pro Eintrag Routing/Datei/Status speichern

Felder:

```text
id
key
label
source
trigger_type
asset_id
file_path
public_url
enabled
sound_category
sound_priority
output_target
volume
created_from
created_at
updated_at
```

Vor Umsetzung pruefen, ob `alert_assets`, `alert_rules` oder bestehende Alert-Settings sinnvoll wiederverwendet werden koennen. Keine Parallelstruktur bauen, wenn bestehende Struktur reicht.

## Mögliche Backend-Routen

Noch nicht umgesetzt.

```text
GET  /api/sound-alerts/inbox
POST /api/sound-alerts/inbox/:id/ignore
POST /api/sound-alerts/inbox/:id/create
POST /api/sound-alerts/inbox/:id/upload
GET  /api/sound-alerts/entries
POST /api/sound-alerts/entries
PUT  /api/sound-alerts/entries/:id
POST /api/sound-alerts/scan
```

Routing-Pfad kann spaeter angepasst werden, damit er zur bestehenden API-Struktur passt.

## Dashboard-Ziel

Bereich:

```text
SoundAlerts
```

Minimal-UX:

```text
Liste mit Filter:
- Alle
- Neu erkannt
- Datei fehlt
- Datei gefunden
- Aktiv
- Inaktiv
- Ignoriert
```

Aktionen pro Zeile:

```text
Bearbeiten
Datei hochladen
Vorhandene Datei wählen
Aktivieren
Deaktivieren
Ignorieren
Testen
```

## Abgrenzung zu STEP188

STEP188/188.1:

```text
Alert-Regeln bekommen eigenes Sound-Routing pro Regel.
```

STEP189:

```text
SoundAlert-Inbox und automatische Erkennung unbekannter SoundAlert-Trigger.
```

Beides haengt fachlich zusammen, sollte aber in getrennten kleinen STEPs umgesetzt werden.

## Naechster technischer Schritt

Vor Umsetzung benoetigt:

```text
backend/modules/alert_system.js
htdocs/dashboard/modules/alerts.js
htdocs/dashboard/modules/alerts.css
```

Falls SoundAlerts als eigenes Modul besser passen, zusaetzlich pruefen:

```text
backend/modules/sound_system.js
htdocs/dashboard/modules/sound.js
htdocs/dashboard/modules/sound.css
config/sound_system.json
```

Wichtig:

- GitHub-Ausgaben fuer grosse Dateien waren gekuerzt.
- Keine Codeaenderung auf Basis gekuerzter Dateien.
- Keine PowerShell-Textpatches.
- ZIPs nur mit echten Zielpfaden.
