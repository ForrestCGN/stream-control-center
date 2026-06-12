# Current Chat Handoff – LWG-4Q.12R / Documentation & Next Chat

Stand: 2026-06-12
Projekt: ForrestCGN / stream-control-center

## Kurzfassung

Dieser Handoff konsolidiert den aktuellen Stand nach den letzten UI-Cleanup-Schritten für Loyalty/Gamble/Giveaways.

Letzte relevante Schritte:

```text
LWG-4Q.12O – Giveaway-Control UI Cleanup
LWG-4Q.12P – Gamble UI Cleanup
LWG-4Q.12Q – Giveaway Wheel Editor UI Cleanup
LWG-4Q.12R – Documentation & Next Chat Handoff
```

## Wichtigste Regeln für den nächsten Chat

- Erst echte Dateien prüfen.
- Keine Annahmen über GitHub/dev oder Live-Stand.
- Prüfen, ob die ZIPs O/P/Q/R bereits übernommen wurden.
- Keine Funktionalität entfernen.
- Keine Apply-/Patch-/Regex-/Set-Content-Scripte.
- SQLite-Datenbank niemals ersetzen.
- Änderungen nur als vollständige Ersatzdateien oder ZIPs mit echten Zielpfaden liefern.

## Aktueller UI-Stand

### Gamble

- Hauptansicht wurde entschlackt.
- Audit-Liste ist nicht mehr direkt sichtbar.
- Statistik öffnet per Modal.
- Audit öffnet per Modal.
- Aktuelle Spielerstatistik ist nur Frontend-/Command-Log-basiert und nicht als echte Langzeitstatistik zu verstehen.

### Giveaways

- Giveaways sind im neuen `loyalty_giveaways.js` Giveaway-Control.
- Die alte Inline-Giveaway-Seite in `loyalty_games.js` darf nicht zurückkommen.
- Die Tab-Leiste muss vollständig sichtbar bleiben:
  - Übersicht
  - Glücksrad
  - Presets
  - Giveaways
  - Gamble
  - Config
  - Chat/Commands
  - Verlauf
  - Hinweise

### Wheel-Editor

- Modal ist scrollbar.
- Standardansicht ist entschlackt.
- Gewicht/Gesamtmenge/Aktiv/Reihenfolge sind aus der normalen UI ausgeblendet.
- Werte bleiben technisch erhalten.

## Vom Nutzer gewünschte nächste größere Themen

### 1. Config-Tab aufräumen

Forrest möchte diverse Configs sauber in den zentralen Config-Tab bauen.

Vor Umsetzung prüfen:

```text
htdocs/dashboard/modules/loyalty_games.js
htdocs/dashboard/modules/loyalty_games.css
backend/modules/loyalty_games.js
backend/modules/loyalty_games/gamble.js
backend/modules/commands.js
config/*loyalty*
config/*dashboard*
```

### 2. Text-Configs in extra Tab

Forrest möchte Text-Configs in einem eigenen Tab, mit Dropdown für einzelne Module/Textbereiche.

Vor Umsetzung prüfen:

```text
backend/modules/helpers/helper_texts.js
backend/modules/helpers/helper_messages.js
module_texts
module_text_variants
htdocs/dashboard/modules/loyalty_games.js
backend/modules/loyalty_giveaways.js
```

Wichtig:

- Keine neue Text-Parallelstruktur.
- Bestehende `module_texts` / `module_text_variants` nutzen.
- Texte kategorisiert und variantenfähig halten.

### 3. Gamble-Langzeitstatistik

Später eine echte Backend-Route planen für:

```text
User
Spiele
Gewonnen
Verloren
Gewinnrate
Einsatz gesamt
Netto
Letzter Gamble
Zeitraumfilter
```

Aktuell nicht als Frontend-Hack erweitern.

### 4. StreamElements später abschalten

Forrest macht das später selbst oder separat.

Ziel:

- Nur HeimaufsichtCGN antwortet auf Gamble.

## Standardtests

Frontend:

```powershell
node -c .\htdocs\dashboard\modules\loyalty_games.js
node -c .\htdocs\dashboard\modules\loyalty_giveaways.js
node -c .\htdocs\dashboard\app.js
```

Backend bei späteren Backend-Änderungen:

```powershell
node -c .\backend\modules\loyalty_games.js
node -c .\backend\modules\loyalty_games\gamble.js
node -c .\backend\modules\commands.js
```

## Aktueller empfohlener nächster Schritt

Nicht direkt bauen.

Zuerst im nächsten Chat:

1. Diesen Handoff lesen.
2. `project-state/CURRENT_STATUS.md` lesen.
3. `project-state/NEXT_STEPS.md` lesen.
4. Echte Dateien aus GitHub/dev prüfen.
5. Prüfen, ob Live-Stand die ZIPs O/P/Q/R enthält.
6. Danach Ziel/Dateien/Änderung/Nicht geändert/Tests nennen.
7. Auf Forrests `go` warten.
