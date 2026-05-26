# Integrationen - Deep-Dive-Übersicht

Stand: 2026-05-26  
STEP: `STEP478_MODULE_DOCS_INTEGRATIONS_COMMUNITY_DEEP_DIVE`

Dieser Block dokumentiert die Integrationsmodule aus dem aktuellen Backend-Upload.

## Enthaltene Detaildokus

- `docs/modules/twitch-deep-dive.md`
- `docs/modules/twitch-presence-deep-dive.md`
- `docs/modules/discord-deep-dive.md`
- `docs/modules/obs-deep-dive.md`
- `docs/modules/scene-control-deep-dive.md`

## Rolle im System

Diese Module sind die äußeren Schnittstellen des Systems:

- Twitch API / OAuth / EventSub / Helix
- Twitch IRC Presence und Chat-Ausgabe
- Discord Text/Voice/Webhook
- OBS WebSocket / Szenen / Quellen / Audio / Replay
- Scene-Control als vereinfachte Steuerungsebene

## Cleanup-Regeln

- Keine Tokens, Secrets oder Live-Konfigurationen in Dokus kopieren.
- Routen mit echter Auswirkung nur bewusst testen, besonders OBS, Discord und Twitch Chat-Ausgabe.
- Legacy-Routen bleiben dokumentiert, solange sie produktiv genutzt werden.
