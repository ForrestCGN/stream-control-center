# STEP287 – Alert Native Output bus_first Live-Test

Datum: 2026-05-24T13:30:00Z

## Ziel

Der in STEP285 vorbereitete und in STEP286 bereinigte native Alert Visual Output wurde im Modus `bus_first` live getestet.

Ziel war zu prüfen:

- Bus wird primär genutzt.
- Bridge rendert den Alert über `visual.alert.play`.
- Legacy-Fallback bleibt vorbereitet, greift aber nur bei Bus-Problem.
- Watchdog erhält weiterhin `finished`.
- Sound-/TTS-/Queue-Verhalten bleibt unverändert.

## Ausgangsstand

Vor STEP287 waren bestätigt:

- `legacy` bestanden.
- `legacy_and_bus` bestanden.
- Timing-/Status-Cleanup aus STEP286 bestätigt.
- Standard blieb `legacy`.

## Testmodus

Temporär gesetzt:

```text
alertOutput.mode = bus_first
```

Erwartetes Verhalten:

- `legacyEnabled = false`
- `legacyFallbackEnabled = true`
- `busEnabled = true`
- Alert wird primär über Communication Bus gesendet.
- Legacy-Fallback wird nur verwendet, wenn Bus-Ausgabe nicht erfolgreich ist.

## Bestätigtes Ergebnis

Live-Testwerte:

```text
mode = bus_first
legacyEnabled = false
legacyFallbackEnabled = true
busEnabled = true
communicationBusAvailable = true
lastMode = bus_first
lastBusEventId = evt_mpjta4cb_s3ktxhwf
errors = 0
playingToAlertOutputBusMs = 2
playingToOverlayMs = 3
```

Watchdog:

```text
status = acknowledged
ackEvent = finished
ackReason = finished
timedOut = false
issue = leer
overlayClientCountAtSend = 1
```

## Bewertung

`bus_first` ist technisch bestanden:

- Bus-Ausgabe funktioniert.
- Bridge rendert den Alert.
- `finished` kommt zurück.
- Watchdog erkennt die Ausgabe als erfolgreich.
- Kein Legacy-Fallback war nötig.
- Keine Watchdog-Issues.
- Keine Sound-/TTS-/Queue-Probleme sichtbar.

## Bewusst nicht geändert

- Keine Codeänderung gegenüber STEP286.
- Keine Sound-System-Änderung.
- Keine TTS-Änderung.
- Keine Queue-Änderung.
- Keine DB-Migration.
- Keine Overlay-Datei geändert.
- Keine Funktionalität entfernt.

## Sicherer Abschlusszustand

Nach dem Test soll der Betrieb wieder auf den sicheren Standard zurückgestellt werden:

```text
alertOutput.mode = legacy
```

## Nächster sinnvoller Schritt

Nicht direkt `bus_only` produktiv testen.

Empfohlen ist zuerst eine bessere Sichtbarkeit im Debug/Dashboard:

- aktueller `alertOutput.mode`
- letzter Output
- Bus-/Legacy-/Fallback-Ergebnis
- letzte Bus-Event-ID
- Watchdog-Ergebnis
- relevante Timing-Werte

Danach kann entschieden werden, ob `bus_first` länger als Testmodus genutzt oder `bus_only` in einer kontrollierten Testumgebung geprüft wird.
