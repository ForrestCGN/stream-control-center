# STEP200.8 – Globaler Installer-/Seed-Plan

Stand: 2026-05-08  
Projekt: stream-control-center  
Typ: Doku-/Planungs-STEP  
Status: vorbereitet

## Ziel

Dieser STEP legt einen globalen Standard fest, wie spätere Installer-/Setup-/Seed-Logik mit JSON, DB, Defaults, Presets, Texten und lokalen Systemwerten umgehen soll.

Dieser Plan gilt nicht nur für das Sound-System, sondern langfristig für alle Module.

---

## Grundregel

```text
JSON = Seed / Fallback / technische Boot-Konfiguration
DB   = aktive Verwaltungsquelle für dashboardfähige Werte
ENV/Secret-Dateien = Secrets und Zugangsdaten
```

Dashboardfähige Werte sollen langfristig nicht dauerhaft aus JSON verwaltet werden.

---

## Was ein Installer niemals tun darf

Ein Installer darf niemals:

```text
.env überschreiben
Secret-Dateien überschreiben
Tokens anzeigen oder committen
app.sqlite löschen oder ersetzen
produktive DB-Daten löschen
produktive DB-Werte blind überschreiben
lokale AudioDevice-IDs von Forrests System übernehmen
Backups oder temporäre Dateien committen
historische Analyse-Snapshots überschreiben
```

SQLite bleibt produktiv aktiv und darf nicht neu gebaut oder ersetzt werden.

Schemaänderungen nur sanft:

```text
CREATE TABLE IF NOT EXISTS
ALTER TABLE nur geprüft und rückwärtskompatibel
INSERT nur wenn Wert fehlt
UPDATE nur wenn ausdrücklich gewünscht
```

---

## Seed-Typen

### 1. Settings-Seeds

Beispiele:

```text
sound_settings
alert_settings
tts_settings
soundalerts_bridge_settings
dashboard settings
module settings
```

Regel:

```text
Default aus JSON/Code nur einfügen, wenn kein DB-Wert existiert.
Bestehende DB-Werte gewinnen immer.
```

### 2. Text-Seeds

Beispiele:

```text
module_text_variants
Tagebuch-Texte
Todo-Texte
Hug/Rehug-Texte
TTS-Systemtexte
SoundAlerts-Systemtexte
Alert-Chattexte
```

Regel:

```text
Text-Keys dürfen geseedet werden.
Neue Varianten dürfen nur ergänzt werden, wenn sie fehlen.
User-geänderte Varianten nicht überschreiben.
Aktiv/Inaktiv-Status nicht blind zurücksetzen.
```

### 3. Preset-Seeds

Beispiele:

```text
alert_test_presets
test_ping
Sound-/Diagnose-Presets
Standard-Alert-Regeln
Default-Display-Profile
```

Regel:

```text
System-Presets dürfen gesetzt werden.
User-Presets nie überschreiben.
Presets brauchen stabile IDs oder eindeutige Keys.
```

### 4. technische Boot-Konfiguration

Beispiele:

```text
routes.prefix
websocket.op
allowedExtensions
Basisordner
Upload-Limits
Fallback-URLs localhost
```

Regel:

```text
Darf in JSON bleiben.
Darf vom Installer bereitgestellt werden.
Darf als Fallback dienen, falls DB noch leer ist.
```

### 5. lokale Maschinenwerte

Beispiele:

```text
AudioDevice selectedDeviceId
AudioDevice selectedDeviceName
lokale absolute Pfade
OBS-Quellen-/Szenen-Namen
ffmpeg-Pfad
cloudflared lokale Einstellungen
```

Regel:

```text
nicht blind übernehmen.
beim Setup prüfen/auswählen lassen.
in Config/DB nur nach Bestätigung speichern.
```

---

## Seed-Strategie

### Empfohlener Ablauf pro Modul

1. JSON-/Code-Defaults laden.
2. DB-Schema sicherstellen.
3. vorhandene DB-Werte lesen.
4. fehlende Settings/Text-Keys/Presets ergänzen.
5. keine vorhandenen produktiven Werte überschreiben.
6. Quelle dokumentieren:
   - database
   - json_seed
   - json_fallback
   - default
7. Integration-Check bereitstellen.

### Beispiel-Regel

```text
if db_value_exists:
    use db_value
else:
    insert seed/default if safe
    use inserted/default value
```

Nicht erlaubt:

```text
delete all settings and reinsert defaults
replace entire config from JSON
overwrite user edited values
```

---

## Modul-Standard für zukünftige Systeme

Jedes neue Modul sollte langfristig haben:

```text
GET  /api/<module>/status
GET  /api/<module>/config
GET  /api/<module>/settings
POST /api/<module>/settings
POST /api/<module>/reload
GET  /api/<module>/routes
GET  /api/<module>/integration-check
```

Nicht jedes Modul braucht sofort alle Endpunkte, aber dies ist der Zielstandard.

### Settings-Antworten sollen enthalten

