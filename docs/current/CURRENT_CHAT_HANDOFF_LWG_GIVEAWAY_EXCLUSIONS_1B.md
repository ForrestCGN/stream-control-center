# Current Chat Handoff – LWG Giveaway Exclusions 1B

Datum: 2026-06-19
Projekt: stream-control-center / Loyalty-Giveaways / CGN-Glücksrad

## Bestätigter Stand vor diesem Step

`LWG_GIVEAWAY_EXCLUSIONS_1` wurde live bestätigt.

Test-Giveaway:

```text
giveaway_1781865117837_a56d3fcb009a15a2
```

Test-Entries:

```text
una_solala   gesperrt
udowb        erlaubt
engelcgn     erlaubt
```

Draw-Ergebnis:

```text
winner.userLogin = udowb
eligibleEntriesCount = 2
exclusionInfo.enabled = true
exclusionInfo.configuredCount = 10
exclusionInfo.rawEntriesCount = 3
exclusionInfo.excludedEntriesCount = 1
exclusionInfo.excluded[0].userLogin = una_solala
exclusionInfo.excluded[0].reason = login
```

Wheel-Claim:

```text
permissionUid = wheelperm_1781865357312_f86f36711269e3e3
spinUid       = spin_1781865515072_d11827bafa8cd593
winner        = udowb
prize         = Roadside Research
status        = wheel_completed
```

## Neuer Step

```text
LWG_GIVEAWAY_EXCLUSIONS_1B
```

Ziel:

- Exclusion-Loader robust gegen Exportformat und Configformat machen.
- UTF-8-BOM entfernen.
- Null-/kaputte Einträge ignorieren.
- Statusdiagnose erweitern.

## Geänderte Dateien

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

## Später

- Dashboard-Editor für Sperrliste.
- DB-basierte Exclusions.
- Twitch-User-ID als Primärschlüssel.
- Pro-Giveaway zusätzliche Sperren.
