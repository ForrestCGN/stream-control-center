# STEP202.3 – Alert-System Pflichtliste / Nächster Arbeitsstand

Stand: 2026-05-08  
Version: v2 mit konkreter Tipeee/Twitch-Filterentscheidung

## Ausgangslage

Die Analyse der Live-Datenbank hat bestätigt:

TipeeeStream liefert bei Forrests Setup offenbar auch Twitch-Events über den Tipeee-Socket weiter. Diese Events werden aktuell vom Backend fälschlich als Tipeee-Donation verarbeitet.

Beispiele aus der Datenbank:

```text
Twitch Bits:
2026-05-08T18:00:35.997Z | Lacklecker | bits | 100 | Cheer100

Tipeee kurz danach:
2026-05-08T18:00:36.522Z | Lacklecker | donation | 0 | Cheer100

Abstand: ca. 0,5 Sekunden
Tipeee raw.event.type: cheer
Tipeee raw.event.origin: twitch
```

```text
Twitch Raid:
2026-05-06T17:16:50.879Z | Nivaaya | raid | 16

Tipeee kurz danach:
2026-05-06T17:16:51.360Z | Nivaaya | donation | 0

Abstand: ca. 0,5 Sekunden
Tipeee raw.event.type: raid
Tipeee raw.event.origin: twitch
```

## Konkrete Filterentscheidung

Für den akuten Fehler reicht als Hauptfilter:

```js
raw.event.origin === "twitch"
```

Das ist der entscheidende Marker, weil die Duplikate im Rohpayload eindeutig als Twitch-Origin erkennbar waren.

Trotzdem soll der Filter defensiv gebaut werden:

```js
function isTwitchMirroredTipeeeEvent(raw) {
  const event = raw?.event || raw || {};

  const origin = String(event.origin || raw?.origin || '').toLowerCase();
  const ref = String(event.ref || raw?.ref || '').toUpperCase();
  const type = String(event.type || raw?.type || '').toLowerCase();

  if (origin === 'twitch') return true;
  if (ref.startsWith('TWITCH_')) return true;

  if (['cheer', 'raid', 'follow', 'sub', 'resub', 'subscription', 'gift', 'gifted_subscription'].includes(type)) {
    return true;
  }

  return false;
}
```

Wichtig: Für die eigentliche Ursache ist `origin === 'twitch'` der primäre Filter.  
`ref.startsWith('TWITCH_')` und Twitch-Typen sind nur Sicherheitsnetze, falls TipeeeStream später `origin` nicht mitsendet oder anders verschachtelt.

## Wichtigster Fix

Datei:

```text
backend/modules/tipeee.js
```

Vor dem Forward an das Alert-System muss gefiltert werden:

```text
Wenn raw.event.origin == "twitch" -> ignorieren
Wenn raw.event.ref mit "TWITCH_" beginnt -> ignorieren
Wenn raw.event.type Twitch-Typen enthält, z. B. cheer, raid, follow, sub, subscription, gift, resub -> ignorieren
Nur echte Tipeee-Donation-/Tip-Events weiterleiten
```

Ziel:

```text
Twitch-Event kommt genau einmal über Twitch/EventSub.
Tipeee darf keine Twitch-Spiegelungen als Donation in die Alert-Queue schieben.
Echte Tipeee-Donations bleiben erhalten.
```

Empfohlenes Verhalten:

```text
Geblockte Twitch-Spiegelungen:
- nicht an /api/alerts/enqueue weiterleiten
- nicht in alert_events schreiben
- nicht in Alert-Queue schreiben
- optional in alert_provider_events als ignored speichern, damit sichtbar bleibt, dass das Event erkannt und bewusst verworfen wurde
```

## Neue Pflichtanforderungen

### 1. Alerts müssen abschaltbar sein

Alerts brauchen einen globalen Enable/Disable-Schalter.

Wenn Alerts abgeschaltet sind:

```text
- kein Alert darf in die Queue
- kein Overlay-Alert darf gestartet werden
- kein Sound/TTS für diesen Alert
- keine Replay-/Queue-Ausgabe
```

