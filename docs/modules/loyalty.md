# Modul: loyalty

Stand: 2026-06-11  
Aktueller Stand: STEP214 / LWG-5.6 Anschluss an Command-Chat-Ausgabe

## Bestätigt

```text
- Loyalty-Core v0.1.13 läuft im Shadow-Modus.
- Available Balance funktioniert.
- Ranking nach verfügbaren Kekskrümeln funktioniert.
- !punkte / !points erzeugt richtige CGN-/Heimleitungs-/Rentner-Textvarianten.
- Die Chat-Ausgabe erfolgt ab STEP214 zentral über commands.js → twitch_presence.
```

## Ausgabe !punkte

Der Command zeigt nur:

```text
verfügbare Kekskrümel + Platzierung von Gesamtzahl gewerteter User
```

Nicht angezeigt werden Gesamtguthaben oder Reservierungen.

## Weiterhin deaktiviert

```text
!givepoints
!setpoint
!gamble
```
