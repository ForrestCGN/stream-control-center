# VIP30 / 30TageVIP

Stand: 2026-06-07  
Aktueller stabiler Arbeitsstand: **STEP8.19.43 – VIP30 Status Command**

## Kurzbeschreibung

VIP30 ist ein Node-basiertes 30-Tage-VIP-System im `stream-control-center`.

Es verarbeitet Twitch-Kanalpunkte-Redemptions vollständig über Node, vergibt Twitch-VIP, schreibt VIP30-Slots, fulfilled/cancelt Redemptions korrekt, löst den VIP30-Alert/Sound über das bestehende Sound-/Alert-System aus und stellt Dashboard sowie Chat-Statuscommands bereit.

## Aktueller Status

```txt
✅ VIP30-Core funktionsfähig
✅ Live-Redemption getestet
✅ Twitch-VIP-Grant getestet
✅ Slot-Write getestet
✅ Redemption-Fulfill getestet
✅ Redemption-Cancel/Refund bei Blockern getestet
✅ Alert/Sound nach MediaId-Fix getestet
✅ Doppelte Einlösung wird blockiert
✅ Externer VIP-Remove gibt Slot frei
✅ Dashboard trennt aktive Slots vom Verlauf
✅ VIP30-Statuscommands eingebunden
✅ GitHub docs/current aktualisiert
```

## Aktuelle Versionen

### Backend VIP30

```txt
Datei: backend/modules/vip30.js
moduleVersion: 0.8.30
moduleBuild: step8.19.43-status-command
```

### Commands

```txt
Datei: backend/modules/commands.js
moduleVersion: 0.1.8
moduleBuild: vip30-command-catalog
```

### Dashboard

```txt
Dateien:
htdocs/dashboard/modules/vip30.js
htdocs/dashboard/modules/vip30.css

Aktueller Dashboard-Stand:
STEP8.19.40 – Dashboard Active Slot Filter
```

## Wichtige Dateien

```txt
backend/modules/vip30.js
backend/modules/commands.js
backend/modules/helpers/helper_twitch_roles.js
htdocs/dashboard/modules/vip30.js
htdocs/dashboard/modules/vip30.css
docs/current/CURRENT_STATUS.md
docs/current/FILES.md
docs/current/NEXT_STEPS.md
docs/current/CHANGELOG.md
docs/modules/vip30.md
```

## Kernablauf bei erfolgreicher Einlösung

```txt
1. Channelpoints-Redemption kommt über Node/EventSub rein.
2. VIP30 prüft Live-/Reward-/Systembereitschaft.
3. VIP30 prüft Zieluser:
   - Broadcaster?
   - Moderator?
   - bereits aktiver VIP30-Slot?
   - bereits Twitch-VIP ohne VIP30?
   - freie Slots?
4. Wenn erlaubt:
   - Twitch-VIP wird vergeben.
   - VIP30-Slot wird als active geschrieben.
   - Redemption wird FULFILLED.
   - VIP30-Alert/Sound wird queued.
   - Chat-Erfolgsmeldung wird ausgegeben.
5. Wenn nicht erlaubt:
   - kein Grant.
   - kein Slot-Write.
   - Redemption wird canceled/refunded, sofern kein VIP-Grant erfolgt ist.
   - passende Chatmeldung wird ausgegeben.
```

## Blocker / Schutzfälle

### Broadcaster

```txt
reason: target_is_broadcaster
Grant: nein
SlotWrite: nein
Redemption: CANCELED/Refund
```

### Moderator

```txt
reason: target_is_moderator
Grant: nein
SlotWrite: nein
Redemption: CANCELED/Refund
```

### Bereits aktiver VIP30-Slot

```txt
reason: already_has_vip30_slot
Grant: nein
SlotWrite: nein
Redemption: CANCELED/Refund
Chat nennt Ablaufdatum des vorhandenen VIP30-Slots.
```

### Bereits Twitch-VIP ohne VIP30

```txt
reason: target_is_already_vip
Grant: nein
SlotWrite: nein
Redemption: CANCELED/Refund
```

Wichtig: **Twitch-VIP ist nicht automatisch VIP30.** Diese Fälle werden bewusst getrennt behandelt.

## Rollenprüfung / Twitch Helper

Datei:

```txt
backend/modules/helpers/helper_twitch_roles.js
```

Relevante Funktionen:

```txt
listChannelVips()
listChannelModerators()
isTargetModerator()
isTargetVip()
getChannelUserRoleState()
tokenStatus()
clearCache()
```

