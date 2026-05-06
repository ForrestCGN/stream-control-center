# STEP193.12 - SoundAlerts Parser Formats Dashboard Editor

Stand: 2026-05-06

## Ziel

Die konfigurierbaren SoundAlerts-Parser-Formate sollen nicht nur technisch per API/DB-Setting vorhanden sein, sondern im Dashboard sichtbar und bedienbar werden.

## Geaendert

- `htdocs/dashboard/modules/soundalerts.js`
  - Bereich `Chat-Erkennung` unter `Bot & Settings` ergaenzt.
  - Bestehende Parser-Formate werden angezeigt.
  - Formate koennen aktiv/inaktiv geschaltet werden.
  - Regex, ID und Gruppen-Zuordnung koennen im erweiterten Bereich bearbeitet werden.
  - Button `Format hinzufuegen` ergaenzt.
  - Button `Standard wiederherstellen` ergaenzt.
  - Lokaler Test fuer Chattexte ergaenzt, ohne Event/DB-Eintrag anzulegen.
  - Beim Speichern werden `parser.messageFormats` ueber `/api/soundalerts/settings` gespeichert.

- `htdocs/dashboard/modules/soundalerts.css`
  - Layout fuer Parser-Formatkarten, Regex-Felder, Gruppenzuordnung und Testausgabe ergaenzt.

## Nicht geaendert

- Keine Backend-Logik.
- Keine API-Route.
- Keine DB-Schemaaenderung.
- Keine bestehende SoundAlerts-Funktionalitaet entfernt.

## Fachregel

Normale Nutzung:

- Formate aktiv/inaktiv schalten.
- Beispieltext lokal testen.
- Regex nur bearbeiten, wenn ein neues SoundAlerts-Chatformat wirklich anders ist.

Der lokale Test im Dashboard legt keinen Event-Log und keinen SoundAlert-Eintrag an. Echte Tests laufen weiterhin ueber SoundAlerts oder die bestehende Test-Chat-API.

## Betroffene Dateien

```text
htdocs/dashboard/modules/soundalerts.js
htdocs/dashboard/modules/soundalerts.css
```

## Test

```text
node --check htdocs/dashboard/modules/soundalerts.js
```

## Nach Deploy pruefen

1. Dashboard oeffnen.
2. `System > SoundAlerts > Bot & Settings` oeffnen.
3. Bereich `Chat-Erkennung` pruefen.
4. Testtext pruefen:
   - `ForrestCGN spielt Lily was here fuer 0 Bits!`
   - `ForrestCGN loest Airhorn mit 0 Bits aus`
5. Speichern.
6. `/api/soundalerts/status` pruefen, ob `parser.messageFormats` weiterhin als Objekt-Array erscheint.
