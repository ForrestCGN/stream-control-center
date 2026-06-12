# CURRENT STATUS

Stand: LWG-4Q.12R / Documentation & Next Chat Handoff
Datum: 2026-06-12
Projekt: ForrestCGN / stream-control-center

## Zweck dieses Stands

Dieser Stand konsolidiert die nach STEP233 weitergeführten Loyalty-/Gamble-/Giveaway-Dashboard-Arbeiten. Er dokumentiert die bestätigten UI-Cleanup-Schritte und hält die nächsten offenen Arbeiten fest.

Wichtig: Dieser Doku-Stand ersetzt keine produktive SQLite-Datenbank, ändert keine Backend-Logik und baut keine neuen Runtime-Flows.

## Basis / Single Source of Truth

- Repo: `ForrestCGN/stream-control-center`
- Branch: `dev`
- Lokales Repo: `D:\Git\stream-control-center`
- Live-Ziel: `D:\Streaming\stramAssets`
- Dashboard: `http://127.0.0.1:8080/dashboard`
- Produktive SQLite-Datenbank: `D:\Streaming\stramAssets\data\sqlite\app.sqlite`

## Wichtige Arbeitsregel weiterhin gültig

- Nicht raten.
- Echte Dateien / GitHub-dev / hochgeladene Dateien als Single Source of Truth verwenden.
- Keine Apply-Scripte.
- Keine Patch-Scripte.
- Keine PowerShell-Regex-Patches.
- Keine Inline-Set-Content-Fixes.
- Keine Funktionalität entfernen.
- SQLite-Datenbank niemals ersetzen/überschreiben.
- Änderungen nur als vollständige Ersatzdateien oder ZIPs mit echten Zielpfaden liefern.

## Seit STEP233 geklärter Stand

### Dashboard-Struktur

Die echte Dashboard-Struktur wurde geprüft.

Bestätigt:

- `htdocs/dashboard/index.html` lädt `loyalty_games.css/js`.
- `htdocs/dashboard/index.html` lädt `loyalty_giveaways.css/js`.
- `loyaltyGamesModule` und `loyaltyGiveawaysModule` existieren als eigene Dashboard-Module.
- Loyalty-Hauptnavigation öffnet weiterhin den Loyalty-Games-Bereich.
- Giveaways sind als eigenes Giveaway-Control vorhanden.

### Giveaways / Giveaway-Control

Bestätigter aktueller Stand:

- Giveaways laufen im neuen Giveaway-Control über `htdocs/dashboard/modules/loyalty_giveaways.js`.
- Die alte Inline-Giveaway-Seite in `loyalty_games.js` darf nicht wieder eingeführt werden.
- Der alte Inline-Giveaway-Wheel-Editor darf nicht wieder eingeführt werden.
- Vollständige Tab-Leiste bleibt sichtbar:
  - Übersicht
  - Glücksrad
  - Presets
  - Giveaways
  - Gamble
  - Config
  - Chat/Commands
  - Verlauf
  - Hinweise

### LWG-4Q.12O – Giveaway-Control UI Cleanup

Umgesetzt als reine UI-Ergänzung:

- Giveaway-Control optisch geglättet.
- Zusätzliche CSS-Datei eingebunden:
  - `htdocs/dashboard/modules/loyalty_giveaways_cleanup.css`
- Keine Backend-Änderung.
- Keine Datenbank-Änderung.
- Keine Giveaway-Logik geändert.

### LWG-4Q.12P – Gamble UI Cleanup

Umgesetzt:

- Gamble-Hauptansicht entschlackt.
- Direkte technische Audit-Liste aus der Hauptansicht entfernt.
- `Statistik öffnen` öffnet ein eigenes Modal.
- `Audit öffnen` öffnet ein eigenes Modal.
- Spieler-Statistik wird aktuell aus geladenen Command-Logs aggregiert.

Einschränkung:

- Aktuelle Spielerstatistik basiert nur auf `/api/commands/logs?limit=80` bzw. den im Frontend geladenen Logs.
- Für echte Langzeitstatistik ist später eine eigene Backend-API nötig.

Nicht geändert:

- Gamble-Berechnung.
- Punktebuchung.
- Command-Logik.
- Cooldown-Logik.
- Backend-Routen.
- Datenbank.

### LWG-4Q.12Q – Giveaway Wheel Editor UI Cleanup

Umgesetzt als reine UI-Ergänzung:

- Glücksrad-Editor-Modal scrollbar gemacht.
- Unnötige Standardfelder im Wheel-Editor aus der sichtbaren UI genommen:
  - Gewicht
  - Gesamtmenge
  - Aktiv-Checkbox
  - Reihenfolge bei bestehenden Feldern
- Technische Werte bleiben erhalten bzw. werden weiterhin mitgesendet:
  - `weight`
  - `quantityTotal`
  - `enabled`
  - `sortOrder`

Nicht geändert:

- Backend.
- Datenbank.
- Giveaway-Logik.
- Wheel-/Reward-Logik.
- Gamble.
- Commands.

## Aktueller Gamble-Stand

Live bestätigt:

- `!gamble` läuft über HeimaufsichtCGN.
- `!gamble 100` funktioniert.
- `!gamble 10%` funktioniert.
- Gewinn = Einsatz dazu.
- Verlust = Einsatz weg.
- Pro Ergebnis wird nur eine Textvariante ausgegeben.
- Engine-Cooldown wurde nicht zusätzlich wieder eingeführt.

Noch offen:

- StreamElements-Gamble/Roulette später abschalten, damit nur HeimaufsichtCGN antwortet.
- Echte Langzeitstatistik per Backend-Route planen.
- Config-/Text-Struktur sauber weiterführen.

## Geplante Strukturwünsche aus dem aktuellen Chat

Forrest möchte als nächste größere Dashboard-Struktur:

1. Diverse Modul-Configs sauber in den zentralen `Config`-Tab bauen.
2. Text-Configs in einen eigenen Tab auslagern.
3. Text-Config-Tab soll per Dropdown einzelne Module/Textbereiche auswählbar machen.
4. Keine neuen Parallelstrukturen erfinden.
5. Vorhandene Helper nutzen:
   - `backend/modules/helpers/helper_texts.js`
   - vorhandene module_texts/module_text_variants-Struktur
6. Config- und Text-Dashboard nicht ungeprüft vermischen.

## Tests für die letzten UI-Schritte

Nach Entpacken/Übernahme der letzten ZIPs:

```powershell
node -c .\htdocs\dashboard\modules\loyalty_games.js
node -c .\htdocs\dashboard\modules\loyalty_giveaways.js
node -c .\htdocs\dashboard\app.js
```

Manuelle Browserprüfung:

```text
Dashboard → Loyalty → Gamble
Dashboard → Loyalty → Giveaways
Dashboard → Loyalty → Giveaways → Glücksrad bearbeiten
```

## Offene Risiken / Hinweise

- GitHub-dev-Projektstatus war vor dieser Doku noch auf STEP233. Diese Doku konsolidiert den neueren Chatstand.
- Wenn Live-System und GitHub/dev auseinanderlaufen, zuerst echte Dateien vergleichen.
- Keine weiteren UI-/Dashboard-Schritte bauen, ohne vorher echte Dateien zu prüfen.
- Die neuen CSS-Ergänzungen sind bewusst UI-only; bei Cache-Problemen Browser/Server neu laden.

## Nicht geändert durch diesen Doku-Step

- Kein Backend-Code.
- Keine Datenbank.
- Keine Runtime-Konfiguration.
- Keine Commands.
- Keine Twitch-/Streamer.bot-Anbindung.
- Keine Gamble-/Giveaway-Logik.
