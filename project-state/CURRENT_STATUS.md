# Current Status – stream-control-center

Stand: 2026-05-18

## Loyalty / Kekskrümel

- Loyalty läuft weiterhin im Shadow-Modus.
- Aktuelle Version: `0.1.10`.
- STEP207 ergänzt AutoRunner Boot Recovery:
  - Wenn Node/Backend während eines aktiven Streams neu startet und der gespeicherte Stream-State weiterhin live ist, startet der AutoRunner beim Modul-Init automatisch wieder.
  - Dadurch soll verhindert werden, dass Watch-Punkte nach einem Backend-Neustart bis Streamende ausfallen.
- Keine Watch-Punkte-, Event-Bonus-, GiftSub-/GiftBomb- oder Sub/Resub-Logik wurde in STEP207 geändert.

## DeathCounter V2

- DeathCounter DB-Storage ist STABLE.
- Produktiv liest und schreibt der DeathCounter aus/in die DB.
- JSON wird nicht mehr automatisch dual geschrieben.
- JSON-Backup/Export erfolgt manuell über `!dcount backup` / `!dcount export` bzw. API-Export.
- Overlay ist optisch an den Alert-Außenrahmen angepasst.
- STEP263 verlangsamt die Overlay-Slide-Transition minimal, ohne Funktionalität zu ändern.

## Aktive Projektregel

Keine Funktionalität entfernen. Bestehende APIs, Streamer.bot-Flows, Overlay-Logik und DB-Struktur bleiben erhalten, sofern nicht explizit anders entschieden.
