# NEXT_STEPS

## Nach STEP469

1. ZIP nach `D:\Git\stream-control-center` entpacken.
2. Syntax prüfen:

```bat
node --check htdocs\dashboard\modules\shoutout.js
```

3. Step abschließen:

```bat
.\stepdone.cmd "STEP469 Shoutout Dashboard Module"
```

4. Backend neu starten oder Dashboard hart neu laden, falls statische Dateien gecacht wurden.
5. Dashboard öffnen:

```text
http://127.0.0.1:8080/dashboard/
```

6. Im Bereich `Community` das Modul `Shoutout-System` öffnen.
7. API-Gegencheck:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/status" | ConvertTo-Json -Depth 8
Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/queue" | ConvertTo-Json -Depth 8
Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/timeline?limit=20" | ConvertTo-Json -Depth 8
```

8. Sichtprüfung im Dashboard:

- Runtime-Version `0.2.9` sichtbar.
- Command `!vso` sichtbar.
- Display-Queue sichtbar.
- Official-Queue sichtbar.
- Live-Gate zeigt `source: stream_status` und `upstreamSource: twitch_api`.
- Timeline lädt ohne Fehler.

## Danach

- Live-Test durchführen, wenn der Stream wirklich online ist.
- Prüfen, ob Official-Queue bei live korrekt sendet und offline weiterhin sauber wartet.
- Danach entscheiden, ob Shoutout-Settings editierbar ins Dashboard kommen sollen.
