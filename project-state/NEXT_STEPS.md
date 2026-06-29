# Next Steps

Nach `RDAP_0.2.24_MEDIA_READONLY_FOUNDATION`:

```text
1. Lokal einspielen und Syntax pruefen.
2. Sichttest lokal und online:
   - Navigation zeigt Media.
   - Media-Seite laedt.
   - GET /api/remote/media/status liefert readOnly=true.
   - Upload/Edit/Delete sind sichtbar gesperrt, keine aktiven Buttons.
   - Lokal/Online-Hinweise sind korrekt.

3. Danach naechster Code-Step:
   RDAP_0.2.25_MEDIA_LOCAL_INVENTORY_READONLY
```

Ziel fuer 0.2.25:

```text
- Lokale Media-Ordner read-only erfassen.
- Start mit vorhandenen Bereichen:
  - htdocs/assets/sounds
  - htdocs/assets/videos
  - htdocs/assets/images
- Safe-Path, Extension-Allowlist und begrenzte Ausgabe.
- Keine Uploads, keine Deletes, keine DB-Migration.
```

Spaeter, nicht jetzt:

```text
- Online Media-Inventar per Agent-WSS Memory-only synchronisieren.
- Erst danach Upload/Edit/Delete mit echter serverseitiger Permission-Middleware, Audit und Confirm planen.
```
