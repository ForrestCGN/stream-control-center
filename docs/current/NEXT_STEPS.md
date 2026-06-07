# NEXT_STEPS – VIP30 / 30-Tage-VIP-System

## Nächster sinnvoller Schritt

Aktuellen VIP30-Stand live im Chat testen und danach erst weitere Komfort-Features bauen.

Der technische VIP30-Liveflow ist nach STEP8.19.43 stabil:

- VIP-Grant funktioniert.
- Slot-Erstellung funktioniert.
- Redemption-Fulfill funktioniert.
- Alert/Sound funktioniert wieder.
- Doppelte Einlösung wird blockiert/refunded.
- Externer VIP-Remove gibt Slots frei.
- Dashboard trennt aktive Slots vom Verlauf.
- Status-Command ist eingebunden.

## Direkte Tests

### 1. Statuscheck Backend

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/vip30/status"
$s | Select-Object ok,moduleVersion,moduleBuild,lastError

$c = Invoke-RestMethod "http://127.0.0.1:8080/api/commands/status"
$c | Select-Object ok,moduleVersion,moduleBuild,lastError
```

Erwartung:

```text
VIP30:
ok: True
moduleVersion: 0.8.30
moduleBuild: step8.19.43-status-command
lastError: leer/null

Commands:
ok: True
moduleVersion: 0.1.8
moduleBuild: vip30-command-catalog
lastError: leer/null
```

### 2. Chatcommands testen

Im Twitch-Chat testen:

```text
!vip30
!vip30 slots
!vip30 me
!vip30 help
```

Falls mit Mod/Broadcaster testen:

```text
!vip30 @user
```

Erwartung:

- `!vip30` zeigt allgemeinen VIP30-Status.
- `!vip30 slots` zeigt freie/belegte Sessel und nächsten Ablauf.
- `!vip30 me` zeigt eigene Restlaufzeit oder Inaktiv-Hinweis.
- `!vip30 @user` ist nur für Mods/Broadcaster erlaubt.
- Kein Command darf VIP vergeben, Slots schreiben oder Redemptions verändern.

### 3. VIP30-Einlösung testen

Mit normalem User ohne aktiven VIP30-Slot:

Erwartung:

- Twitch-VIP wird vergeben.
- VIP30-Slot wird active.
- Redemption wird `FULFILLED`.
- Alert/Sound wird queued und abgespielt.
- Chat-Erfolgsmeldung kommt.

Danach gleiche Person nochmal einlösen lassen:

Erwartung:

- Kein zweiter Grant.
- Kein neuer Slot.
- Redemption wird canceled/refunded.
- Chatmeldung nennt bestehenden VIP30-Sessel und Ablaufdatum.
- Kein Alert.

### 4. VIP30-Logs gezielt auswerten

```powershell
$r = Invoke-RestMethod "http://127.0.0.1:8080/api/vip30/logs?user=younecraft&limit=10"
$r.logs | Select-Object createdAt,eventType,success,reason,message | Format-Table -AutoSize
```

Wichtige Eventtypen:

- `live_flow_vip_granted_slot_created_redemption_fulfilled`
- `vip30_alert_sound_bundle_queued`
- `live_flow_decision_blocked` mit `already_has_vip30_slot`
- `external_vip_remove_slot_released`

## Offene Verbesserungen

### 1. VIP30 Texte ins Dashboard-/Textvarianten-System überführen

Aktuell sind die schöneren Chattexte aus STEP8.19.42 im Modul vorbereitet. Langfristig sollen sie in das bestehende Text-/Varianten-System und ins Dashboard.

Ziel:

- Kategorie für VIP30-Texte.
- Mehrere Varianten pro Key.
- Dashboardfähig.
- CGN-/Altersheim-/Rentner-Stil.

Mögliche Keys:

- `vip30.success.granted`
- `vip30.block.already_active_slot`
- `vip30.block.already_twitch_vip`
- `vip30.block.moderator`
- `vip30.block.broadcaster`
- `vip30.block.full`
- `vip30.status.overview`
- `vip30.status.slots`
- `vip30.status.me.active`
- `vip30.status.me.inactive`

### 2. Dashboard-Soundauswahl validieren

Der Sound-Fix aus STEP8.19.41 behebt den Runtime-Fehler. Später sollte das Dashboard ungültige Media-Auswahlen direkt sichtbar machen oder verhindern.

Ziel:

- Media-ID existiert?
- Media ist abspielbar?
- SoundPool-Eintrag verweist korrekt auf Media?
- Kein Speichern kaputter Media-/Sound-Referenzen.

### 3. Abschluss-/Stable-Doku nach Livebestätigung

Nach erfolgreichem Chat-/Live-Test:

- `CURRENT_STATUS.md` finalisieren.
- `FILES.md` finalisieren.
- `CHANGELOG.md` ergänzen.
- `CURRENT_CHAT_HANDOFF_VIP30_...md` erstellen.
- ggf. Stable-ZIP mit README bereitstellen.

## Wichtig

Bei VIP30-Fehlern zuerst den VIP30-eigenen Logs-Endpunkt nutzen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/vip30/logs?user=<login>&limit=10"
```

Nicht blind allgemeine Node-Logs oder DB-Tabellen suchen, wenn der VIP30-Log-Endpunkt die benötigten Events schon liefert.
