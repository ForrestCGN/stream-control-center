# STEP200.2 – Sound-System Standardisierung / Doku-Plan

Stand: 2026-05-08  
Projekt: stream-control-center  
Typ: Doku-/Planungs-STEP  
Status: vorbereitet

## Ausgangslage

STEP200.1 hat das Sound-System um folgende Standard-Endpunkte ergänzt:

```text
GET /api/sound/routes
GET /api/sound/integration-check
```

Der Live-Test war erfolgreich:

```text
/api/sound/status              ok
/api/sound/config              ok
/api/sound/settings            ok
/api/sound/routes              ok
/api/sound/integration-check   ok
integration-check healthy      true
errors                         []
```

## Aktueller Integrationsstatus

Das Sound-System ist aktuell funktional grün:

- Sound-System ist aktiviert.
- Queue ist leer.
- Overlay-Client ist verbunden.
- Fehlerzähler sind sauber.
- `sound_settings` wird erkannt.
- DB-Settings werden für erlaubte Blöcke genutzt.
- JSON bleibt Fallback.
- AudioDeviceHelper ist konfiguriert und vorhanden.
- `soundsBaseDir` existiert.
- `.mp4` und `.webm` sind erlaubt.

## Bekannte Warnung

Der Integration-Check meldet erwartungsgemäß:

```text
legacy_targets_and_output_targets_both_present
```

Das ist aktuell kein Fehler, sondern eine dokumentierte Altlast.

---

## Verbindliche Zielklärung

### `output.targets` ist das aktive Ausgabezielmodell

Aktives Ausgabezielmodell:

```text
output.targets.overlay
output.targets.device
output.targets.both
```

Bedeutung:

- `overlay`: Wiedergabe im OBS-Browseroverlay
- `device`: Wiedergabe über AudioDeviceHelper auf ein konkretes Audiogerät
- `both`: Kombinierte Ausgabe, aktuell noch deaktiviert

Dieses Modell ist relevant für:

- Alert-System
- SoundAlerts
- TTS
- direkte `/api/sound/play`-Aufrufe
- Overlay-Video-Ausgabe
- Device-Audio-Ausgabe

### `targets` ist Legacy/Kompatibilität

Legacy-Modell:

```text
targets.stream
targets.discord
targets.both
```

Dieses Modell darf vorerst nicht entfernt werden.

Grund:

- Es kann noch alte Aufrufer geben, die `target=stream|discord|both` setzen.
- Manche Module könnten `target` noch semantisch nutzen, auch wenn `outputTarget` die eigentliche Ausgabe steuert.
- Eine Entfernung ohne vollständige Aufruferprüfung könnte Funktionalität brechen.

Regel:

```text
targets bleibt bestehen, bis alle Aufrufer geprüft und migriert sind.
```

---

## DB-/JSON-Regel für Sound-System

### DB ist Zielquelle für dashboardfähige Settings

Die Tabelle:

```text
sound_settings
```

ist die Zielquelle für dashboardfähige Sound-System-Settings.

Dazu gehören langfristig:

- output/defaultTarget
- output/targets/overlay
- output/targets/device
- overlay timing/fallback values
- queue behavior
- priorities
- categoryDefaults
- defaults
- allowedExtensions
- soundsBaseDir, sofern dashboardfähig gewünscht

### JSON bleibt Seed/Fallback/Boot-Konfig

`config/sound_system.json` bleibt für:

- Erstinstallation/Seed
- technische Boot-Fallbacks
- erlaubte Basistypen
- Fallback für fehlende DB-Werte
- Test-/Defaultwerte, solange sie noch nicht DB-seeded sind

Wichtig:

```text
JSON darf nicht dauerhaft Hauptverwaltungsquelle für dashboardfähige Sound-Settings bleiben.
```

---

## `test_ping` in JSON

Aktuell liegt im JSON noch:

```text
sounds: [ test_ping ]
```

Das ist aktuell toleriert, aber langfristig nicht ideal.

Ziel:

- entweder als technischer Seed/Fallback klar dokumentieren
- oder in eine DB-/Preset-Struktur migrieren
- Dashboard soll später Test-Sounds/Preset-Sounds nicht direkt aus JSON verwalten müssen

Nicht jetzt tun:

```text
test_ping nicht blind entfernen.
```

Grund:

- Kann für Diagnose/Test-Endpunkte genutzt werden.
- Könnte noch im Dashboard oder bei manuellen Tests erwartet werden.

---

## Dashboard-Regel

Das Sound-Dashboard darf nicht direkt `sound_system.json` oder SQLite lesen/schreiben.

Ziel:

```text
Lesen:    GET  /api/sound/settings
Schreiben: POST /api/sound/settings
Status:   GET  /api/sound/status
Config:   GET  /api/sound/config
Check:    GET  /api/sound/integration-check
```

Dashboard soll künftig sichtbar unterscheiden können:

```text
source: database
source: json_fallback
source: default
```

Das ist wichtig, damit beim Bearbeiten klar ist, ob ein Wert wirklich in der DB gespeichert ist oder nur aus JSON/Fallback kommt.

---

## Installer-/Setup-Regel

Ein späterer Installer muss für das Sound-System:

1. `config/sound_system.json` als Seed/Fallback bereitstellen.
2. `sound_settings` anlegen/migrieren.
3. fehlende Default-Settings aus JSON in DB seeden.
4. vorhandene DB-Settings nicht überschreiben.
5. AudioDeviceHelper-Pfad prüfen.
6. Overlay-Datei prüfen.
7. AllowedExtensions inkl. `.mp4` und `.webm` setzen.
8. keine lokalen Geräte-IDs hart für andere Systeme übernehmen.

Besonderheit:

```text
selectedDeviceId und selectedDeviceName sind maschinenspezifisch.
```

Diese Werte dürfen bei Installer/Portable-Setup nicht blind von Forrests Live-System übernommen werden.

---

## Offene spätere Aufgaben

### STEP200.3 – Sound-System Dashboard prüfen

Prüfen:

- nutzt Dashboard ausschließlich Backend-APIs?
- zeigt Dashboard DB/effective Settings korrekt?
- sind technische/gefährliche Felder sinnvoll getrennt?
- gibt es zu viele Expert-Felder für normale Benutzer?
- sind `output.targets` und Legacy-`targets` verständlich getrennt?
- gibt es einen klaren Reload-/Speichern-Flow?

### STEP200.4 – Sound-System Settings Source Anzeige

Planen/umsetzen:

- Quelle je Block anzeigen: DB/Fallback/Default
- `settings` vs `effective` benutzerfreundlich darstellen
- keine rohen JSON-Massenblöcke in normaler Ansicht

### STEP200.5 – Sound-System JSON reduzieren/Seed bereinigen

Nur nach vollständiger Prüfung:

- `test_ping` als Seed oder DB-Preset behandeln
- JSON nicht blind leeren
- Installer-Seed vorbereiten
- keine bestehende Funktionalität entfernen

### STEP200.6 – Aufruferprüfung `target` vs `outputTarget`

Alle Module prüfen:

- Alert-System
- SoundAlerts
- TTS
- VIP
- Dashboard
- direkte Test-/Admin-Aufrufe
- Streamer.bot-Aufrufe, soweit dokumentiert

Ziel:

- `outputTarget` als echtes Ausgabeziel festlegen
- `target` nur noch semantisch/legacy oder sauber ablösen
- Legacy nicht entfernen, bis alle Aufrufer migriert sind

---

## Nicht Teil dieses STEPs

Dieser STEP ändert bewusst nichts an:

- Backend-Code
- Dashboard-Code
- DB-Schema
- JSON-Konfiguration
- Overlay-Code
- AudioDeviceHelper
- Queue-/Playback-Logik

---

## Definition „fertig“ für Sound-System Standardisierung

Das Sound-System gilt langfristig als vollständig standardisiert, wenn:

- alle Standard-Endpunkte vorhanden sind
- Integration-Check ohne unerwartete Warnungen läuft
- Dashboard nur Backend-APIs nutzt
- DB-Settings klar vor JSON-Fallback gewinnen
- JSON nur Seed/Fallback/Boot-Konfig enthält
- `target`/`outputTarget` sauber dokumentiert oder migriert ist
- AudioDeviceHelper-Geräte maschinenspezifisch behandelt werden
- Installer-Seed vorbereitet ist
- Doku aktuell ist
