# STEP175.1 VIP-Sound-Verwaltung aufgeräumt

Stand: 2026-05-05

## Ziel

VIP-Sound-Seite besser nutzbar machen, ohne Backend-, Datenbank- oder Berechtigungslogik zu ändern.

## Geänderte Dateien

- `htdocs/dashboard/modules/vip.js`
- `htdocs/dashboard/modules/vip.css`

## Änderungen

- Sounds-Seite strukturiert in Metriken, Filter, User-Auswahl, aktuellen Soundstatus, Upload und Listenansicht.
- Filter ergänzt für `Alle`, `Ohne Sound`, `Mit Sound`, `Twitch VIP`, `Twitch Mod`.
- Suche nach Login/Anzeigename ergänzt.
- Sortierung ergänzt nach fehlenden Sounds, Name, Rolle und längster Sounddauer.
- Schnellzugriff für fehlende Sounds ergänzt.
- Duplikate aus Schnellzugriff und Soundliste entfernt:
  - Wenn der Schnellzugriff fehlende Sounds zeigt, werden diese fehlenden Einträge unten in der Soundliste nicht erneut angezeigt.
  - Wenn explizit der Filter `Ohne Sound` gewählt wird, wird der Schnellzugriff ausgeblendet und die fehlenden Sounds erscheinen nur in der Soundliste.
- Button `Ohne Sound anzeigen` setzt den Soundfilter direkt auf fehlende Sounds.
- Uploadbereich verständlicher beschriftet.

## Bewusst nicht geändert

- Keine Backend-Routen geändert.
- Keine Datenbank geändert.
- Keine Berechtigungslogik geändert.
- Keine vorhandenen Tabs oder Funktionen entfernt.
- Soundrechte bleiben ausschließlich Twitch-VIP/Twitch-Mod aus dem Twitch-Sync-Cache.

## Tests

Lokal ausführen:

```powershell
cd D:\Git\stream-control-center
node -c .\htdocs\dashboard\modules\vip.js
Select-String -Path .\htdocs\dashboard\modules\vip.js,.\htdocs\dashboard\modules\vip.css -Pattern "Ã|â|Â|﻿" -SimpleMatch
```

## Offen

- Nach Sichtprüfung ggf. optische Feinabstände anpassen.
- Sound-Vorschau/Play-Button separat planen, falls vorhandene Datei-URLs sauber und sicher genutzt werden können.
