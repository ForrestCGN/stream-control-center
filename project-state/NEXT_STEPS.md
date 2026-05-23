# Next Steps

## STEP274M - Picker Live-Test + nächste Modul-Anbindung

Zuerst live prüfen:

- Commands-Modul öffnen.
- Sound-Command mit `Medium auswählen` testen.
- Video-/Animation-Command mit `Medium auswählen` testen.
- Upload über Picker mit `moduleKey = commands` testen.
- Neue Zusatzkategorie im Picker anlegen.
- Gespeicherten Command über `/api/commands/media-command-check?trigger=<trigger>` prüfen.

Danach:

- Alerts an Media-Picker anbinden.
- SoundAlerts an Media-Picker anbinden.
- Birthday an Media-Picker anbinden.
- VIP/Rewards später anbinden.

## Wichtig

Backend für Media bleibt aktuell unverändert. STEP274L nutzt die vorhandenen STEP274K-Routen:

- `/api/media/picker-options`
- `/api/media/categories`
- `/api/media/category/upsert`
- `/api/media/upload`
