# CURRENT_CHAT_HANDOFF_CAN44_31_SHOUTOUT_OVERLAY_SETS_COMPACT_UI

Stand: CAN-44.31 abgeschlossen / Doku aktualisiert
Projekt: `ForrestCGN/stream-control-center`
Branch: `dev`
Live-Ziel: `D:\Streaming\stramAssets`

## Arbeitsregeln für den nächsten Chat

- Deutsch, ruhig, direkt, Schritt für Schritt.
- Vor Umsetzung immer echten Dateistand prüfen.
- Keine Funktionalität entfernen.
- Produktive SQLite-Datenbank niemals überschreiben, löschen oder neu bauen.
- Bei Codeänderungen vollständige Ersatzdatei-ZIP mit echten Zielpfaden liefern.
- StepDone-Hinweis am Ende nicht vergessen.
- Keine blinden ZIPs bauen, wenn unklar ist, welche Datei live geladen wird.

## Aktueller Stand

### CAN-44.24f

- H15-Layout im bestehenden `htdocs/overlays/sound_system_overlay.html` als Shoutout-Darstellung integriert.
- Avatar-Fix umgesetzt.
- Nutzer akzeptierte den Stand vorläufig.

### CAN-44.26

- `backend/modules/clip_shoutout.js` auf Modulversion `0.2.42`.
- Overlay-Texte laufen bevorzugt über `overlaySets` als Headline/Subline-Paare.
- Neue API:
  - `GET /api/clip-shoutout/overlay-sets`
  - `POST /api/clip-shoutout/overlay-sets`
- Fallback-Keys bleiben erhalten:
  - `shoutout.overlay.headline`
  - `shoutout.overlay.subline`

### CAN-44.30

- `shoutout.overlay.sets` erscheint im bestehenden Shoutout-Dashboard über Dropdown:
  - Community -> Shoutout -> Texte
  - Kategorie: `Shoutout Overlay`
  - Textkey: `shoutout.overlay.sets`
- Dafür wurde der Spezial-Key direkt in `textRowsForCategory('shoutout.overlay')` injiziert.

### CAN-44.31

- Dashboard-Spezialeditor für Overlay-Sets optisch bereinigt.
- Vorschau-Zeile unter jedem Set entfernt.
- `Set löschen` oben rechts in die Set-Kopfzeile neben `aktiv` verschoben.
- Set-Karten kompakter gemacht.
- Nutzer bestätigte: `Sieht gut aus`.

## Aktuelle gewünschte 10er Textpaar-Liste

Diese Liste wurde festgelegt:

1. Headline: `Kurze Werbeunterbrechung!`  
   Subline: `Die Heimleitung empfiehlt heute {displayName}`

2. Headline: `Die Heimleitung schaltet um!`  
   Subline: `Auf der vergilbten Leinwand läuft jetzt {displayName}`

3. Headline: `Ein Rentner hat umgeschaltet!`  
   Subline: `Jetzt hängt er bei {displayName} fest`

4. Headline: `Rentner-Kino läuft!`  
   Subline: `Heute auf der alten Leinwand: {displayName}`

5. Headline: `Aus dem VHS-Archiv!`  
   Subline: `Gezeigt wird ein Clip von {displayName}`

6. Headline: `Der Beamer brummt!`  
   Subline: `Auf der vergilbten Leinwand läuft {displayName}`

7. Headline: `Werbepause im Fernsehraum!`  
   Subline: `Die Rentnercrew schaut bei {displayName} rein`

8. Headline: `CGN-Altersheim-TV!`  
   Subline: `Im Fernsehraum läuft jetzt {displayName}`

9. Headline: `Reklame war geplant!`  
   Subline: `Geworden ist es ein Clip von {displayName}`

10. Headline: `Die Heimleitung empfiehlt!`  
    Subline: `Heute im Programm: {displayName}`

## API zum Einspielen der Liste

Nicht direkt in SQLite schreiben. Overlay-Sets werden über die Shoutout-Config/API gespeichert.

```powershell
$body = @{
  sets = @(
    @{ id = "werbeunterbrechung"; enabled = $true; weight = 1; headline = "Kurze Werbeunterbrechung!"; subline = "Die Heimleitung empfiehlt heute {displayName}" },
    @{ id = "heimleitung-schaltet-um"; enabled = $true; weight = 1; headline = "Die Heimleitung schaltet um!"; subline = "Auf der vergilbten Leinwand läuft jetzt {displayName}" },
    @{ id = "rentner-umgeschaltet"; enabled = $true; weight = 1; headline = "Ein Rentner hat umgeschaltet!"; subline = "Jetzt hängt er bei {displayName} fest" },
    @{ id = "rentner-kino"; enabled = $true; weight = 1; headline = "Rentner-Kino läuft!"; subline = "Heute auf der alten Leinwand: {displayName}" },
    @{ id = "vhs-archiv"; enabled = $true; weight = 1; headline = "Aus dem VHS-Archiv!"; subline = "Gezeigt wird ein Clip von {displayName}" },
    @{ id = "beamer-brummt"; enabled = $true; weight = 1; headline = "Der Beamer brummt!"; subline = "Auf der vergilbten Leinwand läuft {displayName}" },
    @{ id = "werbepause-fernsehraum"; enabled = $true; weight = 1; headline = "Werbepause im Fernsehraum!"; subline = "Die Rentnercrew schaut bei {displayName} rein" },
    @{ id = "cgn-altersheim-tv"; enabled = $true; weight = 1; headline = "CGN-Altersheim-TV!"; subline = "Im Fernsehraum läuft jetzt {displayName}" },
    @{ id = "reklame-geplant"; enabled = $true; weight = 1; headline = "Reklame war geplant!"; subline = "Geworden ist es ein Clip von {displayName}" },
    @{ id = "heimleitung-empfiehlt"; enabled = $true; weight = 1; headline = "Die Heimleitung empfiehlt!"; subline = "Heute im Programm: {displayName}" }
  )
} | ConvertTo-Json -Depth 10

Invoke-RestMethod `
  -Method POST `
  -Uri "http://127.0.0.1:8080/api/clip-shoutout/overlay-sets" `
  -ContentType "application/json; charset=utf-8" `
  -Body $body
```

Prüfen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/overlay-sets" | ConvertTo-Json -Depth 10
```

## Betroffene Dateien des letzten Schritts

- `htdocs/dashboard/modules/shoutout_v2.js`
- `htdocs/dashboard/modules/shoutout_v2.css`

## Nicht geändert in CAN-44.31

- Backend
- Sound-System-Overlay
- Queue
- Bus
- Playback
- Audio-Finish
- SQLite-Datenbankdatei

## Nächste Schritte

- Stand beobachten.
- Neue 10er-Liste per API einspielen, falls noch nicht erledigt.
- Danach echten Shoutout testen und prüfen, ob Headline/Subline immer paarweise kommen.

## StepDone

Nach erfolgreichem Test:

```powershell
.\stepdone.cmd "CAN-44.31 Shoutout Overlay Sets Compact UI"
```
