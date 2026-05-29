# STEP536 – Technical STEP Docs Triage und Batch-Plan

Version: 0.1.0  
Stand: 2026-05-29  
Basis: STEP535 Scan vom 2026-05-29 09:41:12

## Ergebnis STEP535

| Kennzahl | Wert |
|---|---:|
| Kandidaten | 75 |
| TODO-Hits | 10 |

STEP535 hat bewusst nichts gelöscht. Der Scan hat `docs/archive/*`, `docs/_generated/*`, `docs/modules/*`, `docs/current/*` und `project-state/*` ausgeschlossen.

## Verteilung nach Theme

| Theme | Dateien | TODO-Hits | Bytes |
|---|---:|---:|---:|
| `alerts` | 27 | 4 | 33667 |
| `clips` | 6 | 0 | 3896 |
| `communication_bus` | 2 | 1 | 6446 |
| `dashboard` | 1 | 0 | 839 |
| `misc` | 4 | 1 | 7785 |
| `overlay` | 2 | 0 | 1042 |
| `sound_media` | 22 | 4 | 55182 |
| `vip` | 11 | 0 | 11847 |

## Verteilung nach Art

| Kind | Dateien |
|---|---:|
| `backend_step_doc` | 24 |
| `dashboard_step_doc` | 24 |
| `media_step_doc` | 1 |
| `overlay_step_doc` | 3 |
| `readme_step_doc` | 10 |
| `root_step_doc` | 1 |
| `sound_system_handoff_doc` | 1 |
| `vip_step_doc` | 11 |

## Bewertung

Die technischen STEP-Dokus sind deutlich besser beherrschbar als die vorherige `docs/current`-Halde.

Trotzdem gilt:

- Nicht alle 75 Kandidaten in einem Schritt verschieben.
- Erst je Theme eine Sammeldoku bauen.
- Danach alte Einzeldateien nur per Quarantine-Skript verschieben.
- Dateien mit TODO-Hits zuerst lesen, nicht blind archivieren.

## Empfohlene Batch-Reihenfolge

### STEP536A / nächster Umsetzungs-Batch: Alert + Alert-Dashboard + Alert-Overlay

Warum zuerst:

- größter Themenblock neben Sound/Media
- viele STEP276/340/350/351-Dateien hängen fachlich zusammen
- wurde bereits teilweise in Current-Dokus konsolidiert
- viele Einzelnotizen sind wahrscheinlich erledigte technische Verlaufshistorie

Scope:

```text
docs/backend/ALERT_*STEP*.md
docs/dashboard/ALERT_*STEP*.md
docs/overlays/STEP393_ALERT_OVERLAY_DIRECT_RECONNECT.md
docs/README_STEP278H_I_MASTER_OVERLAY_ALERT_MIRROR.md
docs/sound_system/STABLE_sound_system_alert_handoff_runtime_dashboard_2026-05-02.md
```

TODO-Hinweis: Die Datei `docs/sound_system/STABLE_sound_system_alert_handoff_runtime_dashboard_2026-05-02.md` hat 2 TODO-Hits und muss vor Verschieben genauer geprüft werden.

### STEP536B: Sound/Media/SoundBus

Scope:

```text
docs/backend/*SOUND*
docs/backend/*SOUNDBUS*
docs/backend/*MEDIA*
docs/backend/DISCORD_MEDIA_*
docs/backend/BIRTHDAY_MEDIAID_*
docs/dashboard/SOUND_DASHBOARD_*
docs/media/MEDIA_SYSTEM_ARCHITECTURE_STEP274K.md
```

Wichtige TODO-Hits:

- `docs/backend/SOUND_SYSTEM_BUS_AUDIT_STEP288.md`
- `docs/backend/SOUNDBUS_CONSUMER_DASHBOARD_PLAN_STEP298.md`
- `docs/backend/SOUNDBUS_CONSUMER_INTEGRATION_STEP310.md`

### STEP536C: VIP

Scope:

```text
docs/vip/STEP398_*.md
docs/vip/STEP399_*.md
docs/vip/STEP400_*.md
docs/vip/STEP401_*.md
docs/vip/STEP402_*.md
docs/vip/STEP403_*.md
docs/vip/STEP404_*.md
```

Keine TODO-Hits im STEP535-Scan.  
Guter Kandidat für schnelle Konsolidierung nach Alert/Sound.

### STEP536D: Alte Clip-/README-/Misc-STEPs

Scope:

```text
docs/README_STEP193_*.txt
docs/README_STEP194_*.txt
docs/README_STEP195_*.txt
docs/README_STEP196_DOCUMENTATION.txt
docs/README_STEP203_8.md
docs/README_STEP278B_COMMUNICATION_HELPER_CORE.md
docs/STEP203_7_TWITCH_EVENTSUB_LOYALTY_BRIDGE.md
```

Hier zuerst prüfen, ob Clip-Infos bereits in `docs/modules/clips*.md` oder `docs/current/CURRENT_STEP_HISTORY_CONSOLIDATED.md` enthalten sind.

## Kandidaten mit TODO-Hits

```text
docs/backend/SOUND_SYSTEM_BUS_AUDIT_STEP288.md | theme=sound_media | kind=backend_step_doc | todoHits=2 | bytes=11613
docs/sound_system/STABLE_sound_system_alert_handoff_runtime_dashboard_2026-05-02.md | theme=alerts | kind=sound_system_handoff_doc | todoHits=2 | bytes=10422
docs/README_STEP278B_COMMUNICATION_HELPER_CORE.md | theme=communication_bus | kind=readme_step_doc | todoHits=1 | bytes=787
docs/STEP203_7_TWITCH_EVENTSUB_LOYALTY_BRIDGE.md | theme=misc | kind=root_step_doc | todoHits=1 | bytes=3891
docs/backend/ALERT_SYSTEM_MEDIAID_PLAYBACK_STEP276C.md | theme=alerts | kind=backend_step_doc | todoHits=1 | bytes=708
docs/backend/SOUNDBUS_CONSUMER_DASHBOARD_PLAN_STEP298.md | theme=sound_media | kind=backend_step_doc | todoHits=1 | bytes=5404
docs/backend/SOUNDBUS_CONSUMER_INTEGRATION_STEP310.md | theme=sound_media | kind=backend_step_doc | todoHits=1 | bytes=2555
docs/dashboard/ALERT_LEGACY_SOUND_FOLDOUT_STEP276E.md | theme=alerts | kind=dashboard_step_doc | todoHits=1 | bytes=904
```

## Konkreter nächster Schritt

Ich empfehle als nächstes:

```text
STEP536A_ALERT_TECH_DOCS_CONSOLIDATION
```

Darin:

1. Alert-bezogene STEP-Dokus lesen.
2. Eine Sammeldoku `docs/backend/ALERT_TECH_HISTORY_CONSOLIDATED.md` oder `docs/system-inspection/ALERT_TECH_DOCS_CONSOLIDATED.md` bauen.
3. Offene TODOs aus `STABLE_sound_system_alert_handoff_runtime_dashboard_2026-05-02.md` retten.
4. Alte Einzeldateien per Quarantine-Skript verschieben.
