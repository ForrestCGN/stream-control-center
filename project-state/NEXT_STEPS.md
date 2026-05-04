# NEXT STEPS - stream-control-center

Stand: 2026-05-04

## Wichtigster Grundsatz

Vor jedem neuen STEP:

1. `tools\easy\03_NUR_STATUS_PRUEFEN.cmd` oder `git status --short` pruefen.
2. docs/current/CURRENT_SYSTEM_STATUS.md lesen.
3. project-state/CURRENT_STATUS.md lesen.
4. Reale Dateien pruefen, keine Annahmen.
5. Wenn GitHub/Toolausgaben grosse Dateien kuerzen, echte Datei von Forrest anfordern und diese als Basis nutzen.
6. Kleine Aenderung planen.
7. Nach Aenderung testen, dokumentieren, committen, pushen und Live ueber `tools\easy\01_LIVE_AKTUALISIEREN_VON_GITHUB.cmd` aktualisieren.

## Naechste VIP-Arbeitspakete vor Dashboard

### STEP032 - Soundpfad und Dateiregel aus DB-Settings nutzen

Ziel:

- `soundBaseDir`, `fileNameMode` und `fileExtension` aus `vip_sound_settings` lesen.
- Bestehendes Verhalten bleibt Default:
  - `D:\Streaming\stramAssets\htdocs\assets\sounds\vip\`
  - `Anzeigename.mp3`
- Fallback-Reihenfolge: SQLite > Config > ENV/Default.
- Keine Funktionalitaet entfernen.

### STEP033 - Daily-Usage Retention vorbereiten

Ziel:

- `dailyUsageRetentionDays` und `cleanupDailyUsageOnStartup` aus DB-Settings nutzen.
- Noch vorsichtig: keine harte Auto-Loeschung ohne klaren Schalter.
- Spaeter Dashboard-editierbar.

### STEP034 - Rollen-Fallbacks in DB ueberfuehren

Ziel:

- `config/vip_sound_roles.json` bleibt Import-/Fallback-Datei.
- Neue DB-Tabelle fuer Rollen-Overrides vorbereiten.
- Dashboard kann spaeter Rollen sortieren/suchen/aktivieren/deaktivieren.

### STEP035 - VIP-Text-API fuer SQLite-Texte

Ziel:

- Texte aus `vip_sound_message_templates` per API lesen/bearbeiten.
- Aktiv/Inaktiv und Gewichtung vorbereiten.
- Erst danach Dashboard.

---

## Empfohlene naechste Arbeitspakete

### Naechster VIP-Schritt: VIP-Text-API fuer SQLite-Texte

Ziel:

- `vip_sound_message_templates` per API lesen/bearbeiten.
- Texte aktivieren/deaktivieren.
- Gewichtung anpassen.
- Normale `accepted_mod`-Texte von Override-/Sonderfreigabe-Texten sauber trennen.
- Dashboard soll spaeter diese API nutzen, nicht direkt SQLite anfassen.

---

### 1. STEP032 testen

Ziel:

- `vip_sound_overlay.js` Version `1.7.8` deployen.
- Pruefen, dass `soundBaseDir`, `fileNameMode`, `fileExtension` und `enabled` aus `vip_sound_settings` genutzt werden.
- `!vip @araglor` muss weiterhin Mod-Sound abspielen.

Checks:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/status" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/settings" | ConvertTo-Json -Depth 20
Invoke-RestMethod -Method Post "http://127.0.0.1:8080/api/vip-sound/daily-usage/reset-today" | ConvertTo-Json -Depth 20
```

Danach Twitch-Chat:

```text
!vip @araglor
```

---

### 2. VIP-Settings Schreib-API bauen

Ziel:

- `GET /api/vip-sound/settings` existiert bereits.
- Als naechstes `POST /api/vip-sound/settings` oder gezielte Update-Route bauen.
- Settings sollen spaeter dashboardfaehig sein, aber Dashboard erst nach stabiler API.

Wichtig:

- Keine direkte Dashboard-SQL-Bearbeitung.
- Validierung fuer Pfade, Dateiregeln und Boolean/Number-Werte.
- Aenderungen spaeter auditierbar machen.

