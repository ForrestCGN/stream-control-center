# STEP193.17.1 - SoundAlerts Filter Regression Fix

Stand: 2026-05-06

## Anlass

Nach STEP193.17 wurde der Filter im Tab `Eintraege` nicht mehr korrekt angewendet. Beispiel: Bei Auswahl `Aktiv` wurden weiterhin mehr bzw. falsche Eintraege angezeigt.

## Ursache

In `htdocs/dashboard/modules/soundalerts.js` existierte durch die letzten Dashboard-Umbauten eine zweite `ruleMatchesFilter`-Definition. Diese ueberschrieb die vorherige Filterlogik und nutzte bei Aufrufen ohne expliziten Parameter faelschlich den Fallback `all`.

Dadurch wurde der globale UI-Filter `ruleFilter` nicht mehr beruecksichtigt.

## Aenderung

- `ruleMatchesFilter` nutzt wieder den aktuellen globalen Filter, wenn kein expliziter Filterwert uebergeben wird.
- Die Filterauswertung verwendet wieder die zentrale Statuslogik `ruleStatusKey(rule)`.
- Filter funktionieren wieder fuer:
  - Alle
  - Aktiv
  - Inaktiv
  - Zur Pruefung
  - Datei fehlt
  - Ignoriert

## Betroffene Dateien

- `htdocs/dashboard/modules/soundalerts.js`
- `docs/current/CURRENT_SYSTEM_STATUS.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`
- `project-state/NEXT_STEPS.md`

## Tests

```text
node --check htdocs/dashboard/modules/soundalerts.js
```

Manueller Dashboard-Test:

```text
SoundAlerts > Eintraege > Filter wechseln
```

Erwartung:

- `Aktiv` zeigt nur aktive Eintraege.
- `Inaktiv` zeigt nur inaktive Eintraege.
- `Datei fehlt` zeigt nur unvollstaendige Eintraege.
- `Zur Pruefung` zeigt nur Review-Eintraege.

## Keine Aenderung

- Keine Backend-Aenderung.
- Keine API-Aenderung.
- Keine DB-Aenderung.
- Keine Funktionalitaet entfernt.
