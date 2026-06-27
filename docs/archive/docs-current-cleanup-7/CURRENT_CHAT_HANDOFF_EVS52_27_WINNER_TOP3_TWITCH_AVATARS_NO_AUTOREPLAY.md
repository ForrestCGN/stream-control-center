# CURRENT CHAT HANDOFF – EVS52.27 Winner Top3 Twitch Avatars / No AutoReplay

Stand: 2026-06-19

## Kontext

Im Event-System wurden nach EVS52.26 zwei weitere Fehler gefunden:

1. Im Gewinner-Finale wurde für EngelCGN ein Avatar angezeigt, für RoxxyFoxxyCGN jedoch nicht, obwohl RoxxyFoxxyCGN definitiv einen Twitch-Avatar hat und dieser früher bereits angezeigt wurde.
2. Das Auswertungs-/Winner-Overlay wurde teilweise eingeblendet, wenn das Glücksrad angesprochen/eingeblendet wurde.

## Entscheidung

Forrest hat klargestellt:

```text
Für die ersten drei Gewinner sollen IMMER über Twitch/Userinfo die Avatare geholt werden.
Nur wenn definitiv nichts da ist, darf ein Standard/Fallback angezeigt werden.
```

## Umgesetzter STEP

```text
STEP_EVS52_27_WINNER_TOP3_TWITCH_AVATARS_NO_AUTOREPLAY
```

## Geänderte Dateien

```text
backend/modules/stream_events.js
htdocs/overlays/stream_events/event_winner_overlay.html
```

## Backend-Änderungen

```text
moduleVersion: 0.5.93
moduleBuild: STEP_EVS52_27_WINNER_TOP3_TWITCH_AVATARS_NO_AUTOREPLAY
```

Umgesetzt:

- Top-3-Gewinner werden vor Finale per Twitch/Userinfo forced remote aufgelöst.
- Lokale Daten ohne Avatar verhindern die Twitch/Userinfo-Auflösung nicht mehr.
- Vorhandene lokale Avatare bleiben Fallback.
- Avatar-Felder `userAvatarUrl` und `user_avatar_url` werden zusätzlich erkannt.

## Overlay-Änderungen

```text
moduleVersion: 0.5.42
STEP: EVS52.27
```

Umgesetzt:

- Avatar-Key-Liste erkennt `userAvatarUrl` und `user_avatar_url`.
- Auto-Replay ist standardmäßig AUS.
- Auto-Replay nur noch explizit mit `?autoReplay=1` / `?auto_replay=1`.
- Generisches `action === "started"` triggert das Winner-Overlay nicht mehr.

## Warum das Glücksrad-Problem entstehen konnte

Das Winner-Overlay hatte bisher Auto-Replay standardmäßig aktiv und konnte beim Laden/Neuladen automatisch `/api/stream-events/winner-finale/latest` abfragen. Zusätzlich war der Bus-Trigger zu breit, weil generische `started`-Actions als potentielles Finale-Signal akzeptiert wurden.

Dadurch konnte beim Laden/Fokussieren einer OBS-/Overlay-Szene ein altes oder aktives Finale teilweise wieder sichtbar werden, obwohl eigentlich das Glücksrad angezeigt werden sollte.

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

## Muss im nächsten Chat / direkt nach Einspielen getestet werden

1. Statusroute muss `0.5.93 / STEP_EVS52_27_WINNER_TOP3_TWITCH_AVATARS_NO_AUTOREPLAY` zeigen.
2. Winner-Overlay ohne Parameter öffnen: muss leer bleiben.
3. Glücksrad starten/anzeigen: Winner-Overlay darf nicht teilweise einblenden.
4. Finale/Auswertung starten oder erneut abspielen.
5. RoxxyFoxxyCGN in Top 3 testen: Avatar muss angezeigt werden, wenn Twitch/Userinfo ihn liefert.
6. Finale beenden.
7. Replay prüfen.
8. Danach Reveal-Video/Sound-Queue-Safety prüfen.
9. Danach Random-Rotation/minRepeatDistance prüfen.

## Bekannter vorheriger Stand EVS52.26

EVS52.26 wurde getestet:

- `stream_events` lief auf `0.5.92 / STEP_EVS52_26_WINNER_FINALE_NULLSAFE_PREVIEW`.
- Finale-Preview für `evs_event_mqkyu4hp_27b0cb030fad` lieferte `ok:true`.
- Ranking: ForrestCGN 40, EngelCGN 20.
- `dashboardCanStartFinale:true`.

Offener Hinweis: `finaleActivity.active:true` bei noch nicht vorhandenem Finale ist logisch unsauber, blockierte aber nicht.