---

### 1. VIP-Daily-Usage Retention spaeter konfigurierbar machen

Ziel:

- Alte Daily-Usage-Eintraege spaeter automatisch bereinigen koennen.
- Einstellung nicht hart codieren, sondern ueber Config/Dashboard steuerbar machen.

Geplante Optionen:

- `dailyUsageRetentionDays`
- `cleanupDailyUsageOnStartup`

Wichtig:

- Aktuell keine automatische Loeschlogik erzwingen.
- Dashboard soll diese Einstellung spaeter bearbeiten koennen.
- SQLite weiterhin niemals ersetzen.

---

### 1. STEP026 deployen und testen

Workflow:

- Repo-Dateien nach `D:\Git\stream-control-center` entpacken.
- Syntax pruefen.
- Commit/Push nach `dev`.
- Live-Aktualisierung ueber `D:\Git\stream-control-center\tools\easy\01_LIVE_AKTUALISIEREN_VON_GITHUB.cmd`.
- Backend neu starten.
- Live-Test ausfuehren.

### 1.1 STEP026 Funktionstest

Ziel:

- Neue Datei `backend/modules/helpers/helper_twitch_roles.js` deployen.
- `backend/modules/vip_sound_overlay.js` Version `1.7.4` deployen.
- Backend neu starten.
- `!vip @araglor` testen.

Erwartung:

- `sound_system.current.category = crew`
- `sound_system.current.visual.type = mod`
- `sound_system.current.visual.title = Mod-Sound`

Wichtig:

- Token-Datei nicht anzeigen/committen.
- Falls Twitch-Abfrage `null` liefert, greift weiterhin `config/vip_sound_roles.json`.

---

### 2. Debug-Option in OBS entfernen

Ziel:

- Falls die VIP-Browserquelle noch mit `?debug=1` laeuft, Debug-Parameter wieder entfernen.
- Ziel-URL fuer normalen Betrieb:
  - `/overlays/vip_sound_overlay_v2.html`

Wichtig:

- Keine Backend-Aenderung noetig.
- Debug nicht dauerhaft im Stream aktiv lassen.

---

### 3. Alte VIP-Action in Streamer.bot sichern/deaktiviert lassen

Ziel:

- Alte direkte Legacy-VIP-Overlay-Action nicht mehr am `!vip`-Command betreiben.
- Alte Action vorerst deaktiviert lassen oder spaeter nach Backup entfernen.
- Neuer `!vip`-Ablauf bleibt:
  - Fetch URL -> `/api/vip-sound/command`

Wichtig:

- Nicht einfach loeschen, falls noch alte Referenzen geprueft werden muessen.
- Keine doppelte Ausloesung von `/api/vip-sound/enqueue`.

---

### 4. Optional: echten Mod-Account testen

Ziel:

- Ein echter Mod testet einmal den VIP-Override-Command mit Target.
- Erwartung: Streamer.bot liefert ebenfalls `isModerator=True`.

Wichtig:

- Nur notwendig, wenn wir absolut sicher sein wollen.
- Kein Code-Fix erwartet.

---

### 5. VIP-Soundpfad konfigurierbar machen

Ziel:

- Aktueller Fallback bleibt: `D:\Streaming\stramAssets\htdocs\assets\sounds\vip\`.
- Ziel: Pfad/Dateiregel ueber DB/Config und spaeter Dashboard bearbeitbar.
- Keine hart codierten Pfade als Endloesung.

Wichtig:

- Bestehende ENV-Fallbacks nicht entfernen.
- Dashboard erst nach stabiler Backend-API.

---

### 6. VIP-Dashboard spaeter bauen

Ziel:

- VIP-Status anzeigen.
- Heimaufsicht-Texte pro Event-Key bearbeiten.
- Texte aktivieren/deaktivieren.
- Gewichtung einstellen.
- VIP-Soundpfad und Dateiregel konfigurieren.
- Testausloesung ermoeglichen.
- VIP-Events/Statistiken anzeigen.

Wichtig:

- Erst nach stabiler Backend-API.
- Dashboard soll API nutzen, nicht direkt Dateien/SQL anfassen.

---

### 7. Dashboard-Modulstandard definieren

Ziel:

- Einheitlicher Aufbau fuer Dashboard-Module.
- Klare Struktur fuer init/load/render/bindActions.
- Einheitliches API-Verhalten.
- Einheitliche Loading/Error/Empty-States.
- Einheitliche Config-Strategie.

Betroffene Bereiche:

- htdocs/dashboard/app.js
- htdocs/dashboard/modules/*.js
- docs/dashboard/
- docs/current/CURRENT_SYSTEM_STATUS.md

Wichtig:

- Erst dokumentieren, dann ein kleines Referenzmodul anpassen.
- Keine Funktionen entfernen.

---

### 8. Fireworks spaeter neu aufbauen

Aktueller Zustand:

- Fireworks-Routen sind doppelt registriert.
- Dokumentiert in STEP008.
- Kein kurzfristiger Umbau.

Spaeterer Zielzustand:

- Fireworks vollstaendig in eigenes Modul.
- server.js von Fireworks-Spezialrouten befreien.
- Einheitliches /api/fireworks/* System.
- WebSocket-Broadcast zentralisieren.

---

### 9. Hug-Textbearbeitung spaeter sauber neu planen

Aktueller Zustand:

- Hug-System laeuft.
- Dashboard-Hug ist funktionierender Live-Stand.

Spaeterer Zielzustand:

- Rechte-/Rollenpruefung.
- Audit-Logging.
- Nutzung vorhandener Helper.
- Kein Parallelmodul.

---

### 10. Alerts-Modul spaeter behutsam splitten

Aktueller Zustand:

- alerts.js ist gross und funktionsreich.
- Nicht blind umbauen.

Spaeterer Zielzustand:

- alerts.api.js
- alerts.rules.js
- alerts.assets.js
- alerts.texts.js
- alerts.presets.js
- alerts.history.js

Wichtig:

- Nur schrittweise.
- Erst Tests und Doku.


---

### 10. VIP-Textbestand in SQLite pruefen

Ziel:

- Nach STEP027 sicherstellen, dass Live-SQLite keine sichtbaren `Heimleitung`-Texte mehr enthaelt.
- Gewuenschter sichtbarer Begriff: `Heimaufsicht`.

Check:

```powershell
Set-Location "D:\Streaming\stramAssets"

@'
const { DatabaseSync } = require("node:sqlite");
const db = new DatabaseSync("D:/Streaming/stramAssets/data/sqlite/app.sqlite");
try {
  console.log(db.prepare(`
    SELECT id, event_key, style, message_text
    FROM vip_sound_message_templates
    WHERE message_text LIKE '%Heimleitung%'
    ORDER BY id ASC
  `).all());
} finally {
  db.close();
}
'@ | Set-Content ".\check_vip_heimleitung_texts.js" -Encoding UTF8

node ".\check_vip_heimleitung_texts.js"
Remove-Item ".\check_vip_heimleitung_texts.js"
```

Wichtig:

- Die interne Style-ID `heimleitung` nicht blind umbenennen, solange bestehende Queries diese ID nutzen.
- Erst Dashboard-/Textverwaltung bauen, wenn die Backend-API stabil ist.

---

### VIP Rollen-Config-Pfad nach STEP034.1 pruefen

Ziel:

- Nach Deploy von STEP034.1 sicherstellen, dass `/api/vip-sound/roles` den korrekten Config-Fallback-Pfad zeigt.

Check:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/roles" | ConvertTo-Json -Depth 20
```

Erwartung:

- `configFallback.path = D:\Streaming\stramAssets\config\vip_sound_roles.json`
- `configFallback.exists = true`, sofern Datei vorhanden ist.

---

### Naechster VIP-Schritt: Text-API vorbereiten

Ziel:

- `vip_sound_message_templates` per API les-/bearbeitbar machen.
- Grundlage fuer spaeteres VIP-Dashboard schaffen.
- Accepted-/Override-Texte sauber trennen, damit normale Mod-Sounds nicht mit Sonderfreigabe-Texten antworten.
