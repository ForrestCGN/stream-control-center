# CURRENT CHAT HANDOFF – STEP235 Final Loyalty Dashboard Cleanup

Stand: 2026-06-12  
Projekt: ForrestCGN / stream-control-center  
Bereich: Dashboard / Loyalty / Gamble / Config

## Aktueller bestätigter Stand

```text
518dd6e4 STEP235M Remove Loyalty Runtime Shell Fallback
9ab5e619 STEP235J Remove Standalone Gamble Dashboard
```

STEP235N dokumentiert diesen final bereinigten Stand.

## Kurzfassung

Der Loyalty-Bereich ist jetzt sauber in der Dashboard-Shell integriert.

```text
Loyalty links in der Hauptnavigation
direkter Einstieg auf loyalty_games
Gamble als Tab im Loyalty-Bereich
Gamble-Konfiguration unter Loyalty → Config → Gamble
Standalone-Gamble entfernt
STEP232-/Gamble-Shell-Reste entfernt
Runtime-Shell-Fallback entfernt
```

## Was nicht mehr verwendet werden darf

Nicht mehr als Basis nutzen:

```text
htdocs/dashboard/loyalty-gamble.html
htdocs/dashboard/modules/loyalty-gamble.js
htdocs/dashboard/modules/loyalty-gamble.css
htdocs/dashboard/modules/loyalty-gamble-nav.js
htdocs/dashboard/modules/loyalty-gamble-shell-card.js
htdocs/dashboard/modules/loyalty-gamble-shell-card.css
STEP232-Gamble-Shell-Integration
```

## Aktive Dateien

```text
htdocs/dashboard/index.html
htdocs/dashboard/app.js
htdocs/dashboard/modules/loyalty.js
htdocs/dashboard/modules/loyalty.css
htdocs/dashboard/modules/loyalty_games.js
htdocs/dashboard/modules/loyalty_games.css
htdocs/dashboard/modules/loyalty_giveaways.js
htdocs/dashboard/modules/loyalty_giveaways.css
```

## Bestätigte Schritte

### STEP235H – Config UX Standard

Bestätigt:

```text
Gamble-Config zeigt keine rohe JSON-Ausgabe mehr.
Speichern nutzt Bestätigungsdialog.
confirmWrite bleibt intern gesetzt.
Andere Config-Bereiche zeigen denselben geplanten UX-Standard als Placeholder.
```

### STEP235J – Standalone Gamble Dashboard entfernt

Entfernt:

```text
htdocs/dashboard/loyalty-gamble.html
htdocs/dashboard/modules/loyalty-gamble.js
htdocs/dashboard/modules/loyalty-gamble.css
```

Live-Prüfung wurde vom Nutzer als ok bestätigt.

### STEP235K – Cleanup-Prüfung

Geprüft:

```text
loyalty-gamble
STEP232
gamble-shell-card
```

Ergebnis:

```text
Keine Treffer im aktuellen GitHub/dev.
Normale Dashboard-Shell lädt keine alten Gamble-Dateien.
```

### STEP235L – Runtime-Fallback bewertet

Ergebnis:

```text
app.js registriert loyalty, loyalty_games, loyalty_giveaways fest.
index.html enthält Loyalty fest in der Navigation.
ensureLoyaltyMainSection() ist nicht mehr nötig.
```

### STEP235M – Runtime-Shell-Fallback entfernt

Aus `loyalty_games.js` entfernt:

```text
ensureLoyaltyMainSection()
Runtime-Erzeugung von window.CGN.sections.loyalty
Runtime-Erzeugung des Loyalty-Navigationsbuttons
Runtime-Überschreiben von moduleCatalog/favorites
```

Behalten:

```text
registerDashboardModule() nur noch als kleine Reload-/Overlay-Absicherung.
```

## Aktiver Dashboard-Pfad

```text
http://127.0.0.1:8080/dashboard
```

Prüfen:

```text
Loyalty → Gamble
Loyalty → Config → Gamble
Loyalty → Core / Kekskrümel
Loyalty → Giveaways
```

## Nach jedem weiteren Dashboard-Step testen

```powershell
node -c .\htdocs\dashboard\app.js
node -c .\htdocs\dashboard\modules\loyalty.js
node -c .\htdocs\dashboard\modules\loyalty_games.js
node -c .\htdocs\dashboard\modules\loyalty_giveaways.js
```

Browser-Test:

```text
/dashboard lädt
Loyalty links sichtbar
Klick auf Loyalty öffnet loyalty_games
Tabs sichtbar
Gamble/Config/Audit/Statistik ok
Core und Giveaways erreichbar
keine 404 auf alte Standalone-Dateien
keine Console-Fehler
```

## Nächste sinnvolle Schritte

1. Actor-/Rollenfelder im Gamble-Config-Tab prüfen.
2. Später echte Dashboard-Session-/Rechteinformationen statt manueller Actor-Felder nutzen.
3. Giveaways-UI nach LWG-4Q.11 weiter in kleinen Einzelschritten prüfen.
4. Keine großen UI-assisted Testskripte verwenden.
