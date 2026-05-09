# CURRENT SYSTEM STATUS

Stand: 2026-05-09

## Single Source of Truth

- Branch: `dev`
- Repo: `D:\Git\stream-control-center`
- Live: `D:\Streaming\stramAssets`
- GitHub: `https://github.com/ForrestCGN/stream-control-center`

## Aktueller Hauptfokus - Loyalty / Kekskrümel

Der Loyalty-/Kekskrümel-Block wurde nach STEP194 als nächster großer Themenbereich gestartet.

Aktueller Loyalty-Stand:

- `STEP194` dokumentiert die StreamElements-Loyalty-Migrationsarchitektur.
- `STEP202` dokumentiert die konkrete Erfassung vor Code-Start.
- `STEP202.1` legt den DB-First-Standard für Loyalty fest.
- `STEP202.2` legt Shadow Mode und konfigurierbare Bonus-Regeln fest.
- Es gibt noch keine Loyalty-Code-Dateien.
- Es gibt noch keine Loyalty-DB-Tabellen.
- Es gibt noch kein Loyalty-Dashboard-Modul.
- StreamElements bleibt unverändert aktiv.
- User-Punkte-Import ist kein Blocker mehr fuer die erste technische Umsetzung.

Verbindliche Loyalty-Hauptregel:

```text
Alles, was Kekskrümel gibt, nimmt, prüft, reserviert, erstattet oder verändert, läuft ausschließlich über das Loyalty-System.
```

Verbindliche Loyalty-Datenregel:

```text
DB ist Hauptspeicher.
JSON ist nur Seed/Fallback/technische Boot-Konfig.
```

Verbindliche Startstrategie:

```text
Shadow Mode zuerst, StreamElements bleibt aktiv, Import später.
```

## Bestätigte StreamElements-Loyalty-Werte

Aus den Screenshots vom 2026-05-09 bestätigt:

```text
Loyalty enabled: Ja
Currency name: Kekskrümel
Watch amount: 2
Interval: 10 Minuten
Subscriber multiplier: 3x
Viewer: 2 Kekskrümel alle 10 Minuten
Subscriber: 6 Kekskrümel alle 10 Minuten
Follower bonus: 10 Kekskrümel
Tip bonus: 10 Kekskrümel pro 1,00 EUR
Subscriber bonus: 50 Kekskrümel
Cheer bonus: 10 Kekskrümel pro 100 Bits
Raid bonus: 50 Kekskrümel
Ignored users:
- STREAMELEMENTS
- FORRESTCGN
Punkteverfall: nach mehr als 1 Jahr Inaktivität auf dem Channel
```

Auslegung:

```text
Subscriber erhalten Watch amount 2 x Subscriber multiplier 3 = 6 Kekskrümel.
```

## STEP203 Zielrichtung

Naechster technischer Schritt:

```text
STEP203 - Loyalty Core DB + Basis-API Shadow Mode
```

Geplanter Umfang:

- Core-Backend-Modul
- Seed/Fallback-Config
- DB-Core-Tabellen
- Status-/Settings-/Balance-/Transactions-Routen
- Shadow-Mode-Settings
- keine StreamElements-Abschaltung
- kein produktiver Import in STEP203

## SoundAlerts / Sound-System - aktueller Stand bis STEP193.17.2

SoundAlerts ist bis `STEP193.17.2` technisch umgesetzt, live getestet und dokumentiert.

Aktueller Modulstand:

- `soundalerts_bridge` Version: `0.1.14`
- Backend-Datei:
  - `backend/modules/soundalerts_bridge.js`
- Dashboard-Dateien:
  - `htdocs/dashboard/modules/soundalerts.js`
  - `htdocs/dashboard/modules/soundalerts.css`
- Sound-System Overlay:
  - `htdocs/overlays/sound_system_overlay.html`
- Config/Fallback:
  - `config/soundalerts_bridge.json`
- DB ist Hauptspeicher fuer Eintraege, Events, Meta und technische Settings.
- JSON bleibt Seed/Fallback/Notfall.

## TTS - aktueller Stand bis STEP200.1

Der TTS-Block ist technisch umgesetzt, live getestet, im Dashboard eingebunden und nutzt das globale DB-basierte Textvarianten-System.

Backend:

- `backend/modules/tts_system.js`
- DB-Zugriffe laufen ueber `backend/core/database.js`.
- Settings laufen ueber `backend/modules/helpers/helper_settings.js`.
- Textvarianten laufen ueber `backend/modules/helpers/helper_texts.js`.
- JSON `config/tts_config.json` bleibt Seed/Fallback/technische Boot-Konfig.
- JSON `config/tts_messages.json` bleibt Seed/Fallback fuer TTS-Texte.

Dashboard:

- `htdocs/dashboard/modules/tts.js`
- `htdocs/dashboard/modules/tts.css`
- Einbindung in `htdocs/dashboard/index.html`

## Bewusst offen

- Stream Store / Reward-Items erfassen.
- Giveaway-Settings erfassen.
- Aktive Chat-Games priorisieren.
- Commands/Aliase festlegen.
- Danach STEP203 technisch bauen.
- Sound-System Overlay nur bei konkretem Fehler weiter pruefen.
- MariaDB-Adapter spaeter zentral in `backend/core/database.js` implementieren.
