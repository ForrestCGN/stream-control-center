# STEP193.7 - SoundAlerts Overview Dashboard

Stand: 2026-05-06

## Ziel

Die SoundAlerts-Übersichtsseite wurde übersichtlicher aufgebaut, damit die wichtigsten Zustände und Schnellaktionen direkt auf der Startseite sichtbar sind.

## Betroffene Dateien

- `htdocs/dashboard/modules/soundalerts.js`
- `htdocs/dashboard/modules/soundalerts.css`
- `docs/current/CURRENT_SYSTEM_STATUS.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`
- `project-state/NEXT_STEPS.md`

## Änderungen

- Übersicht zeigt jetzt kompakte Kennzahlen:
  - Gesamt
  - Aktiv
  - Inaktiv
  - Datei fehlt
  - Ignoriert
  - Datei gefunden
- Übersicht zeigt weiterhin wichtige Systemwerte:
  - Modulstatus
  - WebSocket-Status
  - Bot-Login
  - Events DB
  - Nicht eingerichtet
  - Datei fehlt Events
- Neue Übersichtskarte `Letzte 5 Events` ergänzt.
- Letzte 5 Events können direkt aus der Übersicht erneut gestartet werden, sofern eine Datei vorhanden ist.
- Aus der Übersicht kann direkt zum passenden Eintrag gewechselt oder ein Eintrag aus einem unbekannten Event erstellt werden.
- Vollständige Events und vollständige Statistik bleiben in ihren eigenen Tabs.
- Die Übersichtsseite zeigt nicht mehr zusätzlich die komplette Eventliste und Statistikliste, damit sie schlanker bleibt.

## Bewusst nicht geändert

- Keine Backend-Änderung.
- Keine API-Änderung.
- Keine DB-Änderung.
- Keine Änderung an SoundAlerts-Bridge-Logik.
- Keine Änderung an Upload-/Delete-/Ignore-Funktionalität.
- Keine neue Filterfunktion für Einträge. Das bleibt ein möglicher Folgeschritt.

## Test

Lokal geprüft:

```text
node --check htdocs/dashboard/modules/soundalerts.js
```

Erwarteter Dashboard-Test nach Deploy:

```text
System > SoundAlerts > Übersicht
```

Prüfen:

- Kennzahlen werden angezeigt.
- Letzte 5 Events werden angezeigt.
- `Neu starten` funktioniert bei Events mit Datei.
- `Bearbeiten` springt zum richtigen Eintrag.
- `Eintrag erstellen` funktioniert bei unbekannten Events.
- Tabs `Events`, `Statistik`, `Einträge` funktionieren weiterhin.
