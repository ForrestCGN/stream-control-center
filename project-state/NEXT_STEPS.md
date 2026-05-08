# NEXT STEPS - stream-control-center

Stand: 2026-05-08

## Naechster empfohlener Schritt

### TTS Folgepunkte nach STEP199.5

Der TTS-Block ist nach STEP199.1 bis STEP199.5 technisch nutzbar und dokumentiert.

Optional spaeter fuer TTS:

1. TTS-Texte in das globale DB-basierte Textvarianten-System migrieren.
2. Settings-Tab von Raw-JSON auf fachliche Formulare aufteilen.
3. CSV-Export fuer TTS User-Statistik ergaenzen.
4. Klickbare Sortierung direkt ueber Tabellenkoepfe ergaenzen.
5. Rollen-/Stimmen-Konfiguration komfortabler editierbar machen.
6. TTS-Testbereich weiter kompakter/schoener gestalten.

## Danach moeglich

### Sound-System Overlay Bugs bereinigen

Nach `STEP193.17.2` ist der SoundAlerts-Dashboard-/Backend-Block vorerst gut nutzbar und dokumentiert. Die naechsten offenen Punkte liegen vor allem im lokalen Sound-System Overlay.

Pruefen/Beheben:

1. Audio/Video-Verhalten in `htdocs/overlays/sound_system_overlay.html` testen.
2. Overlay-Test mit temporaerem `outputTarget: overlay` pruefen.
3. Device-Test und Overlay-Test klar voneinander trennen.
4. Debug-/Statusanzeige im Overlay verbessern.
5. Sicherstellen, dass Video mit Ton und reine Audio-Tests nachvollziehbar laufen.
6. Klaeren, ob und wann das Overlay automatisch neue Dateien/Queue-Status erkennt oder gezielt aktualisiert werden muss.
7. Nach Overlay-Fix erneuten Doku-Sync machen.

### StreamElements Loyalty Migration / eigenes Loyalty-System

`STEP194` dokumentiert den Architekturstandard fuer den spaeteren Ersatz von StreamElements Loyalty, Stream Store, Giveaways und Chat-Games.

Vor Code-Start zuerst erfassen:

1. StreamElements Loyalty-Settings vollstaendig sichern.
2. User-Punkte exportieren oder Importweg klaeren.
3. Stream Store / Redeem-Items mit Kosten, Cooldowns, Kategorien und Status erfassen.
4. Giveaway-Settings und vorhandene Giveaway-Historie erfassen.
5. Aktive Chat-Games und deren Settings erfassen.
6. Gewuenschte Commands/Aliase festlegen.
7. Overlay-Wuensche priorisieren.

Harte Regel fuer alle spaeteren Loyalty-Module:

```text
Alles, was Kekskruemel gibt, nimmt, prueft, reserviert, erstattet oder veraendert, laeuft ausschliesslich ueber das Loyalty-System.
```

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
- DB gewinnt gegen JSON-Fallback, wenn dashboardfaehige Settings vorhanden sind.
- JSON bleibt Seed/Fallback/technische Boot-Konfig.
- Secrets bleiben ENV/Secret-Dateien.
- TTS ist ueber `backend/modules/tts_system.js` umgesetzt; keine separate Admin-Datei als Zielstand.
- TTS Dashboard: `htdocs/dashboard/modules/tts.js` und `htdocs/dashboard/modules/tts.css`.
- SoundAlerts Bridge Version aktuell: `0.1.14`.
- `_SoundAlerts_Loader` bleibt aktive, stumme 1x1-OBS-Browserquelle.
- Parser-Formate muessen als echtes Objekt-Array erhalten bleiben.
- Loyalty ist spaeter die einzige Quelle fuer Punkte, Kontostaende und Punktetransaktionen.
