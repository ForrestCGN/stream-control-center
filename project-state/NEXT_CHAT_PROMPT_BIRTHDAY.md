# Neuer Chat Prompt – Birthday-System weiterführen

Wir arbeiten am `stream-control-center` von ForrestCGN.

## Projekt-Kontext

Repo: `ForrestCGN/stream-control-center`  
Branch: `dev`  
Lokales Repo: `D:\Git\stream-control-center`  
Live-Ziel: `D:\Streaming\stramAssets`

Wichtige Regeln:

- Vor Änderungen echten aktuellen Repo-/Live-Stand prüfen.
- Keine Funktionalität entfernen.
- Keine Parallelstrukturen bauen.
- Bestehende Helper nutzen.
- SQLite `D:\Streaming\stramAssets\data\sqlite\app.sqlite` nur erweitern, nie überschreiben.
- Chat-Ausgaben über `helper_chat_output`.
- Texte über `helper_texts` / DB-Textvarianten.
- Commands über das zentrale Command-System (`commands.js`) und nicht als Sonderparser.
- Nach jedem abgeschlossenen STEP ZIP mit echten Zielpfaden liefern, Doku/Projektstatus aktualisieren.

## Aktueller Birthday-Stand

Aktueller Stand: `STEP_BIRTHDAY_006E – Command Fallback Cleanup`

Letzter ZIP:
`STEP_BIRTHDAY_006E_command_fallback_cleanup.zip`

Nach dem Entpacken muss/ musste ausgeführt werden:

```powershell
cd D:\Git\stream-control-center
.\stepdone.cmd "STEP_BIRTHDAY_006E Command Fallback Cleanup"
```

Danach prüfen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/birthday/status"
```

Erwartung:

```text
step = STEP_BIRTHDAY_006E
```

## Was das Birthday-System aktuell kann

### Registrierung

```text
!birthday set 22.05
!birthday set 22.05.1980
!birthday show
!birthday delete
!birthday today
```

Jahr ist optional. Wenn ein Jahr gesetzt ist, wird Alter berechnet.

### Automatische kleine Gratulation

Wenn ein registrierter User an seinem Geburtstag im Chat schreibt:

- kleine Chat-Gratulation
- optional Tagebuch-Systemeintrag
- kein Video
- kein Overlay
- kein Song

### Manuelle Show

```text
!birthday party @user
!birthday showtime @user
```

Das System:

- normalisiert `@user` zu Login
- löst DisplayName und Avatar über `/userinfo?login=...` auf
- nutzt Party-Preset/User-Party oder Fallback
- erstellt ein locked Birthday-Bundle für das Sound-System
- Sound-System spielt globales Intro-Video und danach Song
- Birthday-Overlay bleibt während Intro unsichtbar
- Birthday-Overlay blendet erst zur Songphase ein
- Party bleibt bis Songende sichtbar

### Sound-System und Timing

Birthday nutzt das Sound-System als Medien-Master.

Ablauf:

```text
!birthday party @user
→ Birthday-Modul baut Birthday-Bundle:
   1. Intro-Video
   2. Song
→ Sound-System Queue entscheidet Start/Queue
→ Birthday-Overlay synchronisiert sich über Birthday-/Sound-State
```

Intro-Video ist global und immer gleich.

Song kommt aus:

- User-/Party-Song, wenn vorhanden
- sonst Standardsong

Laufzeiten werden per ffprobe erkannt und explizit verwendet.

Bestätigte Medien:

```text
Intro: birthday/birthday_intro_video.mp4, 00:29.4
Standard-Song: birthday/birthday_default_song.mp3, 03:11.3
Araglor-Song: birthday/birthday_song_araglor_2.mp3, 03:31.8
```

### Party-System

Seit STEP_BIRTHDAY_005 gibt es Party-Presets:

```text
default_party
classic_party
cgn_neon
epic_party
heimaufsicht_fun
cute_soft
```

Fallback-Regel:

```text
Wenn User aktive Party-Zuordnung hat:
→ diese Party nutzen

Wenn nicht:
→ Standard-Party + Standardsong nutzen
```

User-Songs können unabhängig von registrierten Geburtstagen existieren.

### Queue/Duplicate

Bestätigt:

```text
!birthday party araglor
→ startet

!birthday party araglor nochmal
→ blockiert

