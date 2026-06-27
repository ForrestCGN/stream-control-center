# CURRENT CHAT HANDOFF – STEP235S Final Gamble Config Cleanup

Stand: 2026-06-12  
Projekt: ForrestCGN / stream-control-center  
Bereich: Dashboard / Loyalty / Gamble / Config

## Aktueller Stand

STEP235S schließt den Gamble-Config-Cleanup im Loyalty-Dashboard ab.

## Kurzfassung

```text
Standalone-Gamble ist entfernt.
STEP232-/Gamble-Shell-Reste sind entfernt.
Runtime-Shell-Fallback aus loyalty_games.js ist entfernt.
Gamble-Config ist im Loyalty-Config-Tab.
Actor-/Rollenfelder sind aus der normalen UI entfernt.
Cooldowns werden in Sekunden angezeigt.
Backend/API/DB/Audit bleiben unverändert.
Echtes Dashboard-Rechtesystem kommt später und ist nur vorbereitet.
```

## Aktive Bedienung

```text
/dashboard
Loyalty → Gamble
Loyalty → Config → Gamble
```

## Finaler Gamble-Config-Tab

Sichtbare Felder:

```text
Engine aktiv
Command aktiv
Chat-Antwort
Gewinnchance %
Auszahlung x
Mindesteinsatz
Maximaleinsatz
Gamble-Cooldown pro User (Sek.)
Gamble-Cooldown global (Sek.)
Command-Cooldown pro User (Sek.)
Prozent-Einsätze erlauben
Keyword-Einsätze erlauben
```

Nicht mehr sichtbar:

```text
Actor Login
Actor Rolle
Dryrun
Write bestätigen
ms-Cooldown-Labels
rohe JSON-Ergebnisblöcke
```

## Rechte-/Actor-Vorbereitung

Das echte Rechte-/Session-System wird später gebaut.

Aktuell gibt es im Frontend nur vorbereitende Helper:

```text
getDashboardActorFallback()
getDashboardActor()
```

Aktueller Fallback:

```text
actorLogin = forrestcgn
actorDisplayName = ForrestCGN
actorRole = streamer
```

Spätere Quelle:

```text
window.CGN.auth.user
```

## Technisches Verhalten

```text
UI zeigt Cooldowns in Sekunden.
Beim Speichern werden Sekunden in Millisekunden umgerechnet.
Backend erwartet weiterhin ms.
confirmWrite=true bleibt.
Audit bleibt aktiv.
Actor-Daten werden weiterhin intern gesendet.
```

## Nicht mehr als Basis verwenden

```text
STEP232
loyalty-gamble.html
loyalty-gamble.js
loyalty-gamble.css
loyalty-gamble-nav.js
loyalty-gamble-shell-card.js
loyalty-gamble-shell-card.css
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
/dashboard lädt.
Loyalty links sichtbar.
Loyalty → Gamble funktioniert.
Loyalty → Config → Gamble funktioniert.
Speichern fragt nach Bestätigung.
Audit wird geschrieben.
Keine 404 auf alte Standalone-Dateien.
Keine Console-Fehler.
```

## Nächster sinnvoller Schritt

Empfohlen:

```text
LWG-4Q.12 – Giveaways-UI nach LWG-4Q.11 klein und manuell prüfen
```

Wichtig:

```text
Keine großen UI-assisted Scripts.
Immer nur ein Giveaway, ein Prüfpunkt, danach löschen.
```
