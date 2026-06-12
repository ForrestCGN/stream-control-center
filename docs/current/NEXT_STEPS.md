# NEXT_STEPS – stream-control-center

Stand: 2026-06-12

## Nach LWG-4Q.12J

Der Giveaways-/Tabs-Cleanup ist abgeschlossen.

## Mögliche nächste Arbeiten

### 1. Giveaway-Control optisch glätten

```text
Labels vereinheitlichen
Button-Texte prüfen
Card-Abstände prüfen
aktive/vorbereitete Giveaways übersichtlicher machen
```

### 2. Wheel-/Preset-Begriffe vereinheitlichen

```text
Glücksrad
Preset
Bound-Wheel
Felder/Gewinne
Reward-Typ
Reward-Wert
```

### 3. Config-Bereiche weiter ausbauen

```text
Loyalty → Config → Core
Loyalty → Config → Giveaways
Loyalty → Config → Wheel
Loyalty → Config → Texte
```

### 4. Später echtes Dashboard-Rechtesystem

```text
Dashboard-Session
Rollen
Audit
Write-Rechte
Mod/Admin/Streamer-Freigaben
```

## Nicht sofort nötig

```text
Backend-Umbauten
DB-Migrationen
API-Änderungen
neue große UI-Testskripte
```

## Prüfroutine bei weiteren UI-Änderungen

```powershell
node -c .\htdocs\dashboard\modules\loyalty_games.js
node -c .\htdocs\dashboard\modules\loyalty_giveaways.js
node -c .\htdocs\dashboard\app.js
```

Browser:

```text
/dashboard
Loyalty → Giveaways
Tabs vollständig
Gamble erreichbar
Config erreichbar
Wheel-Editor über Giveaways erreichbar
Keine Console-Fehler
```
