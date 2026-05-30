# Sound-System Routing für Channelpoints

Stand: 2026-05-27

## Ziel

Channelpoints soll nicht selbst entscheiden, ob ein Sound über Browser-Overlay oder Audio-Device läuft. Channelpoints übergibt Media-Aufträge an das Sound-System. Das Sound-System entscheidet Routing, Queue und Discord-Ziel.

## Aktueller Standard

```text
Audio/Sound: Device
Video: Overlay/Media-Bridge, wenn nötig
Ziel: Stream + Discord
Queue: Sound-System entscheidet
```

## Wichtige Korrektur

Problem vor STEP523:

```text
Reward stand auf Auto,
Sound-System defaults.outputTarget stand aber auf overlay,
dadurch lief Audio weiter über Overlay.
```

Korrektur in `config/sound_system.json`:

```text
output.defaultTarget  = device
defaults.outputTarget = device
targets.discord       = enabled
targets.both          = enabled
output.targets.both   = enabled
```

## Diagnose

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/status" | ConvertTo-Json -Depth 6
```

Prüfen:

```text
config.defaults.outputTarget = device
config.output.defaultTarget  = device
```

Wenn trotz JSON noch `overlay` erscheint, überschreibt eine DB-/Runtime-Einstellung den Config-Wert.

<!-- STEP603B_SOUND_SYSTEM_ROUTING_DOCS_BATCH_START -->

## STEP603B Sound System Routing Docs Batch

Stand: 2026-05-30

Dieser Abschnitt dokumentiert den Sound-/Routing-Anteil aus dem von STEP602 ermittelten Batch A_channelpoints.

Channelpoints-Zeilen wurden bereits in STEP603A getrennt dokumentiert und werden hier nicht erneut vermischt.

### Batch

Batch: A_channelpoints
Ziel-Doku: docs/modules/sound_system_channelpoints_routing.md
Module im Batch: 10
High Priority: 3
Review Priority: 0
Route Hits: 200
Quelle: system-scan-output/step602_next_real_module_doc_batch_rows.tsv
Generated: 2026-05-30 11:32:46

### Arbeitsregel

1. Diese Eintraege sind scan-/triagebasiert.
2. Sie beschreiben Doku-Bedarf fuer Sound-/Routing-nahe Module, keine neue Funktionalitaet.
3. Sound-System, Queue, Prioritaeten, Outputs und Routing-Regeln duerfen dadurch nicht funktional veraendert werden.
4. Keine produktive Route ungeprueft aus Scan-Treffern ableiten.
5. Echte Moduldatei und Router-Kontext bleiben massgeblich.

### Sound-/Routing-nahe Module in diesem Batch

| Priority | Module | File | Route Hits | Action |
|---|---|---|---:|---|
| high | sound_system | backend/modules/sound_system.js | 18 | update_target_doc_first |
| high | soundalerts_bridge | backend/modules/soundalerts_bridge.js | 78 | update_target_doc_first |
| high | tts_system | backend/modules/tts_system.js | 91 | update_target_doc_first |
| normal | commands_media | backend/modules/commands_media.js | 2 | review_existing_doc_section |
| normal | media | backend/modules/media.js | 1 | review_existing_doc_section |
| normal | sound_loudness_scanner | backend/modules/sound_loudness_scanner.js | 1 | review_existing_doc_section |
| normal | sound_media_bridge | backend/modules/sound_media_bridge.js | 2 | review_existing_doc_section |
| normal | sound_output_config | backend/modules/sound_output_config.js | 1 | review_existing_doc_section |
| normal | video_media_bridge | backend/modules/video_media_bridge.js | 2 | review_existing_doc_section |
| normal | vip_sound_overlay | backend/modules/vip_sound_overlay.js | 4 | review_existing_doc_section |

### Abgrenzung

Dieser Abschnitt ist eine Doku-/Review-Zwischenablage fuer Sound-System-/Channelpoints-Routing-nahe Scan-Kandidaten.

Er ersetzt keine fachliche Sound-System-Doku und trifft keine Aussage darueber, ob eine Route produktiv, intern, diagnostisch oder historisch ist.

### Naechster Schritt

STEP604 - Channelpoints/Sound Routing Batch Verification

Ziel: Pruefen, ob STEP603A und STEP603B sauber getrennt dokumentiert wurden und danach den naechsten Modul-Doku-Batch bestimmen.

<!-- STEP603B_SOUND_SYSTEM_ROUTING_DOCS_BATCH_END -->