```text
settings      = gespeicherte DB-Werte / Rohwerte
effective     = effektiv aktive Werte nach DB vor JSON-Fallback
sources       = Quelle je Block oder Feld
schema/status = Tabellen-/Migrationsstatus
```

### Integration-Check soll prüfen

```text
DB erreichbar
Config lesbar
Seeds vorhanden
Pfad-/Asset-Verfügbarkeit
Helper vorhanden
Dashboard-relevante Routen vorhanden
Warnungen
Fehler
```

---

## Dashboard-Regel

Dashboards dürfen nicht direkt lesen/schreiben:

```text
keine direkte SQLite-Nutzung
keine direkte JSON-Schreiblogik im Frontend
keine Secrets im Frontend
```

Dashboards nutzen immer Backend-APIs.

Dashboard sollte darstellen können:

```text
Quelle: DB / JSON-Fallback / Default
Status: gesund / Warnung / Fehler
Expert-Felder getrennt von normalen Feldern
```

---

## Git-/Repo-Regel

In Git gehören:

```text
Code
Doku
Schema-/Migrationslogik
Seed-Defaults ohne Secrets
Beispiel-Configs ohne private Werte
```

Nicht in Git:

```text
.env
Secrets
Tokens
app.sqlite
Backups
temporäre Dateien
private lokale Geräte-IDs, falls vermeidbar
produktive Uploads, wenn nicht ausdrücklich gewünscht
```

---

## Sound-System Anwendung dieser Regel

Für das Sound-System gilt konkret:

```text
sound_settings = DB-Zielquelle
sound_system.json = Seed/Fallback/Boot-Konfig
test_ping = technisches JSON-Seed-/Diagnose-Preset
output.targets = aktives Ausgabezielmodell
targets = Legacy/Kompatibilität
```

Später prüfen:

```text
sound_presets oder vorhandene Asset-/Media-Struktur
keine wachsende sounds[] Hauptverwaltung in JSON
lokale Device-ID beim Installer neu wählen lassen
```

---

## Alert-System Anwendung dieser Regel

Alert-System nutzt bereits viele DB-Strukturen:

```text
alert_rules
alert_assets
alert_events
alert_text_variants / Textblöcke
alert_test_presets
alert_display_profiles
alert_settings
```

JSON/Config bleibt für technische Defaults und Fallbacks.

Wichtig:

```text
Live-Alert-Sound-System-Settings sollen DB-vor-JSON bleiben.
Dashboard darf nur APIs nutzen.
```

---

## TTS Anwendung dieser Regel

TTS nutzt DB-vor-JSON für Settings.

Wichtig:

```text
Secrets/Key-Dateien nicht im Klartext ausgeben.
keyFile nur sanitisiert anzeigen.
Sound-System-Anbindung bleibt über soundSystemOutputTarget.
```

---

## SoundAlerts Anwendung dieser Regel

SoundAlerts nutzt:

```text
soundalerts_bridge_entries
soundalerts_bridge_events
soundalerts_bridge_meta
soundalerts_bridge_settings
```

Wichtig:

```text
Entries/Settings DB-basiert.
Upload-Pfade technisch konfigurierbar.
Audio/Video-Ziele über outputTarget.
```

---

## Texte-System Anwendung dieser Regel

Für alle Chat-/Discord-/Overlay-/Systemtexte gilt:

```text
kategoriebasiert
variantenfähig
dashboardfähig
DB-basiert
JSON nur Seed/Fallback
```

Keine neuen Module mit fest verdrahteten Texten bauen, wenn diese später bearbeitbar sein sollen.

---

## Offene Folgeaufgaben

### STEP201 – Dashboard-/Modul-Standard-Matrix

Ziel:

Eine Übersicht erstellen:

```text
Modul
Status-Endpunkt
Config-Endpunkt
Settings-Endpunkt
Routes-Endpunkt
Integration-Check
DB-Settings
DB-Texte
Dashboard vorhanden
JSON-Fallback
offene Abweichungen
```

### STEP202 – Installer-/Seed-Konzept technisch vorbereiten

Ziel:

- zentrale Seed-Helfer prüfen/planen
- vorhandene Helper nutzen
- keine Parallelstruktur bauen
- dry-run möglich machen
- safe install / update / repair unterscheiden

### STEP203 – Sound-Preset-/Media-Konzept optional

Nur wenn nötig:

- sound_presets prüfen
- vorhandene Asset-/Media-Strukturen prüfen
- Dashboard-UX für Presets planen

---

## Nicht Teil dieses STEPs

Dieser STEP ändert bewusst nichts an:

```text
Backend-Code
Dashboard-Code
DB-Schema
JSON-Dateien
SQLite-Datei
Secrets
.env
Installer-Code
```

---

## Ergebnis

Der globale Installer-/Seed-Standard ist:

```text
sicher
DB-schonend
dashboardorientiert
portabel
ohne Secrets
ohne Datenverlust
ohne lokale Werte blind zu übernehmen
```
