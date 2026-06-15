# CHANGELOG – stream-control-center

## 2026-06-15 – Loyalty Core / Dashboard / Config / Logs / Texte

### Backend / Loyalty Core

- `loyalty.js` auf Version `0.1.23` gebracht.
- Loyalty EventSub-Bonus-Diagnose erweitert.
- Bonus-Mapping-Diagnose erweitert.
- Bonus-Werte-Diagnose erweitert.
- Raid-Bonus von fixer Pauschale auf skalierbare Formel umgestellt:
  - `base_plus_viewers`
  - `baseAmount`
  - `amountPerViewer`
  - `maxAmount`
- Loyalty Event-History-Routen ergänzt:
  - `GET /api/loyalty/events/history`
  - `GET /api/loyalty/events/history/:eventUid`
- GiftSub-/GiftBomb-Empfänger-Modus eingeführt:
  - `disabled`
  - `track_only`
  - `small_bonus`
  - `half_bonus`
  - `custom`
- Default: `track_only`.

### Dashboard Struktur

- Loyalty-Navigation aufgeräumt:
  - Start
  - Core
  - Glücksrad
  - Presets
  - Giveaways
  - Gamble
  - Einstellungen
  - Texte
  - Chat & Befehle
  - Logs
- Core-Untermenü entschlackt.
- Doppelte Core-Regeln/Core-Verlauf entfernt und zentral auf Einstellungen/Logs verwiesen.
- Hilfe-Tab entfernt/nicht mehr als eigener Haupttab geführt.

### Dashboard Einstellungen

- Zentrale Config-Seite `Loyalty → Einstellungen` aufgebaut.
- Core-nahe Einstellungen unter Core gruppiert:
  - Grundregeln
  - Automatische Punkte
  - Abo-Bonus bei automatischen Punkten
  - Geschenk-Abos / GiftBombs
  - Raids
- Erste echte Schreibfunktionen angebunden:
  - GiftSub-/GiftBomb-Empfänger-Modus
  - Raid-Regel
  - Core-Grundregeln
  - Automatische Punkte
  - Abo-Bonus bei automatischen Punkten
- Settings-Reload-Bug behoben: Dashboard liest gespeicherte Werte bevorzugt aus `/api/loyalty/settings`.

### Dashboard Logs

- `Loyalty → Logs` als zentrale Ansicht aufgebaut.
- Filter ergänzt:
  - Bereich
  - Event
  - Status
  - Suche
- Haupttabelle vereinfacht.
- Technische IDs in Detailfenster verschoben.

### Dashboard Texte

- `Loyalty → Texte` als zentrale Textpflege aufgebaut.
- Bereichsfilter ergänzt.
- Haupttabelle komprimiert.
- Editor-Modal pro Textzweck ergänzt.
- Neue Varianten hinzufügen weiterhin über vorhandene APIs.
- Aktivieren/Deaktivieren/Löschen mit Nachfrage für Varianten mit sicherer ID vorbereitet/angebunden.
- Mehrere vorhandene Text-APIs eingebunden:
  - `/api/loyalty/giveaways/texts`
  - `/api/loyalty/games/texts`

### Nicht geändert

- Keine Produktiv-Umschaltung der Alerts auf Bus.
- Keine DB-Struktur ersetzt.
- Keine vorhandenen Textdaten gelöscht.
- Keine Punkte rückwirkend verändert.
- Keine Preset-/Gamble-/Giveaway-Funktion entfernt.
