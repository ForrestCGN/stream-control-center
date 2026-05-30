# Aktueller Systemstatus – stream-control-center

Stand: 2026-05-30  
Fokus: Channelpoints-System, Twitch-Sync, Redemption-Flow, Sound-System-Routing, Media-Dateinamen, Alert-Overlay-Stabilität, Doku-/Project-State-Cleanup, Routen-/Modul-Doku-Verifikation

## Single Source of Truth

Projekt:

```text
D:\Git\stream-control-center
```

GitHub:

```text
https://github.com/ForrestCGN/stream-control-center
Branch: dev
```

Live-System:

```text
D:\Streaming\stramAssets
```

Produktive Datenbank:

```text
D:\Streaming\stramAssets\data\sqlite\app.sqlite
```

Regel:
Die produktive SQLite-Datenbank wird niemals ersetzt oder neu gebaut. Schemaänderungen nur migrationssicher/additiv. MariaDB/MySQL wird langfristig berücksichtigt, aber erst mit echtem Adapter und eigenem Migrations-/Test-/Rollback-Plan aktiv genutzt.

## Aktueller Doku-/Cleanup-Stand

Abgeschlossen:

```text
STEP553–STEP588 Project-State / Dokumentations-Cleanup
STEP589 General Project Prompt Update
STEP590 Central Status Docs Update
```

Ergebnis:

```text
project-state Root bereinigt
keine unerwarteten STEP-/NEXT_STEPS_STEP-Dateien im Root
fachliche Inhalte in docs/system-inspection/ konsolidiert
alte Run-/Arbeitsdokumente archiviert, nicht gelöscht
GENERAL_PROJECT_PROMPT.md aktualisiert
zentrale Statusdateien aktualisiert
```

Aktive Konsolidierungsdateien:

```text
docs/system-inspection/MODULE_AND_META_RULES_CONSOLIDATION.md
docs/system-inspection/COMMUNICATION_BUS_CONTRACT_CONSOLIDATION.md
docs/system-inspection/SHOUTOUT_SYSTEM_CONSOLIDATION.md
docs/system-inspection/CHANNELPOINTS_BUILD_CONSOLIDATION.md
docs/system-inspection/DASHBOARD_COMMANDS_CONSOLIDATION.md
docs/system-inspection/PROJECT_STATE_CLEANUP_RUN_HISTORY.md
```

## Verbindliche Arbeitsweise

Vor Änderungen:

```text
echte Dateien aus GitHub/dev prüfen
keine Annahmen über Routen/Helper/Configs/DB/Live-Zustand
fehlende Dateien konkret anfordern
keine Patches / keine Teil-Datei-Workarounds
vollständige Ersatzdateien liefern
ZIPs mit echten Zielpfaden ab Repo-Root bauen
```

PowerShell-/API-Ausgaben:

```text
kurz und feldgenau halten
keine langen ConvertTo-Json -Depth 10 Dumps, außer Detailanalyse braucht es
bei langen Routenlisten nur relevante Felder/Counts ausgeben
COPY_THIS_RESULT-Blöcke bevorzugen
```

## Aktueller relevanter Feature-Stand

Channelpoints:

```text
STEP527_CHANNELPOINTS_CREATE_SAVE_TWITCH_INACTIVE_DEFAULT_v0.9.13
```

Sound-/Routing:

```text
STEP523_SOUND_SYSTEM_AUTO_OUTPUT_DEFAULTS_FIX_v0.1.12
```

Media-Dateinamen:

```text
STEP524_MEDIA_ASSET_UTF8_FILENAME_CLEANUP_REAL_v0.1.0
```

Zurückgezogen/nicht benutzen:

```text
STEP524_MEDIA_ASSET_FILENAME_ENCODING_CLEANUP_v0.1.0
STEP525_CHANNELPOINTS_SAVE_ACTIVE_SYNCS_TWITCH_v0.9.11
STEP525_CHANNELPOINTS_SIMPLIFIED_TWITCH_ACTIVATION_FLOW_v0.9.11
STEP526_CHANNELPOINTS_SIMPLIFIED_TWITCH_ACTIVATION_HOTFIX_v0.9.12
```

## Channelpoints – aktuelles Bedienkonzept

Editor:

```text
kein Aktiv-Häkchen als normale Bedienlogik
Speichern legt lokal an oder ändert lokal
Speichern erstellt/aktualisiert Twitch Reward
neuer Twitch Reward wird standardmäßig NICHT aktiv/sichtbar auf Twitch erstellt
```

Übersicht:

```text
Twitch Aktiv/Inaktiv steuert nur Twitch sichtbar/einlösbar
```

Bestehender Reward:

```text
Bearbeiten + Speichern aktualisiert lokal und Twitch
bisheriger Twitch-Aktivstatus bleibt erhalten
```

Intern darf `system_enabled` als technische Kompatibilitätsspalte weiter existieren, soll aber nicht als normale Dashboard-Bedienlogik sichtbar sein.

## Sound-/Media-Routing