!birthday party roxxy während Araglor läuft
→ queued
```

Stale Queue Cleanup ist in STEP_BIRTHDAY_005E umgesetzt.

### Overlay

Datei:

```text
htdocs/overlays/_overlay-birthday.html
```

Aktueller Stand nach 006D/006E:

- Overlay während Intro unsichtbar
- Einblendung erst bei `phase=party`
- Name ohne `@`
- Glückwunschtext ohne `@`
- Headline: `Happy Birthday!`
- Alter nur im Untertext: `Alles Gute zum 51. Geburtstag, ForrestCGN!`
- `Party läuft` entfernt
- Avatar wird angezeigt
- Layout wurde Richtung CGN/Deathcounter-Stil poliert
- Weitere optische Arbeit ist ausdrücklich gewünscht

### Dashboard

Dateien:

```text
htdocs/dashboard/modules/birthday.js
htdocs/dashboard/modules/birthday.css
```

Tabs:

- Übersicht
- Show/Medien
- Partys
- Geburtstage
- Settings
- Texte

Seit 005F ist Party-Verwaltung übersichtlicher getrennt.

## Wichtige API-Routen

```text
GET /api/birthday/status
POST /api/birthday/command
GET /api/birthday/today
GET /api/birthday/show/state
GET /api/birthday/show/queue
POST /api/birthday/show/queue/clear-stale
GET /api/birthday/admin/show/assets
POST /api/birthday/admin/show/recheck
POST /api/birthday/admin/show/upload
GET /api/birthday/admin/show/parties
POST /api/birthday/admin/show/parties
POST /api/birthday/admin/show/profile
GET /api/birthday/admin/resolve-user?login=@forrestcgn
GET /api/birthday/admin/users
POST /api/birthday/admin/user
POST /api/birthday/admin/user/delete
GET /api/birthday/admin/settings
POST /api/birthday/admin/settings
GET /api/birthday/admin/texts
POST /api/birthday/admin/texts
```

## Wichtige Testergebnisse

### Resolver

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/birthday/admin/resolve-user?login=@forrestcgn" | ConvertTo-Json -Depth 10
```

Bestätigt:

```text
login = forrestcgn
displayName = ForrestCGN
avatarUrl = vorhanden
source = /userinfo?login=forrestcgn
```

### Queue-Stale Fix

Bestätigt:

```text
cleanup.cleaned = 1
queue = []
state.active = false
phase = idle
```

### Duplicate/Queue

Bestätigt:

```text
1. !birthday party araglor
→ startet

2. !birthday party araglor nochmal
→ Duplicate-Block

3. !birthday party roxxy während Araglor läuft
→ Queue
```

## Wichtig für nächsten Schritt

Forrest will wahrscheinlich als Nächstes weiter am Overlay und/oder Dashboard arbeiten.

Aktuelle Wünsche:

- Overlay soll noch hochwertiger werden.
- Mehr echte „Party“, aber im CGN-/Deathcounter-Stil.
- Mehr Unterschiede zwischen Party-Styles.
- Herzen sollen fliegen.
- 3 Minuten soll nicht immer dasselbe zu sehen sein.
- Später Bilder pro Party möglich machen.
- Dashboard soll weiter übersichtlicher werden.
- Party/User-Song-Zuordnung muss sauber bleiben:
  - technisch Login verwenden
  - Anzeige DisplayName
  - Avatar anzeigen, wenn vorhanden

## Nächste sinnvolle STEPs

### STEP_BIRTHDAY_006F / 007 – Overlay Final Polish

Mögliche Ziele:

- Feintuning in OBS bei 1920×1080
- Party-Styles stärker trennen
- Avatar/Name/Headline noch hochwertiger animieren
- Effekte weniger zufällig, mehr inszeniert
- Szenenwechsel besser timen
- später Party-Bilder vorbereiten

### STEP_BIRTHDAY_007 – Party Images Vorbereitung

Mögliche Tabellen:

```text
birthday_party_images
```

Features:

- Bilder pro Party hochladen/zuordnen
- im Overlay während Partyphase rotieren
- Polaroid/Card-Frames
- später Dashboard-Bildverwaltung

### STEP_BIRTHDAY_008 – Presence / Anwesenheitsprüfung

Aktuell:

```text
presence.known = false
reason = presence_list_unavailable
```

Optionen:

- Twitch Presence Userliste via API bereitstellen
- oder Birthday-interne `last_seen_in_chat` Tabelle
- `show.requireUserPresent` später nutzbar machen

## Bitte im neuen Chat beachten

Nicht auf alten Annahmen bauen.  
Wenn Code geändert wird, zuerst aktuelle Dateien aus Repo/Live/Upload prüfen.  
Keine Funktionalität entfernen.  
Bei Änderungen wieder STEP-ZIP mit echten Zielpfaden und aktualisierten Projektdateien liefern.
