# CURRENT SYSTEM STATUS

Stand: 2026-05-05

## Zweck

Diese Datei ist der aktuelle Einstiegspunkt fuer den Projektstand.

Historische Analyse-Snapshots liegen unter:

- `docs/system-inspection/2026-05-03/`
- `docs/backend/`
- `docs/dashboard/`
- `docs/overlays/`
- `docs/database/`

Diese Snapshots bleiben historische Staende und werden nicht blind ueberschrieben.

## Aktueller Arbeitsstand

Branch:

- `dev`

Repo:

- `D:\Git\stream-control-center`

Live:

- `D:\Streaming\stramAssets`

GitHub:

- `https://github.com/ForrestCGN/stream-control-center`

Aktueller Arbeitsgrundsatz:

- GitHub/dev ist Single Source of Truth.
- Live wird ueber `tools\easy\01_LIVE_AKTUALISIEREN_VON_GITHUB.cmd` aktualisiert.
- Nach manuellem Entpacken eines STEP-ZIPs ist der Standardabschluss:
  ```powershell
  .\stepdone.cmd "commit beschreibung"
  ```
- Nach abgeschlossenen Blocks werden `docs/current/CURRENT_SYSTEM_STATUS.md` und `project-state/*` aktualisiert.
- Keine Secrets, `.env`, SQLite-/DB-Dateien, Backups, ZIPs oder Tokens committen.
- Keine Funktionalitaet entfernen.

## Aktueller Standardablauf nach ZIP-Entpacken

ZIPs werden weiterhin manuell nach Repo-Root entpackt:

```text
D:\Git\stream-control-center
```

Danach Standardabschluss:

```powershell
cd D:\Git\stream-control-center
.\stepdone.cmd "feat: kurze passende commit beschreibung"
```

Das Script macht:

1. Git-Status anzeigen
2. relevante JS-Dateien per `node -c` pruefen
3. relevante Projektdateien vormerken
4. Sicherheitscheck gegen Secrets/DB/Backups/ZIPs
5. Commit mit der uebergebenen Beschreibung
6. Push nach `origin/dev`
7. bekanntes Live-Deploy-Script ausfuehren
8. Abschlussstatus anzeigen

Hinweis:

- Wenn Backend-Dateien geaendert wurden und das Deploy-Script Node nicht automatisch neu startet, muss das Backend danach manuell neu gestartet werden.

## Zuletzt abgeschlossene Hauptbereiche

### Hug / Rehug - STEP181 bis STEP182

Aktueller Stand:

- Hug/Rehug Backend laeuft auf `schemaVersion = 3`.
- Neue gekoppelte Textpaare liegen in `hug_text_pairs`.
- `hug_pending_rehugs` speichert `pair_id`, damit ein Rehug exakt den passenden Antworttext zum urspruenglich gezogenen Hug-Text nutzt.
- Bestehende alte `hug_texts` wurden sanft in 30 gekoppelte Textpaare migriert.
- `hug_types` und `type_id` bleiben aus Kompatibilitaets-/Migrationsgruenden bestehen, sind aber fuer die Bedienung nicht mehr prominent relevant.
- Dashboard-Bedienung wurde vereinfacht: Textpaar / Text / Antwort-Text statt Typen-Komplexitaet.
- STEP182 hat den Hug-Texte-Bereich komplett editierbar gemacht.

Aktive Hug-Texte-Kategorien im Dashboard:

- `Hug/Rehug-Paare`:
  - Tabelle `hug_text_pairs`
  - gekoppelte Textpaare
  - Text und Antwort bleiben immer zusammen
- `Chatweite Hugs`:
  - Tabelle `hug_texts`
  - `kind = hug_all`
  - einfache Einzeltexte fuer Hug ohne Zielperson
- `Systemantworten`:
  - Tabelle `hug_texts`
  - `kind = response`
  - Bot-Antworten fuer Fehler, Hinweise und Statusmeldungen
- `Toplisten`:
  - Tabelle `hug_texts`
  - `kind = top_title`
  - Titel fuer Hug-Toplisten

Live bestaetigt:

```text
GET /api/hug/status
ok: true
schemaVersion: 3
hugTextPairs: 30
activeHugTextPairs: 30
```

Weitere live bestaetigte Editor-Routen:

```text
GET /api/dashboard/community/hug/hug-all-texts
ok: true
kind: hug_all
count: 20
activeCount: 20

GET /api/dashboard/community/hug/response-texts
ok: true
kind: response
count: 24
activeCount: 24

GET /api/dashboard/community/hug/top-title-texts
ok: true
kind: top_title
count: 3
activeCount: 3
```

Aktive Dateien:

- `backend/modules/hug.js`
- `htdocs/dashboard/modules/hug.js`
- `htdocs/dashboard/modules/hug.css`
- `config/hug_system.json`
- `config/messages/hug.json`

Wichtige Hug/Rehug-Dokus:

- `project-state/STEP181_HUG_REHUG_TEXT_PAIRS_BACKEND_2026-05-05.md`
- `project-state/STEP181_2_HUG_REHUG_TEXT_PAIR_DASHBOARD_2026-05-05.md`
- `project-state/STEP181_4_HUG_SIMPLIFY_NO_TYPES_2026-05-05.md`
- `project-state/STEP181_7_STEPDONE_CMD_ONLY_2026-05-05.md`
- `project-state/STEP181_8_HUG_REHUG_DOC_SYNC_2026-05-05.md`
- `project-state/STEP182_1_HUG_DASHBOARD_UX_TEXTPAIR_LABELS_2026-05-05.md`
- `project-state/STEP182_2_HUG_DASHBOARD_UX_TEXTAREA_WIDTH_2026-05-05.md`
- `project-state/STEP182_3_HUG_ALL_TEXT_EDITOR_2026-05-05.md`
- `project-state/STEP182_4_HUG_RESPONSE_TEXT_EDITOR_2026-05-05.md`
- `project-state/STEP182_5_HUG_TOP_TITLE_EDITOR_2026-05-05.md`
- `project-state/STEP182_6_HUG_TEXT_EDITOR_DOC_SYNC_2026-05-05.md`

### Tagebuch / Todo

Aktueller Tagebuch-/Todo-Block ist bis STEP180 abgeschlossen.

Referenzen:

- `project-state/STEP176_TAGEBUCH_TODO_DB_DASHBOARD_AUDIT_2026-05-05.md`
- `project-state/STEP177_TAGEBUCH_TODO_DB_ADMIN_BACKEND_2026-05-05.md`
- `project-state/STEP178_TAGEBUCH_TODO_DASHBOARD_INTEGRATION_2026-05-05.md`
- `project-state/STEP179_TEXT_VARIANTS_EDITOR_2026-05-05.md`
- `project-state/STEP180_TEXT_VARIANTS_STATUS_UX_CLEANUP_2026-05-05.md`

Kernstatus:

- Tagebuch nutzt DB-Settings ueber `tagebuch_settings`.
- Todo nutzt DB-Settings ueber `todo_settings`.
- Tagebuch- und Todo-Texte liegen dashboardfaehig und variantenfaehig in `module_text_variants`.
- `module_texts` bleibt als Legacy-/Kompatibilitaetsschicht erhalten.
- JSON-Dateien bleiben Seed/Fallback.
- Dashboard-Module fuer Tagebuch und Todo sind im Community-Bereich aktiv.
- Texte werden als Kategorie-/Key-/Varianten-Editor dargestellt.
- Dashboard bearbeitet Settings/Texte nur ueber Backend-APIs.

### Sound / Alert / TTS

Referenz:

- `project-state/STEP172_SOUND_ALERT_TTS_STATUS_CURRENT_2026-05-05.md`

Kernstatus:

- Alert-Hauptsound laeuft ueber Sound-System.
- Alert-TTS laeuft als eigenes Sound-System-Item hinter Alert-Hauptsound.
- Chat-TTS wartet, bis Alert-Kette idle ist.
- Overlay bleibt bis nach Alert-TTS sichtbar.
- Sound-System bleibt Audio-Wahrheit.

### VIP / VIP-Sound Dashboard

Aktueller VIP-Dashboard-Block ist bis STEP175.5 dokumentiert.

Zentrale Referenz:

- `project-state/STEP175_VIP_SOUND_BLOCK_HANDOFF_2026-05-05.md`
- `project-state/STEP175_5_PROJECT_DOC_SYNC_AFTER_VIP_BLOCK_2026-05-05.md`

Aktive VIP-Dateien:

- `backend/modules/vip_sound_overlay.js`
- `htdocs/dashboard/modules/vip.js`
- `htdocs/dashboard/modules/vip.css`
- `htdocs/overlays/vip_sound_overlay_v2.html`

