# NEXT_STEPS

## Direkt naechster Schritt im neuen Chat

```text
CAN-25.5: Sound-Shadow Summary Card an echte Bus-Matrix-Row-Struktur anpassen.
```

## Technischer Kern

In `htdocs/dashboard/modules/bus_diagnostics.js`:

```text
pickSoundShadowStatus(matrix)
```

so erweitern/korrigieren, dass es den Channelpoints-Row findet:

```text
matrix.rows.find(row => row.id === "channelpoints")
```

und daraus ein internes Shadow-ViewModel erzeugt.

## Erwartete sichtbare Felder

```text
Reward-Key: bauernweisheit
enabled: false / aus
candidateFound: true
hookInstalled: true
attempts: 1
okCount: 1
failedCount: 0
lastAccepted: true
queueTouched: false
soundTouched: false
rewardExecuted: false
redemptionChanged: false
twitchTouched: false
productiveMigration: false
```

## Danach testen

```bat
tools\can25_3_dashboard_shadow_check.cmd
```

und Dashboard screenshot/Feedback pruefen.

## Nicht mit CAN-25.5 vermischen

```text
Systeme-Tabelle kompakter machen
produktive Migration
weiterer Reward
EventSub-Test
Buttons fuer Enable/Test/Migration
```
