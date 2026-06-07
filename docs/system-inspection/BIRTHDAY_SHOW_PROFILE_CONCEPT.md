# Birthday Show/Profile Concept

Stand: STEP_BIRTHDAY_SHOW_PROFILE_CONCEPT  
Datum: 2026-06-07  
Projekt: ForrestCGN / stream-control-center  
Bereich: Geburtstagsplugin / Birthday-Modul

## 1. Ziel dieses Steps

Dieser Step ist ein reiner Konzept- und Planungsstand. Es wird kein Backend-Code, kein Dashboard-Code, kein Overlay-Code und keine Datenbank geändert.

Ziel ist, das Birthday-Modul als echtes Show-System zu definieren:

1. Standard-Shows müssen anlegbar, bearbeitbar und abspielbar sein.
2. User-Shows müssen pro Twitch-User anlegbar, bearbeitbar und abspielbar sein.
3. Die große Birthday-Show darf nur manuell oder gezielt gestartet werden.
4. Die kleine automatische Geburtstagsgratulation bleibt getrennt von der großen Show.
5. Dashboard, Backend, Overlay, Sound-System, Media-System und Queue müssen sauber zusammenspielen.

## 2. Aktueller geprüfter Stand aus Dateien/Doku

Geprüfte Dateien/Quellen:

- `backend/modules/birthday.js`
- `dashboard/modules/birthday.js`
- `dashboard/modules/birthday.css`
- `overlays/_overlay-birthday.html`
- `docs/modules/birthday.md` aus Upload
- `docs/modules/birthday-deep-dive.md` aus Upload

Wichtiger aktueller Modulstand:

- Backend-Datei: `backend/modules/birthday.js`
- Modulname: `birthday`
- Modulversion im Upload/Live-Test: `0.6.1`
- Build: `diagnostics-standard`
- Schema-Version: `7`
- API-Prefix: `/api/birthday`

Bereits vorhandene Kernbereiche laut Code/Doku:

- Geburtstagsregistrierung
- automatische Chat-Gratulation
- optionaler Tagebuch-Eintrag
- manuelle Birthday-Show
- Show-Profile
- Party-Presets
- Show-Queue
- Upload-/Import-Unterstützung für Birthday-Medien
- Dashboard-Adminbereiche für User, Settings und Texte

Bereits vorhandene Tabellen:

- `birthday_users`
- `birthday_greetings_log`
- `birthday_show_events`
- `birthday_show_profiles`
- `birthday_parties`
- `birthday_show_queue`
- `command_definitions`
- `media_assets`
- `sound_loudness_files`

## 3. Begriffe und klare Trennung

### 3.1 Geburtstag

Ein Geburtstag ist die Datengrundlage eines Users:

- Twitch-Login
- DisplayName
- Tag
- Monat
- Jahr optional
- Sichtbarkeit/Optionen
- gespeicherter Avatar optional

Der Geburtstag entscheidet, ob die kleine automatische Gratulation ausgelöst werden darf.

### 3.2 Kleine automatische Gratulation

Automatisch bei Chat-Aktivität, wenn der User Geburtstag hat.

Soll:

- einmal pro Tag pro User gratulieren
- optional einen Tagebuch-Eintrag schreiben
- keine große Show starten
- keinen Song starten
- keine Party-Queue starten
- keinen Overlay-Zwang haben

### 3.3 Party / Standard-Show

Eine Party ist ein globales Show-Preset. Sie liegt fachlich in `birthday_parties`.

Sie beschreibt:

- Show-Key / Party-Key
- Titel
- Aktiv/Inaktiv
- Standard ja/nein
- Style
- Standard-Song
- Lautstärke
- Dauer
- Headline/Subline-Templates
- Effekte
- Szenen
- Notizen

Eine Standard-Show ist eine Party mit `isDefault = true` oder eine gezielt gewählte Party ohne User-Spezialprofil.

### 3.4 User-Show-Profil

Ein User-Show-Profil liegt fachlich in `birthday_show_profiles`.

Es beschreibt individuelle Einstellungen für einen bestimmten User:

- Twitch-Login
- DisplayName-Override
- Avatar-URL oder eigener Avatar später
- Aktiv/Inaktiv
- zugewiesener Party-Key
- eigener Song
- eigene Song-Dauer
- eigene Song-Lautstärke
- Quelle
- letzte User-Auflösung
- erstellt/geändert

