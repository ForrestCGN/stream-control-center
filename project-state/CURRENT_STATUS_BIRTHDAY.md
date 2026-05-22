# CURRENT STATUS – Birthday-System

Stand: STEP_BIRTHDAY_006E – Command Fallback Cleanup  
Projekt: `stream-control-center`  
Repo: `ForrestCGN/stream-control-center`, Branch `dev`  
Lokales Repo: `D:\Git\stream-control-center`  
Live-Ziel: `D:\Streaming\stramAssets`

## Wichtigster aktueller Stand

Das Birthday-System ist bis STEP_BIRTHDAY_006E umgesetzt und getestet/weiterentwickelt worden.

Letzter gebauter ZIP-Stand:
`STEP_BIRTHDAY_006E_command_fallback_cleanup.zip`

Nach dem Entpacken im Repo muss wie üblich ausgeführt werden:

```powershell
cd D:\Git\stream-control-center
.\stepdone.cmd "STEP_BIRTHDAY_006E Command Fallback Cleanup"
```

Danach Backend neu starten und prüfen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/birthday/status"
```

Erwartung:

```text
step = STEP_BIRTHDAY_006E
```

## Aktuelle Architektur

### Backend

Hauptmodul:

```text
backend/modules/birthday.js
```

Das Modul enthält:

- Geburtstagsregistrierung per Command
- kleine automatische Geburtstagsgratulation bei Chataktivität
- optionaler Tagebuch-Systemeintrag
- manuelle Birthday-Show
- Party-Presets
- User-Party-Zuordnungen
- Uploads für Intro/Standard-Song/User-Songs
- Dauererkennung per Media-/ffprobe-Logik
- Sound-System-Bundle-Nutzung
- Queue-/Duplicate-Logik
- stale Queue Cleanup
- Twitch/Userinfo-Resolve mit Avatar
- Dashboard-Admin-Routen

### Dashboard

Birthday-Dashboard-Modul:

```text
htdocs/dashboard/modules/birthday.js
htdocs/dashboard/modules/birthday.css
```

Birthday-Dashboard ist im Community-Bereich integriert.  
Aktuelle Tabs/Struktur:

- Übersicht
- Show/Medien
- Partys
- Geburtstage
- Settings
- Texte

Die Party-Verwaltung wurde in STEP_BIRTHDAY_005F übersichtlicher getrennt:

- Show/Medien: Uploads, Laufzeiten, Queue, Sound-System-Status
- Partys: Party-Presets anlegen/bearbeiten, User → Party-Zuordnung
- Geburtstage: registrierte Geburtstage
- Settings: Modul-/Show-Einstellungen
- Texte: Textvarianten

### Overlay

Birthday-Overlay:

```text
htdocs/overlays/_overlay-birthday.html
```

Aktueller Overlay-Stand:

- Intro-Video läuft über Sound-System.
- Birthday-Overlay bleibt während Intro unsichtbar.
- Overlay blendet erst bei `phase=party` ein.
- Partyphase zeigt Avatar, DisplayName, Headline, Glückwunschtext, Herzen/Konfetti/Partikel.
- Sichtbarer Name ohne `@`.
- Glückwunschtext ohne `@`.
- Headline zeigt nur `Happy Birthday!`.
- Alter steht nur im Untertext, z. B. `Alles Gute zum 51. Geburtstag, ForrestCGN!`.
- `Party läuft` wurde entfernt.
- Der Chat-Fallback aus 006C wurde in 006E wieder deaktiviert/entfernt, damit Birthday-Commands sauber nur über die zentrale Command-Klasse laufen.

## Commands

### User-Registrierung

```text
!birthday set 22.05
!birthday set 22.05.1980
!birthday show
!birthday delete
!birthday today
```

`year` ist optional. Wenn Jahr gesetzt ist, wird Alter berechnet und in passenden Texten verwendet.

### Manuelle Show

```text
!birthday party @user
!birthday showtime @user
```

`@user` wird unterstützt und sauber normalisiert.

Beispiel:

```text
!birthday party @Araglor
```

Wird intern:

```text
login = araglor
displayName = Araglor, falls Twitch/Userinfo das so liefert
avatarUrl = Twitch-Profilbild, falls vorhanden
```

Test mit Forrest bestätigte:

```text
login = forrestcgn
displayName = ForrestCGN
avatarUrl = vorhanden
source = /userinfo?login=forrestcgn
```

Bei Araglor wurde `displayName=araglor` geliefert. Das ist vermutlich Quelle/Userdaten-bedingt und kein Resolver-Bug.

## Chat-/Command-Architektur

Nach 006E gilt wieder sauber:

```text
Twitch Chat
→ twitch_presence
→ commands.js
→ /api/birthday/command
→ birthday.js
→ helper_chat_output
```

Wichtig:

- Keine direkte Sonderausgabe.
- Keine doppelte Command-Ausgabe durch zusätzlichen Chat-Fallback.
- Passive Geburtstags-Auto-Gratulation bleibt getrennt über Chat-Aktivitätsprüfung.
- Commands funktionieren nur, wenn Heimleitung/Bot im Chat ist und Twitch Presence läuft.

Prüfen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/presence/status"
```

