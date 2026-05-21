# NEXT STEPS - stream-control-center

Stand: 2026-05-21

## Nach STEP269A-C - Sound-/Discord-Integration beobachten und spaeter dashboardfaehig machen

STEP269A bis STEP269C sind funktional bestaetigt:

```text
Sound-System kann Discord als Ausgabeziel nutzen.
Sound-System kann passende Kategorien/Quellen automatisch nach Discord routen.
VIP-/Mod-Sounds laufen nicht mehr hart nur nach stream, sondern koennen ueber soundSystemTarget nach both laufen.
```

Naechste Beobachtung im echten Betrieb:

```text
SoundAlerts/Kanalpunkte kommen im Discord an.
Alert-Hauptsounds kommen im Discord an, falls gewuenscht.
Alert + Alert-TTS bleiben als Bundle sauber zusammen.
Normales Chat-TTS nur nach Discord routen, wenn es wirklich gewuenscht ist.
```

Spaeterer Dashboard-/Control-Center-Punkt:

```text
Sound-/Discord-Routing soll im Dashboard konfigurierbar werden.
```

Dazu gehoeren spaeter:

```text
Discord-Ausgabe global aktiv/deaktivierbar
Auto-Routing aktiv/deaktivierbar
Kategorien/Quellen fuer Discord-Routing bearbeiten
Standard-Ziel pro Bereich: stream, discord, both
VIP-/Mod-/SoundAlert-/Alert-/TTS-Ziele im Dashboard steuerbar
Discord-Voice-Status anzeigen
Testbutton fuer Discord-Soundausgabe
```

Wichtig: Discord bleibt Ausgabeziel des Sound-Systems. Keine zweite fachliche Discord-Queue bauen.

## Nach STEP266B - Alert Bundle/TTS Mischtest beobachten

STEP266B ist funktional getestet und soll jetzt nicht weiter angefasst werden, solange kein neuer Fehler nachweisbar ist.

Naechster Pflichtpunkt ist Beobachtung im echten bzw. realistischen Mehrfach-Alert-Betrieb:

```text
Alert 1 Sound + TTS bleiben zusammen
Alert 2 Sound + TTS bleiben zusammen
Overlay startet erst mit dem richtigen Bundle-Sound
Naechster Alert startet erst nach Ende des vorherigen Bundles inklusive TTS
```

Wenn wieder etwas gemischt wird, zuerst nur Diagnose sammeln:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/alerts/events?limit=5" | ConvertTo-Json -Depth 40
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/status" | ConvertTo-Json -Depth 40
```

Dabei besonders pruefen:

```text
raw.soundSystem.bundled
raw.soundSystem.bundleId
raw.soundSystem.results
raw.alertTts.playback
raw.bundleFinishState
```

Nicht sofort anfassen:

```text
app.sqlite
config/**
backend/modules/sound_system.js
Sound-System Bundle-Core
Streamer.bot-Flows
Overlay-HTML
```

## Nach STEP238 - Message-Rotator Output-Mode testen

Nach Deploy:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/message-rotator/admin/settings" | ConvertTo-Json -Depth 60
Invoke-RestMethod "http://127.0.0.1:8080/api/message-rotator/integration-check" | ConvertTo-Json -Depth 80
```

Dashboard-Test:

```text
System -> Message-Rotator -> Settings
messageOptions.outputMode = announcement
messageOptions.announcementColor = purple
Backend neu laden
```

Dann:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/message-rotator/next?commit=0" | ConvertTo-Json -Depth 60
```

Erwartung:

```text
outputMode = announcement
announcementColor = purple
isAnnouncement = true
streamerbot_action = send_announcement
streamerbot_send = 0
```

Danach Produktivwerte setzen.

## Streamer.bot Folgearbeit

Rotator-Action so anpassen:

```text
streamerbot_action = send_message       -> normale Chatnachricht senden
streamerbot_action = send_announcement -> Twitch Announcement senden
```

Dabei `streamerbot_message` als Text und `streamerbot_announcement_color` als Farbe verwenden.

# Next Steps – stream-control-center

## Loyalty / Kekskrümel

Nächste Prüfung nach STEP208:

- Version `0.1.11` prüfen.
- Subscribe/Resub-Test durchführen:
  - erst Subscribe
  - innerhalb von 60 Sekunden Resub für denselben User
  - prüfen, ob der Subscribe kompensiert und der Resub normal gebucht wurde.
- Beim nächsten echten Stream erneut auswerten:
  - Runner-Recovery
  - Watch-Punkte
  - Event-Boni
  - GiftSub/GiftBomb
  - Subscribe/Resub-Dedupe
  - Bot-Ignore-Liste

Nächste mögliche fachliche Arbeit nach erfolgreichem Test:

- `soundalerts` als Service-Bot in Ignore-Liste aufnehmen, falls noch nicht geschehen.
- Loyalty Dashboard: Status, Runner-Events, User, Transaktionen und Auswertung sichtbar machen.
- Testdaten-Cleanup erst vor echter Live-Schaltung entscheiden.

## DeathCounter V2

Aktuell kein weiterer Pflicht-Umbau.

Empfohlene Prüfung:

- OBS Overlay show/hide prüfen.
- `!rip` / `!del` prüfen.
- Lange Namen prüfen.
- Zusatzspieler links/rechts prüfen.

Wenn visuell nötig: nur kleine CSS-Feinschliffe, keine Funktionsänderungen.

## Nach STEP239 - Message-Rotator Direct Output testen

1. Backend neu starten.
2. Settings prüfen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/message-rotator/admin/settings" | ConvertTo-Json -Depth 80
```

3. Für sicheren Test zuerst `commit=0` verwenden.
4. Wenn `deliveryMode=backend`, `outputMode=announcement`, `announcementColor=purple` gesetzt sind, Live-Test nur bewusst mit `commit=1` durchführen.
5. Falls Twitch `403` liefert, fehlen dem Bot-Token vermutlich Announcement-/Chat-Scope oder Moderatorrechte.
