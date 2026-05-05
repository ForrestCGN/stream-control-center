# STEP175.4 VIP-Sound Upload-Auswahl vereinfacht

Stand: 2026-05-05

## Ziel

Sounds-Seite verständlicher machen: ausgewählter User ist links klar sichtbar, manuelle Login-Eingabe entfernt, Klick auf Hochladen/Ändern springt direkt zum Upload-Bereich.

## Geänderte Dateien

- `htdocs/dashboard/modules/vip.js`
- `htdocs/dashboard/modules/vip.css`

## Änderung

- Manuelle Login-Eingabe im Sounds-Tab entfernt.
- Linker Bereich zeigt den aktuell ausgewählten User mit Login, Twitch-Rolle und Soundstatus.
- Button `User prüfen` in `Auswahl laden` umbenannt.
- Upload-Ziel wird im Upload-Bereich kurz angezeigt.
- Klick auf `Hochladen` oder `Ändern` in Schnellzugriff/Soundliste öffnet die Sounds-Seite, setzt den User und scrollt zum Upload-Bereich.
- Sound-Vorschau-Buttons bleiben erhalten.

## Bewusst nicht geändert

- Keine Backend-Routen geändert.
- Keine Datenbank geändert.
- Keine Berechtigungslogik geändert.
- Keine neue Parallelstruktur.

## Test

```powershell
cd D:\Git\stream-control-center
node -c .\htdocs\dashboard\modules\vip.js
```
