# Changelog

## 2026-05-09

### STEP203.1 - Loyalty Watch Shadow Hook

- `backend/modules/loyalty.js` auf Version `0.1.1` erhöht.
- Loyalty-Schema auf Version `2` erhöht.
- Neue Tabelle `loyalty_watch_state` ergänzt.
- Neue Routen:
  - `GET /api/loyalty/watch/heartbeat`
  - `POST /api/loyalty/watch/heartbeat`
  - `GET /api/loyalty/watch/states`
- Watch-Heartbeat mit Intervall-Schutz ergänzt:
  - kein mehrfaches Punkten innerhalb des Watch-Intervalls
  - `next_reward_at` und `last_reward_at` werden gespeichert
  - Subscriber-Multiplikator bleibt aktiv
  - Ignored Users werden weiter beachtet
- Ignored-User-Antwort semantisch bereinigt: ignored ist erwartetes Verhalten, kein technischer Fehler.
- StreamElements bleibt aktiv.
- Shadow Mode bleibt aktiv.

### STEP203 - Loyalty Core DB + Basis-API Shadow Mode

- Loyalty-Core-Modul eingeführt.
- DB-Tabellen und Basis-Routen angelegt.
- Settings über `helper_settings`.
- Texte über `helper_texts`.
- DB-Zugriffe über `backend/core/database.js`.
- Keine StreamElements-Abschaltung.

### STEP202.2 - Loyalty Shadow Mode & Configurable Bonus Rules

- Startstrategie für Loyalty geändert:
  - neues System läuft zuerst im Shadow Mode parallel zu StreamElements.
  - StreamElements bleibt aktiv.
  - User-Punkte-Import kommt später.
- Konfigurierbare Bonus-Regeln eingeplant.
