# STEP188.1 - Alert Rule Sound Routing Backend Audit

Stand: 2026-05-06

## Zweck

Audit fuer den naechsten Sound-Alert-System-Block nach STEP187.1 bis STEP187.3.

Ziel ist noch keine Umsetzung, sondern die saubere technische Einordnung:

- Sound-Routing soll pro einzelner Alert-Regel einstellbar werden.
- Bits, Subs, Ko-fi und Tipeee sollen als Geld-/Support-Alerts hoeher priorisiert werden.
- Kanalpunkte / Channel Rewards sollen niedriger priorisiert werden.
- SoundAlert-Chat-/Event-Eintraege sollen in eine Dashboard-faehige Verwaltung/Inbox laufen.
- Keine neue Parallelstruktur bauen, wenn bestehende Alert-Tabellen genutzt werden koennen.

## Bereits bestaetigter Live-Stand

### Sound-System

Live validiert:

- `POST /api/sound/stop` stoppt Backend-State.
- Overlay-Video stoppt ohne Browser-Cache-Neuladen.
- Nach Overlay-Stop startet Queue verzögert genug, damit kein deutliches Ueberlappen entsteht.
- Audio-Dateien mit `outputTarget=device` werden ueber den AudioDeviceHelper abgespielt.
- `airhorn.mp3` wurde erfolgreich ueber Device ausgegeben.
- Alert-Sound `alerts/1777654020330_100-249.mp3` wurde erfolgreich ueber Device ausgegeben.
- `device.lastOk = true`
- `deviceStarted > 0`
- `deviceFailed = 0`

### Alert-System