Langfristig kann das Profil weitere Felder bekommen, wenn sie nicht sinnvoll in Party-Presets liegen.

### 3.5 Show-Queue

Die Show-Queue beschreibt konkrete laufende/geplante Show-Ausführungen:

- Request-ID
- Ziel-Login
- Ziel-DisplayName
- Ziel-Avatar
- Party-Key
- Party-Titel
- Style-Key
- Song-Datei
- Video-Datei
- Status
- Position
- gestartet von
- Zeitpunkte
- Fehler

Die Queue ist Laufzeit-/Historienzustand, nicht Konfiguration.

## 4. Zielverhalten

### 4.1 Standard-Show abspielen

Eine Standard-Show muss ohne registrierten Geburtstag und ohne Twitch-User funktionieren.

Beispiel:

```text
Dashboard -> Standard-Show abspielen
API       -> POST /api/birthday/show/start { mode: "standard", partyKey: "default_party" }
```

Erwartung:

- keine Twitch-Auflösung nötig
- kein registrierter Geburtstag nötig
- generischer DisplayName möglich, z. B. `Geburtstagskind`
- Default-Avatar/Fallback möglich
- Standard-Party wird verwendet
- Sound-Bundle wird sauber gebaut
- Overlay-State wird sauber gesetzt
- Queue/Events werden nachvollziehbar aktualisiert

### 4.2 User-Show abspielen

Eine User-Show muss gezielt für einen User funktionieren.

Beispiel:

```text
!birthday show @Tadesso
Dashboard -> User suchen -> Show abspielen
API       -> POST /api/birthday/show/start { mode: "user", targetLogin: "tadesso" }
```

Erwartung:

- User wird über Twitch/Userinfo/gespeicherte Daten/Profile aufgelöst
- DisplayName und Avatar werden verwendet
- falls User ein eigenes aktives Show-Profil hat, wird dieses verwendet
- falls kein Profil vorhanden ist, wird die Standard-Show/Fallback-Party verwendet
- Show startet direkt oder wird sauber eingereiht
- Duplicate-/Queue-Schutz bleibt aktiv

### 4.3 User-Show anlegen/bearbeiten

Im Dashboard soll pro User eine Show erstellt und bearbeitet werden können.

Mindestfelder:

- User/Login
- DisplayName-Override
- Avatar-Override später optional
- Show aktiv/inaktiv
- Party-Preset
- eigener Song optional
- Song-Dauer automatisch oder manuell
- Song-Lautstärke
- Notiz/Quelle

Spätere optionale Felder:

- eigenes Intro
- eigenes Video
- eigene Headline/Subline
- eigene Effekte
- eigene Szenen
- Fallback-Strategie
- Tags/Kategorie

### 4.4 Standard-Shows anlegen/bearbeiten

Im Dashboard sollen globale Party-/Standard-Shows erstellt und bearbeitet werden können.

Mindestfelder:

- Party-Key
- Titel
- Aktiv/Inaktiv
- Als Standard markieren
- Style-Key
- Song-Datei
- Song-Dauer
- Song-Lautstärke
- Headline-Template
- Subline-Template
- Effekte
- Szenen
- Notizen

Regel:

- Es darf nur eine aktive Default-Party geben.
- Wenn eine Party als Default gesetzt wird, müssen andere Default-Markierungen entfernt werden.
- Eine deaktivierte Party darf nicht als Standard genutzt werden.

## 5. Dashboard-Zielstruktur

Das Dashboard sollte nicht alles in eine flache Maske werfen.

Empfohlene Bereiche:

