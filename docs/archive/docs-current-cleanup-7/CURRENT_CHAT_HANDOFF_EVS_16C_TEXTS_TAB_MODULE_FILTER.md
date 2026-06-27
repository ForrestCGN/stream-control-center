# EVS-16c – Texte Tab Module Filter Cleanup

Stand: 2026-06-13

## Ziel
Der Texte-Tab im Event-System soll nicht mehr als lange Scroll-Liste wirken. Textbereiche sollen über ein Dropdown gefiltert werden können.

## Änderungen
- Texte-Tab um Textbereich-Dropdown erweitert:
  - Alle Textbereiche
  - Event-System allgemein
  - Text-Spiel
  - Sound-Spiel
  - Punkte & Ranking
  - System / Sonstiges
- Zusätzliche Suche nach Text-Key oder Variantentext vorbereitet.
- Filterung passiert rein im Dashboard ohne Seitenreload.
- Textvarianten speichern/löschen bleibt unverändert.
- Keine Backend- oder DB-Änderung.

## Betroffene Dateien
- `htdocs/dashboard/modules/stream_events.js`
- `htdocs/dashboard/modules/stream_events.css`

## Tests
```powershell
node -c .\htdocs\dashboard\modules\stream_events.js
```

## Nächster Schritt
Nach UI-Test: prüfen, ob die automatisch zugeordneten Bereiche für Forrest sinnvoll genug sind oder einzelne Text-Keys später manuell kategorisiert werden sollen.
