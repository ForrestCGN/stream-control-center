# VIP30 STEP8.19.23 – Test-Checkliste

## Nach Einspielen von STEP8.19.22

1. Syntaxcheck:

```cmd
cd /d D:\Git\stream-control-center
node -c backend\modules\vip30.js
```

2. Deploy / Live aktualisieren.
3. Node neu starten.
4. Dashboard öffnen:

```text
VIP30 → Übersicht
```

5. Prüfen:

```text
Modul OK
Letzter Fehler nicht HTTP 200
Kachel gefunden
Kachel aktiv
Action-Type vip30
Action-Key vip30.redeem
```

6. Test-Redeem mit User ohne VIP30-Slot.

Erwartung:

```text
VIP wird vergeben
Slot wird gespeichert
Redemption wird fulfilled
Chatmeldung erscheint
Alert wird queued
Log zeigt Erfolg
```

7. Zweiter Test-Redeem mit gleichem User.

Erwartung:

```text
already_has_vip30_slot
Redemption wird canceled/refunded
Chatmeldung erscheint
Log zeigt Block korrekt
```

8. Test mit Streamer/Moderator/bereits VIP nur vorsichtig, da Twitch 422 kommen kann.

Erwartung:

```text
VIP nicht vergeben
Redemption canceled/refunded, soweit möglich
Chatmeldung
Log/Dashboard rot
```
