# NEXT STEPS - stream-control-center

Stand: RDAP_UI2_READONLY_COMFORT_LIVE_CONFIRMED
Datum: 2026-06-24

## Abgeschlossen

```text
RDAP_UI2_READONLY_COMFORT_LIVE_CONFIRMED
```

Live bestätigt:

- `https://mods.forrestcgn.de/` lädt die UI
- Service online sichtbar
- Auto-Refresh sichtbar
- letzte Aktualisierung sichtbar
- Schnellstatus sichtbar
- Read-only Hinweis sichtbar
- Writes/OAuth/Agent disabled sichtbar

## Nächster sinnvoller Schritt

Option A:

```text
RDAP_UI3_READONLY_DETAILS_OR_FILTERS
```

Möglicher Inhalt:

- read-only Filter/Details für Routen
- kompakter Diagnosebereich für Lock/Audit/Schema
- optional einklappbare Karten
- keine Schreibaktionen
- keine Login-/OAuth-Aktivierung

Option B:

```text
RDAP_AUTH_LOGIN_OAUTH_PLAN
```

Nur Planung, noch keine Aktivierung.

Wichtig:

- Login/OAuth/Auth darf nicht nebenbei aktiviert werden.
- Auth muss eigener Scope mit Plan, Rechtekonzept, Security-Prüfung und Tests werden.
