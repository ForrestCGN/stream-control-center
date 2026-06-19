# Module Current – loyalty_giveaways / Giveaway-bound Wheel

Stand: 2026-06-19

## Aktueller Modulstand

Aktueller vorbereiteter Step:

```text
LWG_BOUND_WHEEL_FIELD_COUNT_1
```

Modulversionen:

```text
loyalty_giveaways: 0.1.13 / LWG_BOUND_WHEEL_FIELD_COUNT_1
loyalty_games:     0.2.8  / LWG_BOUND_WHEEL_FIELD_COUNT_1
```

## Zweck

`loyalty_giveaways` verwaltet Loyalty-Giveaways, Entries, Gewinner, Chat-/Command-Runtime und gebundene Giveaway-Glücksräder.

## Giveaway-bound Wheel Regel

Für Giveaway-bound Wheels gilt ab diesem Step:

```text
2+ verfügbare Gewinne  → normaler Spin mit exakt diesen verfügbaren Feldern
1 verfügbarer Gewinn   → Direktvergabe im Backend, kein normaler Wheel-Spin
0 verfügbare Gewinne   → Claim/Spin blockieren
```

## Technische Umsetzung

### `loyalty_giveaways.js`

- Prüft vor dem Wheel-Claim die Anzahl verfügbarer Bound-Wheel-Felder.
- Verhindert Claims ohne verfügbare Felder.
- Vergibt den letzten Gewinn direkt, ohne `loyalty_games`-Spin zu starten.
- Setzt Permission auf `used`.
- Setzt Winner auf `wheel_completed`.
- Speichert `prize_label` und `wheelResult`-Metadata.
- Reduziert das gewonnene Bound-Wheel-Feld.

### `loyalty_games/wheel.js`

- Erkennt Giveaway-bound Spins über `source === "giveaway_bound_wheel"`.
- Setzt die visuelle Mindestanzahl auf die echte Feldanzahl.
- Standalone-/Preset-Wheels behalten ihre bisherige Mindestfeld-/12er-Logik.

## Bewusst noch nicht umgesetzt

Heute wurde keine Dashboard-Config gebaut.

Das Verhalten soll später dashboardfähig werden:

- Verhalten bei 1 verbleibendem Gewinn auswählbar machen.
- Optionales Letzter-Gewinn-Overlay ermöglichen.
- Verhalten bei 0 verfügbaren Gewinnen im Dashboard anzeigen.
- `minVisibleSlots` nur dort als Option zeigen, wo es fachlich sinnvoll ist.

## Relevante Routen

```text
GET  /api/loyalty/giveaways/status
GET  /api/loyalty/games/status
GET  /api/loyalty/giveaways/:giveawayUid/wheel/bound
GET  /api/loyalty/giveaways/:giveawayUid/wheel/bound/fields
GET  /api/loyalty/giveaways/:giveawayUid/wheel/permissions
POST /api/loyalty/giveaways/:giveawayUid/wheel/claim
POST /api/loyalty/games/wheel/spin
```

## Nach Deploy zu bestätigen

- `fieldsCount === visualFieldsCount` bei Giveaway-bound Spins.
- 1 verbleibendes Feld führt zu Direktvergabe.
- 0 verbleibende Felder blockieren sauber.
- Bestehender normaler Wheel-/Overlay-Flow bleibt bei 2+ Feldern erhalten.
