# Current Status – stream-control-center / Loyalty-Giveaways / CGN-Glücksrad

Stand: 2026-06-19

## Aktueller Arbeitsstand

Step `LWG_BOUND_WHEEL_FIELD_COUNT_1` wurde als Datei-/ZIP-Stand vorbereitet.

Ziel dieses Steps ist die harte Runtime-Regel für Giveaway-bound Wheels, damit das System heute im Stream wie gewünscht läuft:

```text
2+ verfügbare Gewinne  → normaler Glücksrad-Spin mit exakt diesen verfügbaren Feldern
1 verfügbarer Gewinn   → kein normales Rad mehr, letzter Gewinn wird direkt im Backend vergeben
0 verfügbare Gewinne   → Claim/Spin blockieren
```

## Umgesetzte technische Regel

### `backend/modules/loyalty_games/wheel.js`

- Giveaway-bound Wheels werden anhand `source === "giveaway_bound_wheel"` erkannt.
- Für diese Quelle wird die visuelle Mindestfeldanzahl auf die echte verfügbare Feldanzahl gesetzt.
- Dadurch werden Giveaway-bound Wheels nicht mehr optisch auf 12 Felder aufgefüllt.
- Standalone-/Preset-Wheels behalten die bisherige `minVisibleSlots`-/Default-12-Logik.

### `backend/modules/loyalty_giveaways.js`

- Bound-Wheel-Kontext liefert `minVisibleSlots` nun passend zur echten verfügbaren Feldanzahl.
- Claim-Flow prüft die Anzahl verfügbarer Bound-Wheel-Felder:
  - `<= 0`: Block mit `bound_wheel_no_usable_fields`.
  - `1`: Direktvergabe ohne normalen Wheel-Spin.
  - `>= 2`: normaler Spin über `loyalty_games`.
- Direktvergabe setzt Permission auf `used`, Winner auf `wheel_completed`, schreibt `prize_label`, reduziert das Bound-Wheel-Feld und protokolliert das Ergebnis in Metadata.

### Modulversionen

```text
loyalty_giveaways: 0.1.13 / LWG_BOUND_WHEEL_FIELD_COUNT_1
loyalty_games:     0.2.8  / LWG_BOUND_WHEEL_FIELD_COUNT_1
```

## Vor dem Deploy empfohlen

Vor dem Einspielen im Live-System soll eine Sicherheitskopie der aktuell laufenden Dateien erstellt werden, damit notfalls sofort zurückkopiert werden kann.

Empfohlene Backup-Dateien:

```text
backend/modules/loyalty_giveaways.js
backend/modules/loyalty_games.js
backend/modules/loyalty_games/wheel.js
config/loyalty_games.json
htdocs/overlays/loyalty/wheel_overlay.html
```

## Wichtiges Follow-up / spätere Dashboard-Config

Diese heutige Lösung ist bewusst eine feste Runtime-Regel, damit das System im Stream sicher funktioniert.

Später muss dieses Verhalten dashboardfähig konfigurierbar gemacht werden:

- Verhalten bei `1` verbleibendem Gewinn konfigurierbar machen:
  - direkt vergeben,
  - separates Letzter-Gewinn-Overlay,
  - optional trotzdem Spin erlauben.
- Verhalten bei `0` verbleibenden Gewinnen streamerfreundlich anzeigen/blockieren.
- Exakte Feldanzahl für Giveaway-bound Wheels sauber von Standalone-/Preset-Wheels trennen.
- `minVisibleSlots` später als Dashboard-Option nur dort anbieten, wo sie fachlich sinnvoll ist.

## Nach Deploy zu testen

```text
node -c backend/modules/loyalty_games/wheel.js
node -c backend/modules/loyalty_games.js
node -c backend/modules/loyalty_giveaways.js
```

Runtime-Tests:

```text
2+ verfügbare Felder → Spin startet, visualFieldsCount entspricht fieldsCount
1 verfügbares Feld  → Direktvergabe, kein Wheel-Overlay-Spin
0 verfügbare Felder → Claim/Spin wird blockiert
```
