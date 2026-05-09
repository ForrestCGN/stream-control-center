# NEXT STEPS - stream-control-center

Stand: 2026-05-09

## Nächster empfohlener Schritt

### STEP203 - Loyalty Core DB + Basis-API Shadow Mode

Der StreamElements-Punkteimport ist kein Blocker mehr.

Geplantes Ziel:

```text
Neues Loyalty-System parallel im Shadow Mode aufbauen.
StreamElements bleibt aktiv.
Import der bisherigen User-Punkte kommt später.
```

Geplanter Startumfang:

```text
backend/modules/loyalty.js
config/loyalty.json als Seed/Fallback
DB-Tabellen fuer Loyalty Core
/api/loyalty/status
/api/loyalty/settings
/api/loyalty/balance/:login
/api/loyalty/transactions
Shadow-Mode-Settings
```

Startmodus:

```text
loyalty.mode = shadow
loyalty.enabled = true
loyalty.publicCommandsEnabled = false
loyalty.modCommandsEnabled = true
loyalty.watchEarningEnabled = true
loyalty.eventBonusesEnabled = false
loyalty.rewardsEnabled = false
loyalty.giveawaysEnabled = false
loyalty.gamesEnabled = false
loyalty.importStatus = not_imported
```

Noch vor oder während STEP203 fachlich erfassen:

1. Stream Store / Redeem-Items mit Kosten, Cooldowns, Kategorien und Status.
2. Giveaway-Settings und vorhandene Giveaway-Historie.
3. Aktive Chat-Games und deren Settings.
4. Gewünschte Commands/Aliase.
5. Overlay-Wünsche.

## Verbindliche Loyalty-Regeln

```text
Alles, was Kekskrümel gibt, nimmt, prüft, reserviert, erstattet oder verändert, läuft ausschließlich über das Loyalty-System.
```

```text
DB ist Hauptspeicher.
JSON ist nur Seed/Fallback/technische Boot-Konfig.
```

```text
Shadow Mode zuerst, StreamElements bleibt aktiv, Import später.
```

## TTS optionale Folgepunkte

Der TTS-Block ist aktuell abgeschlossen. Optional später:

1. Settings-Tab von Raw-JSON auf fachliche Formulare aufteilen.
2. CSV-Export für TTS User-Statistik ergänzen.
3. Klickbare Sortierung direkt über Tabellenköpfe ergänzen.
4. Rollen-/Stimmen-Konfiguration komfortabler editierbar machen.
5. TTS-Testbereich weiter kompakter/schöner gestalten.
6. Textvarianten-Tab optisch weiter polieren.

## System / DB

- MariaDB-Adapter später in `backend/core/database.js` implementieren und testen.
- Neue DB-Features weiter DB-portabel planen.
- Dashboard greift nicht direkt auf SQLite/Dateien zu, sondern nutzt Backend-APIs.
- DB gewinnt gegen JSON-Fallback, wenn dashboardfähige Settings vorhanden sind.
- JSON bleibt Seed/Fallback/technische Boot-Konfig.
