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
- [x] `LWG_GIVEAWAY_EXCLUSIONS_1` eingespielt.
- [x] Datei `config/loyalty_giveaway_exclusions.json` ins Live-System übernommen und korrigiert.
- [x] `loyalty_giveaways` Status grün geprüft: Version `0.1.14`, Build `LWG_GIVEAWAY_EXCLUSIONS_1`.
- [x] Gewinn-Sperrliste aktiv: `enabled=true`, `count=10`.
- [x] Draw-Test mit Sperrliste durchgeführt.
- [x] Gesperrte User bleiben als Entry sichtbar.
- [x] Gesperrte User sind beim Draw nicht eligible.
- [x] Draw-Metadata enthält `exclusionInfo`.
- [x] Gesperrte User können nicht gewinnen.
- [x] Claim-/Wheel-Flow nach Exclusion-Draw erfolgreich getestet.
- [x] Bound-Wheel-Feldverbrauch nach Claim erfolgreich getestet.

## Bestätigter Exclusion-Test

```text
Giveaway: giveaway_1781865117837_a56d3fcb009a15a2
Entries:  una_solala, udowb, engelcgn
Excluded: una_solala
Winner:   udowb
Prize:    Roadside Research
Spin:     spin_1781865515072_d11827bafa8cd593
```

Fairness-/Exclusion-Info:

```text
rawEntriesCount=3
excludedEntriesCount=1
eligibleEntriesCount=2
excluded[0].userLogin=una_solala
excluded[0].reason=login
```

## Gewinn-Sperrliste / Exclusions – später

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
- [ ] Loader-Robustheit als `LWG_GIVEAWAY_EXCLUSIONS_1B` planen:
  - Exportformat `ok/items` akzeptieren,
  - Configformat `enabled/items` oder `enabled/users` akzeptieren,
  - BOM entfernen,
  - null-/kaputte Einträge ignorieren und im Status melden,
  - Debugfelder für `rawItemCount`, `validItemCount`, `invalidItemCount` ergänzen.

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
