# STEP200.8 Status-Notiz – Globaler Installer-/Seed-Plan

Stand: 2026-05-08

## Kurzfassung

Globaler Seed-/Installer-Standard dokumentiert.

Kernregel:

```text
JSON = Seed/Fallback/technische Boot-Konfiguration
DB   = aktive Verwaltungsquelle für dashboardfähige Werte
ENV/Secret-Dateien = Secrets und Zugangsdaten
```

## Wichtig

Installer dürfen niemals:

```text
app.sqlite ersetzen
.env überschreiben
Secrets überschreiben
produktive DB-Werte blind überschreiben
lokale AudioDevice-IDs blind übernehmen
```

## Modul-Zielstandard

Langfristig:

```text
/status
/config
/settings
/routes
/integration-check
/reload
```

## Nächster sinnvoller Schritt

```text
STEP201 – Dashboard-/Modul-Standard-Matrix
```
