# STEP228 – Twitch EventSub Alert Mapping Audit

Stand: 2026-05-11  
Projekt: stream-control-center  
Bereich: Twitch EventSub → Alert-System

## Ziel

Dokumentation des aktuell geprüften Twitch-EventSub-Mappings:

- welche Twitch EventSub-Events aktuell aktiv subscribed sind
- welche Events als Alert verarbeitet werden
- welche Events bewusst nicht als Alert verarbeitet werden
- welche Doppel-/Sonderfälle bekannt sind
- welche offenen Folgearbeiten später geplant sind

Diese Datei dient als Referenz, damit spätere Änderungen an Twitch-Alerts, Prime-Subs, GiftBombs, HypeTrain oder Shoutouts nicht wieder von null geprüft werden müssen.

---

## Aktive Twitch EventSub-Subscriptions

Zum Prüfzeitpunkt waren folgende EventSub-Types aktiv subscribed:

```text
stream.online
stream.offline
channel.update

channel.hype_train.begin
channel.hype_train.progress
channel.hype_train.end

channel.channel_points_custom_reward_redemption.add

channel.follow
channel.subscribe
channel.subscription.gift
channel.subscription.message
channel.cheer
channel.raid

channel.shoutout.create
channel.shoutout.receive
```

Nicht aktiv subscribed:

```text
channel.bits.use
channel.chat.notification
```

Wichtig: `channel.bits.use` ist derzeit nicht aktiv. Dadurch besteht aktuell keine Doppelgefahr zwischen `channel.cheer` und `channel.bits.use`.

---

## Twitch Alert Bridge – Forward-Konfiguration

Zum Prüfzeitpunkt war folgende Forward-Konfiguration aktiv:

```json
{
  "follow": true,
  "bits": true,
  "raid": true,
  "sub": true,
  "resub": true,
  "giftedSubReceived": false,
  "giftSub": true,
  "giftBomb": true,
  "channelPoints": false
}
```

Type-Mapping:

```json
{
  "follow": "follow",
  "bits": "bits",
  "raid": "raid",
  "sub": "sub",
  "resub": "sub",
  "giftedSubReceived": "gifted_sub_received",
  "giftSub": "gift_sub",
  "giftBomb": "gift_bomb",
  "channelPoints": "channel_points"
}
```

Sub-Message-Puffer:

```json
{
  "enabled": true,
  "delayMs": 30000
}
```

Bedeutung: Normale `channel.subscribe`-Events werden 30 Sekunden gepuffert, damit eine eventuell folgende `channel.subscription.message` gewinnen kann.

---

## Geprüfte Events

### 1. Bits / Cheer

Twitch EventSub:

```text
channel.cheer
```

Mapping:

```text
channel.cheer
-> type_key: bits
-> amount: bits
-> message: Twitch-Message
```

Status:

```text
OK
```

Besonderheit: Cheermote-Tokens wie `Cheer100`, `ShowLove10`, `Pride1`, `PJSalt1`, `cheerwhal5`, `Corgo5`, `uni5`, `RIPCheer5` werden für TTS entfernt, damit nur der eigentliche Nachrichtentext vorgelesen wird.

Beispiele:

```text
ShowLove10 ShowLove10 Guten morgen!
-> TTS: Guten morgen!

ShowLove10 ShowLove10
-> TTS deaktiviert
-> reason: empty_message_after_tts_cleanup
```

Aktueller Cheermote-Status:

```text
Quelle: helix_broadcaster
prefixCount: 32
Cache: 86400000 ms
```

Bekannte geladene Prefixe:

```text
Cheer
DoodleCheer
cheerwhal
Corgo
Scoops
uni
ShowLove
Party
SeemsGood
Pride
Kappa
FrankerZ
HeyGuys
DansGame
TriHard
Kreygasm
SwiftRage
NotLikeThis
FailFish
VoHiYo
PJSalt
MrDestructoid
bday
RIPCheer
Shamrock
BitBoss
Streamlabs
Muxy
HolidayCheer
Goal
Anon
Charity
```

---

### 2. Follow

Twitch EventSub:

```text
channel.follow
```

Mapping:

```text
channel.follow
-> type_key: follow
-> amount: 1
-> message: ""
```

Status:

```text
OK
```

Alert-System:

```text
Regel: Neuer Follower
TTS: aus
```

---

### 3. Normaler Sub

Twitch EventSub:

```text
channel.subscribe
```

Beispiel:

```json
{
  "user_login": "testsub",
  "user_name": "TestSub",
  "tier": "1000",
  "is_gift": false
}
```

