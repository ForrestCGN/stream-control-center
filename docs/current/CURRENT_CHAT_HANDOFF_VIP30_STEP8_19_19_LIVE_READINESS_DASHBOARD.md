# VIP30 STEP8.19.19 – Live-Readiness Ampel im Dashboard

## Ziel

VIP30 zeigt im Dashboard direkt sichtbar an, ob der Live-Betrieb wirklich bereit ist.

## Enthaltene Dateien

```text
backend/modules/vip30.js
htdocs/dashboard/modules/vip30.js
htdocs/dashboard/modules/vip30.css
docs/current/CURRENT_CHAT_HANDOFF_VIP30_STEP8_19_19_LIVE_READINESS_DASHBOARD.md
```

## Backend

`/api/vip30/status` liefert jetzt zusätzlich:

```text
liveReadiness
```

Darin enthalten:

- `armed`
- `status`
- `checks`
- `blockers`
- `reward`
- `live`
- `twitchCapability`

Zusätzlich wurde der Reward-Link-Check entschärft:
Preis/kosmetische Abweichungen blocken den Live-Flow nicht mehr hart. Kritisch bleiben:

- Reward existiert nicht
- Reward-Key falsch
- Action-Type/Action-Key falsch
- System deaktiviert
- Reward pausiert
- Auto-Fulfill aktiv
- Twitch Reward-ID fehlt
- fehlende Twitch-Capability
- Live-Gates nicht scharf

## Dashboard

In `VIP30 → Übersicht` erscheint jetzt oben eine Live-Bereitschaftsbox:

- LIVE BEREIT / BLOCKIERT
- Reward-Link
- Reward aktiv
- Twitch Reward-ID
- Twitch Capability
- Live-Gates
- Fulfill/Cancel
- Alert
- Bridge live

Alles grün/rot mit Blocker-Liste.

## Nicht geändert

- Overlay
- Sound-System
- DB-Schema
- Slots/Cleanup
- Redemption-Flow selbst
- Dashboard-Texte-Editor

## Tests

```cmd
cd /d D:\Git\stream-control-center
node -c backend\modules\vip30.js
node -c htdocs\dashboard\modules\vip30.js
```

Danach Node neu starten und Dashboard öffnen:

```text
VIP30 → Übersicht
```

Erwartet:

```text
Live-Bereitschaft
LIVE BEREIT
```

oder bei Problemen klare rote Blocker.

## StepDone

```cmd
cd /d D:\Git\stream-control-center
.\stepdone.cmd "VIP30 STEP8.19.19 Live-Readiness Dashboard"
```
