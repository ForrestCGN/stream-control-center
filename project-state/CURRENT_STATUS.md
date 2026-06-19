# CURRENT_STATUS

Stand: 2026-06-19

## Projektbereich

`stream-control-center` / `Community → Event-System → Stream-Events`

Aktueller geprüfter Arbeitsstand nach EVS52.27:

- Backend `stream_events`: **0.5.93**
- Backend Build: **STEP_EVS52_27_WINNER_TOP3_TWITCH_AVATARS_NO_AUTOREPLAY**
- Winner-Overlay `event_winner_overlay.html`: **0.5.42 / EVS52.27**
- Vorher bestätigter Fix EVS52.26: Finale-Preview crasht nicht mehr und liefert `dashboardCanStartFinale:true`.

## EVS52.27 – Zweck

EVS52.27 behebt zwei im Live-/Testbetrieb gefundene Probleme rund um die Auswertung:

1. Top-3-Avatare im Gewinner-Finale sollen nicht mehr von eventuell unvollständigen lokalen Daten abhängen.
2. Das Gewinner-/Auswertungs-Overlay darf sich nicht ungefragt einblenden, wenn z. B. das Glücksrad angesprochen oder eine OBS-Quelle neu geladen wird.

## Geänderte Dateien in EVS52.27

```text
backend/modules/stream_events.js
htdocs/overlays/stream_events/event_winner_overlay.html
```

## Backend-Änderung

`stream_events.js` wurde von `0.5.92` auf `0.5.93` erhöht.

Der Top-3-Avatar-Preload vor dem Finale nutzt jetzt eine erzwungene Remote-Auflösung über Twitch/Userinfo für die ersten drei Gewinner-Plätze.

Wichtiges Ziel:

```text
Top 3 ermitteln
→ für jeden der ersten drei User Twitch/Userinfo abfragen
→ Avatar + DisplayName übernehmen
→ erst danach Finale-Payload bauen und ans Overlay senden
→ nur wenn Twitch/Userinfo keinen Avatar liefert, lokalen vorhandenen Avatar behalten
→ nur wenn definitiv kein Avatar vorhanden ist, Fallback/Initialen anzeigen
```

Zusätzlich erkennt das Backend Avatar-Felder wie:

```text
userAvatarUrl
user_avatar_url
```

## Overlay-Änderung

`event_winner_overlay.html` wurde von `0.5.41 / EVS52.20` auf `0.5.42 / EVS52.27` erhöht.

Geändert:

- `userAvatarUrl` und `user_avatar_url` werden als Avatar-Felder erkannt.
- Auto-Replay ist standardmäßig AUS.
- Auto-Replay läuft nur noch bei expliziter URL mit `?autoReplay=1` oder `?auto_replay=1`.
- Generisches `action === "started"` triggert das Winner-Overlay nicht mehr.

Damit soll verhindert werden, dass das Auswertungs-Overlay teilweise sichtbar wird, wenn das Glücksrad oder eine andere Overlay-/OBS-Quelle geladen wird.

## Was nicht geändert wurde

```text
Keine DB-Änderung
Kein Dashboard-Code
Kein Sound-System-Code
Kein Glücksrad-Code
Keine Ranking-/Punkte-Logik
Keine Reveal-Video-Queue
Keine Random-Rotation
Keine Funktionalität entfernt
```

## Noch zu testen

Siehe `project-state/NEXT_STEPS.md` und `docs/current/TEST_REPORT_EVS52_27_WINNER_TOP3_TWITCH_AVATARS_NO_AUTOREPLAY.md`.

## Bekannter Hinweis aus EVS52.26

Die Finale-Preview kann noch logisch unsauber `finaleActivity.active:true` bei `finaleStarted:false` liefern. Das blockiert aktuell den Start nicht, sollte aber nach dem Stream sauber bereinigt werden.