Mapping:

```text
channel.subscribe
-> type_key: sub
-> amount: 1
-> message: ""
-> tier: "1000"
-> is_gift: false
```

Status:

```text
OK
```

Wichtig: Beim normalen `channel.subscribe` gibt es keine User-Message. TTS bleibt deshalb aus.

Sub-Puffer:

```text
channel.subscribe wird 30 Sekunden gepuffert.
Kommt keine passende channel.subscription.message, wird der Sub-Alert abgespielt.
```

---

### 4. Resub / Subscription Message

Twitch EventSub:

```text
channel.subscription.message
```

Beispiel:

```json
{
  "user_login": "testresub",
  "user_name": "TestResub",
  "tier": "3000",
  "cumulative_months": 9,
  "streak_months": 0,
  "message": {
    "text": "Resub-Testnachricht"
  }
}
```

Mapping:

```text
channel.subscription.message
-> type_key: sub
-> amount: cumulative_months
-> message: message.text
-> tier: "1000" / "2000" / "3000"
-> cumulative_months
-> streak_months
```

Status:

```text
OK
```

Alert-System:

```text
Regel: Sub Standard
TTS: aktiv, wenn message nicht leer
```

Hinweis: Aktuell wird Resub als `type_key: sub` verarbeitet. Es gibt zwar eine alte Regel `type_key: resub`, aber die aktuelle Twitch-Bridge mapped Resub-Message auf `sub`.

---

### 5. GiftSub 1

Twitch EventSub:

```text
channel.subscription.gift
```

Mapping:

```text
channel.subscription.gift total=1
-> type_key: gift_sub
-> amount: 1
-> quantity: 1
-> message: ""
```

Status:

```text
OK
```

Alert-System:

```text
Regel: Gift Subs 1-4
TTS: aus wegen empty_message
```

---

### 6. GiftBomb

Twitch EventSub:

```text
channel.subscription.gift
```

Mapping:

```text
channel.subscription.gift total>=5
-> type_key: gift_bomb
-> amount: total
-> quantity: total
-> message: ""
```

Status:

```text
OK
```

Geprüft:

```text
5 Subs   -> gift_bomb -> Regel Sub5-9
100 Subs -> gift_bomb -> Regel Sub 50-100
101 Subs -> gift_bomb -> no_matching_rule -> ignored
```

Aktuelle GiftBomb-Regelstaffelung:

```text
gift_sub:
1-4      -> Regel 54 "Gift Subs 1-4"

gift_bomb:
5-9      -> Regel 39 "Sub5-9"
10-24    -> Regel 40 "Sub 10-24"
25-34    -> Regel 61 "Sub 25-34"
35-49    -> Regel 63 "Sub 35-44" / Werte 35-49
50-100   -> Regel 64 "Sub 50-100"
101+     -> aktuell keine passende Regel
```

Offen:

```text
GiftBomb 101+ braucht später eigene Special-/Jackpot-Regel.
```

---

### 7. GiftSub-Empfänger

Twitch EventSub:

```text
channel.subscribe
```

Beispiel:

```json
{
  "user_login": "younecraft",
  "user_name": "YouneCraft",
  "tier": "1000",
  "is_gift": true
}
```

Mapping:

```text
channel.subscribe is_gift:true
-> giftedSubReceived
-> skipped
reason: gifted_sub_received_disabled
```

Status:

```text
OK
```

Wichtig: Diese Events dürfen nicht als normale Sub-Alerts laufen, sonst würde eine Subbombe sehr viele einzelne Empfänger-Alerts auslösen.

---

### 8. Raid

Twitch EventSub:

```text
channel.raid
```

Mapping:

```text
channel.raid
-> type_key: raid
-> user: from_broadcaster_user_name
-> login: from_broadcaster_user_login
-> amount: viewers
-> message: ""
```

Status:

```text
OK
```

Alert-System:

```text
Regel: Raid Standard
TTS: aus wegen empty_message
```

---

### 9. Channel Points

Twitch EventSub:

```text
channel.channel_points_custom_reward_redemption.add
```

Aktueller Zustand:

```text
Subscribed, aber forward.channelPoints = false
```

Status:

```text
OK / bewusst kein Alert
```

Geplante spätere Nutzung:

```text
VIP-Redeem-System
Challenge-System
Sound-/Redeem-System
Overlay-Aktionen
```

Empfehlung: Channel Points später nicht direkt ins Alert-System routen, sondern in ein eigenes Reward-/Redeem-Modul.

---

### 10. Hype Train

