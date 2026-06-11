# NEXT_STEPS

Stand: 2026-06-11

## Direkt nächster Schritt

STEP216-Test ausführen:

```powershell
powershell -ExecutionPolicy Bypass -File .\Test_STEP216_LWG5_8_admin_points_runtime_ForrestCGN.ps1 -Execute
```

## Nach erfolgreichem STEP216

```text
STEP217 / LWG-5.9 – Gamble kontrollierter API-/Runtime-Test vorbereiten
```

## Wichtig für STEP217

```text
!gamble bleibt deaktiviert, bis der Test erfolgreich war.
Zufallslogik ausschließlich serverseitig mit crypto.randomInt.
Einsatz darf verfügbare Punkte nicht überschreiten.
Keine vorhersehbaren Seeds.
Antwort über zentrale commands.js/twitch_presence-Brücke.
```
