# Current Chat Handoff - CAN25.4

## Projekt

ForrestCGN stream-control-center

## Aktueller Stand

CAN-25.4 abgeschlossen: Dokumentation aktualisiert, TODO/Status/Next Steps fuer neuen Chat konsolidiert.

## Letzter technischer Stand

CAN-25.3 stellte einen lokalen read-only Check fuer die Sound-Shadow Summary Card bereit.

Datei:

```text
tools/can25_3_dashboard_shadow_check.cmd
```

CAN-25.2 hatte die read-only Sound-Shadow Summary Card eingebaut.

Geaenderte Dateien aus CAN-25.2:

```text
htdocs/dashboard/modules/bus_diagnostics.js
htdocs/dashboard/modules/bus_diagnostics.css
```

## Aktuelles Testergebnis

Der CAN-25.3 Check lief read-only sauber.

Bestaetigt:

```text
Backend ok
Bus-Matrix ok
Channelpoints Daten vorhanden
Shadow Auto-Status ok
Sound-Migration Candidates ok
keine produktive Aktion
```

## Bekannter Fehler

Die Sound-Shadow Summary Card zeigt aktuell:

```text
keine Daten
```

obwohl die Daten vorhanden sind.

## Ursache

Die Card sucht Daten an der falschen Stelle.

Richtig ist:

```text
matrix.rows.find(row => row.id === "channelpoints")
```

und dann die flachen Felder lesen:

```text
channelpointsSoundShadowAutoEnabled
channelpointsSoundShadowAutoRewardKey
channelpointsSoundShadowAutoCandidateFound
channelpointsSoundShadowAutoHookInstalled
channelpointsSoundShadowAutoAttempts
channelpointsSoundShadowAutoOkCount
channelpointsSoundShadowAutoFailedCount
channelpointsSoundShadowAutoLastAccepted
channelpointsSoundShadowQueueTouched
channelpointsSoundShadowSoundTouched
channelpointsSoundShadowRewardExecuted
channelpointsSoundShadowRedemptionChanged
channelpointsSoundShadowTwitchTouched
channelpointsSoundDryRunResult
```

## Naechster Schritt im neuen Chat

```text
CAN-25.5: Sound-Shadow Summary Card an echte Bus-Matrix-Row-Struktur anpassen.
```

## Wichtige Regel fuer CAN-25.5

Nur read-only UI-Fix.

Nicht bauen:

```text
kein Enable/Disable Button
kein Test-Button
kein Execute-Test Button
kein Sound-Play Button
kein Queue-Reset
kein Migration-Button
keine produktive Sound-Bus-Migration
```

## Danach testen

```bat
tools\can25_3_dashboard_shadow_check.cmd
```

Dashboard pruefen:

```text
Sound-Shadow Status Card befuellt
Reward-Key: bauernweisheit
enabled: aus/false
Hook installed: ja
Attempts: 1
OK: 1
Failed: 0
Last accepted: ja
Safety Flags: ok
keine Buttons
```

## Separates spaeteres Thema

Die Systeme-Tabelle in der Bus-Matrix ist sehr hoch/luftig und schwer lesbar.

Das bitte spaeter separat angehen, nicht mit dem Daten-Fix vermischen.