Twitch EventSub:

```text
channel.hype_train.begin
channel.hype_train.progress
channel.hype_train.end
```

Aktueller Zustand:

```text
Subscribed, aber nicht in typeMap/forward der Alert-Bridge enthalten.
Kein Hinweis auf Fehlverarbeitung als Bits/Sub/GiftSub.
```

Status:

```text
Aktuell kein Alert / keine Fehlverarbeitung erkennbar
```

Geplante spätere Logik:

```text
hype_train_begin       -> optional Start-Alert
hype_train_progress    -> Statusupdate
hype_train_level_up    -> nur wenn newLevel > lastLevel
hype_train_level_jump  -> wenn Twitch von z. B. Level 1 direkt auf Level 6 springt
hype_train_end         -> optional Abschluss-Alert
```

Wichtig:

```text
Wenn Twitch progress level 6 mehrfach sendet, darf nur einmal ein Level-6-Alert laufen.
Wenn Twitch von Level 1 auf Level 6 springt, werden Level 2-5 nicht nachgespielt.
```

---

### 11. Shoutout

Twitch EventSub:

```text
channel.shoutout.create
channel.shoutout.receive
```

Bedeutung:

```text
channel.shoutout.create:
Unser Kanal sendet einen offiziellen Twitch-Shoutout an einen Zielkanal.

channel.shoutout.receive:
Ein anderer Kanal shoutoutet uns.
```

Aktueller Zustand:

```text
Subscribed, aber kein normaler Alert.
```

Status:

```text
Später eigenes /so-/Shoutout-Statistiksystem
```

Geplante spätere Nutzung:

```text
!so / Dashboard-Shoutout = Start unseres Clip-Shoutout-Systems
channel.shoutout.create = offizielle Twitch-Bestätigung + Cooldown + Audit
channel.shoutout.receive = jemand anderes shoutoutet uns
```

Geplante Statistik:

```text
- wer hat /so ausgelöst
- welcher Zielkanal wurde shoutoutet
- wann wurde /so ausgelöst
- wie oft wurde ein Zielkanal shoutoutet
- wie oft hat ein Moderator /so ausgelöst
- letzter /so pro Zielkanal
- Cooldowns speichern
- manueller Twitch-/so vs. unser !so unterscheiden
```

Wichtig: `channel.shoutout.create` darf später nicht automatisch das Clip-Shoutout-System starten, sonst erzeugen wir Schleifen/Doppelstarts.

---

### 12. Stream Online / Offline

Twitch EventSub:

```text
stream.online
stream.offline
```

Aktueller Zustand:

```text
Subscribed, aber kein normaler Alert.
```

Soll-Zustand:

```text
stream.online  -> Streamstatus aktualisieren / Startsysteme / Rotator
stream.offline -> Streamstatus aktualisieren / Stoppsysteme / Endlogik
```

Kein Alert:

```text
kein Sound
kein Overlay-Alert
kein Chattext
kein TTS
```

---

### 13. Channel Update

Twitch EventSub:

```text
channel.update
```

Aktueller Zustand:

```text
Subscribed, aber kein normaler Alert.
```

Soll-Zustand:

```text
Titel/Kategorie/Sprache aktualisieren
Start-Overlay / Dashboard / Statusdaten aktualisieren
```

Kein Alert:

```text
kein Sound
kein Overlay-Alert
kein Chattext
kein TTS
```

---

## Bekannte Doppel-/Sonderfälle

### Technische Duplikate

EventSub kann Events mehrfach liefern. Technischer Schutz sollte über `messageId` erfolgen.

Empfehlung:

```text
messageId-Dedupe prüfen/ggf. ergänzen.
```

### GiftSub-Doppelstruktur

Twitch sendet bei GiftSubs fachlich mehrere Events:

```text
channel.subscription.gift
-> Gifter-Event

channel.subscribe is_gift:true
-> Empfänger-Event
```

Aktueller Schutz:

```text
Empfänger-Event wird skipped.
```

Status:

```text
OK
```

### Subscribe + Subscription Message

Möglicher Ablauf:

```text
channel.subscribe
channel.subscription.message
```

Aktueller Schutz:

```text
30-Sekunden-Puffer für channel.subscribe.
Wenn subscription.message kommt, gewinnt die Message.
```

Status:

```text
OK
```

### Bits / channel.bits.use

Aktuell:

```text
channel.bits.use nicht subscribed.
```

Dadurch kein Doppelrisiko mit `channel.cheer`.

Wenn später `channel.bits.use` aktiviert wird:

