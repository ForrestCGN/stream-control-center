# STEP274V – Birthday MediaField Integration

## Ergebnis

Das zentrale MediaField wird im Birthday-Dashboard vorbereitet/eingebunden:

- User-Song Auswahl/Upload über zentrale Media-Registry
- Party-Song Auswahl/Upload über zentrale Media-Registry
- bestehende Backend-Kompatibilität bleibt erhalten, weil MediaField `asset.relativePath` in die vorhandenen Pfadfelder schreibt

## Geänderte Dateien per Patch-Script

- `htdocs/dashboard/modules/birthday.js`
- `htdocs/dashboard/modules/birthday.css`

## Neue Datei

- `tools/apply_step274v_birthday_mediafield.js`
- `docs/dashboard/BIRTHDAY_MEDIA_FIELD_INTEGRATION.md`

## Ausführen

```cmd
node tools\apply_step274v_birthday_mediafield.js
```

Danach:

```cmd
.\stepdone.cmd "STEP274V Birthday MediaField Integration"
```

## Hinweis

Die alten Birthday-spezifischen Upload-Buttons werden nicht entfernt. Sie bleiben als Fallback bestehen.