Wichtig: Schon beim Enqueue blocken, nicht erst beim Abspielen.

Betroffene Stellen wahrscheinlich:

```text
backend/modules/alert_system.js
htdocs/dashboard/modules/alerts.js
Config/DB-Setting für alertSystem.enabled oder livealert.enabled
```

Umsetzung bevorzugt DB-Setting nach Projektstandard:

```text
DB gewinnt gegen JSON
JSON nur Seed/Fallback
Dashboard über Backend-API
```

### 2. Subscription-Typen sauber unterscheiden

Twitch Sub-Events müssen korrekt auseinandergehalten werden:

```text
Neue Subscription
Resub
Gifted Subscription
Community Gift / Sub-Bombe
```

Nicht alles als normaler Sub behandeln.

### 3. Gifted Subscription sicher erkennen

GiftSubs müssen klar erkennbar sein:

```text
gifter
recipient
tier
amount falls vorhanden
is_anonymous
```

Ziel-Alert-Typen sollten eindeutig bleiben, z. B.:

```text
sub
resub
giftSub
communityGift
```

### 4. Sub-Bombe sicher erkennen und Anzahl auslesen

Community Gift / Sub-Bombe muss sicher erkannt werden.

Wichtige Felder je nach Twitch/EventSub-Payload:

```text
channel.subscription.gift:
- total
- cumulative_total
- tier
- user_name / user_login
- is_anonymous
```

Ziel:

```text
Sub-Bombe mit Anzahl anzeigen:
"X verschenkt Y Subs"
```

Nicht als einzelner GiftSub und nicht als normaler Sub behandeln.

### 5. Alert-History-Limit korrigieren

Das Dashboard "Control -> Alerts -> Letzte Alerts" nutzt aktuell `/api/alerts/status`.

Backend kappt dort hart:

```js
history: state.history.slice(0, 10)
```

Zusätzlich wird im RAM aktuell nur begrenzt gehalten:

```js
state.history = state.history.slice(0, 25)
```

Ziel:

```text
Mindestens 50 oder 100 Einträge anzeigen.
Besser: eigene Route GET /api/alerts/events?limit=100 aus DB alert_events.
```

Wichtig: Keine Verwechslung mit SoundAlerts. SoundAlerts war ein anderes Modul.

## Priorität für morgen

1. Tipeee-Twitch-Spiegelung filtern.
2. Alert global disable vor Queue/Enqueue einbauen.
3. Twitch Subscription-Mapping prüfen und korrigieren:
   - sub
   - resub
   - giftSub
   - communityGift/Sub-Bombe
4. Alert-History sauber machen:
   - mehr als 10
   - ideal DB-basierte Events-Route
5. Danach Testmatrix bauen:
   - Twitch Bits
   - Twitch Raid
   - Twitch Follow
   - Twitch Sub
   - Twitch Resub
   - Twitch GiftSub
   - Twitch CommunityGift/Sub-Bombe
   - Ko-fi Donation
   - echte Tipeee Donation
   - Tipeee-Spiegelung Twitch -> muss ignoriert werden

## Wichtige Regeln

```text
Keine Funktionalität entfernen.
Keine Secrets committen.
Keine SQLite-Datenbank überschreiben.
Nur vollständige echte Dateien patchen.
Vor Änderungen Dateien aus GitHub/dev bzw. realem Repo prüfen.
PowerShell-Befehle in Dateien schreiben, nicht nur lose in Chat.
Alle Änderungen dokumentieren.
```

## Zu prüfende Dateien

```text
backend/modules/alert_system.js
backend/modules/tipeee.js
backend/modules/twitch.js
htdocs/dashboard/modules/alerts.js
config/alert_system.json
project-state/*
docs/current/*
```

## Commit-/Step-Vorschlag

Nach Umsetzung:

```powershell
cd D:\Git\stream-control-center
.\stepdone.cmd "fix: filter provider alert duplicates and improve subscription handling"
```
