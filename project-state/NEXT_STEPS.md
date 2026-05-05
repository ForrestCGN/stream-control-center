# NEXT STEPS - stream-control-center

Stand: 2026-05-05

## Naechster empfohlener Schritt

### Clip-System Live-Test

Der Clip-Backend-Flow ist bis STEP187 vorbereitet. Ein echter End-to-End-Test ist erst sinnvoll, wenn der Stream live ist, weil Twitch Create Clip offline erwartungsgemaess nicht funktioniert.

Vor dem Test pruefen:

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

Dann Live-Test:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/clip/create?input=!clip%20LiveTest&triggerUser=ForrestCGN&triggerLogin=forrestcgn" | ConvertTo-Json -Depth 30
```

Direkt danach:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/clip/history?limit=5" | ConvertTo-Json -Depth 30
```

Nach ca. 35 Sekunden erneut:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/clip/history?limit=5" | ConvertTo-Json -Depth 30
```

Erwartung nach erfolgreichem Live-Test:

```text
status = created oder partial
clipId gesetzt
clipUrl gesetzt oder Twitch-Polling-Status sichtbar
obsReplayRequested = true
obsReplaySaved = true
localReplaySaved = true oder localReplayError gesetzt
discordPosted = true oder discordError gesetzt
```

## Danach moeglich

### Clip-System

1. Streamer.bot-Action reduzieren:
   - aktuell alte ClipV2-Action mit mehreren Scripts/Sub-Actions
   - Ziel: nur noch Backend-Call zu `/api/clip/create` und Chat-Ausgabe aus Backend-Antwort
2. Clip-Dashboard bauen:
   - Status
   - letzte Clips / History
   - Filter
   - Settings
   - Textvarianten
   - Discord-Zielkanal
   - Repost/Verwaltung
3. Optional History-Testdaten verwalten:
   - alte Offline-/Testeintraege ausblenden
   - spaeter Soft-Delete statt hartes Loeschen

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

- Provider-/Settings-Ausgaben maskieren, da Settings sensible Werte enthalten koennen.
- `liveAlert`/`livealert` Duplikat in Alert-Settings spaeter bereinigen.
- Dashboard-Rollen/Rechte und Audit-Logging vorbereiten.
- Fireworks spaeter neu aufbauen.
- Alerts-Modul spaeter behutsam splitten.
- Overlays langfristig mit einheitlichem Overlay-Client standardisieren.
- Module weiter auf DB-Settings/DB-Texte/Helper-Standard auditieren.

## Aktueller Standardabschluss nach ZIP-Entpacken

Nach jedem neuen ZIP:

```powershell
cd D:\Git\stream-control-center
.\stepdone.cmd "passende commit beschreibung"
```

Beispiele:

```powershell
.\stepdone.cmd "fix: improve clip live flow"
.\stepdone.cmd "docs: sync clip backend status"
.\stepdone.cmd "feat: add clip dashboard"
```

## Wichtige Regeln

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