Channelpoints entscheidet nicht selbst, ob Sound über Device oder Overlay läuft.

Standard:

```text
Channelpoints: Auto / Sound-System entscheidet
Sound-System: Device für Audio, Overlay nur wenn nötig/gewollt
Ziel-Standard: Stream + Discord
Queue: Sound-System entscheidet
Video: Overlay/Media-Pfad über Sound-/Media-Bridge möglich
```

Aktueller Sound-System-Fix:

```text
config/sound_system.json
output.defaultTarget  = device
defaults.outputTarget = device
targets.discord       = enabled
targets.both          = enabled
output.targets.both   = enabled
```

Falls `/api/sound/status` trotzdem `defaults.outputTarget: overlay` meldet, überschreibt vermutlich die DB-/Runtime-Config den JSON-Wert.

## Media-Dateinamen

UTF-8-/Mojibake-Problem trat z. B. auf als:

```text
GewA_1_4rzGurke.mp3
```

Korrekte Richtung:

```text
Anzeige: lesbar, z. B. GewürzGurke
Technischer Dateiname: ASCII-sicher, z. B. GewuerzGurke.mp3
```

Aktueller Real-Fix basiert auf echter `backend/modules/media.js` und nicht auf dem zurückgezogenen Tool-Script.

## Alert-Overlay / SoundBus – konsolidierter Stand

Produktiv ist das direkte Alert-Overlay:

```text
http://127.0.0.1:8080/overlays/_overlay-alerts-v2.html
```

Produktiver Alert-Pfad:

```text
alert_system.js
→ legacy WebSocket
→ _overlay-alerts-v2.html
→ overlay finished ack
```

Der Communication-Bus ist vorbereitet und der direkte Bus-Shadow-Client im echten Overlay ist online:

```text
clientId=alert_overlay_v2_shadow
module=alert_system
type=overlay
status=online
```

Wichtig:
Das ist derzeit Shadow-/Vorbereitungsstand. Es ist keine produktive Umschaltung auf Bus.

Nicht als produktiven Alert-Pfad verwenden:

```text
http://127.0.0.1:8080/overlays/_overlay-alerts-v2-bus.html?debug=1&mode=bridge
```

Die iframe-/Bridge-Variante ist nicht Produktionspfad.

Der Alert-Bus-Adapter darf nicht direkt produktiv geschaltet werden. Zukünftiger Bus-Pfad braucht vorher einen stabilen Adaptervertrag:

```text
communication_bus
→ channel visual.alert
→ action play/clear
→ payload.alert
→ overlay bus ack
```

Offene Folgearbeit:
Shadow-/Bus-Test und erst danach Entscheidung, ob produktiver Bus-Modus vorbereitet wird.

## Bekannte offene Issues

### Sound-System: verwaister `activeBundleLock`

Sound-System kann nach Birthday-Bundle/Manual-Stop in einen Zustand geraten, in dem `activeBundleLock` gesetzt bleibt, obwohl `current` und `currentBundle` leer sind.

Effekt:

```text
Neue Birthday-/VIP-Sounds landen in der Queue, starten aber nicht.
```

Live-Workaround:

```text
POST /api/sound/clear
```

Status:
Bekanntes separates Sound-System-Issue, nicht Teil der Alert-Reconnect-/Bus-Arbeiten.

## Prüfbefehle

Backend-Modulliste kurz prüfen:

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/_status"
$s.modules | Select-Object name,loaded,version,lastError | Format-Table -AutoSize
```

Channelpoints-Status:

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/channelpoints/status"
$s | Select-Object ok,module,moduleVersion,enabled,lastError
```

Twitch-Manage-Status:

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/channelpoints/twitch/manage/status"
$s | Select-Object ok,module,moduleVersion,enabled,lastError
```

Reward-Liste kompakt:

```powershell
$r = Invoke-RestMethod "http://127.0.0.1:8080/api/channelpoints/rewards"
$r.rewards | Select-Object reward_key,title,system_enabled,twitch_is_enabled,twitch_reward_id,action_type,action_key,media_asset_id,media_role,cooldown_seconds,max_per_stream,max_per_user_per_stream | Format-Table -AutoSize
```

Alert-/Overlay-Status nur bei Detailanalyse groß ausgeben. Sonst relevante Felder auswählen:

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/alerts/status"
$s | Select-Object ok,module,moduleVersion,enabled,lastError
```

