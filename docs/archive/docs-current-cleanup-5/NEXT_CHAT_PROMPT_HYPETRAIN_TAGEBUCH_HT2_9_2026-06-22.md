# NEXT_CHAT_PROMPT – HypeTrain/Tagebuch HT2.9

Wir arbeiten im Projekt `stream-control-center` von ForrestCGN.

Bitte zuerst die echten Projektdateien und Dokus prüfen, nicht aus Erinnerung arbeiten. Aktueller bestätigter Stand:

```text
hypetrain: 0.1.6 / STEP_HT2_9_HYPETRAIN_TAGEBUCH_POSTER_NAME
tagebuch:  0.1.2 / STEP_HT2_9_TAGEBUCH_SYSTEM_WEBHOOK_NAME
```

HT2.9 ist abgeschlossen. Ziel des Fixes:

```text
Wenn HypeTrain über das Tagebuch postet, soll der sichtbare Discord-Name vom Tagebuch-Webhook kommen.
Aktuell bestätigt: CGN Posty.
```

Bestätigter produktiver Test:

```text
productiveActions = True
dryRun = False
trigger = manual_productive_test
discord.skipped = true
diary.ok = true / status 200
recordSound.skipped = true
Discord sichtbar = CGN Posty
```

Aktueller Standard:

```text
diaryEndEnabled = true
directDiscordEndEnabled = false
recordSoundEndEnabled = false
```

Nächster sinnvoller Schritt:

```text
Beim nächsten echten Twitch-HypeTrain beobachten, ob Ende automatisch ins Tagebuch schreibt und Discord sichtbar als CGN Posty postet.
```

Arbeitsregeln:

- Keine Annahmen; echte Dateien/Dokus prüfen.
- Fehlende Dateien exakt anfordern.
- Vor Änderungen Plan nennen und auf `go` warten.
- ZIPs mit echten Zielpfaden ab Repo-Root liefern.
- Produktive DB niemals ersetzen/löschen/droppen/überschreiben.
- Kein Sound am Sound-System vorbei.
- Keine eigene Twitch/EventSub-Logik im hypetrain-Modul.
- Keine Funktionalität entfernen.
- `stepdone.cmd` erst nach Einspielen, Test und Bestätigung.
