# STEP201 Zwischenmatrix – Modulstandard nach aktuellen Nachzügen

Stand: 2026-05-08  
Projekt: stream-control-center  
Typ: Doku-/Status-STEP  
Status: vorbereitet

## Zweck

Diese Zwischenmatrix hält fest, welche Module im Rahmen von STEP201 bereits auf den neuen Diagnose-/Standard-Endpunkt-Stand gebracht wurden.

Zielstandard:

```text
GET  /api/<module>/status
GET  /api/<module>/config
GET  /api/<module>/settings
GET  /api/<module>/routes
GET  /api/<module>/integration-check
POST /api/<module>/reload
```

Wichtig:

```text
Nicht jedes Modul muss dieselbe interne Datenhaltung haben.
Nicht jedes Modul muss sofort DB-basiert sein.
Legacy-Routen bleiben erhalten.
Neue Standard-Routen werden ergänzt, nicht ersetzt.
```

---

## Abgeschlossene Module im aktuellen Lauf

| Modul | Status | Config | Settings | Routes | Integration-Check | Reload | Ergebnis |
|---|---:|---:|---:|---:|---:|---:|---|
| Alerts | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | abgeschlossen |
| SoundAlerts | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | abgeschlossen |
| Tagebuch | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | abgeschlossen |
| Todo | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | abgeschlossen |
| Messages | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | abgeschlossen |
| Message Rotator | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | abgeschlossen |
| Sound-System | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | bereits Referenz |
| TTS | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | bereits Referenz |

---

## Details pro Modul

### Alerts

Commit:

```text
6b2b017 alerts: add routes endpoint
```

Ergänzt:

```text
GET /api/alerts/routes
```

Status:

```text
/api/alerts/status ✅
/api/alerts/config ✅
/api/alerts/settings ✅
/api/alerts/routes ✅
/api/alerts/integration-check ✅
/api/alerts/reload ✅
```

Notiz:

```text
Alert-System war bereits weitgehend standardisiert.
Es fehlte hauptsächlich /routes.
```

---

### SoundAlerts

Commits:

```text
bb232be soundalerts: add routes endpoint
8da2dad soundalerts: add integration check
```

Ergänzt:

```text
GET /api/soundalerts/routes
GET /api/soundalerts/integration-check
```

Status:

```text
/api/soundalerts/status ✅
/api/soundalerts/config ✅
/api/soundalerts/settings ✅
/api/soundalerts/routes ✅
/api/soundalerts/integration-check ✅
/api/soundalerts/reload ✅
```

Notiz:

```text
SoundAlerts ist jetzt im Zielstandard.
Integration-Check prüft Config, DB, Tabellen, Sound-System-Konfig, Upload-Pfade und Runtime-Zustand.
```

---

### Tagebuch

Commit:

```text
508e7d8 tagebuch: add routes and integration check
```

Ergänzt:

```text
GET /api/tagebuch/routes
GET /api/tagebuch/integration-check
GET /api/tagebuch/config
GET /api/tagebuch/settings
```

Status:

```text
/api/tagebuch/status ✅
/api/tagebuch/config ✅
/api/tagebuch/settings ✅
/api/tagebuch/routes ✅
/api/tagebuch/integration-check ✅
/api/tagebuch/reload ✅
```

Notiz:

```text
Legacy-Routen bleiben erhalten.
Kein Umbau der Tagebuch-Entry-, Streamstart-, Streamende-, Discord-Webhook- oder Stats-Logik.
```

---

### Todo

Commits:

```text
e005efc todo: add routes and integration check
f73c557 todo: fix integration check 500
0515c8d todo: fix integration check text columns
```

Ergänzt:

```text
GET /api/todo/routes
GET /api/todo/integration-check
GET /api/todo/config
GET /api/todo/settings
```

Status:

```text
/api/todo/status ✅
/api/todo/config ✅
/api/todo/settings ✅
/api/todo/routes ✅
/api/todo/integration-check ✅
/api/todo/reload ✅
```

Notiz:

```text
Integration-Check wurde robust gemacht.
Texttabellenprüfung nutzt korrekt module_name.
```

---

### Messages

Commits:

```text
3d0440b messages: add routes and integration check
b9b7234 messages: fix integration check file warnings
```

Ergänzt:

```text
GET /api/messages/routes
GET /api/messages/integration-check
GET /api/messages/config
GET /api/messages/settings
```

Status:

```text
/api/messages/status ✅
/api/messages/config ✅
/api/messages/settings ✅
/api/messages/routes ✅
/api/messages/integration-check ✅
/api/messages/reload ✅
```

Notiz:

```text
[object Object]-Warnings im File-Check wurden korrigiert.
Status.files wird jetzt korrekt über file.path ausgewertet.
```

---

### Message Rotator

Commits:

```text
6d18f9d message-rotator: add routes and integration check
7c20cf6 message-rotator: fix array route registration
```

Ergänzt:

```text
GET /api/message-rotator/routes
GET /api/message-rotator/integration-check
GET /api/message-rotator/config
GET /api/message-rotator/settings
```

Status:

```text
/api/message-rotator/status ✅
/api/message-rotator/config ✅
/api/message-rotator/settings ✅
/api/message-rotator/routes ✅
/api/message-rotator/integration-check ✅
/api/message-rotator/reload ✅
```

Notiz:

```text
Array-Routenregistrierung wurde auf einzelne registerGet-Aufrufe umgestellt.
Legacy-Routen /message-rotator/* bleiben erhalten.
```

---

## Offene Module / Kandidaten

### VIP

Bekannte Prefixe:

```text
/api/vip-sound-overlay
/api/vip-sound
```

Offen:

```text
/api/vip als optionaler Alias
/routes
/integration-check
ggf. /config und /settings sauber dokumentieren
```

Priorität:

```text
mittel
```

Grund:

```text
VIP ist ein Sonderfall mit mehreren Prefixen.
Erst prüfen, dann bauen.
Keine alten VIP-Routen entfernen.
```

---

### Hug/Rehug

Bekannter Stand:

```text
Node + SQLite
Legacy-Import vorhanden
Chatbefehle aktiv
Dashboard-Anpassung geplant
```

Offen:

```text
echte aktuelle Routen prüfen
/routes ergänzen
/integration-check ergänzen
DB-/JSON-/Config-Quellen sauber dokumentieren
```

Priorität:

```text
mittel
```

---

### Challenge

Offen:

```text
prüfen, ob bereits /api/challenge/routes und /api/challenge/integration-check existieren
ggf. Modulstandard nachziehen
```

Priorität:

```text
mittel
```

---

### Clips

Offen:

```text
prüfen, ob /api/clip/routes und /api/clip/integration-check existieren
Config-/Messages-/Discord-Ziel prüfen
```

Priorität:

```text
mittel
```

---

### Credits

Offen:

```text
Proxy-Modul prüfen
/routes und /integration-check nur falls sinnvoll
```

Priorität:

```text
niedrig
```

---

### Deathcounter

Offen:

```text
prüfen, ob API-Standard-Endpunkte fehlen
Datenhaltung JSON-basiert, später DB-Frage separat klären
```

Priorität:

```text
mittel
```

---

### OBS / Scene Control

Offen:

```text
nicht blind nach Standard umbauen
erst tatsächliche Routen und Dashboard-Nutzung prüfen
```

Priorität:

```text
mittel
```

---

### Discord / Twitch / Twitch Presence

Offen:

```text
Bridge-/Infrastrukturmodule getrennt bewerten
nicht jeden Endpoint künstlich in denselben Standard pressen
/routes und /integration-check können trotzdem sinnvoll sein
```

Priorität:

```text
niedrig bis mittel
```

---

## JSON-vs-DB-Zwischenstand

Aktuelle Regel bleibt:

```text
Nur wirklich wichtige, nicht sinnvoll in DB verschiebbare Werte bleiben langfristig in JSON.
Alles, was runtime-/dashboardfähig ist, soll nach und nach DB-basiert werden.
JSON bleibt Seed/Fallback/Installationsgrundlage.
```

Wichtig für Installer:

```text
JSON-Seeds müssen weiterhin existieren können.
DB-Migrationen müssen idempotent sein.
Installer muss DB initialisieren, JSON Seeds importieren und bestehende Daten nicht überschreiben.
```

---

## Nächste sinnvolle Schritte

### Option A – VIP standardisieren

```text
STEP201.3f – VIP /routes + /integration-check prüfen/planen
```

Benötigte Dateien voraussichtlich:

```text
backend/modules/vip_sound_overlay.js
ggf. weitere VIP/Sound-Dateien
```

### Option B – Hug/Rehug standardisieren

```text
STEP201.3f – Hug/Rehug /routes + /integration-check prüfen/planen
```

Benötigte Datei voraussichtlich:

```text
backend/modules/hug_system.js
```

### Option C – Gesamtanalyse neu laufen lassen

```text
STEP201.4 – aktuelle Modulmatrix neu aus API-Tests erzeugen
```

Dafür sinnvoll:

```text
PowerShell-Testscript für alle Standard-Endpunkte
Ausgabe nach D:\gpt\last_api.json
```

---

## Empfehlung

Direkt als nächstes:

```text
STEP201.4 – frische Gesamtmatrix per Testscript erzeugen
```

Grund:

```text
Wir haben mehrere Module nachgezogen.
Eine frische API-Matrix zeigt sauber, welche Module jetzt wirklich noch fehlen.
Danach entscheiden wir gezielt: VIP, Hug, Challenge, Clips oder anderes Modul.
```
