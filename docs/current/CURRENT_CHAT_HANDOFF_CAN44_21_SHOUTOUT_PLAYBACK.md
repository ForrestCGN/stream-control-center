# CURRENT CHAT HANDOFF – CAN-44.21 Shoutout Playback / Clip-Player-Fallback

Stand: 2026-06-04 Abend
Projekt: `ForrestCGN/stream-control-center`
Branch: `dev`
Live-Ziel: `D:\Streaming\stramAssets`

## Arbeitsregeln für den nächsten Chat

- Deutsch, ruhig, direkt, Schritt für Schritt.
- Vor Umsetzung immer: echten Dateistand prüfen, Ziel/Dateien/Änderung/Nicht geändert/Tests nennen, auf `go` warten.
- Keine Apply-Scripte, keine Patch-Scripte, keine PowerShell-Regex-Patches.
- Bei Codeänderungen vollständige Ersatzdatei-ZIP mit echten Zielpfaden liefern.
- Keine Funktionalität entfernen.
- Produktive SQLite-DB niemals überschreiben, löschen oder neu bauen.
- Nach Datei-ZIP normalerweise:

```powershell
node -c pfad\zur\datei.js
.\stepdone.cmd "PASSENDE STEP BESCHREIBUNG"
```

## Aktueller technischer Stand

### CAN-44.21.14

Runtime-Textvarianten für Shoutout wurden aktiv genutzt.
Bestätigt im Chat: Duplicate-Texte kamen aus den neuen DB-Textvarianten.

### CAN-44.21.15

Eine direkte Ersatzdatei-ZIP wurde erstellt und laut Status läuft das Modul inzwischen mit:

```text
moduleVersion = 0.2.27
```

Ziel von CAN-44.21.15:

- Suchbereiche erweitert: `90 / 365 / 730 / 1095 / all-time`
- Nicht mehr sofort beim ersten `fallback_duration`-Treffer abbrechen
- Bis zu 8 Clip-Kandidaten für direkte Playback-URL testen
- `playbackAttempts`/Debug für fehlgeschlagene Kandidaten vorgesehen

Status-Test nach Installation zeigte:

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/status"
$s | Select-Object moduleVersion,lastError,lastRun,lastClipSearch | ConvertTo-Json -Depth 50
```

Ausgabe:

```json
{
  "moduleVersion": "0.2.27",
  "lastError": null,
  "lastRun": null,
  "lastClipSearch": null
}
```

Nach Live-Test änderte sich der Fehler von `clip_playback_missing` zu:

```text
clip_playback_failed_all_candidates
```

Das beweist: Clip-Suche funktioniert, aber direkte GQL-/Playback-URL-Abfrage ist für diese Clips nicht zuverlässig.

## Fehlerbild aus dem Live-Test

Folgende Queue-Einträge sind fehlgeschlagen, nicht hängend:

```text
id  target_login        status  attempts  last_error
75  together_not_alone  failed  3         clip_playback_failed_all_candidates
74  pretos1             failed  3         clip_playback_failed_all_candidates
76  pretos1             failed  1         clip_playback_failed_all_candidates
77  together_not_alone  failed  1         clip_playback_failed_all_candidates
```

Die Einträge sind alte/fehlgeschlagene Testeinträge und sollten nicht als aktive Hänger behandelt werden.

## Clip-Suche wurde geprüft

### pretos1

Route:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/clips?target=pretos1" | ConvertTo-Json -Depth 40
```

Ergebnis:

- `count = 1`
- Clip: `Rechtfertigung Main!`
- Dauer: `38.3s`
- `selectedMode = fallback_duration`

### together_not_alone

Route:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/clips?target=together_not_alone" | ConvertTo-Json -Depth 40
```

Ergebnis:

- `count = 8`
- `selectedMode = duration_ok`
- mehrere Clips im Bereich 12–30 Sekunden

Fazit: Es werden definitiv Clips gefunden. Der Fehler liegt beim direkten Playback-Auflösen.

## Altes Streamer.bot-Skript – wichtige Erkenntnis

Forrest hat zwei alte C#-Skripte gepostet. Beide funktionierten nach eigener Aussage zuverlässig.

Wichtiger Unterschied:

```text
Altes Streamer.bot-Skript:
- CPH.GetClipsForUserById(...)
- zufälligen Clip wählen
- Browserquelle direkt auf:
  http://localhost:8080/overlays/_overlay-clip_player.html?clipId=CLIP_ID
  bzw. mit &user=...
