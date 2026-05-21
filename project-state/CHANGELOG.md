# Changelog

## 2026-05-21 - STEP266B Alert Immediate Bundle Prequeue Self-Block Fix

- `backend/modules/alert_system.js` minimal korrigiert.
- Immediate-Prequeue blockierte sich selbst, weil `alertBundlePrequeue.pending = true` gesetzt wurde und `prepareAndSendAlertSoundBundle(...)` danach wegen genau dieses Pending-Flags abbrach.
- Die Schutzbedingung erlaubt jetzt interne Immediate-Prequeue-Aufrufe mit `allowPendingPrequeue: true`.
- Funktional getestet:
  - Zwei Alerts hintereinander.
  - TTS blieb jeweils beim passenden Alert.
  - Der naechste Alert startete erst nach Ende des vorherigen Alerts inklusive TTS.
  - `raw.soundSystem.bundled = true`.
- Nicht geaendert:
  - `app.sqlite`
  - `config/**`
  - `backend/modules/sound_system.js`
  - Sound-System Bundle-Core
  - Streamer.bot-Flows
  - Overlay-HTML

## 2026-05-20 - STEP238 Message-Rotator Output-Mode

- `backend/modules/message_rotator.js` erweitert:
  - globale `messageOptions.outputMode`
  - globale `messageOptions.announcementColor`
  - optionale Item-Overrides `outputMode` und `announcementColor`
  - Response-Felder fuer Streamer.bot: `streamerbot_action`, `streamerbot_output_mode`, `streamerbot_announcement_color`, `streamerbot_message`
- `htdocs/dashboard/modules/message_rotator.js` erweitert:
  - Select-Felder fuer globale Ausgabeart/Farbe
  - Select-Felder fuer Item-Ausgabeart/Farbe
  - Preview zeigt effektive Ausgabeart.
- Default bleibt `chat`.
- Keine direkte Twitch-/Announcement-Sendelogik im Backend ergaenzt.

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

## STEP239 - 2026-05-20 - Message-Rotator Backend Direct Output

- `backend/modules/message_rotator.js` erweitert: Rotator kann bei `messageOptions.deliveryMode = backend` Ausgaben direkt über Twitch Helix senden.
- `outputMode = announcement` nutzt Helix `/chat/announcements` mit `announcementColor`.
- `outputMode = chat` nutzt Helix `/chat/messages`.
- `deliveryMode = streamerbot` bleibt als Fallback/Handoff möglich.
- `deliveryMode = response_only` erlaubt API-/Vorschau-Betrieb ohne tatsächliches Senden.
- Dashboard zeigt `messageOptions.deliveryMode` als Dropdown.
- Keine DB neu gebaut, keine Secrets geändert, keine vorhandene Rotator-Funktionalität entfernt.
