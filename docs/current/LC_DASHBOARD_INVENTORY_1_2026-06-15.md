# LC-DASHBOARD-INVENTORY-1 – Loyalty Dashboard Inventur

Stand: 2026-06-15
Basis geprüft: aktueller Dashboard-Stand aus `LC_DASHBOARD_STRUCTURE_1_streamer_mod_navigation.zip`

## Zweck

Diese Inventur hält fest, welche Loyalty-Dashboard-Bereiche aktuell vorhanden sind, welche Funktionen/API-Routen daran hängen und wohin sie bei einem späteren Struktur-Umbau gehören.

Wichtig: Diese Datei ist ein Sicherheitsnetz vor `LC-DASHBOARD-STRUCTURE-2`, damit keine vorhandenen Bereiche, Buttons, Presets, Logs oder Config-Funktionen verloren gehen.

## Geprüfte Dateien

```text
htdocs/dashboard/modules/loyalty.js
htdocs/dashboard/modules/loyalty.css
htdocs/dashboard/modules/loyalty_games.js
```

## Nicht geändert

```text
Keine Backend-Logik geändert.
Keine Dashboard-Logik geändert.
Keine Tabs entfernt.
Keine Buttons entfernt.
Keine API-Aufrufe entfernt.
Keine Dateien zusammengelegt.
Keine Punktewerte geändert.
Keine DB geändert.
```

---

# 1. Aktuelle Hauptstruktur

## 1.1 `loyalty.js`

Aktuelle Aufgabe:

```text
Punkte-Core / Kekskrümel-Core
```

Aktuell registriert als:

```text
window.CGN.modules.loyalty.title = Kekskrümel-Core
window.CGN.moduleCatalog.loyalty.label = Kekskrümel-Core
```

Aktuelle Core-Untertabs:

| Aktueller Tab | Funktion | Ziel später |
|---|---|---|
| Übersicht | Core-KPIs, Stream/Runner/Diagnose, Support-Events | Core oder kompakt gespiegelt in Start |
| Steuerung | Runner starten/stoppen/run-once | Core |
| Auswertung | Transaktionen, Watch-State, Präsenz | Core / Logs teilweise zentral |
| User | User-/Balance-Liste | Core |
| Bots ignorieren | Ignore-Liste verwalten | Core oder Einstellungen → Core/Bots |
| Core-Regeln | Core-spezifische Settings | Einstellungen → Bereich Core |
| Core-Verlauf | Loyalty-Events, Runner-Events, Detailmodal | Logs → Bereich Core |

## 1.2 `loyalty_games.js`

Aktuelle Aufgabe:

```text
Loyalty-Hauptbereich + Glücksrad + Presets + Gamble + zentrale Config/Logs/Chat/Hinweise
```

Aktuelle Tabs/Fallback-Tabs:

| Aktueller Tab | Funktion | Ziel später |
|---|---|---|
| Übersicht | Modul-Karten/Ampeln | Start |
| Core | Verweis/Navigation zum Core | Core |
| Glücksrad | Wheel-Status, Overlay, Spins/Sessions | Glücksrad |
| Presets | Preset-Verwaltung + Felder/Preise | Presets |
| Giveaways | Weiterleitung zu `loyalty_giveaways` | Giveaways |
| Gamble | Gamble-Ansicht, Statistik, Audit-Modal | Gamble |
| Einstellungen | Aktuell vor allem Gamble aktiv, andere Bereiche geplant | Einstellungen zentral |
| Chat & Befehle | Command-/Text-/Setup-Anzeige | Chat & Befehle, Texte teilweise zentral |
| Verlauf & Logs | Wheel-Sessions/Verlauf | Logs zentral |
| Hilfe | Hinweise/Routen/offene Punkte | Kein eigener Tab, besser Tooltips/Hinweise vor Ort |

---

# 2. Aktuelle API-Routen nach Datei

## 2.1 `loyalty.js` APIs

```text
GET  /api/loyalty/status
GET  /api/loyalty/routes
GET  /api/loyalty/stream-state
GET  /api/loyalty/runner/status
POST /api/loyalty/runner/start?source=dashboard
POST /api/loyalty/runner/stop?source=dashboard
POST /api/loyalty/runner/run-once?source=dashboard
GET  /api/loyalty/runner/events?limit=40
GET  /api/loyalty/events/history?limit=120
GET  /api/loyalty/events/history/:eventUid
GET  /api/loyalty/users?limit=100
GET  /api/loyalty/transactions?limit=120
GET  /api/loyalty/watch/states?limit=120
GET  /api/loyalty/ignored-users
POST /api/loyalty/ignored-users
DELETE /api/loyalty/ignored-users/:login
POST /api/loyalty/settings
GET  /api/twitch/presence/activity/active?minutes=30&limit=100&includeJoinedOnly=true
```

## 2.2 `loyalty_games.js` APIs