- Twitch/Browser/Overlay kümmert sich um Wiedergabe

Aktuelles Node-System:
- Clips über Helix suchen
- Clip auswählen
- direkte Twitch-GQL-Playback-URL abfragen
- wenn GQL keine brauchbare URL liefert: Fehler
```

Der alte Weg ist robuster, weil er keine direkte MP4-/Playback-URL braucht.

## Geprüft: Overlay-Player existiert

Forrest hat geprüft:

```powershell
Test-Path "D:\Git\stream-control-center\htdocs\overlays\_overlay-clip_player.html"
True

Test-Path "D:\Streaming\stramAssets\htdocs\overlays\_overlay-clip_player.html"
True
```

Damit ist der lokale Clip-Player als Fallback technisch vorhanden.

## Offener wichtiger Punkt

Forrest fragte, ob dabei die Queue/Sound-Queue erhalten bleibt.

Festlegung:

```text
Die Queue muss erhalten bleiben.
Nicht zurück zu Streamer.bot-OBS-Show/Hide/Wait.
Node bleibt Dirigent.
```

Erhalten bleiben müssen:

- Display-Queue
- Worker
- Cooldown
- Start-Szene-Gate
- Official Twitch Queue
- AutoShoutout
- Dashboard-Queue
- Retry/Remove
- Sound-/Bundle-System, sofern technisch möglich

Wichtig: CAN-44.21.16 darf nicht einfach OBS direkt steuern und die Sound-Queue umgehen.

## Nächster geplanter Schritt

### CAN-44.21.16 – Clip Player Overlay Fallback innerhalb bestehender Queue

Ziel:

Wenn direkte Twitch-GQL-Playback-URL für alle Kandidaten scheitert, soll der Display-Shoutout nicht failen, sondern als Fallback den vorhandenen lokalen Clip-Player verwenden:

```text
http://127.0.0.1:8080/overlays/_overlay-clip_player.html?clipId=CLIP_ID&user=LOGIN
```

Aber: Das muss innerhalb der bestehenden Queue-/Sound-/Bundle-Architektur passieren.

Vor Umsetzung prüfen:

1. Kann das aktuelle Sound-/Overlay-System in einem Bundle eine HTML-/Browser-Embed-URL anzeigen?
2. Oder akzeptiert es nur direkte Video-/MP4-URLs in `mediaUrl`/`videoUrl`?
3. Falls nur Video: Muss ein neuer Bundle-Item-Modus wie `browser_embed` / `clip_player_overlay` ergänzt werden.
4. Dafür echte Dateien prüfen, besonders Sound-/Overlay-Consumer:
   - `backend/modules/sound_system.js` oder tatsächliche Sound-Moduldatei
   - Overlay-Datei(en), die `/api/sound/bundle` konsumieren
   - `htdocs/overlays/_overlay-clip_player.html`
   - `backend/modules/clip_shoutout.js`

Geplante Architektur:

```text
Node Display-Queue
→ Clip suchen
→ direct playback versuchen
→ wenn direct scheitert: Browser-Embed-Fallback vorbereiten
→ buildBundlePayload(...)
→ /api/sound/bundle
→ Sound-/Overlay-Queue spielt Eintrag
→ danach Official Twitch Shoutout
→ nächster Queue-Eintrag
```

Nicht erlaubt:

- Kein Streamer.bot-Wait zurückholen
- Kein direktes OBS-Show/Hide aus Node, wenn dadurch Queue/Sound-System umgangen wird
- Kein Entfernen des direkten Playback-Wegs
- Kein DB-Umbau ohne separate Planung

## Alte failed Queue-Einträge

Die alten failed Einträge 74–77 sind Diagnose-/Testreste. Für neue Tests lieber frische `!so ... --force` Einträge verwenden.
Später ggf. per Dashboard/Remove bereinigen, aber nicht als akuter Hänger behandeln.

## Nächste Startanweisung für neuen Chat

Empfohlene Nachricht:

```text
Wir machen mit CAN-44.21.16 weiter. Bitte lies docs/current/CURRENT_CHAT_HANDOFF_CAN44_21_SHOUTOUT_PLAYBACK.md und halte dich an den Master-Prompt. Ziel: Clip Player Overlay Fallback innerhalb der bestehenden Queue/Sound-Queue planen. Erst echte Dateien prüfen, dann Ziel/Dateien/Änderung/Nicht geändert/Tests nennen und auf go warten.
```
