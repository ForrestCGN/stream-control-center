# CHANGELOG – VIP30 / 30-Tage-VIP-System

## STEP8.19.43 – VIP30 Status Command

- `backend/modules/vip30.js` auf Version `0.8.30` / Build `step8.19.43-status-command` angehoben.
- `backend/modules/commands.js` auf Version `0.1.8` / Build `vip30-command-catalog` angehoben.
- Neue Chatcommands:
  - `!vip30`
  - `!vip30 me`
  - `!vip30 slots`
  - `!vip30 help`
  - `!vip30 @user` nur für Mods/Broadcaster
- Commands sind rein lesend und dürfen keinen VIP-Grant, Slot-Write oder Redemption-Update auslösen.
- Syntaxcheck bestätigt:
  - `node -c backend/modules/vip30.js`
  - `node -c backend/modules/commands.js`
- Status bestätigt:
  - VIP30 `0.8.30 / step8.19.43-status-command`
  - Commands `0.1.8 / vip30-command-catalog`

## STEP8.19.42 – VIP30 Chat Wording Polish

- `backend/modules/vip30.js` auf Version `0.8.29` / Build `step8.19.42-chat-wording-polish` angehoben.
- Chattexte im CGN-/Altersheim-Stil überarbeitet.
- Mehrere zufällige Varianten für:
  - erfolgreiche VIP30-Vergabe
  - bereits aktiver VIP30-Slot
  - bereits Twitch-VIP ohne VIP30
  - Moderator
  - Broadcaster/Streamer
  - Slots voll
- Keine Änderung an Grant, Slot-Write, Redemption, Dashboard oder Alert/Sound.

## STEP8.19.41 – Alert Sound MediaId Direct Fix

- `backend/modules/vip30.js` auf Version `0.8.28` / Build `step8.19.41-alert-sound-mediaid-direct-fix` angehoben.
- Fehlerbild behoben:

```text
vip30_alert_sound_bundle_failed
Sound wurde nicht gefunden
soundId: vip30_default-media
mediaId: 1459
```

- Ursache: VIP30 sendete bei Media-Registry-Sounds gleichzeitig eine interne SoundPool-ID als `soundId`, wodurch das Sound-System vor der `mediaId`-Auflösung abbrach.
- Fix: Wenn `mediaId` oder `mediaPath` vorhanden ist, wird kein Fake-`soundId` mehr gesendet.
- SoundKey/Preset-Fallback bleibt erhalten, wenn kein Media-Eintrag vorhanden ist.
- Bestätigt: VIP30-Alert/Sound läuft nach erfolgreicher Einlösung wieder.

## STEP8.19.40 – Dashboard Active Slot Filter

- `htdocs/dashboard/modules/vip30.js` und `htdocs/dashboard/modules/vip30.css` aktualisiert.
- Hauptliste im Dashboard zeigt nur aktive VIP30-Slots (`status = active`).
- Verlauf/Freigaben/Fehler werden separat dargestellt.
- Keine DB-Änderung.
- Keine Backend-Änderung.
- `external_removed` bleibt Verlauf und zählt nicht als aktiver Slot.

## STEP8.19.39 – Twitch VIP Precheck List Fallback

- `backend/modules/helpers/helper_twitch_roles.js` und `backend/modules/vip30.js` aktualisiert.
- `isTargetVip(...)` robuster gemacht:
  - Einzelcheck per Twitch `/channels/vips?user_id=...`
  - Fallback über komplette VIP-Liste via `listChannelVips()`
  - Match per `userId` oder normalisiertem Login
- Problem behoben, bei dem ein normaler Twitch-VIP ohne VIP30 erst bis zum Twitch-Grant lief und Twitch mit 422 ablehnte.
- Bestätigt: Twitch-VIP ohne VIP30 wird jetzt vor Grant mit `target_is_already_vip` geblockt.

## STEP8.19.38 – Already VIP / VIP30 Message Cleanup

- Unterscheidung ergänzt:
  - `already_has_vip30_slot`: User hat aktiven VIP30-Slot.
  - `target_is_already_vip`: User ist Twitch-VIP, aber nicht VIP30.
- Entsprechende Chatmeldungen und Gründe getrennt.

## STEP8.19.37 – Chat Wording Cleanup

- Chat-/User-Texte von „VIP30 wurde nicht vergeben“ auf „VIP wurde nicht vergeben“ angepasst, wo es um Twitch-VIP-Grant geht.
- Broadcaster-/Moderator-/Role-Precheck-Fehlertexte bereinigt.

## STEP8.19.36 – External VIP Remove Event Emit Fix

- Fehlenden Helper `emitLiveExecutionEvent(...)` ergänzt.
- Fehler im EventSub-Pfad `channel.vip.remove` behoben.
- Slot-Freigabe bei externem VIP-Entzug blieb unverändert.

## STEP8.19.35 – Twitch Roles Helper Precheck

- `backend/modules/helpers/helper_twitch_roles.js` erweitert.
- Neue/erweiterte Funktionen:
  - `isTargetVip`
  - `getChannelUserRoleState`
- VIP30 nutzt Rollenhelper vor Twitch-Grant.
- Blocker vor Grant:
  - Broadcaster
  - Moderator
  - bestehender Twitch-VIP
- Chattext „Punkte zurückgegeben“ nur wenn Twitch cancel/refund bestätigt.

## Frühere STEP8.19.x VIP30-Stände

Die wichtigsten stabilisierten Themen vor STEP8.19.35:

- Dashboard-Live-Readiness / Tile Truth.
- Legacy-Gate-Cleanup.
- Desired Reward / DB Override Cleanup.
- Twitch Capability Cleanup.
- Legacy Live Routes Cleanup.
- Dashboard Settings Filter / Settings Surface Cleanup.
- Live Grant Atomic Safety Fix.

## Bestätigter Teststand nach STEP8.19.43

VIP30-Logs für `YouneCraft` zeigten:

```text
live_flow_vip_granted_slot_created_redemption_fulfilled  True
vip30_alert_sound_bundle_queued                          True
live_flow_decision_blocked                               False  already_has_vip30_slot
external_vip_remove_slot_released                        True   external_removed
```

Damit bestätigt:

- Ersteinlösung erfolgreich.
- Alert/Sound queued.
- Zweite Einlösung blockiert.
- Externer VIP-Remove gibt Slot frei.

## Wichtige Regeln

- Keine Funktionalität entfernen.
- Produktive SQLite-Datenbank nicht ersetzen.
- VIP30-eigenen Logs-Endpunkt nutzen, bevor allgemeine Logs oder DB-Tabellen blind gesucht werden.
- Doku bei weiteren Steps sofort aktualisieren.