```text
GET  /api/loyalty/status
GET  /api/loyalty/games/status
GET  /api/loyalty/games/config
GET  /api/loyalty/games/routes
GET  /api/loyalty/games/sessions?gameKey=wheel&limit=50
GET  /api/loyalty/games/wheel/status
GET  /api/loyalty/games/wheel/config
GET  /api/loyalty/games/wheel/presets
GET  /api/loyalty/games/wheel/spins?limit=50
GET  /api/loyalty/giveaways/status
GET  /api/loyalty/giveaways?limit=250
GET  /api/loyalty/giveaways/commands
GET  /api/loyalty/giveaways/texts
GET  /api/communication/status
GET  /api/loyalty/games/gamble/dashboard-config
GET  /api/loyalty/games/gamble/dashboard-audit?limit=8
GET  /api/commands/logs?limit=80
GET  /overlays/loyalty/wheel_overlay.html
```

Zusätzlich nutzt `loyalty_games.js` allgemeine POST/PUT-Helfer (`apiPost`, `apiPut`) für Presets, Felder, Giveaway-/Gamble-Config-Aktionen.

---

# 3. Schreibende Bereiche, die besonders geschützt werden müssen

## 3.1 Core / `loyalty.js`

| Bereich | Schreibfunktion | Darf beim Umbau nicht verloren gehen |
|---|---|---|
| Steuerung | Runner start/stop/run-once | Ja |
| Core-Regeln | Settings speichern | Ja, aber später zentral in Einstellungen |
| Bots ignorieren | User hinzufügen/deaktivieren | Ja |

## 3.2 Games / `loyalty_games.js`

| Bereich | Schreibfunktion | Darf beim Umbau nicht verloren gehen |
|---|---|---|
| Presets | Preset erstellen/kopieren/ändern | Ja |
| Preset-Felder | Felder/Preise erstellen/ändern/deaktivieren | Ja |
| Glücksrad | Spin/Test/Session-Aktionen | Ja |
| Giveaways | Weiterleitung zu Giveaway-Control | Ja |
| Gamble | Dashboard-Config speichern | Ja |
| Chat & Befehle | Text-/Command-nahe Aktionen, falls aktiv | Ja |

---

# 4. Zielstruktur nach Forrests Vorgabe

## 4.1 Top-Level Navigation

Ziel-Top-Tabs:

```text
Start
Core
Glücksrad
Presets
Giveaways
Gamble
Einstellungen
Texte
Chat & Befehle
Logs
```

Nicht verwenden bzw. prüfen:

```text
Punkte-Core → soll Core heißen
Verlauf & Logs → soll Logs heißen
Hilfe → nur behalten, wenn echter Nutzen; sonst Hinweise/Tooltips direkt in den jeweiligen Bereichen
```

## 4.2 Start

Kompakter Überblick über alle Loyalty-Module. Nicht zu viel Detail.

Soll enthalten:

```text
Core: Status, Auto-Punkte, User/Punkte grob
Glücksrad: aktiv/inaktiv, letzte Session, aktives Preset
Presets: Anzahl/aktives Preset
Giveaways: Status/Weiterleitung
Gamble: aktiv/inaktiv, letzter Fehler/Status
Support-Events: Event-Anbindung, letzter Support
Logs: letzte Buchung/letzter Fehler
```

## 4.3 Einstellungen

Eine zentrale Config-Seite.

Dropdown/Bereichsauswahl:

```text
Core
Automatische Punkte
Geschenk-Abos / GiftBombs
Raids
Glücksrad
Presets
Giveaways
Gamble
Chat & Befehle
```

Regel:

```text
Keine technischen Keys für Streamer/Mods anzeigen.
Dropdowns, Checkboxen, Zahlenfelder und Tooltips nutzen.
```

## 4.4 Texte

Eigener zentraler Tab.

Dropdown/Bereichsauswahl:

```text
Core
Glücksrad
Presets
Giveaways
Gamble
Chat & Befehle
Geschenk-Abos / GiftBombs
Hinweise / Fehlertexte
```

Regel:

```text
Text-Key, Varianten, Aktiv/Inaktiv, Platzhalter-Hilfe und Vorschau.
Nicht im Config-Tab verstecken.
```

## 4.5 Logs

Ein zentraler Log-Tab für alle Loyalty-Module inklusive Core.

Filter:

```text
Modul/Bereich: Alle, Core, Glücksrad, Presets, Giveaways, Gamble, Chat & Befehle
Eventtyp: Follow, Sub, Resub, Geschenk-Abo, GiftBomb, Geschenk-Abo Empfänger, Bits/Cheer, Raid, Glücksrad-Dreh, Giveaway, Gamble
Status: Alle, Gebucht, Nur erfasst, Übersprungen, Duplikat, Fehler
User-Suche
Zeitraum
Details im Modal
```

Technische Details nur im Modal unter einem Abschnitt „Technische Details“.

---

# 5. Verschiebeplan ohne Funktionsverlust

