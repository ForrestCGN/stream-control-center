# Current Status – stream-control-center / Loyalty-Giveaways / CGN-Glücksrad

Stand: 2026-06-19

## Aktueller bestätigter Bereich

Step `LWG_GIVEAWAY_EXCLUSIONS_1` wurde live getestet und fachlich bestätigt.

Bestätigt:

```text
loyalty_giveaways: 0.1.14 / LWG_GIVEAWAY_EXCLUSIONS_1
loyalty_games:     0.2.8  / LWG_BOUND_WHEEL_FIELD_COUNT_1
```

## Gewinn-Sperrliste / Exclusions

Config-Datei:

```text
config/loyalty_giveaway_exclusions.json
```

Live-Status nach Korrektur der Config:

```text
giveawayExclusions.enabled = True
giveawayExclusions.count   = 10
lastError                  = leer
```

Fachliche Regel:

```text
User dürfen am Giveaway teilnehmen und bleiben als Entry sichtbar.
Gesperrte User werden erst beim Draw aus der eligible-Liste entfernt.
Gesperrte User können dadurch nicht gewinnen.
```

Sauberer Test mit frischem Test-Giveaway:

```text
Giveaway:        giveaway_1781865117837_a56d3fcb009a15a2
Titel:           Test
Bound-Wheel:     giveawaywheel_1781865117837_3d9cfcef7469aef2
Entries:         una_solala, udowb, engelcgn
Gesperrt:        una_solala
Draw-Gewinner:   udowb
Wheel-Permission: wheelperm_1781865357312_f86f36711269e3e3
Spin:            spin_1781865515072_d11827bafa8cd593
Gewinn:          Roadside Research
```

Draw-Fairness bestätigte:

```text
eligibleEntriesCount = 2
rawEntriesCount      = 3
excludedEntriesCount = 1
excluded[0].userLogin = una_solala
excluded[0].reason    = login
```

Claim-/Wheel-Test bestätigte:

```text
permission.status = used
winner.status     = wheel_completed
winner.prizeLabel = Roadside Research
Roadside Research quantityRemaining: 1 -> 0
fieldsCount        = 8
visualFieldsCount  = 8
giveawayBoundWheelExactFields = true
```

Damit ist bestätigt: Die Gewinn-Sperrliste greift im Draw, ohne Entries unsichtbar zu machen, und der anschließende Giveaway-bound Wheel-Flow bleibt funktionsfähig.

## Vorher bestätigter Wheel-Stand

Step `LWG_BOUND_WHEEL_FIELD_COUNT_1` wurde vorher live getestet und bestätigt.

```text
2+ verfügbare Gewinne  → normaler Glücksrad-Spin mit exakt diesen verfügbaren Feldern
1 verfügbarer Gewinn   → Codepfad vorbereitet: Direktvergabe ohne normalen Wheel-Spin
0 verfügbare Gewinne   → Codepfad vorbereitet: Claim/Spin blockiert
```

Live-Test mit Giveaway `giveaway_1781856708568_9653eba68a211017`:

```text
Vor Test: 8 Bound-Wheel-Felder, davon 7 verfügbar
Claim für urlug → Gewinn Valheim
Spin-Metadata: fieldsCount=7, visualFieldsCount=7, visualMinVisibleSlots=7
Nach Test: Roadside Research=0, Valheim=0, verfügbar=6
```

Damit ist bestätigt: Giveaway-bound Wheels werden nicht mehr optisch auf 12 Felder aufgefüllt.

## Wichtiger Bug-Fund / erledigt

`una_solala` wurde im alten Draw als Gewinner gezogen, obwohl dieser User laut Sperrliste nicht gewinnen darf.

Beobachtung alter Draw:

```text
eligibleEntriesCount=5
Winner=una_solala
```

`LWG_GIVEAWAY_EXCLUSIONS_1` behebt diesen Draw-Eligibility-Teil. Der frische Test bestätigt, dass `una_solala` bei aktiver Sperrliste nicht mehr gewinnen kann.

## Später wieder anfassen – Robustheit / Dashboard-Config

Die Gewinn-Sperrliste ist aktuell bewusst dateibasiert, damit der Stream sicher läuft.

Später muss daraus eine dashboardfähige Verwaltung werden:

- User hinzufügen/entfernen/aktivieren/deaktivieren.
- Twitch-User-ID primär speichern und nutzen.
- Login/DisplayName als Anzeige und Fallback behalten.
- Sichtbar machen, wie viele Entries beim Draw durch Sperrliste ausgeschlossen wurden.
- Optional pro Giveaway zusätzliche Sperren erlauben.
- Loader robuster machen: Exportformat, Configformat, BOM, null-/kaputte Einträge sauber behandeln.

Auch die harte Wheel-Regel muss später dashboardfähig konfigurierbar werden:

- Verhalten bei 1 verbleibendem Gewinn.
- Verhalten bei 0 verbleibenden Gewinnen.
- Exakte Feldanzahl vs. Mindestfeldanzahl getrennt für Bound-Wheels und Standalone-/Preset-Wheels.
