# Current Status – stream-control-center / Loyalty-Giveaways / CGN-Glücksrad

Stand: 2026-06-19

## Aktueller bestätigter Bereich

Step `LWG_GIVEAWAY_EXCLUSIONS_1B` wurde live getestet und bestätigt.

Bestätigt:

```text
loyalty_giveaways: 0.1.15 / LWG_GIVEAWAY_EXCLUSIONS_1B
loyalty_games:     0.2.8  / LWG_BOUND_WHEEL_FIELD_COUNT_1
```

## Bestätigte Wheel-Funktion

Step `LWG_BOUND_WHEEL_FIELD_COUNT_1` bleibt bestätigt:

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

## Gewinn-Sperrliste / Exclusions

Die dateibasierte Gewinn-Sperrliste ist aktiv:

```text
config/loyalty_giveaway_exclusions.json
```

Fachliche Regel:

```text
User dürfen als Entry sichtbar bleiben, sind aber beim Draw nicht eligible und können dadurch nicht gewinnen.
```

Live-Status nach `LWG_GIVEAWAY_EXCLUSIONS_1B`:

```text
moduleVersion = 0.1.15
moduleBuild   = LWG_GIVEAWAY_EXCLUSIONS_1B
giveawayExclusions.enabled = True
giveawayExclusions.count = 10
giveawayExclusions.rawItemsCount = 10
giveawayExclusions.ignoredInvalidCount = 0
giveawayExclusions.loaded = True
lastError =
```

## Bestätigter Exclusion-Test

Frisches Test-Giveaway:

```text
Giveaway:     giveaway_1781865117837_a56d3fcb009a15a2
Titel:        Test
Bound-Wheel:  giveawaywheel_1781865117837_3d9cfcef7469aef2
```

Test-Entries:

```text
una_solala   active  → gesperrt
udowb        active  → erlaubt
engelcgn     active  → erlaubt
```

Draw-Ergebnis:

```text
Winner: udowb
eligibleEntriesCount: 2
rawEntriesCount: 3
excludedEntriesCount: 1
excluded[0].userLogin: una_solala
excluded[0].reason: login
```

Claim-/Wheel-Ergebnis:

```text
Permission: wheelperm_1781865357312_f86f36711269e3e3
Spin:       spin_1781865515072_d11827bafa8cd593
Gewinn:     Roadside Research
Status:     wheel_completed
Feldverbrauch: Roadside Research quantityRemaining 1 → 0
fieldsCount=8, visualFieldsCount=8, giveawayBoundWheelExactFields=true
```

Damit ist bestätigt:

```text
una_solala durfte teilnehmen und blieb sichtbar,
wurde aber beim Draw ausgeschlossen und konnte nicht gewinnen.
Der erlaubte User udowb konnte danach normal das Giveaway-Rad drehen.
```

## 1B-Sicherheitsfix

`LWG_GIVEAWAY_EXCLUSIONS_1B` macht den Loader robuster, ohne die bestätigte Draw-/Wheel-Logik zu verändern:

```text
- Exportformat ok:true + items[] wird akzeptiert.
- Configformat enabled:true + items[] wird akzeptiert.
- users[] und exclusions[] werden ebenfalls akzeptiert.
- UTF-8-BOM wird entfernt.
- kaputte/null-Einträge werden ignoriert.
- Status zeigt rawItemsCount, ignoredInvalidCount, loaded, mtimeMs.
```

## Später wieder anfassen – Dashboard-Config

Die Gewinn-Sperrliste ist aktuell bewusst dateibasiert, damit der Stream sicher läuft.

Später muss daraus eine dashboardfähige Verwaltung werden:

- User hinzufügen/entfernen/aktivieren/deaktivieren.
- Twitch-User-ID primär speichern und nutzen.
- Login/DisplayName als Anzeige und Fallback behalten.
- Sichtbar machen, wie viele Entries beim Draw durch Sperrliste ausgeschlossen wurden.
- Optional pro Giveaway zusätzliche Sperren erlauben.

Auch die harte Wheel-Regel muss später dashboardfähig konfigurierbar werden:

- Verhalten bei 1 verbleibendem Gewinn.
- Verhalten bei 0 verbleibenden Gewinnen.
- Exakte Feldanzahl vs. Mindestfeldanzahl getrennt für Bound-Wheels und Standalone-/Preset-Wheels.
