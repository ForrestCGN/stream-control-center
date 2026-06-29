# RDAP 0.2.49C - Remote-Modboard Media Clean View Manifest Autoload

## Ziel

Media-Mod-Ansicht weiter enttechnisiert und Modul-Autoload wieder ueber Manifest/Router statt HTML-Sonderload.

## Geaendert

```text
remote-modboard/backend/public/assets/modules/media/library.js
remote-modboard/backend/public/assets/modules/module-manifest.js
htdocs/dashboard-v2/index.html
```

## Ergebnis

```text
- Media-Seite bleibt runtime: both fuer Online und Lokal.
- Media-Seite ist im Modul-Manifest eingetragen.
- Dashboard-HTML enthaelt keinen eigenen Media-Sonderload mehr.
- Normale Media-Ansicht zeigt nur Header, Modus, Inventar, Bereiche, Filter/Liste und Read-only-Hinweis.
- Rechte-Tabelle, Allowlist/Dateitypen, Quelle/DB/Fallback/Writes und ?db=1-Hinweise sind nicht mehr prominent in der normalen Mod-Ansicht.
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
