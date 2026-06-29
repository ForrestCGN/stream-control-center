# RDAP 0.2.49B - Remote-Modboard Media Library Loader Fix

## Befund

Lokaler Browser-Test zeigte:

```text
document.querySelectorAll('[data-page-panel]').length => 1
Panel: overview
```

Die Datei `/assets/modules/media/library.js` war direkt erreichbar, wurde beim Klick auf `Medienuebersicht` aber nicht als Page-Modul geladen/aktiviert.

## Geaendert

```text
htdocs/dashboard-v2/index.html
remote-modboard/backend/public/assets/modules/media/library.js
```

## Ergebnis

```text
- Media-Library wird im Dashboard explizit per Script geladen.
- Das Media-Modul registriert sich dadurch beim Dashboard-Start.
- Der bestehende Router kann `media-library` beim Klick aktivieren.
- Die normale Media-Mod-Ansicht bleibt enttechnisiert.
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

## Lokale Checks

```powershell
cd D:\Git\stream-control-center

node --check .\remote-modboard\backend\public\assets\modules\media\library.js
node --check .\remote-modboard\backend\public\assets\remote-modboard.js

git status
```