Live validiert mit:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/alerts/twitch/bits?user=ForrestCGN&amount=100&message=SoundSystemTest" | ConvertTo-Json -Depth 30
```

Ergebnis:

- Event wurde angenommen.
- Regel `100- 249 Bits Normal` / Rule-ID 27 wurde getroffen.
- SoundAsset-ID 13 wurde genutzt.
- Sound wurde an das Sound-System uebergeben.
- `outputTarget = device`
- `category = alert`
- `priority = 100`
- Sound-Datei wurde ueber AudioDeviceHelper abgespielt.
- Queue war danach leer.

## Gepruefte vorhandene Strukturen

Aus `backend/modules/alert_system.js` sichtbar:

### Tabellen

Bereits vorhanden:

```text
alert_types
alert_assets
alert_rules
alert_events
alert_settings
alert_text_variants
alert_test_presets
alert_display_profiles
alert_chat_blocks
alert_chat_outbox
```

Relevant fuer den naechsten Block:

```text
alert_rules
alert_assets
alert_settings
alert_events
```

### Aktuelle `alert_rules`-Basisfelder

Vorhandene Kernfelder:

```text
id
source
type_key
label
min_value
max_value
tier
priority
duration_ms
animation
image_mode
sound_asset_id
image_asset_id
enabled
meta_json
created_at
updated_at
duration_mode
tts_enabled
tts_timing
tts_mode
tts_template
tts_max_chars
tts_min_amount
display_profile_id
```

Aktuell gibt es noch keine klar getrennten Felder fuer Sound-System-Routing pro Regel.

## Fachentscheidung

### Regel-Prioritaet und Sound-Prioritaet trennen

`alert_rules.priority` darf nicht blind dieselbe Bedeutung haben wie Sound-System-Prioritaet.

Kuenftig sauber trennen:

```text
alert_rules.priority         -> Alert-/Regel-/Anzeigeprioritaet
sound routing priority       -> Sound-System-Queue-Prioritaet
```

Warum:

- Bits/Donations/Subs sollen im Sound-System hoeher stehen.
- Kanalpunkte sollen niedriger stehen.
- Eine Alert-Regel kann visuell wichtig sein, ohne automatisch alle Sounds zu ueberholen.
- Sound-System-Queue muss separat kontrollierbar bleiben.

### Geld-/Support-Alerts

Standard-Ziel:

```text
Bits
Subs / Resubs
GiftSubs / GiftBombs
Ko-fi Donations
Tipeee Donations
```

sollen standardmaessig als Support/Geld-Alerts gelten:

```text
soundCategory = alert
soundPriority = 80 oder 85
outputTarget = device
```

Grosse/kritische Sonderfaelle:

```text
soundCategory = alert_critical
soundPriority = 90
```

### Kanalpunkte / SoundAlerts

Kanalpunkte und Chat-/Community-SoundAlerts sind niedriger:

```text
soundCategory = channel_reward
soundPriority = 60 bis 70
outputTarget = device oder overlay je Regel
```

## Zielmodell pro Alert-Regel

Jede einzelne Regel soll eigene Sound-Routing-Werte bekommen:

```text
sound_asset_id
sound_output_target
sound_category
sound_priority
sound_volume
```

Moegliche technische Umsetzung:

### Option A - neue Spalten in `alert_rules`

Vorteile:

- Einfach abfragbar.
- Dashboard kann direkt Felder bearbeiten.
- Keine JSON-Magie fuer Kernrouting.

Mögliche Spalten:

```text
sound_output_target TEXT NOT NULL DEFAULT ''
sound_category TEXT NOT NULL DEFAULT ''
sound_priority INTEGER
sound_volume INTEGER
```

Leere Werte bedeuten: Fallback auf globale Alert-Settings.

### Option B - Ablage in `meta_json.soundRouting`

Vorteile:

- Keine DB-Migration fuer erste Version.
- Schnell testbar.

Nachteile:

- Schlechter sichtbar.
- Dashboard-Validierung schwieriger.
- Langfristig weniger sauber.

Empfehlung: Option A fuer dauerhafte Loesung.

## SoundAlert-Inbox / Import-Workflow

Forrests Fachanforderung:

### Fall 1 - Trigger kommt, Datei existiert, Eintrag fehlt

Beispiel:

```text
SoundAlert-Chateintrag: airhorn
Datei vorhanden: htdocs/assets/sounds/soundalerts/airhorn.mp3
Dashboard-Eintrag fehlt
```

Soll:

```text
Backend erkennt Datei.
Backend erstellt oder markiert einen neuen verwaltbaren SoundAlert-Eintrag.
Dashboard zeigt ihn als neu erkannt.
Forrest kann aktivieren, labeln, priorisieren und einer Regel/Triggerlogik zuweisen.
```

### Fall 2 - Trigger kommt, Datei fehlt

Beispiel:

```text
SoundAlert-Chateintrag: trollsound
Datei fehlt.
```

Soll:

```text
Kein kaputter aktiver SoundAlert.
Inbox-/Log-Eintrag erstellen.
Dashboard zeigt "Datei fehlt".
Von dort aus Datei hochladen und Eintrag erstellen oder ignorieren.
```

### Fall 3 - komplett manuell erstellen

Dashboard:

```text
Neuer SoundAlert
- Key / Name
- Label
- Datei hochladen
- Kategorie
- Prioritaet
- Ausgabeziel
- Lautstaerke
- Aktiv/Inaktiv
```

## Moegliche technische Zielstruktur

Noch nicht umgesetzt, nur Planung.

### SoundAlert-Eintraege

Mögliche Tabelle:

```text
sound_alert_entries
```

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

### SoundAlert-Inbox

Mögliche Tabelle:

```text
sound_alert_inbox
```

Felder:

```text
id
key
label
source
trigger_user
trigger_count
last_triggered_at
status
expected_file
matched_file
note
created_at
updated_at
```

ABER: Vor Umsetzung pruefen, ob sich vorhandene `alert_assets`, `alert_rules` und `alert_events` dafuer sinnvoll erweitern lassen. Keine Parallelstruktur erzwingen.

## Dashboard-Ziel

Neuer/erweiterter Bereich im Alert-Dashboard:

```text
SoundAlerts
```

Mögliche Tabs oder Filter:

```text
Aktive Eintraege
Neu erkannt
Datei fehlt
Manuell erstellen
```

Minimal-UX bevorzugt:

- Eine Liste.
- Filter: Aktiv / Neu erkannt / Datei fehlt / Inaktiv.
- Aktionen:
  - Datei hochladen
  - Eintrag erstellen
  - Aktivieren/Deaktivieren
  - Ignorieren
  - Sound testen
  - Regel-/Prioritaetswerte bearbeiten

## Wichtige Regeln

- Keine Funktionalitaet entfernen.
- Bestehende Alert-Regeln und Assets bleiben kompatibel.
- Videos bleiben immer Overlay.
- Audio-Dateien folgen der Regel-Konfiguration.
- `generated_beep + device` ist bewusst offen und aktuell kein Blocker.
- Dashboard liest/schreibt nur ueber Backend-APIs.
- Keine direkten Dashboard-Zugriffe auf SQLite.
- Keine Secrets, DB-Dateien oder Backups committen.
- Schemaaenderungen nur sanft per Migration / `ALTER TABLE ... ADD COLUMN` / `CREATE TABLE IF NOT EXISTS`.

## Naechster Umsetzungsschritt

### STEP188.2 - Alert Rule Sound Routing Backend

Vor Codeaenderung benoetigt:

Vollstaendige echte Dateien aus GitHub/dev oder Upload:

```text
backend/modules/alert_system.js
htdocs/dashboard/modules/alerts.js
htdocs/dashboard/modules/alerts.css
```

Grund:

- GitHub-Ausgabe fuer `backend/modules/alert_system.js` und `htdocs/dashboard/modules/alerts.js` ist gekuerzt.
- Keine Codeaenderung auf Basis gekuerzter Dateien.
- Keine PowerShell-Textpatches.

Umsetzung in kleinem Schritt:

1. Backend-Migration fuer Sound-Routing-Felder in `alert_rules`.
2. `saveRule()` liest/speichert neue Felder.
3. `listRules()` gibt neue Felder aus.
4. Sound-System-Request nutzt pro Regel:
   - `sound_output_target`
   - `sound_category`
   - `sound_priority`
   - `sound_volume`
5. Fallback auf bestehende globale `liveAlert`-Settings bleibt erhalten.
6. Bestehende Regeln bleiben unverändert lauffähig.

Danach separater Dashboard-Step:

### STEP188.3 - Alert Rule Sound Routing Dashboard

- Felder im Regel-Editor sichtbar machen.
- Kompakt, nicht überladen.
- Defaults lesbar anzeigen.
- Prioritaeten und Kategorien klar benennen.

Danach separater Plan/Code-Step:

### STEP189 - SoundAlert Inbox / Import Workflow

- Ausloeser-/Event-Logik definieren.
- Datei-Scan/Matching definieren.
- Inbox-Tabelle/API bauen.
- Dashboard-Ansicht bauen.
