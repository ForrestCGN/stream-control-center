# NEXT CHAT HANDOFF – STEP209 Alert Message Text Settings

Projekt: `stream-control-center`
Branch: `dev`
Stand: STEP209 ergänzt einstellbare Nachrichtentext-Optionen im Alert-Design.

## Wichtig

Basis war der bereits getestete Alert-Overlay-Stand nach STEP208.3 mit vollständigen Usernamen ohne Ellipsis.

## Geändert

- `htdocs/dashboard/modules/alerts.js`
- `htdocs/dashboard/modules/alerts.css`
- `htdocs/overlays/_overlay-alerts-v2.html`

## Neue Settings im Display-Profil

- `messageEnabled`
- `messageScale`
- `messageWidthMode`
- `messageMaxLines`
- `messageWeight`

## Verhalten

Der untere Alert-Message-Text kann jetzt pro Designprofil angezeigt/ausgeblendet, skaliert, verbreitert, auf Zeilen begrenzt und fett gemacht werden. TTS, Sound-System, Alert-Queue, Regeln und Backend wurden nicht verändert.

## Nach Entpacken/Deploy

Standardbefehl:

```powershell
cd D:\Git\stream-control-center
.\stepdone.cmd "feat: add alert message text design settings"
```

Danach Dashboard hart neu laden und in `Design / Live-Vorschau` testen.
