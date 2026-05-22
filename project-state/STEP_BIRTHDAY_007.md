# STEP_BIRTHDAY_007 – Ist-Stand-Abgleich und nächster Arbeitsplan

Stand: 2026-05-22  
Projekt: stream-control-center  
Bereich: Birthday-System  
Status: Korrigierter Planungs-/Prüfstand nach Abgleich mit GitHub/dev und hochgeladenen Dateien

---

## 1. Korrektur zum vorherigen STEP_BIRTHDAY_007-Entwurf

Der vorherige Entwurf ging fälschlich davon aus, dass das Birthday-System noch nicht implementiert ist.

Das ist falsch.

Der echte aktuelle Stand laut GitHub/dev und hochgeladenen Dateien ist:

```text
STEP_BIRTHDAY_006E – Birthday Command Fallback Cleanup
```

Das Birthday-System ist bereits implementiert und besteht mindestens aus:

```text
backend/modules/birthday.js
htdocs/dashboard/modules/birthday.js
htdocs/dashboard/modules/birthday.css
htdocs/overlays/_overlay-birthday.html
project-state/STEP_BIRTHDAY_006E.md
project-state/CURRENT_STATUS.md
docs/current/CURRENT_SYSTEM_STATUS.md
```

---

## 2. Aktueller bestätigter Stand

### Backend

Datei:

```text
backend/modules/birthday.js
```

Bestätigte Merkmale:

```text
MODULE_NAME = birthday
SCHEMA_VERSION = 7
API_PREFIX = /api/birthday
STEP = STEP_BIRTHDAY_006E
```

Das Backend enthält bereits:

- Birthday-User-Verwaltung
- DB-Schema bis Version 7
- Birthday-Greetings-Log
- Birthday-Show-Events
- Birthday-Show-Profile
- Birthday-Partys
- Birthday-Show-Queue
- Settings-Anbindung über `birthday_settings`
- Textvarianten über `helper_texts`
- Chat-Ausgabe über `helper_chat_output`
- Command-System-Anbindung über `commands.js`
- passive Auto-Gratulation per Chat-Hook
- Sound-System-Bundle-Anbindung für Intro/Song
- Party-Presets:
  - `classic_party`
  - `cgn_neon`
  - `epic_party`
  - `heimaufsicht_fun`
  - `cute_soft`

---

## 3. Command-Fluss

Aktuell gewollter Command-Fluss:

```text
Twitch Chat
→ twitch_presence
→ commands.js
→ /api/birthday/command
→ birthday.js
→ helper_chat_output
```

Wichtig:

Der zusätzliche Birthday-Chat-Fallback ist deaktiviert bzw. wird nicht mehr aktiv genutzt.

Grund:

Das Problem war nicht der Birthday-Command selbst, sondern dass der Bot/Heimleitung nicht im Chat war. Dadurch kamen keine PRIVMSG-Events an und das zentrale Command-System konnte nichts verarbeiten.

---

## 4. Auto-Gratulation

Der passive Chat-Hook bleibt aktiv.

Ablauf:

```text
User schreibt normal im Chat
→ Birthday-Modul prüft, ob User registriert ist
→ Prüft, ob heute Geburtstag ist
→ Prüft, ob Stream aktiv ist, wenn onlyWhenLive aktiv ist
→ Prüft, ob heute schon gratuliert wurde
→ sendet kleine Chat-Gratulation
→ schreibt optional Tagebuch-Eintrag
→ schreibt Greeting-Log
```

Wichtig:

Normale `!birthday` Commands dürfen nicht parallel im Hook verarbeitet werden.

---

## 5. Dashboard

Dateien:

```text
htdocs/dashboard/modules/birthday.js
htdocs/dashboard/modules/birthday.css
```

Das Dashboard-Modul existiert und registriert sich als:

```text
Birthday-System
```

Bereich:

```text
community
```

Genutzte API-Routen:

```text
/api/birthday/status
/api/birthday/admin/users
/api/birthday/admin/user
/api/birthday/admin/user/delete
/api/birthday/admin/settings
/api/birthday/admin/texts
/api/birthday/reload
/api/birthday/show/state
/api/birthday/show/stop
/api/birthday/admin/show/upload
/api/birthday/admin/show/assets
/api/birthday/admin/show/recheck
/api/birthday/admin/show/parties
/api/birthday/admin/show/profile
/api/birthday/admin/resolve-user
```

Dashboard-Bereiche:

- Übersicht
- User/Geburtstage
- Party-Show
- Party-Profile
- Settings
- Texte/Textvarianten

---

## 6. Overlay

Datei:

