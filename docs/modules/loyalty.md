# Modul: loyalty

## Stand nach STEP225 / LWG-6.6

Das `loyalty`-Modul ist die zentrale Punkte-/Kekskrümel-Basis.

## Bestätigte Funktionen

```text
!punkte / !points
!givepoints
!setpoint
```

## Admin-Befehle

- `!givepoints @user <amount>`: Mod+
- `!setpoint @user <balance>`: Streamer/Owner

## Safety

- Testuser wurden in den Tests wiederhergestellt
- Transaktionen bleiben auditierbar
- SQLite-Datenbank wird nicht überschrieben
- Punktestand wird nur über Runtime-/DB-safe Wege verändert

## Bedeutung für Gamble

`loyalty_games` nutzt das Loyalty-Punktesystem für Einsätze, Gewinne, Verluste und verfügbare Balance.
