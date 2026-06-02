# CAN-24.6 - Sound Shadow-DryRun Decision Closure

## Zweck

CAN-24.6 schliesst den bisherigen CAN-24 Block ab und entscheidet den naechsten sicheren Schritt.

## Aktueller Stand aus CAN-24

```text
CAN-24.0 Sound-Migrationskandidaten read-only vorbereitet
CAN-24.1 Kandidaten gegen Sound-DryRun validierbar gemacht
CAN-24.2 Kandidaten/DryRun im Dashboard sichtbar gemacht
CAN-24.3 Decision-Gate: keine produktive Migration
CAN-24.4 Shadow-DryRun vorbereitet
CAN-24.5 Shadow-DryRun Safety-Auswertung sichtbar gemacht
CAN-24.6 Decision Closure
```

## Entscheidung

Noch keine produktive Sound-Migration.

Freigegeben fuer den naechsten eigenen Schritt ist nur:

```text
Produktiver Shadow-DryRun-Mitulauf fuer genau einen ausgewaehlten Channelpoints-Sound-Reward vorbereiten.
```

Das bedeutet:

```text
Der bestehende produktive Legacy-Flow bleibt unveraendert.
Der echte Reward darf optional zusaetzlich einen Shadow-DryRun erzeugen.
Der Shadow-DryRun darf keinen Sound spielen, keine Queue beruehren und keine Redemption/Twitch-Aktion ausloesen.
Default muss aus oder streng auf einen Kandidaten begrenzt sein.
```

## Nicht freigegeben

```text
keine Umstellung auf sound.play.request als produktiver Pfad
kein Sound-Play ueber Bus
kein Queue-Clear
keine Reward-Ausfuehrung ueber neuen Bus-Pfad
keine Redemption-Fulfill-/Cancel-Aenderung
keine Twitch-Aktion
keine automatische Recovery
```

## Freigegebener naechster Step

```text
CAN-24.7: Channelpoints Sound Shadow-DryRun Mitlauf fuer genau einen Reward vorbereiten
```

## Anforderungen an CAN-24.7

```text
1. Nur ein explizit konfigurierter Reward-Key.
2. Default deaktiviert oder read-only vorbereitet.
3. Bestehender Legacy-Execute/EventSub-Flow bleibt produktiv unveraendert.
4. Shadow-DryRun laeuft nur diagnostisch.
5. Ergebnis wird in Shadow-Auswertung sichtbar.
6. Keine Queue, kein Sound, keine Twitch-/Redemption-Aenderung.
7. Saubere Abschaltmoeglichkeit.
```

## Empfohlene Umsetzung fuer CAN-24.7

```text
- Config/State-Felder:
  shadowDryRunAutoEnabled: false
  shadowDryRunRewardKey: ""
  shadowDryRunLastAutoResult: null

- Nur im Channelpoints-Modul.
- Noch kein Dashboard-Schalter, wenn dadurch versehentlich aktiviert werden koennte.
- Aktivierung nur per separatem spaeterem Go-Step oder expliziter Route mit klarer Safety.
```

## Sicherheitsstatus

```text
productiveMigration: false
legacyFlowUnchanged: true
soundPlay: false
queueTouched: false
rewardExecutedViaBus: false
redemptionChanged: false
twitchTouched: false
recovery: false
```

## Tests

```bat
node -c backend\modules\channelpoints.js
node -c backend\modules\overlay_monitor.js
node -c backend\modules\vip_sound_overlay.js
node -c backend\modules\alert_system.js
node -c backend\modules\sound_system.js
node -c backend\modules\bus_integration_matrix.js
node -c htdocs\dashboard\modules\bus_diagnostics.js
```

Alle Syntax-Checks waren erfolgreich.
