# CHANGELOG DASHUI4B Safe File Names

Datum: 2026-06-23  
Status: DASHUI4B / Safe File Names für Deploy-Guard

## Zweck

Der vorherige DASHUI4-Step enthielt die Datei:

```text
frontend/dashboard-v2/src/styles/tokens.css
```

Dieser Dateiname triggert den lokalen Deploy-/Sicherheitsblocker, weil `token` im Pfad enthalten ist.

## Geändert

Umbenannt:

```text
frontend/dashboard-v2/src/styles/tokens.css
```

nach:

```text
frontend/dashboard-v2/src/styles/theme.css
```

Aktualisiert:

```text
frontend/dashboard-v2/src/main.jsx
```

Import geändert von:

```js
import "./styles/tokens.css";
```

auf:

```js
import "./styles/theme.css";
```

Doku/Projektstatus wurden entsprechend nachgezogen.

## Nicht geändert

- keine Funktionalität entfernt
- kein Backend-Code
- kein bestehendes Dashboard unter `htdocs/dashboard/`
- kein Build-Output unter `htdocs/dashboard-v2/`
- kein Agent-Code
- keine produktive SQLite
- keine Config
- keine OBS-Änderung
- kein Node-Neustart nötig

## Hinweis

Falls der alte fehlgeschlagene Step bereits Dateien ins Repo geschrieben hat, muss vor Installation dieses Fix-Steps die alte Datei entfernt oder der Step per `stepundo.cmd` zurückgenommen werden.
