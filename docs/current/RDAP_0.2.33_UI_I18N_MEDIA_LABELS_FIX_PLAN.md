# RDAP 0.2.33 - UI i18n Media Labels Fix Plan

Stand: 2026-06-29

## Ziel

Sichtbare rohe Media-Translation-Keys im Online-Modboard beseitigen.

Betroffene Keys:

```text
module.media.label
page.media.library.title
page.media.library.label
```

## Geaendert

```text
remote-modboard/backend/public/assets/languages/de.js
remote-modboard/backend/public/assets/languages/en.js
remote-modboard/backend/public/assets/modules/media/library.js
htdocs/dashboard-v2/assets/modules/media/library.js
```

## Umsetzung

- Media-Sprachkeys in Deutsch und Englisch ergaenzt.
- Media-Modulregistrierung nutzt jetzt `labelKey`, `descriptionKey`, `titleKey` und `tabKey` mit vorhandenen Klartext-Fallbacks.
- Beide UI-Pfade bleiben gleich: Server `3010` und lokal `8080/dashboard-v2`.

## Sicherheitsgrenze

Nicht geaendert:

```text
keine Backend-Route
keine DB-Migration
keine Media-Persistenz
keine Agent-Aenderung
keine Uploads
keine Deletes
keine Edits
keine Shell-/Datei-/Prozess-Actions
keine neue Runtime-Datei
```

## Erwartetes Ergebnis

Navigation und Seitentitel zeigen wieder echte Labels statt roher i18n-Keys.
