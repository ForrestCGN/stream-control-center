# Loyalty-Modul – Stand STEP218 / LWG-5.10

## Live-Basis

```text
backend/modules/loyalty.js
Version 0.1.13
Mode shadow
Currency Kekskrümel
```

## Aktive Funktionen

```text
available balance = balance - offene Reservierungen
Ranking basiert auf verfügbaren Punkten
!punkte / !points gibt verfügbare Punkte und Rang aus
!givepoints kann Punkte vergeben
!setpoint kann Zielsaldo setzen
Transaktionshistorie bleibt nachvollziehbar
```

## Aktive Chat-Commands

```text
!punkte / !points         everyone
!givepoints @user amount  mod
!setpoint @user balance   streamer/owner
```

## Bestätigte Admin-Tests

```text
step217_testuser vorher: balance=0, available=0, reserved=0
!givepoints @step217_testuser 4 → balance=4, available=4, Chat-Antwort gesendet
!setpoint @step217_testuser 0   → balance=0, available=0, Chat-Antwort gesendet
final unchanged                 → balance=0, available=0, reserved=0
recentAdminTransactions=2       → Audit bestätigt
```

## Wichtig

Die Transaktionen aus dem kontrollierten Test bleiben absichtlich in der Historie. Das ist korrekt und gewollt, da Admin-Änderungen auditierbar sein sollen.

StreamElements-Commands `!points` / `!punkte` müssen deaktiviert bleiben, damit keine alte SE-Antwort parallel erscheint.
