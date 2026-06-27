# Next Steps – Loyalty-Giveaways / CGN-Glücksrad

Stand: 2026-06-19

## Aktueller Stand

`LWG_CHAT_OUTPUT_1B` wurde gebaut, aber noch nicht live bestätigt.

```text
loyalty_giveaways: 0.1.18 / LWG_CHAT_OUTPUT_1B
loyalty_games:     0.2.8  / LWG_BOUND_WHEEL_FIELD_COUNT_1
```

Vorher bestätigt:

```text
LWG_CHAT_COMMANDS_1:
- !ticket aktiv und zentral geroutet.
- !wheel / !rad aktiv und zentral geroutet.
- !join / !raffle bleiben Raffle.

LWG_CHAT_OUTPUT_1:
- Chatmeldungen für !ticket und !wheel/!rad erscheinen grundsätzlich.
- Problem: Einige Meldungen enthielten durch Legacy-/DB-Mehrzeiler zwei Sätze in einer Chatnachricht.
```

## Als Nächstes testen

### 1. Chat-Ausgabe für !ticket nach 1B

Mit einem offenen Test-Giveaway im Chat:

```text
!ticket
```

Erwartung:

```text
- Entry wird erstellt.
- Im Chat erscheint eine Bestätigung aus ticket.success.
- Es kommt genau eine einzelne Variante, kein Doppeltext.
```

### 2. Chat-Ausgabe für !wheel / !rad nach 1B

Nach Draw und offener Wheel-Permission:

```text
!wheel
```

oder:

```text
!rad
```

Erwartung:

```text
- Wheel-Claim wird ausgelöst.
- Im Chat erscheint eine Bestätigung aus wheel.success.
- Es kommt genau eine einzelne Variante, kein Doppeltext.
- Overlay dreht wie bisher.
```

### 3. Testscript 1.3 nochmal sauber beenden lassen

Mit frischem Test-Giveaway:

```powershell
powershell.exe -ExecutionPolicy Bypass -File .	ools	ests\loyalty_giveaway_wheel_interactive_test.ps1 `
  -GiveawayUid "<giveaway_uid>" `
  -BlockedUser "una_solala"
```

Erwartung:

```text
TEST ABGESCHLOSSEN: PASS / SUCCESS
```

## UID für frisches Giveaway anzeigen

```powershell
$base = "http://127.0.0.1:8080"

$r = Invoke-RestMethod "$base/api/loyalty/giveaways?limit=20"

$r.rows |
  Select-Object giveawayUid,title,status,mode,wheelEnabled,setupComplete,canOpen,createdAt |
  Format-Table -AutoSize
```

## Nicht erneut anfassen, sofern Test grün

- Draw-Logik
- Exclusion-Fairness
- Bound-Wheel-Feldverbrauch
- `!join`/`!raffle` Raffle-Verhalten
- Overlay-Rendering
- DB-Textdaten per Hand

## Danach sinnvoll

1. Doku nach Live-Test von `LWG_CHAT_OUTPUT_1B` final bestätigen.
2. Test-Giveaways löschen oder als Test markieren.
3. Dashboard-Editor für Exclusions planen.
4. 1-Gewinn-/0-Gewinne-Fälle separat testen.
