# NEXT CHAT PROMPT – LC-CORE-POINTS-3A DONE

Wir machen mit dem Projekt `stream-control-center` für ForrestCGN weiter.

Bitte arbeite auf Deutsch, ruhig, direkt und strikt schrittweise.

Wichtig: Erst prüfen, dann planen, dann auf mein ausdrückliches `go` warten. Keine Umsetzung ohne `go`.

Bitte zuerst lesen/berücksichtigen:

- `docs/current/CURRENT_CHAT_HANDOFF_LC_CORE_POINTS_3A_DONE.md`
- `docs/current/CURRENT_STATUS.md`
- `docs/current/TODO.md`
- `docs/current/NEXT_STEPS.md`
- `docs/current/FILES.md`
- `docs/current/CHANGELOG.md`
- `MASTER_PROMPT_stream_control_center_CLEAN_2026-06-15.txt`

Projektbasis:

```text
GitHub: ForrestCGN/stream-control-center
Branch: dev
Lokales Repo: D:\Git\stream-control-center
Live-System: D:\Streaming\stramAssets
Dashboard: http://127.0.0.1:8080/dashboard
Produktive SQLite: D:\Streaming\stramAssets\data\sqlite\app.sqlite
```

Aktueller bestätigter Stand:

```text
LC-CORE-POINTS-3A abgeschlossen.
loyalty.js läuft als Version 0.1.16.
loyalty hat den Bus-Consumer `loyalty:twitch.events:bonus_events` installiert.
Consumer hängt auf sourceModule `twitch_events`, action `received`.
Statusblock `twitchEventBonusBinding` ist in `/api/loyalty/status` sichtbar und installed=true.
```

Technisch angebundene Twitch-Events:

```text
twitch.follow.received
twitch.sub.received
twitch.resub.received
twitch.subgift.received
twitch.giftbomb.received
twitch.cheer.received
twitch.raid.received
```

Mapping zu Loyalty:

```text
twitch.follow.received   -> follow
twitch.sub.received      -> subscribe
twitch.resub.received    -> resub
twitch.subgift.received  -> gift_sub
twitch.giftbomb.received -> gift_bomb
twitch.cheer.received    -> cheer
twitch.raid.received     -> raid
```

Nicht geändert / bewusst offen:

```text
Alert-System wurde nicht angebunden.
Dashboard wurde nicht geändert.
Twitch_events.js wurde nicht geändert.
Donation/Tip wurde nicht als Twitch-Event umgesetzt.
Keine produktive SQLite ersetzt oder verändert.
```

Nächster Schritt:

```text
LC-CORE-POINTS-3B – Event-Bonus-Livetest / Diagnose
```

Bitte zuerst prüfen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/status" | ConvertTo-Json -Depth 8
Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/events/status" | ConvertTo-Json -Depth 8
```

Erwartung bei Loyalty:

```text
version = 0.1.16
twitchEventBonusBinding.installed = true
errors = 0
```

Ziel von LC-CORE-POINTS-3B:

```text
Prüfen, ob bei echten Twitch-Events received/processed hochzählt und ob recordEventBonus() korrekt Punkte/Events schreibt.
```

Harte Regeln:

```text
Keine Funktionalität entfernen.
Keine produktive SQLite ersetzen/löschen.
Keine Apply-/Patch-/Regex-Scripte.
Keine neuen Parallel-Systeme.
Vorhandenen communication_bus/helper_communication nutzen.
Keine Alert-System-Integration ohne separate Planung.
Keine Fake-Test-Route bauen, ohne vorhandene Muster und Risiken zu prüfen.
Vor Umsetzung Ziel/Dateien/Änderung/Nichtänderung/Tests nennen und auf `go` warten.
```
