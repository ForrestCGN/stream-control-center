# CAN-25.4 - Dokumentation aktualisiert und Chat-Handoff

## Zweck

CAN-25.4 konsolidiert den aktuellen Arbeitsstand vor dem Wechsel in einen neuen Chat.

Dieser Schritt dokumentiert:

```text
aktueller Stand
Testergebnis CAN-25.3
bekannter Fehler
offene TODOs
naechster sinnvoller Schritt
Sicherheitsgrenzen
Uebergabe fuer neuen Chat
```

## Aktueller Stand

CAN-24 ist als Sound-Shadow-Stufe abgeschlossen.

CAN-25 hat begonnen, die Dashboard-/Bus-Diagnose fuer Sound-Shadow zu verbessern.

Bis CAN-25.3 wurde eine read-only Sound-Shadow Summary Card vorbereitet und ein lokaler Check durchgefuehrt.

## CAN-25.3 Ergebnis

Der lokale Check bestaetigt:

```text
Backend laeuft
Bus-Matrix erreichbar
Channelpoints-Daten vorhanden
Sound-Shadow Auto-Status erreichbar
Sound-Migration-Candidates erreichbar
read-only Check ausgefuehrt
kein Sound-Play
keine Queue-Aktion
keine Twitch-/Redemption-Aktion
keine Migration
kein Enable/Disable
```

## Bestaetigte Backend-/Matrix-Daten

Die Bus-Matrix enthaelt im `channelpoints` Row die benoetigten Werte:

```text
channelpointsSoundShadowAutoEnabled: false
channelpointsSoundShadowAutoRewardKey: bauernweisheit
channelpointsSoundShadowAutoCandidateFound: true
channelpointsSoundShadowAutoHookInstalled: true
channelpointsSoundShadowAutoAttempts: 1
channelpointsSoundShadowAutoOkCount: 1
channelpointsSoundShadowAutoFailedCount: 0
channelpointsSoundShadowAutoLastAccepted: true
```

Ausserdem:

```text
channelpointsSoundCandidatesOk: true
channelpointsMigrationCandidateTotal: 28
channelpointsMigrationCandidateReady: 28
channelpointsFirstCandidateRewardKey: bauernweisheit
channelpointsSoundDryRunAccepted: true
channelpointsSoundShadowQueueTouched: false
channelpointsSoundShadowSoundTouched: false
channelpointsSoundShadowRewardExecuted: false
channelpointsSoundShadowRedemptionChanged: false
channelpointsSoundShadowTwitchTouched: false
```

## Bekannter Fehler

Die neue Sound-Shadow Summary Card findet aktuell keine Daten und zeigt:

```text
Sound-Shadow Status
keine Daten
Keine Sound-Shadow-Daten in der aktuellen Bus-Matrix gefunden.
```

## Ursache

Die Card sucht die Daten an der falschen Stelle.

Die echte Struktur liegt in:

```text
matrix.rows[] mit id === "channelpoints"
```

Die relevanten Daten liegen dort als flache Felder:

```text
channelpointsSoundShadowAutoEnabled
channelpointsSoundShadowAutoRewardKey
channelpointsSoundShadowAutoCandidateFound
channelpointsSoundShadowAutoHookInstalled
channelpointsSoundShadowAutoAttempts
channelpointsSoundShadowAutoOkCount
channelpointsSoundShadowAutoFailedCount
channelpointsSoundShadowAutoLastAccepted
```

## Naechster technischer Schritt

```text
CAN-25.5: Sound-Shadow Summary Card an echte Bus-Matrix-Row-Struktur anpassen.
```

Technische Richtung:

```text
pickSoundShadowStatus(matrix) muss matrix.rows.find(row => row.id === "channelpoints") nutzen.
Die flachen channelpointsSoundShadow*-Felder muessen in ein internes Shadow-ViewModel gemappt werden.
```

## Geplante Dateien fuer CAN-25.5

Voraussichtlich nur:

```text
htdocs/dashboard/modules/bus_diagnostics.js
```

Optional bei Layoutbedarf:

```text
htdocs/dashboard/modules/bus_diagnostics.css
```

## Nicht in CAN-25.5 vermischen

Die grosse Systeme-Tabelle ist aktuell sehr hoch/luftig und schwer lesbar. Das ist ein separates Layout-Thema.

Nicht zusammen mit dem Sound-Shadow-Datenfix vermischen.

Empfohlener spaeterer Schritt:

```text
CAN-26.0 oder CAN-25.6: Bus-Matrix Systeme-Tabelle kompakter machen.
```

## Sicherheitsgrenzen

Weiterhin blockiert:

```text
keine produktive Sound-Bus-Migration
kein produktiver Sound-Bus-Play
kein Hook fuer alle Rewards
kein EventSub-/Twitch-Redemption-Test
keine Queue-Aktion
keine Twitch-/Redemption-Aenderung
kein Enable/Disable Button
kein Test-Button
kein Execute-Test Button
kein Migration-Button
```

## Lokaler Check fuer neuen Chat

Nach dem Fix erneut ausfuehren:

```bat
tools\can25_3_dashboard_shadow_check.cmd
```

Danach Dashboard/Bus-Diagnostics pruefen:

```text
Sound-Shadow Status Card sichtbar
Reward-Key bauernweisheit sichtbar
enabled false sichtbar
Hook installed ja sichtbar
Attempts 1 sichtbar
OK 1 sichtbar
Failed 0 sichtbar
Last accepted ja sichtbar
Safety Flags gruen/ok
keine Buttons
```

## Bewertung

CAN-25.4 ist reine Dokumentation und Handoff.

Keine Code-Logik wurde geaendert.
Keine produktive Aktion wurde ausgefuehrt.
