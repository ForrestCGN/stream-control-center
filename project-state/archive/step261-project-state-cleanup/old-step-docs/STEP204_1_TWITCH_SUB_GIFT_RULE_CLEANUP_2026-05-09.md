# STEP204.1 – Twitch Sub/Gift/Resub Rule Cleanup

Stand: 2026-05-09  
Projekt: stream-control-center  
Bereich: Alert-System / Twitch EventSub / Sub-Gift-Regeln

## Ziel

Nach STEP204 wurde die technische Trennung der Twitch-Subtypen eingeführt. In STEP204.1 wurden die Live-Regeln per Backend-API bereinigt und getestet.

Wichtig: Diese Änderung betrifft den produktiven Regelbestand in der SQLite-Datenbank über die Alert-API. Es wurden keine Secrets, keine Datenbankdateien und keine Backups in Git übernommen.

## Fachliche Trennung

Verbindlicher aktueller Stand:

```text
channel.subscribe + is_gift=false
-> type_key: sub
-> normaler Sub
-> spielt Sub Standard

channel.subscribe + is_gift=true
-> type_key: gifted_sub_received
-> aktuell bewusst keine aktive Regel
-> wird ignoriert, damit kein Doppel-Alert entsteht

channel.subscription.message
-> type_key: resub
-> spielt Re-Sub

channel.subscription.gift mit total 1-4
-> type_key: gift_sub
-> spielt Gift Subs 1-4

channel.subscription.gift mit total 5-9
-> type_key: gift_bomb
-> spielt Sub-Bombe 5-9

channel.subscription.gift mit total 10-20
-> type_key: gift_bomb
-> spielt Sub-Bombe 10-20

channel.subscription.gift mit total >=21
-> type_key: gift_bomb
-> spielt Sub-Bombe ab 21
```

## Live-Regeländerungen

### Korrigiert

```text
ID 55
source: twitch
type_key: sub
label: Sub Standard
min_value: 0
max_value: null
sound_asset_id: 44
enabled: 1
chat block: 8
```

Vorher war diese Regel falsch als Sub-Bombe belegt. Jetzt ist sie die Standardregel für normale Subs.

### Deaktiviert

```text
ID 56
source: twitch
type_key: sub
label: Sub Regel deaktiviert - war falsch als Sub Bombe
enabled: 0
```

Diese Regel war fachlich falsch, weil Sub-Bomben nicht unter `sub` laufen dürfen.

### Umbenannt / bereinigt

```text
ID 54
type_key: gift_sub
label: Gift Subs 1-4
min_value: 1
max_value: 4
sound_asset_id: 50
enabled: 1
```

```text
ID 39
type_key: gift_bomb
label: Sub-Bombe 5-9
min_value: 5
max_value: 9
sound_asset_id: 42
enabled: 1
```

```text
ID 40
type_key: gift_bomb
label: Sub-Bombe 10-20
min_value: 10
max_value: 20
sound_asset_id: 43
enabled: 1
```

### Neu angelegt

```text
ID 61
type_key: gift_bomb
label: Sub-Bombe ab 21
min_value: 21
max_value: null
sound_asset_id: 43
enabled: 1
```

Ein versehentlich doppelt angelegtes Duplikat ID 62 wurde wieder entfernt bzw. deaktiviert/gelöscht.

## Getestete Ergebnisse

### Normaler Sub

Payload:

```text
source: twitch
type: sub
raw.eventsub_type: channel.subscribe
raw.is_gift: false
raw.tier: 1000
```

Ergebnis:

```text
type_key: sub
rule_id: 55
rule.label: Sub Standard
sound label: Eigener Sub
status: finished
```

### Gifted Sub Received

Payload:

```text
source: twitch
type: gifted_sub_received
raw.eventsub_type: channel.subscribe
raw.is_gift: true
raw.tier: 1000
```

Ergebnis:

```text
type_key: gifted_sub_received
rule_id: null
status: ignored
ignoredReason: no_matching_rule
```

Das ist aktuell bewusst so, damit empfangene GiftSubs keinen doppelten Sub-Alert auslösen.

### Resub

Payload:

```text
source: twitch
type: resub
raw.eventsub_type: channel.subscription.message
raw.tier: 1000
raw.cumulative_months: 12
raw.streak_months: 6
raw.message.text vorhanden
```

Ergebnis:

```text
type_key: resub
rule_id: 36
rule.label: Re-Sub
sound label: Re-Sub
status: finished
```

### Gift Subs 1-4

Getestet mit amount 1 und 4.

Ergebnis:

```text
type_key: gift_sub
rule_id: 54
rule.label: Gift Subs 1-4
sound label: Gift Sub 1-2
status: finished
```

### Sub-Bombe 5-9

Getestet mit amount 5 und 7.

Ergebnis:

```text
type_key: gift_bomb
rule_id: 39
rule.label: Sub-Bombe 5-9
sound label: 5 sub-Bombe
status: finished / playing
```

### Sub-Bombe 10-20

Getestet mit amount 10.

Ergebnis:

```text
type_key: gift_bomb
rule_id: 40
rule.label: Sub-Bombe 10-20
sound label: 10 Sub-Bombe
status: finished
```

### Sub-Bombe ab 21

Vor der neuen Regel wurde amount 21 korrekt ignoriert:

```text
status: ignored
ignoredReason: no_matching_rule
```

Nach Regel ID 61:

```text
type_key: gift_bomb
rule_id: 61
rule.label: Sub-Bombe ab 21
sound label: 10 Sub-Bombe
status: finished
```

## Aktueller Regelbestand für Sub/Gift/Resub

```text
ID 55 | twitch | sub       | Sub Standard                          | 0+    | Sound 44 | aktiv
ID 56 | twitch | sub       | Sub Regel deaktiviert - war falsch... | 10-20 | Sound 43 | inaktiv
ID 36 | twitch | resub     | Re-Sub                                | -     | Sound 40 | aktiv
ID 54 | twitch | gift_sub  | Gift Subs 1-4                         | 1-4   | Sound 50 | aktiv
ID 39 | twitch | gift_bomb | Sub-Bombe 5-9                         | 5-9   | Sound 42 | aktiv
ID 40 | twitch | gift_bomb | Sub-Bombe 10-20                       | 10-20 | Sound 43 | aktiv
ID 61 | twitch | gift_bomb | Sub-Bombe ab 21                       | 21+   | Sound 43 | aktiv
```

## Bewusst offen

- Tier-spezifische Regeln für Sub/GiftSub/Resub.
- Prime-Erkennung, falls Twitch-Daten das später sauber hergeben.
- `gifted_sub_received` optional dashboardfähig aktivierbar machen.
- TTS pro Text-Event:
  - Cheer message
  - Resub message.text
  - Ko-fi/Tipeee Donation message
  - Channelpoints user_input
- HypeTrain-Regeln:
  - Start
  - Progress nach Level/Stufen
  - End
- Dashboard-UX für Spezialbedingungen aus `meta_json.match`.

## Wichtige Projektregeln

- Keine Funktionalität entfernen.
- Keine SQLite-Datei committen.
- Keine Secrets committen.
- Regeln nur über Backend-API/Dashboard ändern.
- Dashboard greift nicht direkt auf DB zu.
- DB-Regelstand ist produktiver Live-Zustand und muss dokumentiert werden.
