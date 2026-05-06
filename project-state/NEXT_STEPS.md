# NEXT STEPS - stream-control-center

Stand: 2026-05-06

## Naechster empfohlener Schritt

### SoundAlerts Dashboard-UX fuer Auto-Eintraege

STEP193 ist live getestet:

```text
soundalerts_bridge version = 0.1.6
Unbekannter Trigger: ForrestCGN spielt Neuer Test Sound fuer 0 Bits!
autoEntry.created = true
entry.id = neuer_test_sound
entry.enabled = false
entry.status = missing_file
entries.source = db
fahrstuhl_sound bleibt aktiv
```

Naechster sinnvoller Schritt:

1. Dashboard pruefen, ob automatisch erkannte Eintraege klar sichtbar sind.
2. UX fuer `missing_file` verbessern, falls noetig.
3. Datei aus dem Eintrag heraus hochladen/zuweisen testen.
4. Eintrag erst nach bewusster Pruefung aktivieren.
5. Optional Test-/Alt-Eintraege spaeter per Admin-Funktion verwalten.

Wichtig:

- Keine bestehende Funktionalitaet entfernen.
- Bestehende aktive Eintraege duerfen nicht ueberschrieben werden.
- JSON bleibt Fallback.
- DB bleibt Hauptspeicher fuer dashboardfaehige Daten.
- Neue DB-Logik nach Moeglichkeit ueber `backend/core/database.js` oder vorhandene Helper bauen.
- MariaDB spaeter mitdenken, aber nicht ungetestet als aktiv voraussetzen.
- Diese DB-Portability-Regel gilt fuer alle Module, nicht nur fuer SoundAlerts.

## Danach moeglich

### SoundAlerts

1. Dashboard-Inbox/Auto-Eintraege aufraeumen:
   - Filter nach `new_detected`, `missing_file`, `active`, `disabled`, `ignored`
   - kompakte Bearbeitung direkt im Eintrag
2. Upload-UX verbessern:
   - Max Audio/Video sichtbar anzeigen
   - `file_too_large` lesbar anzeigen
   - Overwrite-Abfrage, wenn Datei existiert
3. Admin-Config UI:
   - eigener Bereich `SoundAlerts`
   - nicht im normalen Sound-System-Expertenbereich verstecken
4. Video-Upload-Limit optional erhoehen:
   - aktuell `upload.maxVideoSizeBytes = 104857600`
   - getestetes grosses Video ca. 390 MB
   - moeglicher Zielwert spaeter: `524288000`

### Clip-System

1. Clip-System bei naechstem Live-Stream testen:
   ```powershell
   Invoke-RestMethod "http://127.0.0.1:8080/api/clip/status" | ConvertTo-Json -Depth 30
   ```

   Erwartung:

   ```text
   backendCreate.ready = true
   twitchApi.readyForCreateClip = true
   obsReplay.readyForBackendSave = true
   discord.readyForPost = true
   channelInfo.is_live = true
   ```

2. Dann Live-Test:
   ```powershell
   Invoke-RestMethod "http://127.0.0.1:8080/api/clip/create?input=!clip%20LiveTest&triggerUser=ForrestCGN&triggerLogin=forrestcgn" | ConvertTo-Json -Depth 30
   ```

3. Nach ca. 35 Sekunden History pruefen:
   ```powershell
   Invoke-RestMethod "http://127.0.0.1:8080/api/clip/history?limit=5" | ConvertTo-Json -Depth 30
   ```

4. Wenn Live-Test sauber ist:
   - Streamer.bot-Action auf Backend-Call reduzieren.
   - Danach Clip-Dashboard bauen.

### Hug/Rehug optional

- Audit-Logging fuer Textaenderungen.
- Bessere Hilfe je Text-Key bei Systemantworten.
- Sammel-Speichern statt Einzel-Speichern.
- Rollen/Rechte fuer Textbearbeitung vorbereiten.

### VIP

- Echte 7-/30-Tage-Statistik backendseitig ergaenzen.
- Upload-UX nur behutsam weiter verbessern.
- Sound-Vorschau optional erweitern:
  - Stop-Button
  - aktuelle Vorschau optisch markieren
  - lokale Dashboard-Lautstaerke

### System allgemein

- Globaler Standard: Alle neuen Module und neuen DB-Features MariaDB-tauglich planen; SQLite bleibt aktuell produktiv und muss weiter funktionieren.
- Neue DB-Zugriffe bevorzugt ueber `backend/core/database.js` oder vorhandene Helper bauen, nicht direkt ueber `sqlite_core.js`.
- Provider-/Settings-Ausgaben maskieren, da Settings sensible Werte enthalten koennen.
- `liveAlert`/`livealert` Duplikat in Alert-Settings spaeter bereinigen.
- Dashboard-Rollen/Rechte und Audit-Logging vorbereiten.
- Fireworks spaeter neu aufbauen.
- Alerts-Modul spaeter behutsam splitten.
- Overlays langfristig mit einheitlichem Overlay-Client standardisieren.
- Module weiter auf DB-Settings/DB-Texte/Helper-Standard auditieren.
- Echten MariaDB-Adapter spaeter in `backend/core/database.js` implementieren.

## Aktueller Standardabschluss nach ZIP-Entpacken

Nach jedem neuen ZIP:

```powershell
cd D:\Git\stream-control-center
.\stepdone.cmd "passende commit beschreibung"
```

Beispiele:

```powershell
.\stepdone.cmd "docs: sync soundalerts status"
.\stepdone.cmd "feat: add soundalerts inbox"
.\stepdone.cmd "fix: improve soundalerts upload limits"
```

## Wichtige Regeln

### SoundAlerts

- Eintraege/Mappings: `soundalerts_bridge_entries`
- Technische Settings: `soundalerts_bridge_settings`
- Events/Logs: `soundalerts_bridge_events`
- JSON `config/soundalerts_bridge.json` bleibt Seed/Fallback.
- SoundAlerts Bridge Version aktuell: `0.1.6`.
- Fuer normale SoundAlerts ist die Standard-Kategorie `channel_reward`.
- Video geht standardmaessig nach `overlay`.
- Audio geht standardmaessig nach `device`.
- Priority leer/null bedeutet: effektive Prioritaet kommt aus Kategorie/Default.

### Clip-System

OBS lokal muss 60 Sekunden speichern:

```text
30 Sekunden vor !clip
30 Sekunden nach !clip
```

Daher gilt:

```text
T+0s  -> Twitch Create Clip sofort
T+30s -> OBS SaveReplayBuffer
T+33s -> lokale Datei suchen/umbenennen
```

### Hug/Rehug

Bei Hug/Rehug duerfen Text und Antwort nicht getrennt zufaellig werden.

Richtig:

```text
Text 1 -> Antwort-Text 1
Text 2 -> Antwort-Text 2
```

Falsch:

```text
Text 1 -> zufaellige Antwort 8
```
