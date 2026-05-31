# STEP626C – Rahmen/Birthday/Platzhalter nachziehen

## Ziel

Der Overlay-Monitor soll aktuell genutzte OBS-Browserquellen zuverlässiger bewerten:

- `Rahmen` darf nicht mehr als sichtbare CGN-Quelle ohne Bus gewertet werden, wenn der Bus-Client als `rahmen_overlay` läuft.
- Legacy-/OBS-URL `Overlay Birthday.html` wird als Alias zur aktuellen Birthday-Overlay-Datei bereitgestellt.
- `about:blank`/leere Browserquellen werden als Platzhalter erkannt und nicht als Bus-/Heartbeat-Fehler bewertet.
- Anzeigenamen für Rahmen, Birthday, Easteregg, Clip, Media und Mega-Shoutout sind lesbarer.

## Geänderte Dateien

- `htdocs/dashboard/modules/overlays.js`
- `htdocs/overlays/_rahmen.html`
- `htdocs/overlays/Overlay Birthday.html`

## Nicht geändert

- Keine OBS-Quellen wurden umgestellt.
- Keine Reparaturbuttons.
- Kein Cache-Refresh.
- Kein Rahmen-Redesign.
- Keine Backend-/DB-Änderung.

## Hinweis

Wenn OBS noch eine gecachte Version von `_rahmen.html` geladen hat, muss die Browserquelle einmal aktualisiert oder OBS/Dashboard neu geladen werden, damit der neue `rahmen_overlay`-Heartbeat sichtbar wird.
