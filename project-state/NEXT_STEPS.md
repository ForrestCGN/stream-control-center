# Next Steps

Nach `0.2.25`:

```text
1. Lokal testen:
   - GET http://127.0.0.1:8080/api/remote/media/status
   - Media-Seite im lokalen Dashboard ansehen
   - Pruefen: Sounds/Videos/Bilder-Zaehlung, Filter, truncated-Hinweis

2. Online testen:
   - GET http://127.0.0.1:3010/api/remote/media/status
   - Erwartung: online pending, kein lokales Inventar

3. Danach entscheiden:
   - Media-Agent-Inventory-Sync read-only
   - oder Permission-Middleware fuer spaetere Media-Writes vorbereiten
```

Nicht tun:

```text
Keine Upload-/Delete-Buttons aktivieren.
Keine lokalen absoluten Pfade anzeigen.
Keine grossen Media-Listen ohne Limit/Paging laden.
```
