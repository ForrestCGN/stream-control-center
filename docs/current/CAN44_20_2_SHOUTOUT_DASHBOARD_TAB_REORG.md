# CAN-44.20.2 – Shoutout Dashboard Tab Reorganisation

Stand: 2026-06-04

## Ziel

Das Shoutout-Dashboard wurde in der Tab-Struktur klarer organisiert, ohne Backend-, DB- oder Runtime-Logik zu ändern.

## Geänderte Dateien

- `htdocs/dashboard/modules/shoutout.js`
- `htdocs/dashboard/modules/auto_shoutout.js`
- `htdocs/dashboard/modules/shoutout_texts.js`
- `htdocs/dashboard/modules/shoutout.css`

## Inhalt

- Haupt-Tabs im Shoutout-Dashboard neu benannt und sortiert:
  - Übersicht
  - Chat-Shoutout
  - AutoShoutout
  - Queues
  - Texte
  - Verlauf
  - Statistik
  - Eingehend
  - Diagnose
  - Einstellungen
- `Chat-Shoutout` enthält den manuellen Test-/Aufnahmebereich plus Live-Gate.
- `Diagnose` fasst Produktionscheck und Live-Test zusammen.
- `Einstellungen` enthält nur noch kompakte Konfigurationsanzeige, nicht mehr den Testbereich.
- `AutoShoutout` wird weiterhin über das vorhandene AutoShoutout-Modul eingebunden, aber an der Zielposition nach `Chat-Shoutout`.
- `Texte` wird weiterhin über das vorhandene Texte-Modul eingebunden, aber an der Zielposition nach `Queues`.
- Aktive Shoutout-Tabs erhalten klareren CGN-Neon-Look mit Lila/Cyan-Glow.
- Normale Tabs bleiben zurückhaltender.

## Nicht geändert

- Keine Backend-Route geändert.
- Keine DB geändert.
- Keine Runtime-Textumstellung.
- `auto.greeting` bleibt erhalten.
- AutoShoutout-Logik bleibt erhalten.
- Shoutout-Texte-Editor bleibt erhalten.
- Kein Dashboard-Shell-Umbau.

## Tests

```cmd
node -c htdocs\dashboard\modules\shoutout.js
node -c htdocs\dashboard\modules\auto_shoutout.js
node -c htdocs\dashboard\modules\shoutout_texts.js
```

Dashboard prüfen:

- Shoutout-System öffnen.
- Tab-Reihenfolge prüfen.
- Aktiver Tab hat CGN-Neon-Look.
- Chat-Shoutout zeigt Testbox und Live-Gate.
- Diagnose zeigt Produktionscheck und Live-Test.
- Einstellungen enthält keine Testbox mehr.
- AutoShoutout und Texte bleiben bedienbar.
