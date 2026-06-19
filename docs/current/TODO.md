# TODO – Loyalty-Giveaways / CGN-Glücksrad

Stand: 2026-06-19

## Bestätigt / erledigt

- [x] `LWG_BOUND_WHEEL_FIELD_COUNT_1` live getestet.
- [x] Giveaway-bound Wheel füllt nicht mehr visuell auf 12 Felder auf.
- [x] Bound-Wheel-Spin nutzt bei 2+ verfügbaren Gewinnen exakt die verfügbaren Felder.
- [x] Live-Test: `fieldsCount=7`, `visualFieldsCount=7`, `visualMinVisibleSlots=7`.
- [x] Gewinn `Valheim` wurde korrekt reduziert; Restbestand danach `6`.
- [x] Single-Remaining-Regel im Backend vorbereitet: 1 verbleibender Gewinn wird direkt vergeben.
- [x] 0 verfügbare Gewinne werden backendseitig blockiert.
- [x] Bug erkannt: `una_solala` wurde im alten Draw gezogen, obwohl User nicht gewinnen darf.

## Aktueller Sofort-Step

- [ ] `LWG_GIVEAWAY_EXCLUSIONS_1` einspielen.
- [ ] Datei `config/loyalty_giveaway_exclusions.json` ins Repo/Live-System übernehmen.
- [ ] `loyalty_giveaways` Status grün prüfen: Version `0.1.14`, Build `LWG_GIVEAWAY_EXCLUSIONS_1`.
- [ ] Draw-Test mit Sperrliste durchführen:
  - gesperrte User bleiben als Entry sichtbar,
  - gesperrte User sind beim Draw nicht eligible,
  - Draw-Metadata enthält `exclusionInfo`,
  - gesperrte User können nicht gewinnen.

## Gewinn-Sperrliste / Exclusions

Dateibasierter Sofort-Fix:

```text
config/loyalty_giveaway_exclusions.json
```

Regel:

```text
User dürfen teilnehmen/sichtbar bleiben, können aber nicht gewinnen.
```

Offen für später:

- [ ] Dashboard-Editor für gesperrte User bauen.
- [ ] DB-basierte Verwaltung statt reiner JSON-Datei.
- [ ] Twitch-User-ID als primärer Schlüssel.
- [ ] Login/DisplayName als Anzeige/Fallback.
- [ ] Anzeige im Draw-/Log-Tab: `rawEntries`, `excludedEntries`, `eligibleEntries`.
- [ ] Optional pro Giveaway eigene zusätzliche Sperrliste.

## Später wieder anfassen – Dashboard-Config Wheel

Die Runtime-Wheel-Regel ist heute bewusst fest eingebaut, damit der Stream funktioniert.

Später muss das als streamerfreundliche Dashboard-Konfiguration umgesetzt werden:

- [ ] Verhalten bei 1 verbleibendem Gewinn konfigurierbar machen:
  - Direktvergabe,
  - separates Letzter-Gewinn-Overlay,
  - optional normaler Spin trotz 1 Feld.
- [ ] Verhalten bei 0 verfügbaren Gewinnen im Dashboard sichtbar machen.
- [ ] Exakte Feldanzahl vs. Mindestfeldanzahl getrennt konfigurieren:
  - Giveaway-bound Wheels: Standard exakt verfügbare Felder.
  - Standalone-/Preset-Wheels: `minVisibleSlots` weiter möglich.
- [ ] Späteres Letzter-Gewinn-Overlay planen, aber nicht heute erzwingen.

## Weitere offene Punkte

- [ ] Direkten Reset-/Hide-Test sauber möglich machen.
- [ ] Test-Giveaway nach Abschluss löschen oder eindeutig als Test markieren.
- [ ] Gamble-Alias-Bug separat prüfen: `aliases` zeigt `[object`, `object]`.