Starten:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/presence/start" -Method POST -ContentType "application/json" -Body '{}'
```

## Sound-System und Timing

Birthday nutzt das Sound-System als Medien-Master.

Ablauf:

```text
!birthday party @user
→ Birthday-Modul erstellt locked Birthday-Bundle
→ Sound-System bekommt:
   1. globales Intro-Video
   2. Song
→ Birthday-Overlay bleibt während Intro unsichtbar
→ bei Song-Phase phase=party
→ Birthday-Overlay blendet ein
→ bleibt bis Songende sichtbar
```

Wichtig:

- Intro-Video ist global und immer gleich.
- Song kommt aus:
  - User-/Party-Song, falls konfiguriert
  - sonst Standardsong
- Laufzeiten werden per ffprobe erkannt und explizit ans Sound-System übergeben.
- Overlay rät nicht, sondern verwendet Show-State/Phasen.

## Bestätigte Medien/Laufzeiten aus Tests

Intro:

```text
birthday/birthday_intro_video.mp4
Dauer: 00:29.4
durationMs: 29420
durationOk: true
durationSource: ffprobe
Sound-System: canPlay true
```

Standardsong:

```text
birthday/birthday_default_song.mp3
Dauer: 03:11.3
durationMs: 191320
durationOk: true
durationSource: ffprobe
Sound-System: canPlay true
```

Araglor User-Song:

```text
birthday/birthday_song_araglor_2.mp3
Dauer: 03:31.8
durationMs: 211800
durationOk: true
durationSource: ffprobe
Sound-System: canPlay true
Loudness: known true, status ok
```

Default-Show:

```text
Intro: 00:29.4
Default-Song: 03:11.3
Gesamt: 03:40.7
Party startet nach: 00:29.4
```

Araglor-Show:

```text
Intro: 00:29.4
Araglor-Song: 03:31.8
Gesamt: ca. 04:01.2
Party startet nach: 00:29.4
```

## Party-System

Seit STEP_BIRTHDAY_005 gibt es echte Party-Presets.

Initiale Styles/Partys:

```text
default_party
classic_party
cgn_neon
epic_party
heimaufsicht_fun
cute_soft
```

Fallback-Logik:

```text
Wenn User eine aktive Party-Zuordnung hat:
→ diese Party nutzen

Wenn User keine aktive Party-Zuordnung hat:
→ Standard-Party + Standardsong nutzen
```

Wichtig:

- Eine eigene Party wird nur genutzt, wenn sie angelegt/zugeordnet ist.
- Sonst läuft immer Standard-Song + Standard-Party.
- User-Songs können unabhängig von registrierten Geburtstagen existieren.

Araglor-Stand aus Tests:

```text
login=araglor
songFile=birthday/birthday_song_araglor_2.mp3
partyKey später epic_party / araglor_party möglich
source=file_backfill
```

## Queue-/Duplicate-Logik

Bestätigtes Verhalten:

```text
!birthday party araglor
→ startet direkt

!birthday party araglor nochmal
→ wird blockiert