```text
htdocs/overlays/_overlay-birthday.html
```

Das Overlay ist vorhanden.

Merkmale:

- 1920x1080
- transparenter Hintergrund
- CGN-Neon-Stil
- Avatar/Initialen-Fallback
- Party-Styles
- FX-Layer mit Herzen, Konfetti, Ballons, Sparkles, Ribbon, Words
- Polling auf `/api/birthday/show/state`
- WebSocket-Reaktion auf Birthday-Events
- Debug-Modus per `?debug=1`

---

## 7. API-Routen laut Backend

Aktuell dokumentierte bzw. registrierte Routen:

```text
GET  /api/birthday/status
POST /api/birthday/command
GET  /api/birthday/today
GET  /api/birthday/show/state
GET  /api/birthday/show/queue
POST /api/birthday/show/queue/clear-stale
POST /api/birthday/show/stop
POST /api/birthday/admin/show/upload
GET  /api/birthday/admin/show/assets
POST /api/birthday/admin/show/recheck
GET  /api/birthday/admin/show/parties
POST /api/birthday/admin/show/parties
POST /api/birthday/admin/show/profile
GET  /api/birthday/admin/resolve-user
GET  /api/birthday/admin/users
POST /api/birthday/admin/user
POST /api/birthday/admin/user/delete
GET  /api/birthday/admin/settings
POST /api/birthday/admin/settings
GET  /api/birthday/admin/texts
POST /api/birthday/admin/texts
POST /api/birthday/reload
```

---

## 8. Lokaler Syntax-Check

Die hochgeladene Backend-Datei wurde lokal geprüft:

```powershell
node --check birthday.js
```

Ergebnis:

```text
kein Syntaxfehler
```

---

## 9. Nächste sinnvolle Arbeit

Der nächste Schritt ist nicht mehr „Backend-Basis implementieren“.

Der nächste Schritt ist:

```text
STEP_BIRTHDAY_008 – Live-Test, Fehlerbereinigung und Dashboard-/Command-Abgleich
```

Empfohlene Testreihenfolge:

### 9.1 Backend-Status

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/birthday/status"
```

Erwartung:

```text
ok = true
step = STEP_BIRTHDAY_006E
schemaVersion = 7
chatHookInstalled = true
commandSeeded = true
```

### 9.2 Twitch Presence prüfen

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/presence/status"
```

Wenn Bot nicht im Chat ist:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/presence/start" -Method POST -ContentType "application/json" -Body '{}'
```

### 9.3 Command testen

Nur wenn Heimleitung/Bot im Chat ist:

```text
!birthday help
!birthday set 16.08.1974
!birthday show
!birthday delete
```

### 9.4 Dashboard testen

Im Dashboard prüfen:

- Birthday-System sichtbar?
- Status lädt?
- User-Liste lädt?
- Settings laden?
- Texte laden?
- Overlay-Link öffnet?
- Show-State lädt?

### 9.5 Overlay testen

```text
http://127.0.0.1:8080/overlays/_overlay-birthday.html?debug=1
```

---

## 10. Offene Prüfpunkte

Diese Punkte sollten vor neuen Features geprüft werden:

1. Kommt `!birthday` wirklich über `commands.js` an?
2. Ist `command_definitions` korrekt geseedet?
3. Wird `/api/birthday/command` vom Command-System korrekt aufgerufen?
4. Ist `helper_chat_output` korrekt konfiguriert?
5. Ist Twitch Presence aktiv?
6. Wird Auto-Gratulation nur bei normalen Chatnachrichten geprüft?
7. Wird bei Commands keine Auto-Gratulation parallel ausgelöst?
8. Funktioniert Tagebuch-Schreiben bei Geburtstagsgrüßen?
9. Greift `onlyWhenLive` korrekt?
10. Funktioniert Sound-System-Bundle für Birthday-Show?
11. Wird die Show-Queue nach altem/abgebrochenem Status sauber bereinigt?
12. Ist das Dashboard vollständig mit den Backend-Routen kompatibel?
13. Funktioniert Avatar-Auflösung im Dashboard/Show-Profil?
14. Lädt das Overlay den korrekten Show-State?

---

## 11. Keine Codeänderung in diesem STEP

STEP_BIRTHDAY_007 ist nur der korrigierte Abgleich.

Es wurden keine Funktionen entfernt und keine Projektdateien geändert.

---

## 12. Empfehlung

Erst testen, dann gezielt fixen.

Wenn bei den Tests Fehler auftreten, sollte STEP_BIRTHDAY_008 nur die konkret gefundenen Probleme beheben und keine neuen Großfeatures einbauen.
