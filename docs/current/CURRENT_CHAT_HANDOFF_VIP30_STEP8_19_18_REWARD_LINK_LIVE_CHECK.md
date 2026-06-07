# VIP30 STEP8.19.18 – Reward-Link Live-Check Hotfix

## Problem

Im Live-Betrieb wurde Stage A mit `stage_a_not_armed` und Blocker `localRewardLinked` gestoppt, obwohl die Live-Gates aktiv waren und das Reward-Dashboard den VIP30-Reward als Twitch-verknüpft/aktiv angezeigt hat.

## Ursache

`localRewardLinked` hing zu stark am vollständigen VIP30-Wunschzustand. Dadurch konnten z.B. Preis-/Titel-/Config-Abweichungen oder alte VIP30-Settings die Live-Ausführung blockieren, obwohl der tatsächliche Channelpoints-Reward eindeutig mit `vip30.redeem` verknüpft ist.

## Änderung

In `backend/modules/vip30.js` wurde `buildLocalRewardOperationalState()` angepasst.

Stage A blockt bei `localRewardLinked` nur noch, wenn wirklich kritische Zuordnungsfelder fehlen/falsch sind:

- lokaler Reward existiert
- Reward-Key passt
- Action-Type/Action-Key passen zu VIP30
- System ist aktiv
- Reward ist nicht pausiert
- Auto-Fulfill ist aus
- Twitch-Reward-ID ist vorhanden

Nicht mehr hart blockierend:

- Preis
- Titel
- Prompt
- Sortierung
- rein kosmetische Unterschiede

Zusätzlich gibt es im Safety-Status jetzt einen eigenen Check:

- `channelpointsRewardActive`

Dieser nutzt den echten lokalen Channelpoints-Reward-Status (`twitchIsEnabled`/Twitch-Reward-ID) und den Live-Modus.

## Nicht geändert

- Overlay
- Dashboard
- DB-Schema
- Slots
- Cleanup
- Redemption-API
- Twitch-VIP-API
- Sound-System
- Media-System

## Test

```cmd
cd /d D:\Git\stream-control-center
node -c backend\modules\vip30.js
```

Danach deployen/Node neu starten.

Im Dashboard prüfen:

```text
VIP30 → Diagnose
```

Erwartet:

```text
live_actions_armed
localRewardLinked = true
channelpointsRewardActive = true
```

Dann einen echten Test-Redeem auslösen.

## Optionaler DB-Check

Siehe:

```text
docs/sql/VIP30_STEP8_19_18_reward_active_check.sql
```

## StepDone

```cmd
cd /d D:\Git\stream-control-center
.\stepdone.cmd "VIP30 STEP8.19.18 Reward-Link Live-Check Hotfix"
```
