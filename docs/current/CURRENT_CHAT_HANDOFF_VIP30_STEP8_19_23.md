# VIP30 – Übergabe für neuen Chat

## Startpunkt

Wir machen mit dem VIP30-System weiter.

Bitte zuerst diese Datei lesen:

```text
docs/current/CURRENT_STATUS_VIP30_STEP8_19_23.md
```

Aktueller letzter Code-Step:

```text
STEP8.19.22 – Backend Safety Cleanup
```

ZIP:

```text
VIP30_STEP8_19_22_backend_safety_cleanup.zip
```

## Wichtigste Entscheidung

Die Kanalpunkte-Kachel ist die Wahrheit.

VIP30 erkennt die Kachel über:

```text
actionType = vip30
actionKey  = vip30.redeem
queue      = vip30
```

Name, Preis und Prompt sind keine Live-Blocker.

## Bereits entschieden

Harte Blocker nur noch:

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

Fachliche Blocker bleiben:

```text
Userdaten fehlen
User ist Streamer/Broadcaster
User ist Moderator
User ist bereits VIP
User hat aktiven VIP30-Slot
Slots voll
Twitch-Grant schlägt fehl
Slot speichern schlägt fehl
```

Alte Safety-Gates sind raus als Blocker:

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
Reward-Preis/Titel/Prompt
```

## Nächster sinnvoller Schritt

Erst prüfen, ob STEP8.19.22 im Live-System eingespielt wurde.

Dann:

```cmd
cd /d D:\Git\stream-control-center
node -c backend\modules\vip30.js
```

Node neu starten und Dashboard prüfen.

Danach Dashboard anpassen:

```text
STEP8.19.23/24 – Dashboard Live-Readiness auf neue Kachel-Wahrheit umstellen
```

## Bitte beachten

Keine alten Safety-Gates wieder einbauen.

Nicht wieder anfangen mit:

```text
live.mode muss live sein
twitch.liveActionsEnabled muss true sein
allowVipGrant muss true sein
allowSlotWrite muss true sein
allowAlert muss true sein
```

Das war bewusst entfernt bzw. nur noch Info/Warnung.

## User-Wunsch

Stück für Stück arbeiten. Nicht mehrere Baustellen gleichzeitig. Erst anzeigen/prüfen, dann umbauen.

Keine unnötigen Sicherheits-Gates mehr, aber fachliche Blocker und Fehlerbehandlung behalten.
