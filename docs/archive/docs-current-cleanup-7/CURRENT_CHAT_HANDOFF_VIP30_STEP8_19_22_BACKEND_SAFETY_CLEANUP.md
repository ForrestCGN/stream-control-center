# VIP30 STEP8.19.22 – Backend Safety Cleanup

Stand: 2026-06-07 10:35

## Ziel

Die alten Entwicklungs-Safety-Gates wurden aus den harten VIP30-Live-Blockern entfernt.

Neue Hauptregel:

```text
Die Kanalpunkte-Kachel ist die Wahrheit.
```

VIP30 erkennt seine Kachel über:

```text
actionType = vip30
actionKey  = vip30.redeem
queue      = vip30
```

Der sichtbare Titel, Preis und Prompt sind keine Live-Blocker mehr.

## Geänderte Datei

```text
backend/modules/vip30.js
```

## Wichtigste Änderungen

### `buildLiveActionSafetyStatus()`

Harte Blocker sind jetzt nur noch:

```text
moduleEnabled
vip30TileFound
vip30TileActive
actionTypeVip30
actionKeyVip30
rewardSystemEnabled
rewardTwitchEnabled
rewardNotPaused
```

### Nicht mehr harte Blocker

Diese Werte werden nur noch als `legacyInfo`/Warnung angezeigt:

```text
live.mode
twitch.liveActionsEnabled
bridge.decisionOnly
live.allowVipGrant
live.allowSlotWrite
live.allowRedemptionFulfillCancel
live.allowAlert
capabilityChecked
twitchCapabilityReady
autoFulfill
twitchRewardIdLinked
queueOk
Preis/Titel/Prompt-Unterschiede
```

### Kachel-Erkennung

VIP30 sucht die Kanalpunkte-Kachel bevorzugt über:

```text
action_type = vip30
action_key  = vip30.redeem
```

Falls keine solche Kachel gefunden wird, fällt es auf den alten `reward_key = vip30` zurück.

### HTTP 200 Bug

`HTTP 200` gilt nicht mehr als echter Modulfehler für `ok=false`.

## Beibehalten

Aus STEP8.19.20 bleibt erhalten:

```text
Chat-Ausgaben
Fehler-Refund/Cancel bei Twitch-Grant-Fehler
Live-Readiness-Status
```

Fachliche Blocker bleiben im Entscheidungs-/Ausführungsflow:

```text
Userdaten fehlen
User ist Streamer/Broadcaster
User ist Moderator
User ist bereits VIP
User hat aktiven VIP30-Slot
Slots voll
Twitch-VIP-Grant schlägt fehl
Slot speichern schlägt fehl
```

## Nicht geändert

```text
Dashboard
Overlay
Sound-System
Media-System
DB-Schema
Textsets
SoundPool
Cleanup
```

## Test

```cmd
cd /d D:\Git\stream-control-center
node -c backend\modules\vip30.js
```

Danach Node neu starten und prüfen:

```text
VIP30 → Übersicht
```

Erwartung:

```text
Alte Live-Gates blockieren nicht mehr.
VIP30-Kachel aktiv/verknüpft entscheidet den Live-Status.
HTTP 200 steht nicht mehr als Fehler/OK=false.
```

## StepDone

```cmd
cd /d D:\Git\stream-control-center
.\stepdone.cmd "VIP30 STEP8.19.22 Backend Safety Cleanup"
```