Wichtiger Stand aus STEP8.19.39:

- `isTargetVip(...)` nutzt nicht nur den Einzelcheck.
- Fallback über komplette VIP-Liste via `listChannelVips()`.
- Match per `userId` oder normalisiertem Login.
- Dadurch werden normale Twitch-VIPs ohne VIP30 vor dem Grant korrekt erkannt.

## Alert/Sound

### Erfolgsstatus

Nach STEP8.19.41 läuft der VIP30-Alert/Sound wieder.

Bestätigter Event:

```txt
vip30_alert_sound_bundle_queued
```

### Behobener Fehler

Fehlerbild vor STEP8.19.41:

```txt
vip30_alert_sound_bundle_failed
Sound wurde nicht gefunden
soundId: vip30_default-media
mediaId: 1459
```

Ursache:

```txt
VIP30 hatte bei Media-Registry-Sounds gleichzeitig eine interne SoundPool-ID als soundId und eine mediaId gesendet.
Das Sound-System interpretierte soundId als echtes Sound-Preset und brach ab, bevor mediaId aufgelöst wurde.
```

Fix:

```txt
Wenn mediaId oder mediaPath vorhanden ist, sendet VIP30 keinen Fake-soundId mehr.
Wenn kein Media-Eintrag vorhanden ist, bleibt der alte soundKey/Preset-Fallback möglich.
```

## Dashboard

### Tabs

```txt
Übersicht
Slots
Logs
Config
Sounds
Texte
Aktionen
Diagnose
```

### Slotanzeige

Stand STEP8.19.40:

```txt
Hauptliste: nur aktive Slots (status = active)
Verlauf/Freigegeben/Fehler: separate Darstellung
```

Statuswerte wie `external_removed`, `expired`, `failed`, `revoked` usw. sind Verlauf und dürfen nicht durch Dashboard-Filter gelöscht werden.

### Sounds

Setting:

```txt
alerts.soundPool
```

Beispiel:

```json
[
  {
    "id": "vip30_default-media",
    "enabled": true,
    "weight": 1,
    "mediaId": 1459,
    "mediaPath": "",
    "durationMs": 0,
    "label": "VIP30 Sound"
  }
]
```

Regel:

```txt
durationMs = 0 -> Auto aus Media-System/ffprobe
durationMs > 0 -> manuelle Dauer in ms
```

Wichtig nach STEP8.19.41:

```txt
Die interne SoundPool-id darf bei Media-Einträgen nicht als soundId an das Sound-System gesendet werden.
```

### Texte / OverlaySets

Setting:

```txt
alerts.overlaySets
```

Beispiel:

```json
[
  {
    "id": "heimleitung-upgrade",
    "enabled": true,
    "weight": 3,
    "kicker": "Upgrade im CGN-Altersheim",
    "headline": "{displayName} wird Ehrenbewohner.",
    "subline": "Die Rentner begrüßen freundlich.",
    "message": "Ein kleines VIP-Upgrade wurde genehmigt.",
    "perks": ["Keks extra", "Sessel vorgewärmt"],
    "brand": "CGN VIP-Lounge"
  }
]
```

## Chatcommands

Stand STEP8.19.43:

```txt
!vip30
!vip30 me
!vip30 slots
!vip30 help
!vip30 @user   nur Mods/Broadcaster
```

Erwartung:

```txt
!vip30        -> allgemeiner VIP30-Status
!vip30 slots  -> belegte/freie Slots und nächster Ablauf
!vip30 me     -> eigene Restlaufzeit oder Inaktiv-Hinweis
!vip30 help   -> kurze Hilfe
!vip30 @user  -> Mod/Broadcaster-Abfrage für Zieluser
```

Wichtig:

```txt
Diese Commands sind rein lesend.
Sie dürfen keinen VIP-Grant, Slot-Write oder Redemption-Update auslösen.
```

## Wichtige API-Endpunkte

### Status

```txt
GET /api/vip30/status
```

