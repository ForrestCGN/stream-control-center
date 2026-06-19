# CHANGELOG – Event-System EVS52.27

Stand: 2026-06-19

## STEP_EVS52_27_WINNER_TOP3_TWITCH_AVATARS_NO_AUTOREPLAY

Geändert:

```text
backend/modules/stream_events.js
htdocs/overlays/stream_events/event_winner_overlay.html
```

### Backend

- `stream_events.js` von `0.5.92` auf `0.5.93` erhöht.
- `moduleBuild` gesetzt auf `STEP_EVS52_27_WINNER_TOP3_TWITCH_AVATARS_NO_AUTOREPLAY`.
- Top-3-Gewinner werden vor dem Finale per Twitch/Userinfo forced remote aufgelöst.
- Lokaler DisplayName ohne Avatar stoppt die Avatar-Auflösung nicht mehr.
- Avatar-Felder `userAvatarUrl` und `user_avatar_url` werden zusätzlich normalisiert/erkannt.
- Vorhandene lokale Avatare bleiben Fallback, falls Twitch/Userinfo keinen Avatar liefert oder fehlschlägt.

### Winner-Overlay

- `event_winner_overlay.html` von `0.5.41 / EVS52.20` auf `0.5.42 / EVS52.27` erhöht.
- Avatar-Key-Liste erweitert um `userAvatarUrl` und `user_avatar_url`.
- Auto-Replay ist standardmäßig AUS.
- Auto-Replay läuft nur noch explizit mit `?autoReplay=1` oder `?auto_replay=1`.
- Generisches `action === "started"` triggert das Winner-Overlay nicht mehr.

## Behobene/Adressierte Probleme

- RoxxyFoxxyCGN hatte im Gewinner-Finale keinen Avatar, obwohl definitiv ein Twitch-Avatar vorhanden ist.
- Ursache/Adressierung: Top-3-Finale darf nicht von unvollständigen lokalen Daten abhängig sein; Twitch/Userinfo wird für die Top 3 erzwungen.
- Auswertungs-Overlay wurde teilweise eingeblendet, wenn das Glücksrad angesprochen wurde.
- Ursache/Adressierung: Winner-Overlay war durch Auto-Replay und breite Bus-Trigger zu aggressiv.

## Nicht geändert

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

## Vorheriger bestätigter STEP

EVS52.26:

- Finale-Preview crasht nicht mehr bei frisch beendetem Event ohne vorhandenes `winnerFinale`.
- API liefert `ok:true` und `dashboardCanStartFinale:true` für `evs_event_mqkyu4hp_27b0cb030fad`.
