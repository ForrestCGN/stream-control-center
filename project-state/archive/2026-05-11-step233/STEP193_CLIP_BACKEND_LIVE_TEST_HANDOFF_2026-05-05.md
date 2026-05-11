# Clip-System Handoff / Weiterarbeit

Stand: 2026-05-05

## Kontext

Wir arbeiten am Projekt `stream-control-center`.

Single Source of Truth:
- GitHub Repo: `ForrestCGN/stream-control-center`
- Branch: `dev`
- Lokales Repo: `D:\Git\stream-control-center`
- Live-System: `D:\Streaming\stramAssets`
- ZIPs werden grundsätzlich ins Repo entpackt, danach `stepdone.cmd`, danach Deploy nach Live.

## Aktueller Clip-System Stand

Dashboard-Integration ist erledigt und läuft.

### Erledigte Schritte

- STEP188: Clip-Dashboard integriert.
- STEP188.1: Settings-Save-Format korrigiert.
  - Dashboard speichert Clip-Settings im Backend-Format:
    - `{"settings":{"key":"value"}}`
  - Nicht mehr im falschen Todo-Format:
    - `{"key":"...","value":"..."}`
- STEP188.2: Discord-Ziel im Dashboard direkt per DB-Channel-ID.
  - `discordChannelMode` wird automatisch auf `custom` gesetzt.
  - `discordChannelKey` bleibt nur Legacy/Fallback/Import.
  - Dashboard zeigt nur noch die direkte Discord Channel-ID.
- STEP189: History-Details im Dashboard.
  - History-Zeilen anklickbar.
  - Detailkarte zeigt Status, Fehlergrund, Twitch/OBS/Discord/lokale Datei.
  - Repost/Retry nur vorbereitet und deaktiviert, weil Backend-Route noch fehlt.
- STEP190: Settings-Cleanup.
  - Normale Settings-Ansicht zeigt nur relevante Bedienfelder.
  - Technische Werte sind reduziert im Erweitert-Bereich.
- STEP191: Textvarianten-UX-Cleanup.
  - Verständliche Labels.
  - Technische Keys klein sichtbar.
  - Platzhalter-Hinweise.
  - Neue Variante oben.
- STEP192: Finale Heimaufsicht-/Beweismaterial-Texte.
  - Alte aktive Varianten wurden deaktiviert, nicht gelöscht.
  - Neue Texte wurden über Backend-API gesetzt.
  - Keine direkte DB-Bearbeitung.
  - JSON bleibt nur Seed/Fallback/Import.

## Verifizierte API-Zustände

`GET /api/clip/status` war erfolgreich.

Wichtige Werte:

- `ok = true`
- `enabled = true`
- `schemaVersion = 3`
- `backendCreate.ready = true`
- `twitchApi.readyForCreateClip = true`
- `twitchApi.hasClipsEdit = true`
- `obsReplay.readyForBackendSave = true`
- `obsReplay.replayBufferActive = true`
- `discord.readyForPost = true`
- `discord.discordChannelMode = custom`
- `discord.discordChannelId = 1498973670557745162`
- `discord.discordChannelSource = clip_settings.discordChannelId`
- `database.historyCount` war vorhanden
- `messagesFromDbPrepared = true`
- `settingsFromDbPrepared = true`

## Verifizierte Settings

`GET /api/clip/admin/settings` war erfolgreich.

Wichtige Werte:

- `discordChannelId = 1498973670557745162`
- `discordChannelMode = custom`
- `discordPostEnabled = true`
- `postOnlyWhenLive = false`
- `backendCreateEnabled = true`
- `obsReplaySaveEnabled = true`
- `obsReplaySaveDelayMs = 30000`
- `localReplayRenameEnabled = true`
- `localReplayDir = d:\Aufnahme\Clips`
- `saveHistory = true`

## Verifizierte Textvarianten

`GET /api/clip/admin/texts` war erfolgreich.

Finale aktive Richtung:
- Heimaufsicht
- Beweismaterial
- Aufnahme sichern
- CGN-Archiv
- kurze Chattexte
- Discord etwas ausführlicher

Beispiele:
- `/me 📋 Vorgang aufgenommen. Die Heimaufsicht sichert Beweismaterial.`
- `/me 🎬 Beweise werden gesichert. Die Heimaufsicht ist dran.`
- `/me ✅ Beweismaterial gesichert: {clipUrl}`
- `/me 📋 Vorgang abgeschlossen. Clip liegt vor: {clipUrl}`

## Offline-Test

Ausgeführt:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/clip/create?input=OfflineTest&triggerUser=ForrestCGN&triggerLogin=forrestcgn" | ConvertTo-Json -Depth 30
```

PowerShell zeigt das als Fehler, weil das Backend bei Offline-Guard einen HTTP-Fehlerstatus liefert. Fachlich ist das korrekt.

Antwortinhalt war sinngemäß:

- `ok = false`
- `accepted = false`
- `error = stream_not_live`
- `reason = stream_not_live`
- `history.saved = true`
- `history.id = 6`
- `channelInfo.isLive = false`
- `sendChat = true`
- `chatMessage = "Die Heimaufsicht clippt nur im Live-Betrieb. Vorgang wurde übersprungen."`

History danach:

- neuer Eintrag `id = 6`
- `clipTitle = OfflineTest | Supermarket Together`
- `status = skipped`
- `reason = stream_not_live`
- `sourceMethod = backend_create_offline`

Damit ist der Offline-Guard bestanden.

## Offener nächster Schritt heute Abend

### STEP193 - Clip Backend Live-Test

Noch nicht am alten Streamer.bot-`!clip`-Ablauf ersetzen.

Erst separater Live-Test von:

```text
/api/clip/create
```

Zu prüfen:

1. Twitch-Clip wird erstellt.
2. Twitch-Clip-URL kommt zurück.
3. OBS Replay wird nach Delay gespeichert.
4. Lokale Datei wird gefunden/umbenannt.
5. Discord-Post kommt im Channel `1498973670557745162`.
6. History zeigt `created` bzw. korrekte Statusdaten.
7. OBS-/Discord-/lokale Datei-Felder werden im Dashboard korrekt angezeigt.
8. Chatmeldung passt zu den Heimaufsicht-Texten.

## Wichtige Regel für nächste Arbeit

Nicht direkt den alten Streamer.bot-Clip-Ablauf ersetzen.

Erst:
- Live-Test separat.
- History prüfen.
- Discord prüfen.
- lokale Datei prüfen.
- danach Entscheidung, ob Streamer.bot auf Backend-Create umgestellt wird.

## Arbeitsablauf für Forrest

ZIPs grundsätzlich ins Repo entpacken:

```text
D:\Git\stream-control-center
```

Dann:

```powershell
cd D:\Git\stream-control-center
git status --short
.\stepdone.cmd "passende commit message"
.\01_LIVE_AKTUALISIEREN_VON_GITHUB.cmd
```

Nicht Live-first arbeiten, außer ausdrücklich als schneller Test.
