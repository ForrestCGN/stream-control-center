# TEST REPORT – EVS52.21 Winner Finale

Stand: 2026-06-18

## Testbasis

Testevent:

```text
eventUid: evs_event_mqjp25n9_afdd14be3c4a
Name: test
Status: finished
RankingCount: 2
```

Ranking:

```text
1. EngelCGN – 50 Punkte – 2 Einträge
2. ForrestCGN – 10 Punkte – 1 Eintrag
```

## Beobachtete Ergebnisse

### Finale-Backend

Die Start-Route lieferte korrekt:

```text
ok: true
alreadyDrawn: true
replay: true
winner: EngelCGN
rankingCount: 2
```

Damit war klar: Backend/Finale-Daten waren vorhanden.

### Overlay-Probleme und Fixes

1. Overlay war anfangs dauerhaft sichtbar → EVS52.17 Idle-Hide.
2. Overlay tauchte kurz auf und verschwand wieder → EVS52.19 manuelles Finale-Ende, kein Ausblenden durch leeren Poll.
3. Overlay blieb sichtbar, aber Header startete wiederholt neu → EVS52.20 No-Restart-Loop.
4. Wunsch nach erneutem Abspielen über Dashboard → EVS52.21 Replay-Button.

### Finaler Bedienablauf nach EVS52.21

```text
1. Auswertung starten.
2. Overlay bleibt sichtbar.
3. Finale beenden.
4. Overlay verschwindet.
5. Auswertung erneut abspielen.
6. Dieselbe Auswertung wird erneut gezeigt, ohne neue Auslosung.
```

## Noch empfohlener kurzer Abschlusstest

Nach Einspielen im Live-System:

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/status"
$s | Select-Object moduleVersion,moduleBuild | Format-List
```

Dann im Dashboard hart neu laden und Ablauf prüfen:

```text
🏆 Auswertung starten → ⏹ Finale beenden → 🔁 Auswertung erneut abspielen
```

## Hinweis

EVS52.21 ändert nicht die Backend-Auslosung, sondern die Bedienung/Replays im Dashboard und das Overlay-Verhalten.