```text
Geburtstage
├─ Übersicht
│  ├─ Modulstatus
│  ├─ heutige Geburtstage
│  ├─ aktive Show
│  └─ Show-Queue
│
├─ User-Shows
│  ├─ User suchen/auflösen
│  ├─ Profil laden
│  ├─ Profil anlegen/bearbeiten
│  ├─ Party zuweisen
│  ├─ eigenen Song wählen/importieren
│  ├─ speichern
│  └─ Show abspielen mit Bestätigung
│
├─ Standard-Shows
│  ├─ Partys anzeigen
│  ├─ Party anlegen/bearbeiten
│  ├─ Default setzen
│  ├─ Medien wählen
│  └─ Standard-Show abspielen mit Bestätigung
│
├─ Medien
│  ├─ Assets anzeigen
│  ├─ Import aus Media-System
│  ├─ Upload
│  ├─ Dauer/Lautheit prüfen
│  └─ fehlende Dateien markieren
│
├─ Texte
│  ├─ Chat-Texte
│  ├─ Overlay-Texte
│  ├─ Tagebuch-Texte
│  └─ Varianten
│
└─ Einstellungen
   ├─ Auto-Gratulation
   ├─ Tagebuch aktiv
   ├─ Show-Queue aktiv
   ├─ Fallbacks
   └─ Rechte/Sicherheit
```

## 6. Backend-API-Zielstruktur

### 6.1 Vorhandene Routen beibehalten

Bestehende Routen bleiben rückwärtskompatibel erhalten.

Wichtige vorhandene Routen:

```text
GET  /api/birthday/status
GET  /api/birthday/today
GET  /api/birthday/show/state
GET  /api/birthday/show/queue
POST /api/birthday/show/queue/clear-stale
POST /api/birthday/show/stop
GET  /api/birthday/admin/show/assets
GET  /api/birthday/admin/show/parties
POST /api/birthday/admin/show/parties
POST /api/birthday/admin/show/profile
GET  /api/birthday/admin/users
POST /api/birthday/admin/user
GET  /api/birthday/admin/settings
POST /api/birthday/admin/settings
GET  /api/birthday/admin/texts
POST /api/birthday/admin/texts
POST /api/birthday/command
POST /api/birthday/reload
```

### 6.2 Neuer empfohlener Show-Start-Endpunkt

Für Dashboard und saubere interne Nutzung sollte ein eigener Start-Endpunkt geplant werden:

```text
POST /api/birthday/show/start
```

Beispiel Standard-Show:

```json
{
  "mode": "standard",
  "partyKey": "default_party",
  "startedBy": "dashboard"
}
```

Beispiel User-Show:

```json
{
  "mode": "user",
  "targetLogin": "tadesso",
  "partyKey": "default_party",
  "startedBy": "dashboard"
}
```

Antwort-Ziel:

```json
{
  "ok": true,
  "module": "birthday",
  "mode": "user",
  "requestId": "birthday_...",
  "queued": false,
  "targetLogin": "tadesso",
  "targetDisplayName": "Tadesso",
  "partyKey": "default_party",
  "state": {}
}
```

### 6.3 Neuer empfohlener Profile-GET-Endpunkt

Aktuell gibt es `POST /api/birthday/admin/show/profile`. Für den Dashboard-Builder wäre ein gezielter GET-Endpunkt sinnvoll:

```text
GET /api/birthday/admin/show/profile?login=tadesso
```

Zweck:

- ein einzelnes User-Profil laden
- gespeicherte Geburtstagsdaten, Profil und Fallbacks zusammenführen
- Dashboard muss nicht aus Gesamtlisten selbst raten

### 6.4 Validierungs-/Preview-Endpunkt später optional

Optional später:

```text
POST /api/birthday/show/preview
```

Zweck:

- Show-Kontext berechnen
- Asset-Verfügbarkeit prüfen
- keine produktive Show starten
- kein Sound abspielen
- Overlay nicht auslösen

## 7. Sicherheits-/Rechte-Regeln

Produktive Dashboard-Aktionen brauchen mindestens:

- Owner/Admin-Rechte
- sichtbare Bestätigung
- Audit-Log
- klare Anzeige, ob echter produktiver Start oder Preview
- Duplicate-/Queue-Schutz
- keine automatischen Replay-/Retry-Aktionen

Produktive Aktionen:

- Show starten
- Show stoppen
- Queue bereinigen
- Standard-Show ändern
- User-Show speichern
- Medien importieren/hochladen
- Texte speichern
- Settings speichern

Read-only-Aktionen:

- Status anzeigen
- Queue anzeigen
- Assets anzeigen
- Partys anzeigen
- Profile anzeigen
- Settings anzeigen
- Texte anzeigen

## 8. Datenmodell: Mindestfelder und Erweiterungen

### 8.1 `birthday_parties` aktuell passend

Vorhandene aktuelle Kernfelder reichen als Basis:

