# VIP30 STEP8.19.21 – Live-Safety Cleanup Plan

Stand: 2026-06-07 10:30

## Ziel

VIP30 soll keine unnötigen Entwicklungs-Sicherheiten mehr im Live-Betrieb haben.

Die zentrale Regel lautet:

```text
Die Kanalpunkte-Kachel ist die Wahrheit.
```

Ohne aktive VIP30-Kachel gibt es keinen VIP30-Redeem.  
Mit aktiver VIP30-Kachel darf VIP30 den Redeem verarbeiten.

## Technische Kachel-Erkennung

Die VIP30-Kachel wird nicht über Titel, Preis oder Prompt erkannt.

Die eindeutige technische Erkennung ist:

```text
actionType = vip30
actionKey  = vip30.redeem
queue      = vip30
```

Der sichtbare Titel der Kachel darf frei geändert werden.

## Neue Live-Grundregel

```text
Aktive Kanalpunkte-Kachel mit actionType=vip30 und actionKey=vip30.redeem
→ VIP30 darf Redeems verarbeiten

Keine aktive VIP30-Kachel
→ VIP30 bekommt normalerweise keine Redeems
→ Dashboard zeigt "keine aktive VIP30-Kachel"
```

Falls trotzdem ein Event ankommt, obwohl keine aktive Kachel gefunden wird:

```text
nicht live verarbeiten
loggen
Dashboard rot anzeigen
```

## Sicherheits-/Blocker-Entscheidungen

### Bleibt als fachlicher Blocker

```text
Userdaten fehlen oder sind ungültig
User ist Streamer/Broadcaster
User ist Moderator
User ist bereits VIP
User hat bereits aktiven VIP30-Slot
Slots sind voll
Twitch-VIP-Vergabe schlägt fehl
Slot speichern schlägt fehl
```

### Bleibt als Fehlerbehandlung, aber nicht als Vorab-Safety

```text
Redemption fulfill schlägt fehl
Redemption cancel/refund schlägt fehl
Alert/Sound schlägt fehl
Chatmeldung schlägt fehl
```

### Raus als harte VIP30-Live-Blocker

```text
live.mode
twitch.liveActionsEnabled
bridge.decisionOnly
live.allowVipGrant
live.allowSlotWrite
live.allowRedemptionFulfillCancel
live.allowAlert
localRewardLinked im alten strengen Sinn
capabilityChecked
twitchCapabilityReady
autoFulfill
Reward-Preis
Reward-Titel
Reward-Prompt
Twitch Reward-ID als gespeicherter globaler Vorab-Blocker
```

## Dashboard-Ziel

Dashboard soll nicht mehr mit vielen alten Safety-Gates verwirren.

Stattdessen anzeigen:

```text
VIP30-Kachel gefunden: Ja/Nein
VIP30-Kachel aktiv: Ja/Nein
Action-Type: vip30
Action-Key: vip30.redeem
Queue: vip30
Live bereit: Ja/Nein
Fachliche Blocker: falls vorhanden
Letzter Fehler: echter Fehler, nicht HTTP 200
```

Alte Gates dürfen höchstens noch als Legacy/Info erscheinen, aber nicht mehr als Live-Blocker.

## Umsetzung in Code – geplante Schritte

### STEP8.19.22 – Backend Safety Cleanup

Datei:

```text
backend/modules/vip30.js
```

Geplant:

1. `buildLiveActionSafetyStatus()` vereinfachen.
2. Harte Checks reduzieren auf:
   - Kachel aktiv/gefunden
   - gültige Kachel-Erkennung über `actionType/actionKey`
   - fachliche Checks
3. Alte Gates aus `blockers` entfernen.
4. `live.mode`, `allow*`, `twitch.liveActionsEnabled`, `bridge.decisionOnly`, Capability nur noch als Info/Warnung.
5. `HTTP 200` darf nicht mehr als Fehler/OK=false erscheinen.
6. Chat-/Refund-Fixes aus STEP8.19.20 beibehalten.

### STEP8.19.23 – Dashboard Cleanup

Dateien:

```text
htdocs/dashboard/modules/vip30.js
htdocs/dashboard/modules/vip30.css
```

Geplant:

1. Live-Readiness-Box auf Kachelstatus umstellen.
2. Alte Safety-Gates nicht mehr als rote Live-Blocker anzeigen.
3. Klare Anzeige:
   - Kachel gefunden
   - Kachel aktiv
   - Action-Key korrekt
   - Live bereit
   - fachliche Blocker
4. Legacy-Werte höchstens unter technische Details.

## Nicht anfassen

```text
Overlay
Sound-System
Media-System
Slot-Datenbankstruktur
Cleanup-Logik
Textsets
SoundPool
Dashboard-Texte-Editor
```

## Test nach Umsetzung

```cmd
cd /d D:\Git\stream-control-center
node -c backend\modules\vip30.js
node -c htdocs\dashboard\modules\vip30.js
```

Danach:

```text
Node neu starten
VIP30 → Übersicht prüfen
Test-Redeem durchführen
Logs prüfen
Chatmeldung prüfen
Refund/Fulfill prüfen
```

## StepDone für diesen Plan

```cmd
cd /d D:\Git\stream-control-center
.\stepdone.cmd "VIP30 STEP8.19.21 Live-Safety Cleanup Plan"
```
