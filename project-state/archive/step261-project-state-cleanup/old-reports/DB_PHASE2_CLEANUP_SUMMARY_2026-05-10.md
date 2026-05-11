# DB Phase 2 Cleanup Summary - 2026-05-10

Projekt: `ForrestCGN/stream-control-center`  
Branch: `dev`  
Arbeitsziel: SQLite-spezifische Konstrukte schrittweise zentralisieren, ohne bestehende Funktionalität zu entfernen.

## Kurzfazit

Phase 2 ist für `AUTOINCREMENT` abgeschlossen.

Der finale Rescan nach STEP237 zeigt:

```text
PATTERN: INTEGER PRIMARY KEY AUTOINCREMENT
------------------------------------------------------------
backend\core\database.js:242: return "INTEGER PRIMARY KEY AUTOINCREMENT";
```

Damit gibt es keine direkte `INTEGER PRIMARY KEY AUTOINCREMENT`-Verwendung mehr in Backend-Modulen. Die SQLite-spezifische DDL ist zentral im Core-DB-Helper gekapselt.

## Zentraler Helper

Die direkte SQLite-DDL läuft jetzt über:

```js
database.primaryKeyAutoIncrementSql()
```

Aktuell gibt dieser Helper für SQLite zurück:

```js
"INTEGER PRIMARY KEY AUTOINCREMENT"
```

Das ist absichtlich weiterhin SQLite-spezifisch, aber nur noch zentral in `backend/core/database.js`.

## Abgeschlossene Cleanup-Steps

### STEP220-STEP237 relevante Phase-2-Arbeiten

Im Verlauf der Phase wurden direkte `AUTOINCREMENT`-Stellen und einige einfache Upsert-Fälle bereinigt.

Wichtige erledigte Module:

```text
backend/modules/helper_texts.js
backend/modules/challenge.js
backend/modules/clips.js
backend/modules/dashboard_auth.js
backend/modules/hug.js
backend/modules/kofi.js
backend/modules/loyalty.js
backend/modules/sound_system.js
backend/modules/soundalerts_bridge.js
backend/modules/tagebuch.js
backend/modules/tipeee.js
backend/modules/tts_system.js
backend/modules/twitch.js
backend/modules/vip_sound_overlay.js
backend/modules/alert_system.js
```

## Finaler Stand aus dem Rescan

### PRAGMA table_info

Noch vorhanden:

```text
backend\modules\alert_system.js
backend\core\database.js
```

Bewertung:

- `backend/core/database.js` ist zentraler Helper und darf `PRAGMA table_info` kapseln.
- `alert_system.js` hat noch eine direkte `PRAGMA table_info`-Stelle. Diese sollte separat geprüft werden, nicht blind ersetzen.

### INSERT OR IGNORE

Noch vorhanden:

```text
backend\modules\vip_sound_overlay.js
backend\core\database.js
```

Bewertung:

- `backend/core/database.js` enthält den zentralen Helper.
- `vip_sound_overlay.js` nutzt `INSERT OR IGNORE` in Seed-/Fallback-Logik. Nicht blind ersetzen.

### ON CONFLICT

Noch vorhanden:

```text
backend\modules\helpers\helper_texts.js
backend\modules\alert_system.js
backend\modules\kofi.js
backend\modules\soundalerts_bridge.js
backend\modules\sqlite_core.js
backend\modules\tagebuch.js
backend\modules\tipeee.js
backend\modules\todo.js
backend\modules\tts_system.js
backend\modules\twitch_presence.js
backend\modules\vip_sound_overlay.js
backend\core\database.js
```

Bewertung:

Diese Stellen sind nicht automatisch falsch. Viele enthalten fachliche Sonderlogik:

```text
- Counter-Inkremente
- COALESCE-Schutz
- bestehende Userdaten schützen
- Seed-/TypeMap-Logik
- Usage-/Event-Upserts
- Settings-/Entry-Seeding
- zentrale Core-Upsert-Helfer
```

Diese Stellen müssen einzeln bewertet werden, bevor man sie ersetzt.

## Bewusst nicht geändert

In Phase 2 wurde bewusst nicht geändert:

```text
- keine Tabellenstruktur-Migration
- keine Datenmigration
- kein Wechsel auf MySQL/MariaDB
- keine Aktivierung von MariaDB
- keine Entfernung bestehender Funktionen
- keine Änderung an fachlicher Alert-/VIP-/Loyalty-/TTS-/Tagebuch-/SoundAlerts-Logik
```

## Teststatus

Die betroffenen Module wurden nach den jeweiligen Steps über Status-/Routes-/Integration-Checks geprüft.

Bestätigte Bereiche:

```text
Auth
Tagebuch
Todo
Challenge
Hug
Ko-fi
Tipeee
Twitch EventSub / Alert Bridge
Sound-System
Clips
TTS
SoundAlerts
Loyalty
VIP-Sound
Alert-System
Core Database
```

Der finale Scan bestätigt außerdem, dass alle `AUTOINCREMENT`-Verwendungen in Modulen entfernt wurden und nur noch der zentrale Core-Helper die SQLite-spezifische Rückgabe enthält.

## Nächste sinnvolle Schritte

### 1. Phase 2 abschließen

Empfohlener Commit/Step:

```powershell
cd D:\Git\stream-control-center
.\stepdone.cmd "db: finish phase 2 sqlite construct cleanup"
```

### 2. Git-Status prüfen

```powershell
git status --short
git log --oneline -10
```

### 3. Optional: Phase 3 planen

Phase 3 sollte nicht pauschal alle `ON CONFLICT`-Stellen ersetzen. Besser:

```text
Phase 3A: alert_system.js PRAGMA table_info gezielt kapseln
Phase 3B: alert_system.js einfache Settings-Upserts prüfen
Phase 3C: vip_sound_overlay.js INSERT OR IGNORE / ON CONFLICT einzeln bewerten
Phase 3D: soundalerts_bridge.js Settings-/Entry-Upserts prüfen
Phase 3E: Stats-/Usage-Upserts bewusst dokumentieren oder gezielt abstrahieren
```

## Empfehlung

Aktuell ist ein guter stabiler Zwischenstand erreicht.

Nicht direkt weiter umbauen, bevor dieser Stand committed und dokumentiert ist. Danach kann Phase 3 als eigener Block gestartet werden.
