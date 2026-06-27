Du bist im Projekt **stream-control-center / Event-System / ForrestCGN**.

Bitte strikt einhalten:

## Arbeitsweise / Regeln

1. Nicht raten.
2. Keine alten Stände mischen.
3. Single Source of Truth sind die aktuell hochgeladenen echten Live-Dateien.
4. Keine Apply-Skripte, keine Regex-Patches, keine PowerShell-Set-Content-Flickerei.
5. Wenn Dateien geändert werden müssen: immer vollständige Ersatzdateien in einer ZIP mit echtem Zielpfad.
6. ZIPs müssen direkt nach `D:\Git\stream-control-center` entpackbar sein.
7. Vor jeder Änderung erst erklären:
   - welche Datei betroffen ist
   - welcher konkrete Fehler gefunden wurde
   - was exakt geändert wird
   - was ausdrücklich nicht geändert wird
8. Erst nach meinem **go** eine ZIP bauen.
9. Nach dem Einspielen läuft bei mir `stepdone.cmd`; erst danach testen.
10. Keine DB-Änderungen ohne ausdrückliche Freigabe.
11. Keine Funktionalität entfernen.
12. Wenn eine benötigte Datei fehlt: genau diese Datei anfordern, nicht improvisieren.

## Aktueller Stand

Wir sind im Event-System bei **EVS52.27**.

Zuletzt gebauter Code-STEP:

```text
STEP_EVS52_27_WINNER_TOP3_TWITCH_AVATARS_NO_AUTOREPLAY
```

Geänderte Dateien:

```text
backend/modules/stream_events.js
htdocs/overlays/stream_events/event_winner_overlay.html
```

Erwartete Versionen nach Einspielen:

```text
stream_events moduleVersion: 0.5.93
stream_events moduleBuild: STEP_EVS52_27_WINNER_TOP3_TWITCH_AVATARS_NO_AUTOREPLAY

event_winner_overlay.html moduleVersion: 0.5.42
STEP: EVS52.27
```

## Was EVS52.26 vorher behoben hatte

EVS52.26 war bereits getestet:

```text
moduleVersion : 0.5.92
moduleBuild   : STEP_EVS52_26_WINNER_FINALE_NULLSAFE_PREVIEW
```

Finale-Preview für:

```text
evs_event_mqkyu4hp_27b0cb030fad
```

lieferte wieder:

```text
ok:true
ranking: ForrestCGN 40, EngelCGN 20
dashboardCanStartFinale:true
```

Der Crash `Cannot read properties of null (reading 'startedAt')` war damit behoben.

Offener Hinweis: `finaleActivity.active:true` bei `finaleStarted:false` ist logisch unsauber, blockierte aber nicht.

## Warum EVS52.27 gebaut wurde

Zwei neue Fehler wurden gefunden:

1. In der Auswertung wurde für EngelCGN ein Avatar angezeigt, für RoxxyFoxxyCGN nicht, obwohl RoxxyFoxxyCGN definitiv einen Twitch-Avatar hat und dieser früher bereits angezeigt wurde.
2. Das Auswertungs-/Winner-Overlay wurde teilweise eingeblendet, wenn das Glücksrad angesprochen/eingeblendet wurde.

Entscheidung von Forrest:

```text
Für die ersten drei Gewinner IMMER über Twitch/Userinfo die Avatare holen.
Nur wenn definitiv nichts da ist, darf ein Standard/Fallback angezeigt werden.
```

EVS52.27 soll daher:

- Top-3-Gewinner vor Finale per Twitch/Userinfo forced remote auflösen.
- Lokale Daten ohne Avatar dürfen Twitch/Userinfo nicht blockieren.
- `userAvatarUrl` und `user_avatar_url` backend- und overlayseitig erkennen.
- Winner-Overlay Auto-Replay standardmäßig deaktivieren.
- Auto-Replay nur explizit mit `?autoReplay=1` oder `?auto_replay=1` erlauben.
- Winner-Overlay nicht mehr auf generisches `action === "started"` triggern lassen.

Nicht geändert:

```text
Keine DB
Kein Dashboard
Kein Sound-System
Kein Glücksrad-Code
Keine Ranking-/Punkte-Logik
Keine Reveal-Video-Queue
Keine Random-Rotation
Keine Funktionalität entfernt
```

## Erste Aufgabe im neuen Chat

Bitte zuerst **keine ZIP bauen**.

Zuerst testen/prüfen:

1. Wurde EVS52.27 eingespielt?

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/status"
$s | Select-Object moduleVersion,moduleBuild | Format-List
```

Erwartung:

```text
moduleVersion : 0.5.93
moduleBuild   : STEP_EVS52_27_WINNER_TOP3_TWITCH_AVATARS_NO_AUTOREPLAY
```

2. Winner-Overlay normal öffnen:

```text
http://127.0.0.1:8080/overlays/stream_events/event_winner_overlay.html
```

Erwartung: bleibt leer, kein altes Finale, kein Auto-Replay.

3. Glücksrad starten/anzeigen.

Erwartung: Winner-/Auswertungs-Overlay blendet nicht teilweise ein.

4. Finale/Auswertung starten oder erneut abspielen.

Erwartung: Finale wird angezeigt, Top-3-Avatare werden geladen.

5. Speziell RoxxyFoxxyCGN in Top 3 testen.

Erwartung: RoxxyFoxxyCGN zeigt Avatar, wenn Twitch/Userinfo Avatar liefert.

6. Finale beenden und Replay prüfen.

## Danach nächste Priorität

Wenn EVS52.27 sauber ist:

1. Reveal-Video / Sound-Queue-Safety prüfen.
2. Prüfen, ob Video-Items `mediaType=video`, `durationMs`, `eventUid`, `roundUid`, `requestId` sauber tragen.
3. Prüfen, warum Sound-System nach Reveal-Video manchmal bei `Sound läuft` hängen kann.
4. Notfallbefehl bleibt vorerst:

```powershell
Invoke-RestMethod -Method Post "http://127.0.0.1:8080/api/sound/skip"
```

5. Danach Random-Rotation/minRepeatDistance prüfen.

## Dateien, die im neuen Chat hochgeladen werden sollen

Bitte wieder mit echten Live-Dateien arbeiten:

```text
D:\Streaming\stramAssets\backend\modules\stream_events.js
D:\Streaming\stramAssets\backend\modules\sound_system.js
D:\Streaming\stramAssets\htdocs\dashboard\modules\stream_events.js
D:\Streaming\stramAssets\htdocs\overlays\stream_events\event_winner_overlay.html
D:\Streaming\stramAssets\htdocs\overlays\sound_system_overlay.html
D:\Streaming\stramAssets\htdocs\overlays\event_runtime_overlay.html
```

Zusätzlich, falls vorhanden:

```text
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/CHANGELOG.md
project-state/FILES.md
docs/modules/stream_events.md
docs/current/CURRENT_CHAT_HANDOFF_EVS52_27_WINNER_TOP3_TWITCH_AVATARS_NO_AUTOREPLAY.md
docs/current/TEST_REPORT_EVS52_27_WINNER_TOP3_TWITCH_AVATARS_NO_AUTOREPLAY.md
```
