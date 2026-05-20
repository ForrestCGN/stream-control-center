# NEXT STEPS - stream-control-center

Stand: 2026-05-20

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
