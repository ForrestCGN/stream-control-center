# NEXT STEPS - stream-control-center

Stand: 2026-05-08

## Naechster empfohlener Schritt

### STEP201 - Loyalty / Kekskruemel-System vorbereiten

Der TTS-Block ist nach STEP199.1 bis STEP200.1 technisch nutzbar und dokumentiert. Als naechster groesserer Bereich ist das Loyalty-/Kekskruemel-System vorgesehen.

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

## TTS optionale Folgepunkte

Der TTS-Block ist aktuell abgeschlossen. Optional spaeter:

1. Settings-Tab von Raw-JSON auf fachliche Formulare aufteilen.
2. CSV-Export fuer TTS User-Statistik ergaenzen.
3. Klickbare Sortierung direkt ueber Tabellenkoepfe ergaenzen.
4. Rollen-/Stimmen-Konfiguration komfortabler editierbar machen.
5. TTS-Testbereich weiter kompakter/schoener gestalten.
6. Textvarianten-Tab optisch weiter polieren.

## Danach moeglich

### Sound-System Overlay nur bei konkretem Fehler pruefen

Nach SoundAlerts und TTS ist der Sound-System-/Overlay-Block nicht mehr als blinder Hauptpunkt einzuplanen. Nur bei konkretem Fehler erneut pruefen:

1. Audio/Video-Verhalten in `htdocs/overlays/sound_system_overlay.html`.
2. Overlay-Test mit temporaerem `outputTarget: overlay`.
3. Device-Test vs. Overlay-Test.
4. Debug-/Statusanzeige im Overlay.
5. Video mit Ton / reine Audio-Tests.

### SoundAlerts

- Event-Tab-Filter: Alle / Abgespielt / Fehler / Kein aktueller Eintrag.
- Statistik weiter verbessern, falls echte Live-Daten weitere Auswertungen brauchen.
- Optional alte Test-/Log-Eintraege gezielter ausblendbar machen.
- Parser-Format-Editor weiter absichern, falls spaeter weitere SoundAlerts-Texte auftauchen.

### Clip-System

Clip-System laeuft und ist im Dashboard vorhanden. Kein Neubau einplanen.

Optional spaeter:

- Live-Erfahrungen auswerten.
- Streamer.bot-Action weiter auf Backend-Call reduzieren, falls noch Altlogik aktiv ist.
- Clip-History/Discord-Post-UX weiter polieren, falls gewuenscht.

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
- TTS Texte: `module_text_variants` mit `module_name = 'tts'`; `config/tts_messages.json` bleibt Seed/Fallback.
- SoundAlerts Bridge Version aktuell: `0.1.14`.
- `_SoundAlerts_Loader` bleibt aktive, stumme 1x1-OBS-Browserquelle.
- Parser-Formate muessen als echtes Objekt-Array erhalten bleiben.
- Loyalty ist spaeter die einzige Quelle fuer Punkte, Kontostaende und Punktetransaktionen.
