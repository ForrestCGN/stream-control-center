# Loyalty-Modul – Stand STEP217 / LWG-5.9

## Live-Basis

```text
backend/modules/loyalty.js
Version 0.1.13
Mode shadow
Currency Kekskrümel
```

## Bestätigte Funktionen

```text
available balance = balance - offene Reservierungen
Ranking basiert auf verfügbaren Punkten
!punkte / !points gibt verfügbare Punkte aus
Admin-Give/Set Runtime wurde in STEP216 kontrolliert getestet
Direkte Admin-Chat-Commands wurden in STEP217 freigegeben
```

## Admin-Points

```text
!givepoints @user <amount>
```

- benötigt Mod/Streamer
- nutzt intern `handleGivePointsCommandRuntime`
- erzeugt Transaktion `points_admin_give`
- sendet Erfolgsmeldung zentral über `commands.js` → `twitch_presence`

```text
!setpoint @user <balance>
```

- benötigt Streamer/Owner
- setzt nicht hart den DB-Wert, sondern schreibt eine Differenz-Transaktion
- erzeugt Transaktion `points_admin_set`
- sendet Erfolgsmeldung zentral über `commands.js` → `twitch_presence`

## Sicherheitsregeln

```text
Viewer darf keine Punkte geben
Mod darf keine Punkte setzen
Owner/Streamer darf setzen
Setpoint darf nicht unter reservierte Punkte setzen
Transaktionshistorie bleibt erhalten
```
