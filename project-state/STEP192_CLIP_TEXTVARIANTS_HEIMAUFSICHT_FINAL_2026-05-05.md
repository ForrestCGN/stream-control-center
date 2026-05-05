# STEP192 - Clip Textvarianten Heimaufsicht FINAL

Stand: 2026-05-05

## Ziel

Finale Heimaufsicht-/Beweismaterial-Texte für das Clip-System setzen.

## Betroffene Dateien

- `tools/clip_textvariants_step192_heimaufsicht_final.ps1`

## Backend/DB

Keine direkte DB-Bearbeitung.
Keine JSON-Bearbeitung.
Das Script nutzt ausschließlich:

- `GET /api/clip/admin/texts`
- `POST /api/clip/admin/texts`

## Verhalten

- Alte aktive Varianten der verwalteten Clip-Text-Keys werden deaktiviert.
- Neue finale Heimaufsicht-Texte werden aktiviert oder neu angelegt.
- Es wird nichts gelöscht.
- Dry-Run standardmäßig.
- `-Apply` schreibt über die Backend-API.

## Finale Richtung

Chattexte:
- kurz
- Heimaufsicht
- Beweise / Beweismaterial
- Aufnahme / Archiv

Discord-Texte:
- etwas ausführlicher
- Titel, Spiel, Auslöser, Link
- Heimaufsicht/CGN-Archiv

## Ausführen

Dry-Run:

```powershell
cd D:\Git\stream-control-center
powershell -ExecutionPolicy Bypass -File .\tools\clip_textvariants_step192_heimaufsicht_final.ps1
```

Anwenden:

```powershell
cd D:\Git\stream-control-center
powershell -ExecutionPolicy Bypass -File .\tools\clip_textvariants_step192_heimaufsicht_final.ps1 -Apply
```

Danach prüfen:

```text
Live -> Clips -> Texte
```

## Commit

```powershell
cd D:\Git\stream-control-center
git status --short
.\stepdone.cmd "chore: add final heimaufsicht clip text variants"
```
