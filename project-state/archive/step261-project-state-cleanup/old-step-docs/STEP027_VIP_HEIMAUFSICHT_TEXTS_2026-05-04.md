# STEP027 - VIP-Texte auf Heimaufsicht umgestellt

Stand: 2026-05-04

## Ziel

Die sichtbaren VIP-/Mod-Chattexte sollen nicht mehr "Heimleitung" sagen, sondern "Heimaufsicht".

## Geaendert

- `backend/modules/vip_sound_overlay.js`
  - Alle sichtbaren Default-Chattexte mit `Heimleitung` wurden auf `Heimaufsicht` geaendert.
  - Die interne Style-ID `heimleitung` bleibt unveraendert, damit bestehende SQLite-Daten und bestehende Queries kompatibel bleiben.
  - Keine Daily-Usage-, Sound-System-, Twitch-Rollen-, Override- oder Overlay-Logik wurde veraendert.

## Wichtig fuer Live

Die aktuellen Chattexte werden aus SQLite gelesen:

- Tabelle: `vip_sound_message_templates`

Deshalb muss im Live-System einmalig die bestehende Datenbank aktualisiert werden:

```powershell
Set-Location "D:\Streaming\stramAssets"

@'
const { DatabaseSync } = require("node:sqlite");

const dbPath = "D:/Streaming/stramAssets/data/sqlite/app.sqlite";
const db = new DatabaseSync(dbPath);

try {
  const result = db.prepare(`
    UPDATE vip_sound_message_templates
    SET message_text = REPLACE(message_text, 'Heimleitung', 'Heimaufsicht'),
        updated_at = datetime('now')
    WHERE message_text LIKE '%Heimleitung%'
  `).run();

  console.log("GEAENDERT:", result.changes);
} finally {
  db.close();
}
'@ | Set-Content ".\update_vip_texts_heimaufsicht.js" -Encoding UTF8

node ".\update_vip_texts_heimaufsicht.js"
Remove-Item ".\update_vip_texts_heimaufsicht.js"
```

## Test

- `node -c backend/modules/vip_sound_overlay.js`
- Danach Backend neu starten.
- `!vip @araglor` testen.
- Erwartung:
  - Mod-Sound wird weiterhin erkannt.
  - Chat-Ausgabe nutzt `Heimaufsicht`.
  - Keine Funktionalitaet geht verloren.

## Nicht geaendert

- Keine SQLite-Datei committed.
- Keine Secrets.
- Keine Sound-Dateien.
- Keine alten Routen entfernt.
- Keine Funktionalitaet entfernt.