Fachliche VIP-Regel:

- Nur Twitch VIP oder Twitch Mod ist berechtigt.
- Keine Berechtigung aus lokalen Overrides.
- Keine Berechtigung aus Daily-Usage, Events oder Historie.
- Lokale Overrides duerfen Diagnose-/Altdaten bleiben, aber keine Rechte erzeugen.

## Aktive Dashboard-Module

- Stream-Desk
- Control-Uebersicht
- Alerts V2
- OBS Details
- Sound-System
- Hug-System
- Tagebuch
- Todo
- VIP-System
- Admin Configs

## Modulstandard

Fuer alle kuenftigen Dashboard-Module gilt als Zielstandard:

1. Dashboardfaehige Settings liegen primaer in DB.
2. Dashboardfaehige Texte liegen primaer in DB.
3. JSON-Dateien bleiben technische Config, Import oder Fallback.
4. Dashboard greift nie direkt auf SQLite oder Dateien zu.
5. Dashboard nutzt nur Backend-APIs.
6. Vorhandene Helper werden genutzt, keine Parallelstrukturen.
7. Harte Texte im Code sind nur Seed-Defaults, nicht dauerhafte Quelle.
8. Keine Funktionalitaet entfernen.

Aktuelle Helper-Lage:

- `helper_settings.js` ist DB-Settings-Standard.
- `helper_texts.js` unterstuetzt zentrale DB-Modultexte und Textvarianten via `module_texts`/`module_text_variants`; JSON bleibt Seed/Fallback.
- VIP nutzt DB-Texte modulnah.
- Alerts haben DB-Textbereiche.
- Hug/Rehug nutzt wegen notwendiger Text-Antwort-Kopplung eine eigene Paarstruktur `hug_text_pairs`.
- Hug-Einzeltexte nutzen `hug_texts` mit `kind = hug_all`, `response` und `top_title`.

## Wichtige Regeln

- Keine Funktionalitaet entfernen.
- Vor Aenderungen echten Dateistand pruefen.
- GitHub/dev und Live bewusst synchron halten.
- Keine Secrets committen.
- Keine SQLite-Dateien committen.
- Keine Backups/Altdateien committen.
- Historische Analyse-Snapshots nicht ueberschreiben.
- Aktuellen Stand in `docs/current/CURRENT_SYSTEM_STATUS.md` und `project-state/*` aktuell halten.
- Nach jedem abgeschlossenen Block STEP-Doku schreiben.
- Bei Hug/Rehug muessen Text und Antwort immer gekoppelt bleiben.

## Offene Punkte

### Hug / Rehug

- Finaler Browser-UX-Check fuer alle vier Text-Kategorien.
- Optional spaeter:
  - Audit-Logging fuer Textaenderungen
  - bessere Platzhalter-/Key-Hilfe je Systemantwort
  - Sammel-Speichern statt Einzel-Speichern
  - Rollen/Rechte fuer Textbearbeitung

### VIP

- Echte 7-/30-Tage-Statistik backendseitig ergaenzen.
- Upload-UX nur behutsam weiter verbessern.
- Sound-Vorschau optional erweitern:
  - Stop-Button
  - aktuelle Vorschau optisch markieren
  - lokale Dashboard-Lautstaerke
- Keine neue Berechtigungslogik fuer VIP-Sounds.

### System allgemein

- Alle Module auf DB-Settings/DB-Texte/Helper-Standard auditieren.
- Provider-/Settings-Ausgaben maskieren, da Settings sensible Werte enthalten koennen.
- `liveAlert`/`livealert` Duplikat in Alert-Settings spaeter bereinigen.
- Dashboard-Rollen/Rechte und Audit-Logging vorbereiten.
- Fireworks spaeter neu aufbauen.
- Alerts-Modul spaeter behutsam splitten.
- Overlays langfristig mit einheitlichem Overlay-Client standardisieren.

## Naechster empfohlener Schritt

1. Hug-Dashboard im Browser final pruefen:
   ```text
   Community -> Hug-System -> Texte
   ```
2. Alle vier Kategorien kurz anklicken:
   - Hug/Rehug-Paare
   - Chatweite Hugs
   - Systemantworten
   - Toplisten
3. Danach naechstes Modul planen oder Hug-UX nur noch mit kleinen Fixes nachziehen.
