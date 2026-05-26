# Channelpoints – Einlösungsverlauf Filter (STEP507)

## Version

- Dashboard UI: `0.9.8`
- Build: `redemption-history-filters`

## Ziel

Der Einlösungsverlauf soll praktisch nutzbar sein, ohne neue DB-Logik oder zusätzliche Bedienmodi einzuführen.

## Änderung

Die Seite **Kanalpunkte → Einlösungen** zeigt weiterhin den normalen Verlauf:

- Zeit
- User
- Reward
- Eingabe
- Aktion/Ergebnis
- Status

Zusätzlich gibt es einfache Filter:

- Suche über User, Reward, Eingabe, Ergebnis und Status
- Status-Filter
- Reward-Filter
- User-Filter
- Filter zurücksetzen

## Nicht geändert

- Keine Backend-Änderung
- Keine DB-Migration
- Keine neue Tabelle
- Kein Twitch-Write
- Keine Shadow-/Live-/Allowlist-/AutoExecute-Logik

## Datenbasis

Die Anzeige nutzt weiterhin die vorhandene Tabelle:

```text
channelpoints_redemptions
```

Die DB-Anbindung läuft unverändert über den bestehenden Core-Database-Helper.