- `party_key`
- `title`
- `enabled`
- `is_default`
- `song_file`
- `song_duration_ms`
- `song_volume`
- `style_key`
- `headline_template`
- `subline_template`
- `effects_json`
- `scenes_json`
- `notes`
- `created_at`
- `updated_at`

Bewertung:

- Für globale Standard-Shows brauchbar.
- Eigene Intro-/Video-Felder fehlen als explizite Spalten, können aktuell teils aus Asset-/Config-Logik kommen.
- Für nächste Steps nicht sofort DB erweitern, erst vorhandene Felder sauber nutzen.

### 8.2 `birthday_show_profiles` aktuell brauchbar, aber begrenzt

Vorhandene aktuelle Kernfelder:

- `user_login`
- `display_name_override`
- `avatar_url`
- `last_resolved_at`
- `song_file`
- `song_duration_ms`
- `song_volume`
- `party_key`
- `active`
- `source`
- `created_at`
- `updated_at`

Bewertung:

- Für erste User-Shows ausreichend.
- Für „alles mögliche einstellen“ langfristig zu klein.
- Nächster sinnvoller Ausbau sollte aber erst nach sauberem Dashboard-/API-Konzept erfolgen.

Mögliche spätere Erweiterungsfelder:

- `headline_template`
- `subline_template`
- `intro_file`
- `video_file`
- `effects_json`
- `scenes_json`
- `notes`
- `fallback_mode`

Diese Erweiterungen nur per geprüfter Migration und nur wenn wirklich nötig.

## 9. Fallback-Regeln

Beim Start einer User-Show:

1. User-Profil aktiv und vorhanden?
2. Profil-Party-Key gesetzt und Party aktiv?
3. Profil-Song gesetzt und Datei vorhanden?
4. Sonst Party-Song verwenden.
5. Sonst globale Default-Song/Config verwenden.
6. Falls kein Song vorhanden: Show darf entweder ohne Song starten oder sauber blockieren, abhängig von Setting.

Beim Start einer Standard-Show:

1. Angegebene Party vorhanden und aktiv?
2. Sonst aktive Default-Party verwenden.
3. Sonst `default_party` verwenden.
4. Sonst sauberer Fehler `birthday_party_unavailable`.

Avatar-Fallback:

1. Twitch/Userinfo Avatar
2. gespeicherter Birthday-User Avatar
3. Show-Profil Avatar
4. generisches CGN/Birthday-Fallback-Bild

Text-Fallback:

1. User-Profil-Template später optional
2. Party-Template
3. globale Birthday-Texte
4. hartes technisches Fallback nur als letzte Sicherheit

## 10. Umsetzungsschritte nach diesem Konzept

### STEP 1: Read-only Ist-Zustand prüfen

Keine Dateiänderung.

Tests am Live-System:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/birthday/admin/show/assets" | ConvertTo-Json -Depth 8
Invoke-RestMethod "http://127.0.0.1:8080/api/birthday/admin/show/parties" | ConvertTo-Json -Depth 8
Invoke-RestMethod "http://127.0.0.1:8080/api/birthday/admin/users" | ConvertTo-Json -Depth 8
Invoke-RestMethod "http://127.0.0.1:8080/api/birthday/show/state" | ConvertTo-Json -Depth 8
Invoke-RestMethod "http://127.0.0.1:8080/api/birthday/show/queue" | ConvertTo-Json -Depth 8
```

### STEP 2: Command-Fix

Datei:

```text
backend/modules/birthday.js
```

Ziel:

```text
!birthday show
-> eigenen Geburtstag anzeigen

!birthday show @user
-> manuelle User-Show starten

!birthday party @user
-> manuelle User-Show starten

