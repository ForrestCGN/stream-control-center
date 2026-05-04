# CURRENT SYSTEM STATUS

Stand: 2026-05-04

## Zweck

Diese Datei ist der aktuelle Einstiegspunkt fuer den Projektstand.

Historische Analyse-Snapshots liegen unter:

- docs/system-inspection/2026-05-03/
- docs/backend/
- docs/dashboard/
- docs/overlays/
- docs/database/

## Aktueller Arbeitsstand

Branch:

- dev

Repo:

- D:\Git\stream-control-center

Live:

- D:\Streaming\stramAssets

GitHub:

- https://github.com/ForrestCGN/stream-control-center

## Zuletzt abgeschlossen

- STEP040 VIP Backend Reference / Dashboard Ready Status
- STEP041 TTS / Alert / Sound-System Analyseplan
- STEP042 Alert-TTS Vorbereitung und Timing-Support
- STEP043 TTS generated files unter `htdocs/assets/sounds/tts/generated/`
- STEP044 Chat-TTS ueber Sound-System vorbereitet
- STEP044.4 TTS-Overlay nach VIP-Prinzip ueber Sound-System Visual State
- STEP044.5 bis STEP044.8 TTS-Overlay Layout/Avatar/adaptive Breite finalisiert
- STEP045 TTS Queue Sync mit Sound-System vorbereitet
- STEP046 Alert-Hauptsound frueh ins Sound-System eingereiht, damit Prioritaet korrekt greift
- STEP047 VIP Dashboard Base

## Aktueller sauberer Zustand

- GitHub/dev wurde fuer STEP047 aktualisiert.
- Aktuelles VIP-Modul: `backend/modules/vip_sound_overlay.js`
- VIP-Modul-Version live/API: `1.8.5`
- VIP-DB-Schema-Version: `4`
- Aktives VIP-Overlay: `htdocs/overlays/vip_sound_overlay_v2.html`
- Neues Dashboard-Modul: `htdocs/dashboard/modules/vip.js`
- Neues Dashboard-CSS: `htdocs/dashboard/modules/vip.css`
- VIP ist in der Dashboard-Community-Sektion registriert.
- VIP nutzt DB-Settings ueber `vip_sound_settings`.
- VIP nutzt DB-Texte ueber `vip_sound_message_templates`.
- VIP nutzt DB-Rollen-Fallbacks ueber `vip_sound_role_overrides`.
- VIP Events/Stats laufen ueber `vip_sound_events`.
- VIP Daily-Usage laeuft ueber `vip_sound_daily_usage`.
- Soundausgabe laeuft ueber `sound_system`.
- Chat-Ausgabe laeuft zentral ueber `helper_chat_output` / Heimaufsicht-Bot.

Live/API geprueft fuer STEP047:

- `node -c htdocs/dashboard/modules/vip.js`
- `GET /api/vip-sound/admin/summary`
- `GET /api/vip-sound/settings`
- `GET /api/vip-sound/texts?limit=5`

## VIP-System aktueller Stand

Dokumentation:

- `project-state/STEP040_VIP_BACKEND_REFERENCE_DASHBOARD_READY_2026-05-04.md`
- `project-state/STEP047_VIP_DASHBOARD_BASE_2026-05-04.md`

Aktueller Ablauf fuer `!vip`:

1. Twitch-Chat-Command `!vip @user` startet in Streamer.bot eine Fetch-URL-Action.
2. Streamer.bot ruft `/api/vip-sound/command` auf.
3. Streamer.bot sendet keinen Chattext und startet kein Overlay direkt.
4. VIP-Backend loest Actor-/Target-Daten auf.
5. Optionaler Zieluser wird erkannt.
6. Wenn ein Zieluser angegeben wurde und Actor nicht identisch mit Zieluser ist, gilt der Request als Override-Versuch.
7. Override wird nur erlaubt, wenn die Actor-Rolle in `VIP_OVERRIDE_ALLOWED_ROLES` enthalten ist.
8. Ohne Override wird Daily-Usage pro User/pro Stream-Tag geprueft.
9. Wenn User bereits genutzt hat:
   - kein Sound-System-Request
   - keine neue Daily-Usage
   - Duplicate-Nachricht ueber Heimaufsicht-Bot
10. Wenn User noch nicht genutzt hat oder Override erlaubt ist:
   - VIP-/Mod-MP3 wird ueber DB-Settings gesucht
   - aktueller Soundpfad: `D:/Streaming/stramAssets/htdocs/assets/sounds/vip`
   - aktuelle Dateiendung: `.mp3`
