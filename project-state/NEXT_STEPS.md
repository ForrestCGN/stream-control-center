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

## Empfohlene naechste Arbeitspakete

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
- Heimleitungs-Texte pro Event-Key bearbeiten.
- Texte aktivieren/deaktivieren.
- Gewichtung einstellen.
- VIP-Soundpfad und Dateiregel konfigurieren.
- Testausloesung ermoeglichen.

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
