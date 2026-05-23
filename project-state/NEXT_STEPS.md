# NEXT_STEPS

## Direkt nach STEP277A_FIX1

1. ZIP nach `D:\Git\stream-control-center` entpacken.
2. Backend neu starten.
3. Prüfen:

```text
http://127.0.0.1:8080/api/clip-shoutout/status
```

Erwartet:

```text
step: STEP277A_FIX1
version: 2
```

4. Chat-Test:

```text
!vso @urlug
```

5. Danach erneut Status prüfen:

```text
lastRun.target.login oder lastRun.targetLogin muss urlug sein
```

## Wenn danach `no_clips_found` kommt

Dann ist das Command-Routing repariert. Danach muss nur noch geprüft werden, ob Twitch für diesen Kanal wirklich Clips über Helix zurückliefert oder ob die Clip-Suche in einem weiteren Fix erweitert werden muss.

## Wenn danach `queued` hochgeht

Dann als Nächstes Sound-System prüfen:

```text
http://127.0.0.1:8080/api/sound/status
```

## Später

- Optional TTS nach dem Clip aktivieren.
- Dashboard-Settings für Clip-Shoutout ergänzen.
- Clip-Auswahl/Debug ggf. verfeinern.