```text
channel.bits.use type=cheer darf nicht zusätzlich zu channel.cheer als Bits-Alert laufen.
```

### Hype Train

Hype-Train-Events können zusätzlich zu Bits/Sub/GiftSub laufen. Sie dürfen später nicht als normale Contributions verarbeitet werden.

Geplanter Schutz:

```text
Hype Train als eigenes Status-/Alertsystem.
Keine Umwandlung in bits/sub/gift_sub.
```

---

## Offene spätere Punkte

### Prime-Sub / Prime-Resub

Aktuell nicht möglich über `channel.subscribe` allein, weil dort nur `tier: "1000"` kommt.

Für Prime-Erkennung später nötig:

```text
channel.chat.notification
```

Geplante Typen:

```text
prime_sub
prime_resub
```

Geplante Logik:

```text
channel.subscribe / channel.subscription.message
+ channel.chat.notification notice_type=sub/resub
-> is_prime erkennen
-> Prime-Alert statt normalem Sub/Resub
```

Hinweis: Es gibt bereits Prime-Bildassets:

```text
Prime ABO -neu-
Prime -Verlängert-
```

---

### GiftBomb 101+ Special-/Jackpot-Alert

Aktueller Zustand:

```text
101+ -> no_matching_rule -> ignored
```

Später bauen:

```text
gift_bomb min_value 101 max_value null
eigener Sound
eigenes Display-Profil
eigener Chattextblock
Special-/Jackpot-Overlay
```

---

### Dynamische SubBomb-Zahl im Overlay

Geplanter Ansatz:

```text
Keine eigene Grafik pro Zahl.
Grundgrafik/Grunddesign verwenden.
Zahl dynamisch aus Event anzeigen:
amount / quantity / total
```

Beispiele:

```text
10er Subbombe -> große 10 im Overlay
12er Subbombe -> große 12 im Overlay
100er Subbombe -> große 100 / optional Special-Design
```

Optional:

```text
25+ stärkerer Glow
50+ dramatischer Effekt
100+ Jackpot-/Großalarm-Design
```

---

### GiftBomb-Empfänger sammeln

Idee:

```text
Bei großer Subbombe:
- Hauptalert für die Subbombe abspielen
- Empfänger-Events channel.subscribe is_gift:true sammeln
- prüfen, wer davon aktuell im Chat ist
- nur Chat-aktive Empfänger optional hervorheben
- niemals alle Empfänger einzeln als Alerts abspielen
```

Mögliche Config:

```json
{
  "giftBombReceiverHighlights": {
    "enabled": true,
    "minGiftBombTotal": 50,
    "collectWindowMs": 15000,
    "onlyChatters": true,
    "maxReceiverAlerts": 5,
    "fallbackShowList": true
  }
}
```

---

### Hype Train System

Später eigenes System:

```text
hype_train_begin
hype_train_level_up
hype_train_level_jump
hype_train_end
```

Interner Zustand:

```text
hypeTrainId
lastLevel
startedAt
expiresAt
lastProgressAt
```

Logik:

```text
Wenn newLevel > lastLevel:
  Alert spielen

Wenn newLevel <= lastLevel:
  nur Status aktualisieren
```

---

### Shoutout-/SO-Statistik

Später eigenes Modul/Dashboard-Bereich:

```text
- !so Clip-Shoutout
- offizieller Twitch-/so
- channel.shoutout.create als Bestätigung
- channel.shoutout.receive als Eingang
- Statistik pro Moderator
- Statistik pro Zielkanal
- Cooldowns
- letzter Shoutout
```

---

### TTS-Wortfilter / Moderation

Aktuell liest TTS echte User-Messages ungefiltert vor, außer Cheermote-Tokens werden entfernt.

Später sinnvoll:

```text
- Badword-Filter
- Wortersetzungen
- TTS bei bestimmten Wörtern blockieren
- optional Dashboard-Konfiguration
```

---

## Zusammenfassung

Geprüfte klassische Twitch-Alerts funktionieren aktuell korrekt:

```text
Bits
Follow
Sub
Resub-Message
GiftSub
GiftBomb
GiftSub-Empfänger-Skip
Raid
```

Bewusst keine normalen Alerts:

```text
Channel Points
Hype Train
Shoutout create/receive
Stream online/offline
Channel update
```

Offene größere Erweiterungen:

```text
Prime-Sub/Prime-Resub
GiftBomb 101+
dynamische SubBomb-Zahl
GiftBomb-Empfänger-Highlights
HypeTrain-System
Shoutout-Statistik
TTS-Filter
```