!birthday party roxxy während Araglor läuft
→ wird in die Geburtstags-Warteschlange gelegt
```

Duplicate-Block funktioniert seit 005C sauber ohne `target_http_400`.

Stale Queue Cleanup seit 005E:

- Hängende `birthday_show_queue`-Einträge werden erkannt.
- Wenn Birthday-State idle ist und Sound-System keine Birthday-Arbeit mehr hat, werden alte queued/active Einträge bereinigt.
- Route:

```text
POST /api/birthday/show/queue/clear-stale
GET  /api/birthday/show/queue
```

Bestätigter Test:

```text
cleanup.cleaned = 1
queue = []
state.active = false
phase = idle
```

## Wichtige API-Routen

Status:

```text
GET /api/birthday/status
```

Command:

```text
POST /api/birthday/command
```

Heute:

```text
GET /api/birthday/today
```

Show State:

```text
GET /api/birthday/show/state
```

Queue:

```text
GET /api/birthday/show/queue
POST /api/birthday/show/queue/clear-stale
```

Assets/Medien:

```text
GET  /api/birthday/admin/show/assets
POST /api/birthday/admin/show/recheck
POST /api/birthday/admin/show/upload
```

Party-System:

```text
GET  /api/birthday/admin/show/parties
POST /api/birthday/admin/show/parties
POST /api/birthday/admin/show/profile
```

User Resolve:

```text
GET /api/birthday/admin/resolve-user?login=@forrestcgn
```

Users/Settings/Texts:

```text
GET  /api/birthday/admin/users
POST /api/birthday/admin/user
POST /api/birthday/admin/user/delete

GET  /api/birthday/admin/settings
POST /api/birthday/admin/settings

GET  /api/birthday/admin/texts
POST /api/birthday/admin/texts
```

## Wichtige DB-Strukturen

Bestehende/erweiterte Tabellen:

```text
birthday_users
birthday_greetings_log
birthday_settings
birthday_show_profiles
birthday_show_queue
birthday_parties
```

Wichtige Felder:

```text
birthday_show_profiles.login
birthday_show_profiles.display_name_override
birthday_show_profiles.avatar_url
birthday_show_profiles.last_resolved_at
birthday_show_profiles.song_file
birthday_show_profiles.song_duration_ms
birthday_show_profiles.party_key

birthday_show_queue.target_login
birthday_show_queue.target_display_name
birthday_show_queue.target_avatar_url
birthday_show_queue.party_key
birthday_show_queue.style_key
birthday_show_queue.song_file
birthday_show_queue.video_file
birthday_show_queue.status
```

## Upload-/Dateinamen-Regeln

Birthday-Medien liegen unter:

```text
D:\Streaming\stramAssets\htdocs\assets\sounds\birthday
```

Relative Pfade:

```text
birthday/birthday_intro_video.mp4
birthday/birthday_default_song.mp3
birthday/birthday_song_araglor_2.mp3
```

Regeln:

- Technischer Schlüssel ist immer `login`, z. B. `araglor`.
- Anzeige nutzt `displayName`, z. B. `Araglor`, wenn verfügbar.
- Dateinamen nutzen Login lowercase.
- Dashboard darf `@Araglor`, `Araglor` oder `araglor` akzeptieren.
- Speicherung normalisiert auf Login und speichert optional DisplayName/Avatar.

## Offene Punkte / Nächste sinnvolle Schritte

### 1. Overlay weiter finalisieren

Aktueller Stand ist deutlich besser, aber noch nicht final. Weiteres Feintuning empfohlen:

- in OBS ohne `?debug=1` testen
- Größen/Positionen feinjustieren
- mehrere Party-Styles noch stärker voneinander unterscheiden
- Animationen hochwertiger machen
- Szenenwechsel über 3 Minuten noch abwechslungsreicher
- später Party-Bilder pro Party vorbereiten

### 2. User-Anwesenheit prüfen

`resolve-user` liefert aktuell:

```text
presence.known = false
reason = presence_list_unavailable
```

Für echte Anwesenheitsprüfung braucht es später:

- `/api/twitch/presence/users`
- oder Birthday-interne `last_seen_in_chat` Tabelle über Chat-Hook

Aktuell nicht hart erzwingen.

### 3. Party-Bilder später

Geplant/gewünscht:

- Party-Presets später mit Bildern erweitern
- z. B. `birthday_party_images`
- Bilder während Partyphase rotieren/einblenden
- pro Party konfigurierbar

### 4. Dashboard weiter aufräumen

Nach 005F schon besser, aber weitere UX möglich:

- klare Karten für Party-Presets
- bessere User-Auswahl
- sichtbare Avatar-Vorschau
- Test-Buttons pro Party/User
- Anzeige: welcher Song/Style wird effektiv genutzt
- Default-Fallback klarer markieren

## Aktuelle wichtigste Regel

Keine Funktionalität entfernen.  
Birthday-Commands müssen über das zentrale Command-System laufen.  
Chat-Ausgaben über `helper_chat_output`.  
Texte über `helper_texts` / DB-Textvarianten.  
SQLite nur erweitern, niemals überschreiben.
