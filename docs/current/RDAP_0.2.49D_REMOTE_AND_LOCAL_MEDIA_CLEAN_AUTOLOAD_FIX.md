# RDAP 0.2.49D - Remote and Local Media Clean Autoload Fix

## Korrektur

0.2.49/0.2.49C hatte die Online-Datei geaendert, waehrend lokal unter `/dashboard-v2/` eine eigene Media-Library geladen wurde.

Dieser Step aendert deshalb Online und Offline/Lokal.

## Geaendert Online

```text
remote-modboard/backend/public/index.html
remote-modboard/backend/public/assets/modules/media/library.js
remote-modboard/backend/public/assets/modules/module-manifest.js
remote-modboard/backend/public/assets/modules/ui/module-autoload-fix.js
```

## Geaendert Offline/Lokal

```text
htdocs/dashboard-v2/index.html
htdocs/dashboard-v2/assets/modules/media/library.js
htdocs/dashboard-v2/assets/modules/module-manifest.js
htdocs/dashboard-v2/assets/modules/ui/module-autoload-fix.js
```

## Ergebnis

```text
- Normale Media-Ansicht ist online und lokal enttechnisiert.
- Keine Rechte-Tabelle.
- Keine Dateitypen-/Allowlist-Karte.
- Keine Server-Cache-/Loeschen-Karten.
- Keine Quelle/DB/Fallback/Writes/?db=1 Hinweise.
- Nur Header, Modus, Inventar, Media-Bereiche, Medienliste mit Filter und Read-only-Hinweis.
- Generischer Autoload-Fix fuer Manifest-Module verhindert First-Click-Blank.
```

## Sicherheitsgrenzen

```text
Keine Backend-Write-Routen.
Keine neue API.
Kein neuer Endpoint.
Keine DB-Item-Reads.
Keine SQL-Ausfuehrung.
Keine DB-Migration.
Keine INSERT/UPDATE/DELETE.
Keine Media-Daten-Writes.
Keine Agent-Writes.
Kein Upload/Edit/Delete.
Fallback bleibt aus.
Writes bleiben aus.
```
