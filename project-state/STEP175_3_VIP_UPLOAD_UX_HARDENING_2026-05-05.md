# STEP175.3 VIP Upload-UX robuster gemacht

Stand: 2026-05-05

## Ziel

VIP-Sound-Upload im Dashboard verständlicher und sicherer machen, ohne Backend-, DB- oder Berechtigungslogik zu ändern.

## Geänderte Dateien

- `htdocs/dashboard/modules/vip.js`
- `htdocs/dashboard/modules/vip.css`

## Änderung

- Upload-Bereich deutlicher strukturiert.
- Ziel-User, Ziel-Datei, erlaubte Endung und maximale Größe werden direkt angezeigt.
- Upload-Modus zeigt klar `Neu hochladen` oder `Ersetzen`.
- Ausgewählte Datei wird im Dashboard mit Name und Dateigröße angezeigt.
- Wenn für den User bereits ein Sound existiert, muss die Checkbox `vorhandenen Sound ersetzen` aktiv sein.
- Bei aktivem Ersetzen gibt es zusätzlich eine Browser-Bestätigung.
- Nach Upload bleibt die bestehende Aktualisierung von Userliste und ausgewähltem User erhalten.

## Bewusst nicht geändert

- Keine Backend-Route geändert.
- Keine Datenbank geändert.
- Keine Berechtigungslogik geändert.
- Keine Sound-System-Queue ausgelöst.
- Keine bestehende Funktionalität entfernt.

## Tests

```powershell
cd D:\Git\stream-control-center
node -c .\htdocs\dashboard\modulesip.js
```

Zusätzlich visuell im Dashboard prüfen:

- User ohne Sound: Upload zeigt `Neu hochladen`.
- User mit Sound: Upload zeigt `Ersetzen`.
- Upload ohne Datei wird abgefangen.
- Upload bei vorhandenem Sound ohne Checkbox wird abgefangen.
- Vorschau-Buttons aus STEP175.2 bleiben erhalten.
