# Secondary Modules Deep Dive Overview

Stand: 2026-05-26

Dieser STEP dokumentiert kleinere, sekundäre oder ergänzende Backend-Module. Die Dokus basieren auf dem aktuellen Backend-Upload und ersetzen keine spätere Live-Prüfung vor Codeänderungen.

## alert-provider

| Modul | Doku | erkannte Routen | erkannte Tabellen | Version erkannt |
|---|---|---:|---|---|
| Ko-fi Provider | [`kofi-deep-dive.md`](./kofi-deep-dive.md) | 5 | `alert_provider_events`, `alert_rules`, `alert_settings`, `alert_types` | — |
| Tipeee Provider | [`tipeee-deep-dive.md`](./tipeee-deep-dive.md) | 9 | `alert_provider_events`, `alert_rules`, `alert_settings`, `alert_types` | — |

## assets-media

| Modul | Doku | erkannte Routen | erkannte Tabellen | Version erkannt |
|---|---|---:|---|---|
| Media-System | [`media-deep-dive.md`](./media-deep-dive.md) | 12 | `media_assets`, `media_categories` | — |

## chat-control

| Modul | Doku | erkannte Routen | erkannte Tabellen | Version erkannt |
|---|---|---:|---|---|
| Commands-System | [`commands-deep-dive.md`](./commands-deep-dive.md) | 13 | `command_definitions`, `command_execution_log` | — |
| Commands Media Bridge | [`commands-media-deep-dive.md`](./commands-media-deep-dive.md) | 3 | — | — |
| Chat Output | [`chat-output-deep-dive.md`](./chat-output-deep-dive.md) | 3 | — | — |
| Messages | [`messages-deep-dive.md`](./messages-deep-dive.md) | 32 | — | — |
| Message Rotator Scheduler | [`message-rotator-scheduler-deep-dive.md`](./message-rotator-scheduler-deep-dive.md) | 16 | `message_rotator_scheduler_settings` | — |

## community-points

| Modul | Doku | erkannte Routen | erkannte Tabellen | Version erkannt |
|---|---|---:|---|---|
| Loyalty-System | [`loyalty-deep-dive.md`](./loyalty-deep-dive.md) | 40 | `loyalty_events`, `loyalty_ignored_users`, `loyalty_imports`, `loyalty_reservations`, `loyalty_runner_events`, `loyalty_settings`, … | — |

## community-runtime

| Modul | Doku | erkannte Routen | erkannte Tabellen | Version erkannt |
|---|---|---:|---|---|
| Challenge-System | [`challenge-deep-dive.md`](./challenge-deep-dive.md) | 38 | `challenge_runtime_events`, `challenge_user_mode_stats` | — |
| Hug System Legacy/Runtime | [`hug-system-deep-dive.md`](./hug-system-deep-dive.md) | 6 | `hug_pair_stats`, `hug_pending_rehugs`, `hug_users` | — |

## core-status

| Modul | Doku | erkannte Routen | erkannte Tabellen | Version erkannt |
|---|---|---:|---|---|
| Database Core Status | [`database-core-status-deep-dive.md`](./database-core-status-deep-dive.md) | 1 | — | — |
| Security Status | [`security-status-deep-dive.md`](./security-status-deep-dive.md) | 1 | — | — |
| Audit Log | [`audit-log-deep-dive.md`](./audit-log-deep-dive.md) | 5 | — | `0.2.0` |

## diagnostics

| Modul | Doku | erkannte Routen | erkannte Tabellen | Version erkannt |
|---|---|---:|---|---|
| Bus Diagnostics | [`bus-diagnostics-deep-dive.md`](./bus-diagnostics-deep-dive.md) | 3 | — | — |
| Diagnostics | [`diagnostics-deep-dive.md`](./diagnostics-deep-dive.md) | 3 | — | — |

## media-runtime

| Modul | Doku | erkannte Routen | erkannte Tabellen | Version erkannt |
|---|---|---:|---|---|
| Video Media Bridge | [`video-media-bridge-deep-dive.md`](./video-media-bridge-deep-dive.md) | 9 | — | — |

## overlay-runtime

| Modul | Doku | erkannte Routen | erkannte Tabellen | Version erkannt |
|---|---|---:|---|---|
| Deathcounter V2 | [`deathcounter-v2-deep-dive.md`](./deathcounter-v2-deep-dive.md) | 65 | `deathcounter_settings` | — |
| Fireworks API | [`fireworks-api-deep-dive.md`](./fireworks-api-deep-dive.md) | 3 | — | — |
| Overlay Data | [`overlay-data-deep-dive.md`](./overlay-data-deep-dive.md) | 1 | — | — |
| Start Overlay | [`start-overlay-deep-dive.md`](./start-overlay-deep-dive.md) | 8 | — | — |
| Twitch Chat Overlay | [`twitch-chat-overlay-deep-dive.md`](./twitch-chat-overlay-deep-dive.md) | 33 | — | — |

## sound-runtime

| Modul | Doku | erkannte Routen | erkannte Tabellen | Version erkannt |
|---|---|---:|---|---|
| SoundAlerts Bridge | [`soundalerts-bridge-deep-dive.md`](./soundalerts-bridge-deep-dive.md) | 16 | `soundalerts_bridge_entries`, `soundalerts_bridge_events`, `soundalerts_bridge_meta`, `soundalerts_bridge_settings` | — |
| Sound Output Config | [`sound-output-config-deep-dive.md`](./sound-output-config-deep-dive.md) | 5 | — | — |
| Sound Loudness Scanner | [`sound-loudness-scanner-deep-dive.md`](./sound-loudness-scanner-deep-dive.md) | 26 | `alert_rules`, `sound_loudness_files`, `sound_loudness_promotions`, `sound_loudness_scans`, `sound_loudness_settings`, `sound_settings` | `0.1.12-step272i5-scan-startedat-fix` |
| Sound Media Bridge | [`sound-media-bridge-deep-dive.md`](./sound-media-bridge-deep-dive.md) | 4 | — | — |

## stream-runtime

| Modul | Doku | erkannte Routen | erkannte Tabellen | Version erkannt |
|---|---|---:|---|---|
| Credits | [`credits-deep-dive.md`](./credits-deep-dive.md) | 1 | — | — |