Prüfung:

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/vip30/status"
$s | Select-Object ok,moduleVersion,moduleBuild,lastError
```

Erwartung:

```txt
ok: True
moduleVersion: 0.8.30
moduleBuild: step8.19.43-status-command
lastError: leer/null
```

### VIP30 Logs

```txt
GET /api/vip30/logs?user=<login>&limit=<n>
```

Beispiel:

```powershell
$r = Invoke-RestMethod "http://127.0.0.1:8080/api/vip30/logs?user=younecraft&limit=10"
$r.logs | Select-Object createdAt,eventType,success,reason,message | Format-Table -AutoSize
```

Wichtig: Bei VIP30-Fehlern zuerst diesen VIP30-eigenen Logs-Endpunkt nutzen, nicht blind allgemeine Node-Logs oder DB-Tabellen suchen.

### Commands Status

```txt
GET /api/commands/status
```

Prüfung:

```powershell
$c = Invoke-RestMethod "http://127.0.0.1:8080/api/commands/status"
$c | Select-Object ok,moduleVersion,moduleBuild,lastError
```

Erwartung:

```txt
ok: True
moduleVersion: 0.1.8
moduleBuild: vip30-command-catalog
lastError: leer/null
```

### Manueller Alert-Test

Endpunkt:

```txt
POST /api/vip30/alert/test
```

Dashboard:

```txt
Aktionen -> Anzeigename/Login zum Auflösen -> VIP30 Alert testen
```

Sicherheit:

```txt
kein Twitch VIP Grant
kein Slot Write
kein Redemption Fulfill/Cancel
nur Twitch User-Lookup + Alert-Bundle
```

## Bestätigter Teststand

VIP30-Logs für `YouneCraft` nach STEP8.19.41/42/43:

```txt
13:28:21  live_flow_vip_granted_slot_created_redemption_fulfilled  True
13:28:23  vip30_alert_sound_bundle_queued                           True
13:28:48  live_flow_decision_blocked                                False  already_has_vip30_slot
13:29:07  external_vip_remove_slot_released                         True   external_removed
```

Bedeutung:

```txt
Ersteinlösung erfolgreich
VIP-Grant erfolgreich
Slot erstellt
Redemption fulfilled
Alert/Sound queued
Zweite Einlösung blockiert wegen aktivem VIP30-Slot
Externer VIP-Remove hat Slot freigegeben
```

## Historie der letzten Steps

### STEP8.19.35 – Twitch Roles Helper Precheck

- Rollenhelper erweitert.
- Broadcaster/Moderator/VIP vor Grant geprüft.

### STEP8.19.36 – External VIP Remove Event Emit Fix

- Fehlender `emitLiveExecutionEvent(...)` Helper ergänzt.
- EventSub `channel.vip.remove` Pfad stabilisiert.

### STEP8.19.37 – Chat Wording Cleanup

- Texte von „VIP30 wurde nicht vergeben“ auf „VIP wurde nicht vergeben“ bereinigt, wenn Twitch-VIP-Grant gemeint ist.

### STEP8.19.38 – Already VIP / VIP30 Message Cleanup

- `already_has_vip30_slot` und `target_is_already_vip` getrennt.

### STEP8.19.39 – Twitch VIP Precheck List Fallback

- VIP-Precheck gegen komplette VIP-Liste ergänzt.

### STEP8.19.40 – Dashboard Active Slot Filter

- Dashboard-Hauptliste nur aktive Slots.
- Verlauf separat.

### STEP8.19.41 – Alert Sound MediaId Direct Fix

- Fake-`soundId` bei MediaId-Sounds entfernt.
- Alert/Sound läuft wieder.

### STEP8.19.42 – Chat Wording Polish

- Zufällige Chatvarianten im CGN-/Altersheim-Stil.

### STEP8.19.43 – VIP30 Status Command

- `!vip30` Statuscommands eingebunden.

## Offene Punkte

1. Chatcommands live im Twitch-Chat testen:
   - `!vip30`
   - `!vip30 slots`
   - `!vip30 me`
   - `!vip30 help`
   - optional `!vip30 @user`
2. VIP30-Texte langfristig in das bestehende Text-/Varianten-System und Dashboard überführen.
3. Dashboard-Soundauswahl validieren, damit ungültige Media-/Sound-Referenzen nicht gespeichert bleiben.
4. Nach Livebestätigung finalen Stable-/Handoff-Stand erstellen.

## Arbeitsregeln für VIP30

- Keine Funktionalität entfernen.
- Produktive SQLite-Datenbank niemals ersetzen oder überschreiben.
- Änderungen immer gegen echten aktuellen Dateistand machen.
- ZIPs mit echten Zielpfaden ab Repo-Root liefern.
- Nach jedem abgeschlossenen Step Doku aktualisieren.
- Bei VIP30-Fehlern zuerst `GET /api/vip30/status` und `GET /api/vip30/logs?...` nutzen.
