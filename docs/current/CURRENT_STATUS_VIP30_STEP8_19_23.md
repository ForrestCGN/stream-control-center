# VIP30 / 30 Tage VIP – CURRENT STATUS STEP8.19.23

Stand: 2026-06-07 10:40

## Aktueller Arbeitsstand

Wir haben das VIP30-System nach dem Live-Test und der Safety-Diskussion neu ausgerichtet.

Wichtigste Entscheidung:

```text
Die Kanalpunkte-Kachel ist die Wahrheit.
```

VIP30 erkennt die passende Kachel technisch über:

```text
actionType = vip30
actionKey  = vip30.redeem
queue      = vip30
```

Der sichtbare Titel, Preis und Prompt der Kachel sind keine Live-Sicherheitskriterien mehr.

## Zuletzt gebaute STEP-ZIPs

### STEP8.19.19 – Live-Readiness Dashboard

ZIP:

```text
VIP30_STEP8_19_19_live_readiness_dashboard.zip
```

Enthalten:

```text
backend/modules/vip30.js
htdocs/dashboard/modules/vip30.js
htdocs/dashboard/modules/vip30.css
docs/current/CURRENT_CHAT_HANDOFF_VIP30_STEP8_19_19_LIVE_READINESS_DASHBOARD.md
```

Ziel:

- Live-Bereitschaft im Dashboard anzeigen
- Ampeln für Reward/Live-Gates/Capability
- Backend liefert `liveReadiness`

### STEP8.19.20 – Chat-Ausgaben + Fehler-Refund

ZIP:

```text
VIP30_STEP8_19_20_chat_output_refund.zip
```

Enthalten:

```text
backend/modules/vip30.js
docs/current/CURRENT_CHAT_HANDOFF_VIP30_STEP8_19_20_CHAT_OUTPUT_REFUND.md
```

Ziel:

- Chatmeldungen bei Erfolg, Block, Fehler
- Bei Twitch-Grant-Fehler in Stage B wird versucht, Redemption zu canceln/refunden
- Keine Dashboard-/Overlay-Änderung

### STEP8.19.21 – Safety Cleanup Plan

ZIP:

```text
VIP30_STEP8_19_21_safety_cleanup_plan.zip
```

Enthalten:

```text
docs/current/CURRENT_CHAT_HANDOFF_VIP30_STEP8_19_21_SAFETY_CLEANUP_PLAN.md
docs/steps/CHANGELOG_VIP30_STEP8_19_21.md
project-state/VIP30_STEP8_19_21_NEXT_CHAT_SUMMARY.md
```

Ziel:

- Alle Safety-Entscheidungen dokumentieren
- Kein Code
- Grundlage für STEP8.19.22

### STEP8.19.22 – Backend Safety Cleanup

ZIP:

```text
VIP30_STEP8_19_22_backend_safety_cleanup.zip
```

Enthalten:

```text
backend/modules/vip30.js
docs/current/CURRENT_CHAT_HANDOFF_VIP30_STEP8_19_22_BACKEND_SAFETY_CLEANUP.md
```

Ziel:

- Alte Entwicklungs-Safetys aus harten Live-Blockern entfernen
- Kachelstatus als Wahrheit nutzen
- HTTP 200 nicht mehr als Fehler/OK=false behandeln
- Chat-/Refund-Fixes aus STEP8.19.20 beibehalten

## Aktuelle Ziel-Logik

### Harte Live-/Vorab-Blocker

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

Praktisch bedeutet das:

```text
VIP30-Kachel gefunden?
VIP30-Kachel aktiv?
Action-Type = vip30?
Action-Key = vip30.redeem?
Kachel im System aktiv?
Kachel auf Twitch aktiv?
Kachel nicht pausiert?
```

### Fachliche Blocker bleiben

```text
Userdaten fehlen/ungültig
User ist Streamer/Broadcaster
User ist Moderator
User ist bereits VIP
User hat bereits aktiven VIP30-Slot
Slots sind voll
Twitch-VIP-Vergabe schlägt fehl
Slot speichern schlägt fehl
```

### Nicht mehr harte VIP30-Live-Blocker

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

Diese Werte dürfen höchstens noch als Info/Warnung im Dashboard erscheinen.

## Live-Test-Erkenntnisse

Aus dem Test:

- YouneCraft hat beim ersten Redeem korrekt 30 Tage VIP erhalten.
- Slot wurde gespeichert.
- Redemption wurde fulfilled.
- Alert wurde als Sound-System-Bundle queued.
- Zweiter Redeem von YouneCraft wurde korrekt geblockt wegen `already_has_vip30_slot`.
- ForrestCGN/EngelCGN liefen auf Twitch-Fehler 422, wahrscheinlich bereits VIP oder Twitch lehnt Add-VIP ab.
- Es fehlten zunächst Chatmeldungen; das wurde mit STEP8.19.20 ergänzt.
- Zu viele Safety-Gates waren verwirrend und wurden mit STEP8.19.21 geplant sowie STEP8.19.22 backendseitig reduziert.

## Wichtig: Noch nicht final geprüft

STEP8.19.22 wurde gebaut und per `node -c` geprüft, muss aber im Live-System noch eingespielt und getestet werden.

Nach Einspielen:

```cmd
cd /d D:\Git\stream-control-center
node -c backend\modules\vip30.js
```

Dann:

```text
Deploy / Live aktualisieren
Node neu starten
VIP30 → Übersicht prüfen
Test-Redeem durchführen
Logs prüfen
Chatmeldung prüfen
Fulfill/Cancel prüfen
```

## Aktuell nicht anfassen

Bis STEP8.19.22 sauber getestet ist:

```text
Overlay
Sound-System
Media-System
Textsets
SoundPool
Cleanup
Slot-DB-Schema
Dashboard-Texte-Editor
```

## Bekannte nächste Aufgabe

Nächster Chat:

```text
STEP8.19.23 / STEP8.19.24 – Dashboard an neue Safety-Logik anpassen
```

Ziel:

- Live-Readiness-Box im Dashboard nicht mehr mit alten Safety-Gates rot machen
- Kachelstatus klar anzeigen
- Fachliche Blocker und echte Fehler getrennt anzeigen
- Legacy-Gates nur noch als Info/Details anzeigen
