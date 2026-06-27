# VIP30 STEP8.19.3 - Simple Name Position Preview

## Stand

Dieser STEP ist ein Vorschau-/Entscheidungsstand. Es wurden keine produktiven Dashboard-, Backend-, DB- oder Overlay-Dateien geändert.

## Ziel

Test des vereinfachten VIP30-Textaufbaus:

```txt
USERNAME
HEADLINE 1
SUBLINE
```

oder pro Textset wählbar:

```txt
HEADLINE 1
USERNAME
SUBLINE
```

Der Username wird künftig als eigener automatischer Textbereich gedacht. Die Headline muss den Namen nicht mehr enthalten.

## Enthaltene Datei

```txt
htdocs/overlays/_test-vip30-editor-preview-simple-position.html
```

## Regeln im Preview

- bestehender CGN Split Lounge / VIP30-Look als Designbasis
- Username separat als große Textzeile
- `namePosition` pro Textset:
  - `top` = Username über Headline
  - `bottom` = Username unter Headline
- Headline 1 maximal 2 Zeilen
- Subline darunter
- Message optional
- `{displayName}` / `{login}` werden in der Preview als Legacy-Hinweis erkannt und für die Anzeige aus Headline 1 entfernt
- keine produktive Speicherung ins Backend
- Prototyp speichert Teständerungen nur lokal im Browser per `localStorage`

## Nicht geändert

- `htdocs/overlays/sound_system_overlay.html`
- `htdocs/dashboard/modules/vip30.js`
- `htdocs/dashboard/modules/vip30.css`
- `backend/modules/vip30.js`
- DB-Schema
- VIP30 Reward/EventSub Flow
- Sound-System-Bundle
- Media-System
- Fulfill/Cancel Logik

## Geplanter Folgeschritt nach Freigabe

Wenn das Layout passt, nächster produktiver Umbau in getrennten STEP-Ständen:

1. Produktives VIP30-Overlay im Sound-System-Overlay anpassen.
2. Dashboard-Texte-Tab auf `namePosition` + Vorschau umbauen.
3. Backend-Defaults in `backend/modules/vip30.js` auf neue Textlogik ändern.
4. Bestehende `alerts.overlaySets` in der DB/Settings sanft auf neue Texte migrieren.
5. Doku / project-state aktualisieren.

## Test

Nach Entpacken nach `D:\Git\stream-control-center` öffnen:

```txt
http://127.0.0.1:8080/overlays/_test-vip30-editor-preview-simple-position.html
```

Prüfen:

- Textset-Dropdown
- Name-Position top/bottom
- Testnamen-Dropdown
- eigener Testname
- Headline 1 maximal 2 Zeilen
- Warnungen bei zu langen Headlines oder Legacy-Platzhaltern

## Abschlusskommando

```cmd
cd /d D:\Git\stream-control-center
.\stepdone.cmd "VIP30 STEP8.19.3 Simple Name Position Preview erstellt"
```
