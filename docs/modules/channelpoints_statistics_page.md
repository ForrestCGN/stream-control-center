# Channelpoints Statistik-Seite — STEP505

Stand: UI v0.9.6 (`simple-stats-page`)

## Ziel

Die Kanalpunkte-Oberfläche bekommt eine einfache Statistik-Seite ohne zusätzliche Test-/Ausführungs-Modi.

## Inhalt

- Rewards gesamt, aktiv, inaktiv
- Aktionen vollständig / Aktion fehlt
- Einlösungen gesamt, ausgeführt, Fehler
- Offen/blockiert
- Top-Rewards aus lokal gespeicherten Einlösungen
- Letzte Aktionen

## Nicht enthalten

- kein AutoExecute-Modus
- keine Shadow-/Live-/Allowlist-Bedienlogik
- kein Twitch-Write
- keine Backend-Änderung
- keine DB-Migration

## Grundregel

Reward inaktiv → nicht ausführen.  
Reward aktiv + Aktion vollständig → bei Einlösung ausführen.  
Reward ohne Aktion → darf nicht aktiviert werden / wird nicht ausgeführt.
