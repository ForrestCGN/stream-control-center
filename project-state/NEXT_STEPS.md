# NEXT STEPS - stream-control-center

Stand: 2026-05-06

## Naechster empfohlener Schritt

### SoundAlerts Live-Test / Stabilisierung

Nach `STEP193.9` erstmal keine weiteren SoundAlerts-Umbauten, solange die Einrichtung live getestet wird.

Pruefen:

1. Neuer unbekannter SoundAlert kommt rein.
2. Eintrag erscheint unter `Zur Pruefung`.
3. Datei/Label/Kategorie pruefen.
4. Einzelnen Eintrag speichern/freigeben.
5. Nur dieser eine Eintrag verschwindet aus `Zur Pruefung`.
6. Andere Review-Eintraege bleiben offen.
7. Inaktiv speichern bleibt `Inaktiv` und zaehlt nicht als offene Einrichtung.
8. Letzte 5 Events zeigen nur abspielbare Events.
9. Replay funktioniert.
10. `_SoundAlerts_Loader` bleibt aktiv, stumm und unsichtbar.

## Danach moeglich

### SoundAlerts

- Event-Tab-Filter: Alle / Abgespielt / Fehler / Kein aktueller Eintrag.
- Statistik weiter verbessern, falls echte Live-Daten weitere Auswertungen brauchen.
- Optional alte Test-/Log-Eintraege gezielter ausblendbar machen.

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
- SoundAlerts Bridge Version aktuell: `0.1.9`.
- `_SoundAlerts_Loader` bleibt aktive, stumme 1x1-OBS-Browserquelle.