Sound-Status:

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/sound/status"
$s | Select-Object ok,module,moduleVersion,enabled,lastError
```

## Nächster sinnvoller Schritt

```text
STEP591 – Routes and Module Docs Verification Scan
```

Ziel:

```text
echte Backend-Routen aus Modulen erfassen
Dashboard-/Overlay-/Streamer.bot-relevante APIs markieren
gegen docs/modules/*.md und docs/current/CURRENT_SYSTEM_STATUS.md vergleichen
fehlende/veraltete Routen-Doku melden
```

<!-- STEP601_CURRENT_STATUS_CROSSMODULE_BATCH_START -->

## STEP601 Crossmodule Route Documentation Batch

Stand: 2026-05-30

Dieser Abschnitt dokumentiert den aus STEP600 ausgewaehlten echten Modul-/Status-Doku-Batch.

Ziel ist eine zentrale Status-Einordnung fuer Module, deren Routen laut Scan/Triage aktuell eher in CURRENT_SYSTEM_STATUS.md als in einer neuen Einzel-Doku zusammengefasst werden sollen.

### Batch

Batch: F_current_status_crossmodule
Ziel-Doku: docs/current/CURRENT_SYSTEM_STATUS.md
Module im Batch: 8
High Priority: 4
Review Priority: 0
Route Hits: 394
Quelle: system-scan-output/step600_next_real_module_doc_batch_rows.tsv
Generated: 2026-05-30 11:23:23

### Arbeitsregel

1. Diese Liste ist scan-/triagebasiert.
2. Sie beschreibt Doku-Bedarf und Status-Einordnung, keine neue Funktionalitaet.
3. Keine produktive Route ungeprueft aus Scan-Treffern ableiten.
4. Moduldatei und Router-Kontext bleiben fuer fachliche Aussagen massgeblich.

### Module in diesem Crossmodule-Batch

| Priority | Module | File | Route Hits | Action |
|---|---|---|---:|---|
| high | alert_system | backend/modules/alert_system.js | 203 | update_target_doc_first |
| high | obs | backend/modules/obs.js | 83 | update_target_doc_first |
| high | scene_control | backend/modules/scene_control.js | 42 | update_target_doc_first |
| high | twitch_chat_overlay | backend/modules/twitch_chat_overlay.js | 41 | update_target_doc_first |
| normal | kofi | backend/modules/kofi.js | 5 | review_existing_doc_section |
| normal | overlay_data | backend/modules/overlay_data.js | 3 | review_existing_doc_section |
| normal | start_overlay | backend/modules/start_overlay.js | 8 | review_existing_doc_section |
| normal | tipeee | backend/modules/tipeee.js | 9 | review_existing_doc_section |

### Bedeutung fuer den aktuellen Systemstatus

Dieser Batch zeigt, dass mehrere route-tragende Module zwar in der zentralen Inventur erfasst sind, aber fuer die operative Projektuebergabe weiterhin einen kompakten Status-/Doku-Hinweis brauchen.

Die Eintraege bleiben bewusst als Doku-/Review-Liste formuliert. Eine spaetere Detail-Doku darf daraus nur nach gezielter Pruefung der echten Dateien entstehen.

### Naechster Schritt

STEP602 - Current Status Crossmodule Batch Verification

Ziel: Pruefen, ob CURRENT_SYSTEM_STATUS.md sauber ergaenzt wurde und danach den naechsten echten Modul-Doku-Batch bestimmen.

<!-- STEP601_CURRENT_STATUS_CROSSMODULE_BATCH_END -->

<!-- STEP612_ROUTE_MODULE_DOCS_COMPLETION_STATUS_START -->
## STEP612 Route-/Modul-Doku-Konsolidierung abgeschlossen

Stand: 2026-05-30

Die Route-/Modul-Doku-Konsolidierung aus STEP591 bis STEP611D ist abgeschlossen und final verifiziert.

Abschlusspruefung:

- Completion OK: True
- Docs checked: 7
- Report groups checked: 24
- STEP610 remaining all batches: 0
- Warnings/Errors in STEP611D: 0/0

Wichtig:

- Es wurden keine produktiven Flows umgebaut.
- Die Arbeiten waren Doku-/Scan-/Konsolidierungsarbeit.
- Zentrale Zielbereiche wurden ergaenzt: ROUTES, Current Status, Channelpoints, Sound Routing, Dashboard Commands, Communication Bus, Shoutout System.
- STEP611A bis STEP611D klaerten und korrigierten nur zu strenge Verification-/Marker-Mappings.
<!-- STEP612_ROUTE_MODULE_DOCS_COMPLETION_STATUS_END -->

<!-- STEP615_CLEANUP_FREEZE_START -->
## STEP615 Cleanup Freeze & Return to Productive Work

Stand: 2026-05-30

Die Cleanup-/Doku-Konsolidierungsrunde ist eingefroren. Route-/Modul-Doku STEP591 bis STEP613 ist abgeschlossen und STEP614 hat eine Uebergabe plus Fresh-SystemScan-Prep erstellt.

Frischer Scan als Referenz:

- Files: 1122
- Backend modules: 69
- Helpers: 18
- Dashboard files: 67
- Overlay files: 34
- Config files: 58
- Docs files: 250
- Cleanup candidates: 550

Entscheidung: Cleanup-Kandidaten werden nicht weiter kleinteilig verfolgt. Weitere Cleanup-Arbeit nur noch bei echtem Bedarf und dann als groesserer, sicher geplanter Batch.
<!-- STEP615_CLEANUP_FREEZE_END -->

