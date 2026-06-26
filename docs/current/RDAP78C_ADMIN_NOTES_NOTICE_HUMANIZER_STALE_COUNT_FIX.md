# RDAP78C_ADMIN_NOTES_NOTICE_HUMANIZER_STALE_COUNT_FIX

Datum: 2026-06-26  
Projekt: `stream-control-center` / Remote-Modboard / RDAP  
Art: Frontend-only Korrekturstep

## Anlass

RDAP78/RDAP78B haben den Zieluser-Kontext der Admin-Notizen verbessert. Im Browser blieb aber bei EngelCGN weiterhin ein falscher Count sichtbar:

```text
Admin-Notizen fuer EngelCGN
4 Notizen geladen
```

Die Liste selbst war leer bzw. gefiltert. Damit war klar: Der falsche Wert kam nicht aus der aktuell angezeigten Liste, sondern aus einer alten Notice-Humanizer-Logik.

## Echte Ursache

In `remote-modboard.js` nutzt `simplifyAdminNotesNotice()` bisher bevorzugt:

```js
notice.dataset.rdap73OriginalText
```

Wenn dort einmal ein alter Text mit `4 Admin-Notizen ...` gespeichert wurde, kann die Funktion diesen alten Text weiterverwenden und daraus erneut `4 Notizen geladen` machen, obwohl `rdap28-admin-notes.js` inzwischen einen aktuellen EngelCGN-Text schreibt.

## Änderung

`simplifyAdminNotesNotice()` nutzt jetzt den aktuellen `notice.textContent` als Wahrheit.

Zusätzlich:

```text
- Bei leerem Text wird altes dataset entfernt.
- Bei "Keine Admin-Notizen ..." wird altes dataset entfernt.
- Wenn im aktuellen Text kein Count steht, wird kein alter Count wiederverwendet.
- Count wird nur aus dem aktuellen Notice-Text humanisiert.
```

## Grenzen

```text
Kein Backend.
Keine DB.
Keine neue Permission.
Kein Delete.
Kein Deactivate.
Keine Community-Read-Freigabe.
Keine Write-Freigabe.
Keine Agent-/OBS-/Sound-/Overlay-/Command-Steuerung.
```

## Testziel

```text
EngelCGN auswaehlen:
- Wenn keine Engel-Notizen vorhanden sind, darf nicht "4 Notizen geladen" stehen.
- Es muss "Keine Notizen ..." oder 0 passend zum aktuellen Engel-Kontext erscheinen.
- ForrestCGN darf weiterhin seine echten Notizen anzeigen.
```