11. Wenn MP3 fehlt:
   - keine Daily-Usage
   - `sound_missing`-Nachricht ueber Heimaufsicht-Bot
12. Wenn MP3 existiert:
   - POST an Sound-System `/api/sound/play`
   - Sound-System bekommt Visualdaten fuer Overlay V2
13. Nur wenn Sound-System akzeptiert:
   - normale Ausloesung schreibt Daily-Usage
   - erlaubter Override ueberspringt Daily-Usage bewusst
   - Accepted-/Override-Nachricht ueber Heimaufsicht-Bot
14. OBS Overlay V2 liest direkt Sound-System-WebSocket/Polling und zeigt `visual.module = vip_sound_overlay` an.

## Dashboard-Stand

Aktive Dashboard-Module:

- Stream-Desk
- Control-Uebersicht
- Alerts V2
- OBS Details
- Sound-System
- Hug-System
- VIP-System
- Admin Configs

VIP-Dashboard kann aktuell:

- Status/Uebersicht anzeigen
- Settings anzeigen und speichern
- Texte aus DB anzeigen, filtern, anlegen, bearbeiten und aktivieren/deaktivieren
- Rollen-Fallbacks anzeigen, anlegen und entfernen
- Daily-Usage anzeigen
- Events/Stats anzeigen
- Admin-Testausloesung vorbereiten

Bewusst nicht in STEP047 enthalten:

- VIP-Song-Upload
- Backend-Umbau
- generischer DB-Text-Helper
- Migration anderer Module
- Dashboard-Rollen/Rechte/Audit-Logging

## Modulstandard ab STEP047

Fuer alle kuenftigen Dashboard-Module gilt als Zielstandard:

1. Dashboardfaehige Settings liegen in DB.
2. Dashboardfaehige Texte liegen in DB.
3. JSON-Dateien bleiben technische Config, Import oder Fallback.
4. Dashboard greift nie direkt auf SQLite oder Dateien zu.
5. Dashboard nutzt nur Backend-APIs.
6. Vorhandene Helper werden genutzt, keine Parallelstrukturen.
7. Harte Texte im Code sind nur Seed-Defaults, nicht dauerhafte Quelle.

Aktuelle Helper-Lage:

- `helper_settings.js` ist DB-Settings-Standard.
- VIP nutzt DB-Texte modulnah.
- Alerts haben DB-Textbereiche.
- `helper_texts.js` ist aktuell noch JSON-basiert und muss spaeter fuer DB-Texte erweitert oder durch einen DB-Text-Helper ergaenzt werden.

## Doku-Struktur

Repo-Doku:

- D:\Git\stream-control-center\docs

Live-Doku:

- D:\Streaming\stramAssets\docs

Aktuelle Statusdatei:

- docs/current/CURRENT_SYSTEM_STATUS.md

Snapshots:

- docs/system-inspection/2026-05-03/
- docs/backend/
- docs/dashboard/
- docs/overlays/
- docs/database/

## Wichtige Regeln

- Keine Funktionalitaet entfernen.
- Vor Aenderungen echten Dateistand pruefen.
- GitHub/dev und Live bewusst synchron halten.
- Keine Secrets committen.
- Keine SQLite-Dateien committen.
- Doku-Snapshots nicht ueberschreiben, sondern neue CURRENT-Dateien pflegen.
- STEP-Dokus nach jedem abgeschlossenen Block schreiben.

## Offene Punkte

- Browser-/Live-Test des neuen VIP-Dashboard-Moduls nach Deploy bestaetigen.
- VIP-Song-Upload separat planen und nach Helper-/Upload-Standard bauen.
- Alle Module auf DB-Settings/DB-Texte/Helper-Standard auditieren.
- Zentralen DB-Text-Helper planen.
- Debug-Parameter `?debug=1` in OBS wieder entfernen, wenn nicht mehr gebraucht.
- Alte VIP-Action in Streamer.bot deaktiviert lassen oder spaeter nach Backup sauber entfernen.
- Legacy-Routen `/api/vip-sound/enqueue` und `/api/vip-sound-overlay/enqueue` vorerst fuer Kompatibilitaet behalten.
- Fireworks spaeter neu aufbauen.
- Hug-Textbearbeitung spaeter sauber neu planen.
- Alerts-Modul spaeter behutsam splitten.
- Overlays langfristig mit einheitlichem Overlay-Client standardisieren.

## Naechster empfohlener Schritt

1. STEP047 per Live-Deploy im Browser pruefen.
2. Danach Modul-Audit fuer Texte/Settings/Helper vorbereiten.
3. Danach VIP-Song-Upload als separaten STEP planen.
