# RDAP 0.2.52 - Remote and Local Media Mod Usable List

## Thema

Media-Liste im Remote-Modboard / lokalen Dashboard fuer Mods besser nutzbar machen.

## Ausgangslage

Die Media-Liste war technisch korrekt, aber fuer Mods nicht gut brauchbar:

```text
- Dateiname stand zu stark im Vordergrund.
- Pfad war in der Hauptliste sichtbar, fuer Mods aber meistens unwichtig.
- Es gab keine echten sprechenden Anzeigenamen.
- Suche/Sortierung/Paging fehlten.
- Liste war bei vielen Eintraegen unhandlich.
```

## Umsetzung

Geaendert wurden online und lokal parallel:

```text
remote-modboard/backend/public/assets/modules/media/library.js
htdocs/dashboard-v2/assets/modules/media/library.js
```

Umgesetzt:

```text
- kompaktere Media-Karten
- Typ/Bereich sichtbarer
- Dateiname bleibt als Basis sichtbar, aber weniger technisch
- Pfad aus der Hauptkarte entfernt
- Info-Fenster pro Medium fuer technische Details
- Suche nach Datei, Bereich oder Typ
- Sortierung nach Name, Bereich, Groesse und Geaendert
- Paging mit 50 Eintraegen pro Seite
- Filter und Neu laden bleiben erhalten
```

## Nicht geaendert

```text
Keine Backend-Aenderung.
Keine API-Aenderung.
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

## Bekannte Einschraenkung

Aktuell liefert das Inventar keine echten sprechenden Media-Namen. Deshalb nutzt die UI weiter:

```text
displayName/title/label, falls spaeter vorhanden,
sonst name,
sonst relativePath,
sonst "Unbenannte Datei".
```

Sprechende Namen, Kategorien, Tags und Beschreibungen brauchen spaeter einen eigenen Metadata-/Write-Scope.

## Lokale Tests

```powershell
cd D:\Git\stream-control-center

node --check .\remote-modboard\backend\public\assets\modules\media\library.js
node --check .\htdocs\dashboard-v2\assets\modules\media\library.js

git status
```

Dashboard:

```text
http://127.0.0.1:8080/dashboard
```

Pruefen:

```text
- Media-Seite laedt beim ersten Klick.
- Filter Alle/Sounds/Bilder/Videos funktionieren.
- Suche filtert Dateiname/Bereich/Typ.
- Sortierung Name/Bereich/Groesse/Geaendert funktioniert.
- A-Z/Z-A Umschaltung funktioniert.
- Paging Zurueck/Weiter funktioniert.
- Info-Fenster oeffnet und schliesst.
- Pfad ist nur im Info-Fenster sichtbar.
- Upload/Edit/Delete bleiben unsichtbar/gesperrt.
```

## Webserver-Deploy

Da `remote-modboard/backend/public/...` geaendert wurde, ist nach lokalem Test und `stepdone.cmd` ein Webserver-Deploy noetig.

Standard:

```bash
bash /opt/stream-control-center/tools/server/remote-modboard-deploy-step.sh RDAP_0.2.52_REMOTE_AND_LOCAL_MEDIA_MOD_USABLE_LIST dev
```

Danach gezielt pruefen:

```bash
curl -fsS http://127.0.0.1:3010/api/remote/status | jq
curl -fsS http://127.0.0.1:3010/api/remote/media/status | jq '.ok, .runtimeMode, .inventory.active, .inventory.counts'
```
