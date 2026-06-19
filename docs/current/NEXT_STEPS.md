# Next Steps – LWG Giveaway Exclusions 1B

Stand: 2026-06-19

## Aktueller Stand

`LWG_GIVEAWAY_EXCLUSIONS_1` ist live bestätigt.

Bestätigt:

```text
una_solala durfte teilnehmen, wurde beim Draw ausgeschlossen.
udowb wurde gezogen, konnte das Rad drehen und gewann Roadside Research.
Roadside Research wurde auf quantityRemaining=0 reduziert.
```

## Jetzt einspielen

### LWG_GIVEAWAY_EXCLUSIONS_1B

Ziel:

- Loader robuster machen.
- Exportformat und Configformat akzeptieren.
- UTF-8-BOM vor JSON-Parsing entfernen.
- Null-/kaputte Einträge ignorieren.
- Statusdiagnose erweitern.

Betroffene Dateien:

```text
backend/modules/loyalty_giveaways.js
config/loyalty_giveaway_exclusions.json
docs/current/CURRENT_STATUS.md
docs/current/TODO.md
docs/current/NEXT_STEPS.md
docs/current/CHANGELOG.md
docs/current/FILES.md
docs/current/CURRENT_CHAT_HANDOFF_LWG_GIVEAWAY_EXCLUSIONS_1B.md
docs/modules/loyalty_giveaways_CURRENT.md
project-state/CURRENT_STATUS_LWG_GIVEAWAY_EXCLUSIONS_1B.md
```

## Nach Deploy testen

1. Node neu starten.
2. Status prüfen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/giveaways/status" |
  Select-Object ok,module,moduleVersion,moduleBuild,enabled,lastError,giveawayExclusions |
  Format-List
```

Erwartet:

```text
moduleVersion=0.1.15
moduleBuild=LWG_GIVEAWAY_EXCLUSIONS_1B
giveawayExclusions.enabled=True
giveawayExclusions.count=10
giveawayExclusions.rawItemsCount=10
giveawayExclusions.ignoredInvalidCount=0
lastError=
```

## Danach / später

- Dashboard-Editor für Sperrliste planen.
- DB-basierte Exclusions statt JSON-Datei.
- Pro-Giveaway Exclusions.
- 1-Gewinn-Direktvergabe später gezielt testen.
