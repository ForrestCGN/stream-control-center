# CAN-24.3 - Sound Migration Decision Gate

## Zweck

CAN-24.3 entscheidet den naechsten sicheren Migrationskandidaten nach CAN-24.0 bis CAN-24.2.

## Entscheidung

Es wird **noch keine produktive Sound-Migration** freigegeben.

Freigegeben fuer den naechsten Schritt ist nur:

```text
Shadow-/Dry-Run-Caller vorbereiten
```

Das bedeutet:

```text
Ein echter produktiver Caller darf zusaetzlich einen Dry-Run-Payload erzeugen/validieren.
Der bestehende produktive Legacy-Flow bleibt unveraendert.
Sound-Play bleibt auf dem bestehenden Weg.
Dry-Run darf niemals Sound oder Queue ausloesen.
```

## Nicht erlaubt

```text
keine produktive Umstellung auf sound.play.request
kein Sound-Play ueber Bus-Testbutton
keine Queue-Mutation
kein Queue-Clear
keine Reward-Ausfuehrung ueber neuen Bus-Pfad
keine Redemption-Aenderung
keine Twitch-Fulfill-/Cancel-Aktion
keine automatische Recovery
```

## Erlaubter naechster technischer Schritt

```text
CAN-24.4: Channelpoints Sound Shadow-DryRun vorbereiten
```

## Ziel von CAN-24.4

```text
Bei einem ausgewaehlten Sound-Kandidaten kann parallel zum bestehenden Legacy-Flow ein diagnostischer Dry-Run-Payload vorbereitet werden.
Der produktive Legacy-Flow bleibt weiter aktiv.
Der Shadow-DryRun muss abschaltbar/konfigurierbar bleiben.
Default: aus oder read-only/manuell, nicht automatisch fuer alle Rewards.
```

## Sicherheitskriterien fuer CAN-24.4

```text
dryRunOnly: true
productiveExecutionUnchanged: true
soundPlay: false
queueTouched: false
redemptionChanged: false
twitchTouched: false
eventBusEmit: false oder nur Diagnose, wenn explizit so gebaut
```

## Empfohlene Implementationsrichtung

1. Eine kleine Kandidaten-/Shadow-Config im Channelpoints-Modul vorbereiten.
2. Noch keinen automatischen Hook in EventSub/Execute.
3. Erst eine manuelle Dashboard-/API-Ausloesung fuer den konkreten Kandidaten.
4. Ergebnis sichtbar machen.
5. Danach separat entscheiden, ob Shadow-DryRun beim echten EventSub-Redemption-Eingang mitlaufen darf.

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
