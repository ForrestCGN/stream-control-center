# CURRENT_STATUS – stream-control-center

## Aktueller Bereich

Aktiver Arbeitsbereich: **VIP30 / 30-Tage-VIP-System**

Aktueller stabiler Stand nach letzter Änderung:

- `vip30` Modulversion: **0.8.30**
- `vip30` Build: **step8.19.43-status-command**
- `commands` Modulversion: **0.1.8**
- `commands` Build: **vip30-command-catalog**
- Dashboard-Step: **STEP8.19.40 – Dashboard Active Slot Filter**
- Alert-/Sound-Fix: **STEP8.19.41 – Alert Sound MediaId Direct Fix**
- Chattexte: **STEP8.19.42 – Chat Wording Polish**
- Status-Command: **STEP8.19.43 – VIP30 Status Command**

## Kurzstatus

VIP30 läuft vollständig über Node im `stream-control-center`.

Der getestete Liveflow ist stabil:

- Channelpoints-Redemption wird über Node verarbeitet.
- Bei erfolgreicher Einlösung wird Twitch-VIP vergeben.
- Ein VIP30-Slot wird als `active` gespeichert.
- Die Redemption wird `FULFILLED`.
- Der VIP30-Alert/Sound wird über das bestehende Sound-/Alert-System ausgelöst.
- Eine zweite Einlösung durch denselben aktiven VIP30-User wird blockiert und refunded/canceled.
- Externer VIP-Entzug wird erkannt und der passende VIP30-Slot wird freigegeben.
- Dashboard zeigt aktive Slots getrennt vom Verlauf.

## Bestätigte Testpunkte

### STEP8.19.39 – Twitch VIP Precheck List Fallback

Bestätigte Blocker vor Grant:

- Broadcaster/Streamer wird geblockt: `target_is_broadcaster`.
- Moderator wird geblockt: `target_is_moderator`.
- Twitch-VIP ohne VIP30-Slot wird vor Grant geblockt: `target_is_already_vip`.
- Bei diesen Fällen erfolgt kein Twitch-Grant und kein Slot-Write.
- Redemption wird bei blockierten Einlösungen canceled/refunded, sofern Twitch-VIP nicht bereits erfolgreich vergeben wurde.

### STEP8.19.40 – Dashboard Active Slot Filter

Bestätigt im Dashboard:

- Hauptliste zeigt nur aktive VIP30-Slots (`status = active`).
- Verlauf/Freigaben/Fehler werden separat angezeigt.
- `external_removed` zählt nicht gegen die Slotgrenze.
- Keine DB-Änderung, keine Backend-Änderung in diesem Step.

### STEP8.19.41 – Alert Sound MediaId Direct Fix

Ursache des Soundfehlers:

- VIP30 übergab bei Media-Registry-Sounds gleichzeitig eine interne SoundPool-ID als `soundId` und eine `mediaId`.
- Beispiel aus dem Fehlerbild: `soundId: vip30_default-media`, `mediaId: 1459`.
- Das Sound-System interpretierte `soundId` als echtes Sound-Preset und brach ab, bevor `mediaId` aufgelöst wurde.

Fix:

- Wenn `mediaId` oder `mediaPath` vorhanden ist, sendet VIP30 keinen Fake-`soundId` mehr.
- SoundKey/Preset-Fallback bleibt erhalten, wenn kein Media-Eintrag vorhanden ist.

Bestätigt:

- VIP30-Alert/Sound läuft nach erfolgreicher Einlösung wieder.
- Kein `vip30_alert_sound_bundle_failed` wegen `Sound wurde nicht gefunden` im bestätigten Test.

### STEP8.19.42 – Chat Wording Polish

Geändert:

- Mehrere zufällige Chatvarianten im CGN-/Altersheim-Stil.
- Varianten für Erfolg, bereits aktiver VIP30-Slot, bereits Twitch-VIP ohne VIP30, Moderator, Broadcaster und Slots voll.
- Keine Funktionsänderung an Grant, Slot-Write, Redemption oder Alert/Sound.

### STEP8.19.43 – VIP30 Status Command

Neu:

- `!vip30`
- `!vip30 me`
- `!vip30 slots`
- `!vip30 help`
- `!vip30 @user` nur für Mods/Broadcaster

Bestätigt per Status-Endpunkten:

```text
VIP30:
ok: True
moduleVersion: 0.8.30
moduleBuild: step8.19.43-status-command

Commands:
ok: True
moduleVersion: 0.1.8
moduleBuild: vip30-command-catalog
```

## Letzter erfolgreicher Funktionstest

Auswertung der VIP30-Logs für `YouneCraft`:

```text
13:28:21  live_flow_vip_granted_slot_created_redemption_fulfilled  True
13:28:23  vip30_alert_sound_bundle_queued                           True
13:28:48  live_flow_decision_blocked                                False  already_has_vip30_slot
13:29:07  external_vip_remove_slot_released                         True   external_removed
```

Bedeutung:

- Ersteinlösung erfolgreich.
- VIP-Grant erfolgreich.
- Slot erstellt.
- Redemption fulfilled.
- Alert/Sound queued.
- Zweite Einlösung blockiert wegen aktivem VIP30-Slot.
- Externer VIP-Remove hat Slot freigegeben.

## Aktueller Dashboard-/Slotstatus aus Test

Beispielausgabe nach Test:

```json
{
  "max": 10,
  "active": 1,
  "free": 9,
  "total": 10,
  "revokePending": 0,
  "revoked": 0,
  "failed": 0,
  "cancelled": 0,
  "nextExpiry": "2026-07-07T13:23:25.349Z"
}
```

## Wichtige Projektregeln

- Keine Funktionalität entfernen.
- Bestehende produktive SQLite-Datenbank niemals ersetzen/überschreiben.
- GitHub/dev und Live-System müssen bewusst synchron gehalten werden.
- ZIPs immer mit echten Zielpfaden ab Repo-Root liefern.
- Bei neuen Steps Doku sofort mitziehen.
- VIP30-Core-Flow nicht anfassen, solange nur Texte/Dashboard/Doku geändert werden.

## Offene Punkte

1. Chatcommands live im Twitch-Chat testen:
   - `!vip30`
   - `!vip30 slots`
   - `!vip30 me`
   - optional `!vip30 @user` mit Mod/Broadcaster.
2. VIP30-Texte langfristig in das bestehende Text-/Varianten-System und Dashboard überführen.
3. Sound-/Media-Auswahl im Dashboard später validieren, damit keine ungültige Media-Auswahl gespeichert bleibt.
4. Nach Livebestätigung einen stabilen Abschlussstand dokumentieren.
