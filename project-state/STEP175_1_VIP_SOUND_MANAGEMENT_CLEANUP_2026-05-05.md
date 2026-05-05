# STEP175.1 VIP-Sound-Verwaltung aufgeräumt

Stand: 2026-05-05

## Ziel

Die bestehende VIP-Sounds-Seite im Dashboard praktischer machen, ohne Backend, Datenbank oder Berechtigungslogik zu ändern.

## Geänderte Dateien

- `htdocs/dashboard/modules/vip.js`
- `htdocs/dashboard/modules/vip.css`

## Änderung

- Sounds-Seite neu strukturiert: Kennzahlen, Filter, Workbench, Upload, Schnellzugriff auf fehlende Sounds und gefilterte Soundliste.
- Filter ergänzt: Alle, Ohne Sound, Mit Sound, Twitch VIP, Twitch Mod.
- Suche nach Login/Anzeigename ergänzt.
- Sortierung ergänzt: Fehlende zuerst, Name A-Z, Rolle, längste Sounds.
- Aktueller Soundstatus kompakter und verständlicher dargestellt.
- Uploadbereich klarer formuliert und sichtbar vom Statusbereich getrennt.
- Schnellzugriff auf die ersten User ohne Sounddatei ergänzt.
- Nach Upload bleibt die vorhandene Aktualisierung der Userliste bestehen.

## Bewusst nicht geändert

- Keine Backend-Routen geändert.
- Keine Datenbank geändert.
- Keine Berechtigungslogik geändert.
- Keine neue Parallelstruktur gebaut.
- Keine Sound-System-Logik ergänzt.
- Kein Play-/Preview-Button, weil dafür zuerst die saubere Browser-URL-Strategie geprüft werden soll.

## Tests

Vor Commit lokal ausführen:

```powershell
cd D:\Git\stream-control-center
node -c .\htdocs\dashboard\modulesip.js
Select-String -Path .\htdocs\dashboard\modulesip.js,.\htdocs\dashboard\modulesip.css -Pattern "Ã|â|Â|﻿" -SimpleMatch
```

## Offen

- STEP175.2: Sound-Vorschau/Play-Button prüfen, aber erst nach Prüfung der sicheren Browser-URL für vorhandene Sounddateien.
- STEP175.3: Upload robuster machen, z. B. klarere Überschreib-Bestätigung und Upload-Fehlertexte.
