# Next Steps – Loyalty-Giveaways / CGN-Glücksrad

Stand: 2026-06-19

## Aktueller bestätigter Stand

`LWG_GIVEAWAY_EXCLUSIONS_1` ist live bestätigt.

Bestätigt:

```text
loyalty_giveaways: 0.1.14 / LWG_GIVEAWAY_EXCLUSIONS_1
loyalty_games:     0.2.8  / LWG_BOUND_WHEEL_FIELD_COUNT_1
```

Live-Test Exclusions:

```text
Giveaway: giveaway_1781865117837_a56d3fcb009a15a2
Entries:  una_solala, udowb, engelcgn
Draw:     udowb gewann, una_solala wurde ausgeschlossen
Claim:    udowb drehte das gebundene Giveaway-Rad
Prize:    Roadside Research
Spin:     spin_1781865515072_d11827bafa8cd593
```

Damit sind bestätigt:

- Sperrliste wird geladen: `enabled=true`, `count=10`.
- Gesperrte User bleiben sichtbar als Entry.
- Gesperrte User werden beim Draw aus der eligible-Liste entfernt.
- `exclusionInfo` wird in Fairness-/Event-Metadata geschrieben.
- Wheel-Permission, Claim, Spin und Bound-Wheel-Feldverbrauch funktionieren danach weiter.

## Nächster sinnvoller Schritt

### LWG_GIVEAWAY_EXCLUSIONS_1B – Loader-Robustheit planen

Kein Notfall, aber sinnvoll vor Live-Nutzung über längere Zeit.

Ziel:

- Config-Loader robust gegen verschiedene Dateiformate machen.
- Exportformat und Configformat sauber akzeptieren.
- Kaputte/null-Einträge ignorieren statt komplette Sperrliste wirkungslos zu machen.
- Statusdiagnose verbessern.

Geplante Akzeptanzkriterien:

```text
Exportformat:
{ ok: true, items: [...] }

Configformat:
{ enabled: true, items: [...] }
{ enabled: true, users: [...] }
```

Status sollte später zusätzlich anzeigen:

```text
exists
enabled
rawItemCount
validItemCount
invalidItemCount
lastError
path
generatedAt
updatedAt
```

## Danach / später

- Dashboard-Editor für Sperrliste planen.
- DB-basierte Exclusions statt JSON-Datei.
- Pro-Giveaway Exclusions.
- Twitch-User-ID langfristig als primären Schlüssel in Entries speichern/nutzen.
- Wheel-1-Gewinn-Direktvergabe später gezielt testen, ohne produktive Gewinne unnötig zu verbrauchen.
- Wheel-Verhalten später dashboardfähig konfigurierbar machen.