!birthday showtime @user
-> manuelle User-Show starten
```

Modulversion dann vermutlich `0.6.1 -> 0.6.2`.

### STEP 3: Backend Show-Start-Endpunkt

Datei:

```text
backend/modules/birthday.js
```

Neu:

```text
POST /api/birthday/show/start
```

Ziel:

- `mode=standard`
- `mode=user`
- `partyKey` optional
- `targetLogin` bei User-Mode Pflicht
- Audit-/Security-Kontext vorbereiten
- keine Dashboard-UI in diesem Step

### STEP 4: Standard-Show sauber unterstützen

Datei:

```text
backend/modules/birthday.js
```

Ziel:

- `startBirthdayShow` oder Wrapper unterstützt Standard-Shows ohne echten User.
- Show-State und Sound-Bundle werden trotzdem sauber erzeugt.
- Queue- und Duplicate-Logik bleibt stabil.

### STEP 5: User-Profile gezielt laden/speichern

Datei:

```text
backend/modules/birthday.js
```

Mögliche Ergänzung:

```text
GET /api/birthday/admin/show/profile?login=...
```

Bestehendes Speichern über `POST /api/birthday/admin/show/profile` prüfen und ggf. erweitern.

### STEP 6: Dashboard-Builder

Dateien:

```text
dashboard/modules/birthday.js
dashboard/modules/birthday.css
```

Ziel:

- User suchen
- Profil laden
- Profil bearbeiten
- Standard-/Party-Show bearbeiten
- Medien wählen
- Speichern
- Show starten mit Bestätigung
- Queue/State anzeigen

### STEP 7: Overlay prüfen/anpassen

Datei:

```text
overlays/_overlay-birthday.html
```

Ziel:

- Standard-Show ohne Zieluser anzeigen
- User-Show mit Avatar/Name anzeigen
- Style/Effekte/Szenen aus State verwenden
- Ende sauber erkennen

## 11. Tests pro späterem Code-Step

Standardtests nach Backend-Änderung:

```powershell
node -c backend\modules\birthday.js

$s = Invoke-RestMethod "http://127.0.0.1:8080/api/birthday/status"
$s | Select-Object ok,module,moduleVersion,moduleBuild,version,initialized,schemaOk,routeCount

$r = Invoke-RestMethod "http://127.0.0.1:8080/api/diagnostics/registry"
$r.coverage | Select-Object ok,registryEntries,loadedModules,coveredLoadedModules,missingLoadedModules,registryOnlyEntries
$r.coverage.missingLoadedModuleRows
$r.coverage.registryOnlyRows
```

Read-only Showtests:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/birthday/admin/show/assets" | ConvertTo-Json -Depth 8
Invoke-RestMethod "http://127.0.0.1:8080/api/birthday/admin/show/parties" | ConvertTo-Json -Depth 8
Invoke-RestMethod "http://127.0.0.1:8080/api/birthday/show/state" | ConvertTo-Json -Depth 8
Invoke-RestMethod "http://127.0.0.1:8080/api/birthday/show/queue" | ConvertTo-Json -Depth 8
```

Produktive Tests erst bewusst nach Freigabe:

```powershell
# Beispiel spaeter, nicht fuer Konzept-Step ausfuehren
Invoke-RestMethod "http://127.0.0.1:8080/api/birthday/show/start" -Method POST -ContentType "application/json" -Body '{"mode":"standard","partyKey":"default_party"}'
```

## 12. Nicht-Ziele dieses Steps

Nicht geändert:

- kein Backend-Code
- kein Dashboard-Code
- kein Overlay-Code
- keine Datenbank
- keine Registry
- keine Modulversion
- kein Sound-System
- kein Media-System
- keine produktive Show
- keine Queue-Aktion
- keine Userdaten
- keine automatische Gratulation

Nicht geplant für den ersten Code-Step:

- kompletter Dashboard-Neubau
- DB-Neudesign
- Sound-System-Umbau
- Media-System-Umbau
- Löschen alter Diagnose-Dateien
- automatische Recovery
- automatische Show-Auslösung

## 13. Empfohlene nächste Entscheidung

Nächster sinnvoller Schritt nach diesem Konzept:

```text
STEP_BIRTHDAY_READONLY_SHOW_STATE_AUDIT
```

Ziel:

- Live-Ist-Zustand von Assets, Partys, Profilen, State und Queue erfassen.
- Prüfen, ob Standard-Party/Song/Assets existieren.
- Prüfen, ob aktuelle Dashboard-Daten zu den Backend-Routen passen.
- Noch keine Codeänderung.

Danach erst:

```text
STEP_BIRTHDAY_COMMAND_SHOW_TARGET_FIX
```

oder, falls der Show-Ist-Zustand gravierende Asset-/Party-Probleme zeigt:

```text
STEP_BIRTHDAY_DEFAULT_SHOW_DATA_FIX
```
