# STEP193.7.1 - SoundAlerts Inaktiv/Filter Fix

Stand: 2026-05-06

## Ziel

SoundAlerts-Dashboard fachlich korrigieren und Einträge schneller filterbar machen.

## Geändert

- `htdocs/dashboard/modules/soundalerts.js`
  - `enabled: false` zählt nicht mehr automatisch als „Einrichtung nötig“.
  - Einrichtung nötig ist nur noch bei fehlendem SoundAlerts-Namen oder fehlender/Platzhalter-Datei.
  - Inaktive, vollständig konfigurierte Einträge gelten als bewusst deaktiviert.
  - Einträge-Tab hat jetzt einen Filter: `Alle`, `Aktiv`, `Inaktiv`, `Datei fehlt`, `Ignoriert`.
  - KPI-Klicks in der Übersicht öffnen den passenden Eintragsfilter.
- `htdocs/dashboard/modules/soundalerts.css`
  - Styling für die neue Filter-Zeile ergänzt.

## Nicht geändert

- Keine Backend-Änderung.
- Keine API-Änderung.
- Keine DB-/Schema-Änderung.
- Keine Sound-/Video-Ausgabe geändert.
- Keine bestehende Funktionalität entfernt.

## Fachregel

```text
Inaktiv = bewusst deaktiviert und keine offene Einrichtung, solange Name und Datei vorhanden sind.
Einrichtung nötig = Name fehlt oder Datei/Platzhalter-Datei fehlt.
Ignored = bewusst ignoriert und wird nicht erneut als offener Auto-Eintrag angelegt.
```

## Test

```text
node --check htdocs/dashboard/modules/soundalerts.js
```

Dashboard-Test:

```text
System > SoundAlerts > Einträge
Filter Alle/Aktiv/Inaktiv/Datei fehlt/Ignoriert prüfen.
```
