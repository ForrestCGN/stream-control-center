# Channelpoints – Simple Redemption Flow (STEP503)

Ziel: Die unnötige AutoExecute-/Shadow-/Live-/Allowlist-Bedienlogik wurde aus dem normalen Kanalpunkte-Flow zurückgebaut.

## Regel

- Reward inaktiv: nicht ausführen.
- Reward aktiv + Aktion vollständig: bei Redemption ausführen.
- Reward ohne Aktion: darf nicht aktiviert werden und wird nicht ausgeführt.

## Sicherheit

Sicherheit passiert über harte Backend-Regeln, nicht über zusätzliche Dashboard-Modi.

- Kein Twitch-Write.
- Keine zusätzliche Live-Freigabe.
- Keine Shadow-/Dryrun-/Armed-Bedienlogik.
- DB-Zugriff weiter über `../core/database`.

## Routen

- `GET /api/channelpoints/eventsub/redemption/status`
- `POST /api/channelpoints/eventsub/redemption/preview`
- `POST /api/channelpoints/eventsub/redemption`

## Status

Backend: `0.8.7` / `redemption-simple-active-flow`
Dashboard: `0.9.4` / `simple-redemption-flow-cleanup`
