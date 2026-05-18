# Changelog – stream-control-center

## 2026-05-18 – STEP208 Loyalty Subscribe/Resub Dedupe

- Loyalty-Version auf `0.1.11` erhöht.
- Subscribe/Resub-Kollisionsfilter ergänzt:
  - Wenn ein `resub` kurz nach einem `subscribe` für denselben User/Provider/Tier kommt, wird der vorherige Subscribe kompensiert.
  - Der vorherige Subscribe wird als `replaced_by_resub` markiert.
  - Eine negative `event_dedupe_adjustment`-Transaktion gleicht die ursprünglichen Subscribe-Punkte aus.
- Neue Settings:
  - `eventDedupe.subscribeResubCollision.enabled`
  - `eventDedupe.subscribeResubCollision.windowSeconds`
- Keine Änderung an GiftSub-/GiftBomb-, Watch-Punkte- oder Runner-Logik.

## 2026-05-18 – STEP207 Loyalty AutoRunner Boot Recovery

- Loyalty-Version auf `0.1.10` erhöht.
- AutoRunner Boot Recovery ergänzt:
  - Beim Backend-/Node-Neustart wird geprüft, ob der gespeicherte Stream-State weiterhin live ist.
  - Wenn ja und `autoRunner.startOnStreamStateStart` aktiv ist, startet der Runner automatisch wieder.
- Neue Runner-Events:
  - `runner_auto_started_on_boot_live_state`
  - `runner_boot_recovery_skipped_by_setting`
  - `runner_boot_recovery_error`
- Keine Änderung an Watch-Punkte-, Event-Bonus-, GiftSub-/GiftBomb- oder Sub/Resub-Logik.

## 2026-05-11 – STEP263 DeathCounter Overlay Slide Timing

- DeathCounter-Overlay-Slide minimal langsamer gemacht.
- `.bar` Transition angepasst:
  - opacity/filter `0.50s`
  - transform `0.72s`
- Keine Funktionslogik geändert.

## 2026-05-11 – STEP262 DeathCounter Overlay Alert Frame Slide

- DeathCounter-Overlay optisch an Alert-Außenrahmen angepasst.
- Slide-In/Out von oben umgesetzt.
- API/WebSocket/Marquee/Zusatzspieler-Logik unverändert gelassen.

## 2026-05-11 – STEP259 DeathCounter DB-only Manual JSON Export

- DeathCounter produktiv DB-only.
- Automatischer JSON-Dual-Write entfernt.
- `!dcount backup` und `!dcount export` ergänzt.
