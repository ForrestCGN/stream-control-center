# STEP192 - Clip Textvarianten Heimaufsicht Cleanup/Seed

Stand: 2026-05-05

## Ziel

Clip-Textvarianten in der DB aufräumen und durch Heimaufsicht-/CGN-Textvarianten ersetzen.

## Betroffene Dateien

- `tools/clip_textvariants_step192_heimaufsicht_seed.ps1`

## Backend/DB

Keine direkte DB-Bearbeitung.
Keine JSON-Bearbeitung.
Das Script nutzt ausschließlich:

- `GET /api/clip/admin/texts`
- `POST /api/clip/admin/texts`

## Verhalten

- Alte aktive Varianten der verwalteten Clip-Text-Keys werden deaktiviert.
- Finale Heimaufsicht-Texte werden aktiviert oder neu angelegt.
- Es wird nichts gelöscht.
- Dry-Run standardmäßig.
- `-Apply` schreibt über die Backend-API.

## Textstil

- Chat kurz, modfreundlich und streamtauglich.
- Discord etwas ausführlicher.
- Fehlertexte sachlich, aber mit Heimaufsicht-Ton.
- JSON bleibt nur Seed/Fallback/Import.
- Primäre Verwaltung bleibt DB-basiert über `module_text_variants`.

## Ausführen

Dry-Run:

```powershell
cd D:\Git\stream-control-center
.\tools\clip_textvariants_step192_heimaufsicht_seed.ps1
```

Anwenden:

```powershell
cd D:\Git\stream-control-center
.\tools\clip_textvariants_step192_heimaufsicht_seed.ps1 -Apply
```

Danach prüfen:

```text
Live -> Clips -> Texte
```

## Commit

```powershell
cd D:\Git\stream-control-center
git status --short
.\stepdone.cmd "chore: add heimaufsicht clip text variants seed"
```
