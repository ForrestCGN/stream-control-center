# NEXT_STEPS – stream-control-center

Stand: 2026-06-12

## Nach LWG-4Q.12N

Der aktuelle Giveaways-/Gamble-Cleanup ist dokumentiert.

## Direkt sinnvoll

### 1. Live-Abnahme abschließen

```text
Dashboard öffnen
Loyalty → Config → Gamble prüfen
Loyalty → Gamble prüfen
!gamble mit fester Zahl testen
!gamble mit Prozent testen
prüfen, dass nur HeimaufsichtCGN antwortet, sobald StreamElements abgeschaltet ist
```

### 2. StreamElements-Gamble abschalten

```text
StreamElements-Roulette/Gamble deaktivieren
prüfen, dass keine parallele SE-Antwort mehr kommt
```

### 3. Giveaway-Control optisch glätten

```text
Labels vereinheitlichen
Button-Texte prüfen
Card-Abstände prüfen
aktive/vorbereitete Giveaways übersichtlicher machen
Bound-Wheel-Begriffe vereinheitlichen
```

### 4. Command-/Chat-Seite prüfen

```text
Command aktiv/inaktiv sauber anzeigen
Command-Cooldown sichtbar machen
Chat-Antwort-Ziel verständlich machen
Keine doppelten Cooldown-Quellen
```

## Später

```text
Loyalty → Config → Core
Loyalty → Config → Giveaways
Loyalty → Config → Wheel
Loyalty → Config → Texte
echtes Dashboard-Rechtesystem
Dashboard-Session
Rollen
Audit-Viewer
```

## Nicht sofort nötig

```text
DB-Migrationen
neue große Backend-Umbauten
neue Gamble-Features
neue Giveaway-Mechaniken
```

## Prüfroutine bei weiteren UI-/Backend-Änderungen

```powershell
node -c .\htdocs\dashboard\modules\loyalty_games.js
node -c .\htdocs\dashboard\modules\loyalty_giveaways.js
node -c .\htdocs\dashboard\app.js
node -c .\backend\modules\loyalty_games.js
node -c .\backend\modules\loyalty_games\gamble.js
```

Browser:

```text
/dashboard
Loyalty → Giveaways
Loyalty → Gamble
Loyalty → Config → Gamble
Tabs vollständig?
Keine Console-Fehler?
Keine alte Inline-Giveaway-Ansicht?
Keine Standalone-Gamble-Seite?
```