| Aktueller Ort | Ziel | Hinweis |
|---|---|---|
| `loyalty.js` Core Übersicht | Core + kleine Start-Kachel | Nicht löschen |
| `loyalty.js` Steuerung | Core | Schreibbuttons behalten |
| `loyalty.js` Auswertung | Core, relevante Buchungen zusätzlich Logs | Nicht doppelt kaputtziehen |
| `loyalty.js` User | Core | Behalten |
| `loyalty.js` Bots ignorieren | Core oder Einstellungen → Core/Bots | Behalten |
| `loyalty.js` Core-Regeln | Einstellungen → Core | Später zentralisieren |
| `loyalty.js` Core-Verlauf | Logs → Core-Filter | Detailmodal erhalten |
| `loyalty_games.js` Übersicht | Start | Kompakter machen |
| `loyalty_games.js` Glücksrad | Glücksrad | Behalten |
| `loyalty_games.js` Presets | Presets | Preset-/Feldeditor behalten |
| `loyalty_games.js` Giveaways | Giveaways | Weiterleitung behalten |
| `loyalty_games.js` Gamble | Gamble | Config/Stats/Audit beachten |
| `loyalty_games.js` Einstellungen | Einstellungen | Nicht nur Gamble, später alle Config-Bereiche |
| `loyalty_games.js` Chat | Chat & Befehle + Texte teilweise | Nicht löschen |
| `loyalty_games.js` Verlauf & Logs | Logs | Wheel-Sessions integrieren |
| `loyalty_games.js` Hilfe | Tooltips/Hinweise vor Ort | Erst entfernen, wenn Inhalte umgezogen sind |

---

# 6. Dateien zusammenlegen oder aufteilen?

Aktueller Befund:

```text
loyalty.js ist Punkte-Core.
loyalty_games.js ist zu groß und enthält viele unterschiedliche Bereiche.
```

Empfehlung:

```text
Nicht sofort zusammenlegen.
Nicht sofort große Datei zerschneiden.
Erst Navigation/Struktur stabilisieren.
Danach optional in kleinere Dashboard-Dateien aufteilen:
- loyalty_core.js
- loyalty_overview.js
- loyalty_config.js
- loyalty_texts.js
- loyalty_logs.js
- loyalty_wheel.js
- loyalty_presets.js
- loyalty_gamble.js
```

Wichtig:

```text
Eine spätere Aufteilung darf nur passieren, wenn alle Funktionen aus dieser Inventur abgehakt sind.
```

---

# 7. Prüfliste für LC-DASHBOARD-STRUCTURE-2

Vorher/nachher prüfen:

```text
[ ] Top-Tab Core vorhanden
[ ] Top-Tab Glücksrad vorhanden
[ ] Top-Tab Presets vorhanden
[ ] Top-Tab Giveaways vorhanden
[ ] Top-Tab Gamble vorhanden
[ ] Top-Tab Einstellungen vorhanden
[ ] Top-Tab Texte vorhanden
[ ] Top-Tab Chat & Befehle vorhanden
[ ] Top-Tab Logs vorhanden
[ ] Kein Hilfe-Tab mehr sichtbar, außer Inhalte wurden nicht umgezogen
[ ] Preset-Verwaltung öffnet weiterhin
[ ] Preset-Felder/Preise weiterhin sichtbar
[ ] Gamble-Ansicht weiterhin sichtbar
[ ] Gamble-Config weiterhin erreichbar
[ ] Gamble-Stats/Audit weiterhin erreichbar
[ ] Giveaway-Control weiterhin erreichbar
[ ] Core-Steuerung weiterhin erreichbar
[ ] Core-User weiterhin erreichbar
[ ] Ignore/Bots weiterhin erreichbar
[ ] Core-Settings weiterhin erreichbar oder sauber in Einstellungen eingeordnet
[ ] Core-Events/History weiterhin erreichbar
[ ] Wheel-Sessions weiterhin erreichbar oder in Logs integriert
[ ] Chat & Befehle weiterhin erreichbar
```

---

# 8. Nächster empfohlener Schritt

```text
LC-DASHBOARD-STRUCTURE-2
```

Ziel:

```text
Navigation auf die neue Struktur bringen, aber keine Funktionen entfernen.
```

Geplante sichere Änderungen:

```text
Punkte-Core → Core
Verlauf & Logs → Logs
Texte als Top-Tab hinzufügen
Texte aus Einstellungen-Dropdown entfernen
Hilfe-Tab nicht mehr als eigener Haupttab, Inhalte in Tooltips/Hinweise überführen oder vorerst unter Start/Logs sichtbar halten
Einstellungen als zentrale Config-Seite mit Bereichs-Dropdown erhalten
Logs als zentrale Log-Seite mit Bereichs-Dropdown vorbereiten
Start kompakter als Modulübersicht aufbauen
```

Nicht in STRUCTURE-2:

```text
Keine Backend-Änderung
Keine DB-Änderung
Keine neuen Schreibfunktionen
Keine Dateien zusammenlegen
Keine großen Modul-Splits
Keine Entfernung vorhandener Bedienfunktionen
```
