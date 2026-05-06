# NEXT STEPS - stream-control-center

Stand: 2026-05-06

## Naechster empfohlener Schritt

### Sound-System Overlay Bugs bereinigen

Nach `STEP193.17` ist der SoundAlerts-Dashboard-/Backend-Block vorerst gut nutzbar. Die naechsten offenen Punkte liegen vor allem im lokalen Sound-System Overlay.

Pruefen/Beheben:

1. Audio/Video-Verhalten in `htdocs/overlays/sound_system_overlay.html` testen.
2. Overlay-Test mit temporaerem `outputTarget: overlay` pruefen.
3. Device-Test und Overlay-Test klar voneinander trennen.
4. Debug-/Statusanzeige im Overlay verbessern.
5. Sicherstellen, dass Video mit Ton und reine Audio-Tests nachvollziehbar laufen.
6. Nach Overlay-Fix erneuten Doku-Sync machen.

## Danach moeglich

### SoundAlerts

- Event-Tab-Filter: Alle / Abgespielt / Fehler / Kein aktueller Eintrag.
- Statistik weiter verbessern, falls echte Live-Daten weitere Auswertungen brauchen.
- Optional alte Test-/Log-Eintraege gezielter ausblendbar machen.
- Parser-Format-Editor weiter absichern, falls spaeter weitere SoundAlerts-Texte auftauchen.

### Clip-System

- Clip-System beim naechsten Live-Stream testen.
- Danach Streamer.bot-Action auf Backend-Call reduzieren.
- Danach Clip-Dashboard bauen.

### System / DB

- MariaDB-Adapter spaeter in `backend/core/database.js` implementieren und testen.
- Neue DB-Features weiter DB-portabel planen.

## Wichtige Regeln

- Keine Funktionalitaet entfernen.
- SQLite `app.sqlite` niemals ersetzen oder neu bauen.
- Keine Secrets, Tokens, `.env`, DBs, Backups oder ZIPs committen.
- Dashboard greift nicht direkt auf SQLite/Dateien zu, sondern nutzt Backend-APIs.
- SoundAlerts Bridge Version aktuell: `0.1.14`.
- `_SoundAlerts_Loader` bleibt aktive, stumme 1x1-OBS-Browserquelle.
- Parser-Formate muessen als echtes Objekt-Array erhalten bleiben.
