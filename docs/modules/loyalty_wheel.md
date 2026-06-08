# Loyalty Wheel / CGN Glücksrad

Stand: 2026-06-08  
Version: 0.2.0  
STEP: LWG-4B

## Zweck

Das Wheel kann jetzt entweder wie bisher aus der Config drehen oder optional ein Datenbank-Preset verwenden.

## Presets

Presets speichern Felder/Gewinne:

```text
loyalty_wheel_presets
loyalty_wheel_fields
```

Beim ersten Start wird automatisch ein Standard-Preset aus `config/loyalty_games.json` erzeugt, falls noch kein Preset existiert.

## Drehungen

Ein einzelner Rad-Dreh wird intern als Spin gespeichert, wenn ein Preset benutzt wird:

```text
loyalty_wheel_spins
```

Im Dashboard sollte das spaeter als `Dreh-Verlauf` bezeichnet werden.

## Regeln

```text
- Spin ohne presetUid bleibt kompatibel.
- Spin mit presetUid nutzt DB-Felder.
- Gewinnmengen werden bei begrenzten Feldern reduziert.
- Wenn keine Gewinne/Felder mehr verfuegbar sind, wird ein Preset exhausted.
- Finished/exhausted/deleted Presets sind read-only.
```

## Tests

```powershell
$p = Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/games/wheel/presets"
$p.rows | Select-Object presetUid,name,status,presetType,minVisibleSlots

$presetUid = $p.rows[0].presetUid
$r = Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/games/wheel/spin?presetUid=$presetUid&login=forrestcgn&displayName=ForrestCGN&duration=5000"
$r | Select-Object ok,presetUid,spinUid,sessionUid,selectedFieldLabel,durationMs
```

## Noch nicht umgesetzt

```text
- Preset Editor im Dashboard
- Giveaway-Editor
- Kanalpunkte-/Command-Ausloesung
- Reward-Ausfuehrung
```
