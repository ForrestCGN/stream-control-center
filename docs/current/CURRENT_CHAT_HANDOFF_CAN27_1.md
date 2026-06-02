# Current Chat Handoff - CAN27.1

## Projekt

ForrestCGN `stream-control-center`

```text
Repo: https://github.com/ForrestCGN/stream-control-center
Branch: dev
Lokales Repo: D:\Git\stream-control-center
Live-Ziel: D:\Streaming\stramAssets
Produktive SQLite-DB: D:\Streaming\stramAssets\data\sqlite\app.sqlite
```

## Aktueller Stand

CAN-26.5 wurde live bestaetigt: `docs/current` und `project-state` werden jetzt korrekt nach Live deployt.

CAN-27.0 hat die doppelte Struktur `htdocs\htdocs\...` geprueft. Ergebnis: Sie existiert, ist Git-getrackt, aber nicht produktiv referenziert.

CAN-27.1 ist vorbereitet: Die getrackten Altlast-Dateien unter `htdocs/htdocs` sollen per `git rm` entfernt werden. Die echten Zielpfade bleiben unveraendert.

## Wichtigste Regeln

```text
Keine Funktionalitaet entfernen.
Immer echte aktuelle Dateien/GitHub-dev/Live als Single Source of Truth pruefen.
Erst analysieren/planen, dann auf ausdrueckliches go umsetzen.
Keine produktive Aktion ohne separaten Go-Schritt.
Keine DB ueberschreiben oder neu bauen.
Keine Apply-/Patch-Scripts als Standardlieferung.
```

## CAN-27.0 Analysebefund

Getrackte Dateien unter Doppelpfad:

```text
htdocs/htdocs/dashboard/modules/overlays.js
htdocs/htdocs/overlays/Overlay Birthday.html
htdocs/htdocs/overlays/_rahmen.html
```

Referenzen:

```text
Keine Runtime-Referenzen auf htdocs/htdocs gefunden.
Nur Doku-/Projektstandsreferenzen vorhanden.
```

Bewertung:

```text
htdocs/htdocs/dashboard/modules/overlays.js = alter/abweichender Stand der echten htdocs/dashboard/modules/overlays.js.
htdocs/htdocs/overlays/Overlay Birthday.html = Duplikat von htdocs/overlays/_overlay-birthday.html.
htdocs/htdocs/overlays/_rahmen.html = alter/abweichender Stand der echten htdocs/overlays/_rahmen.html.
```

## CAN-27.1 Anwendung

Nach Entpacken der CAN-27.1-Doku-ZIP nach `D:\Git\stream-control-center`:

```powershell
cd D:\Git\stream-control-center

git rm "htdocs/htdocs/dashboard/modules/overlays.js"
git rm "htdocs/htdocs/overlays/Overlay Birthday.html"
git rm "htdocs/htdocs/overlays/_rahmen.html"

.\stepdone.cmd "CAN-27.1 Entferne getrackten htdocs-htdocs Doppelordner"
```

## Erwartete Tests

```powershell
git ls-files "htdocs/htdocs/*"
Test-Path "D:\Git\stream-control-center\htdocs\htdocs"
Test-Path "D:\Git\stream-control-center\htdocs\dashboard\modules\overlays.js"
Test-Path "D:\Git\stream-control-center\htdocs\overlays\_overlay-birthday.html"
Test-Path "D:\Git\stream-control-center\htdocs\overlays\_rahmen.html"
```

Erwartung:

```text
git ls-files "htdocs/htdocs/*" gibt nichts aus.
Die echten Zielpfad-Dateien existieren weiterhin.
```

## Weiterhin verboten / nicht passiert

```text
Keine echten htdocs/dashboard-Dateien geaendert.
Keine echten htdocs/overlays-Dateien geaendert.
Keine Backend-Module geaendert.
Keine Dashboard-Logik geaendert.
Keine DB-Migration.
Keine OBS-Aktion.
Keine produktiven Flows.
Keine Funktionalitaet entfernt.
```

## Empfohlener Start im neuen Chat

```text
Wir machen mit dem stream-control-center weiter. Bitte lies zuerst docs/current/CURRENT_CHAT_HANDOFF_CAN27_1.md und halte dich an den Master-Prompt. Aktueller Stand ist CAN-27.1 vorbereitet/anzuwenden: getrackten htdocs/htdocs-Doppelordner per git rm entfernen, Doku-ZIP anwenden, stepdone laufen lassen und danach Repo/Live pruefen.
```
