# CURRENT_STATUS

## Stand: CAN-27.1 vorbereitet

CAN-26.5 wurde live bestaetigt: `docs/current` und `project-state` werden durch das Deploy-Script nach `D:\Streaming\stramAssets` synchronisiert.

CAN-27.0 hat die doppelte lokale Struktur `htdocs\htdocs\...` geprueft. Ergebnis: Der Ordner ist Git-getrackt, wird aber nicht produktiv referenziert. Drei Dateien liegen dort:

```text
htdocs/htdocs/dashboard/modules/overlays.js
htdocs/htdocs/overlays/Overlay Birthday.html
htdocs/htdocs/overlays/_rahmen.html
```

## Aktueller Arbeitsbereich

```text
CAN-27: Repo-Struktur bereinigen, ohne produktive Funktionalitaet zu entfernen.
```

## Aktueller stabiler Stand

CAN-26 wurde nach CAN-25.25b als Abschluss-/Qualitaetscheck fuer Bus-Diagnose und Overlay-Monitor durchgefuehrt.

Abgeschlossen und live getestet:

```text
CAN-26.0 GitHub/dev und Live-System bewusst abgeglichen.
CAN-26.1 Overlay-Monitor Scene-Awareness Diagnose-Fix.
CAN-26.2 Overlay-Monitor client-control Top-Level Diagnosefelder.
CAN-26.3 Doku- und Handoff-Aktualisierung inkl. Dashboard-Sichtpruefung.
CAN-26.4 Live-Doku-Sync und NEXT_STEPS-Bereinigung im Repo vorbereitet.
CAN-26.5 Deploy-Script um docs/project-state-Sync erweitert und live bestaetigt.
```

CAN-27.0 / CAN-27.1:

```text
CAN-27.0 htdocs/htdocs-Struktur analysiert.
CAN-27.1 soll den getrackten Doppelordner htdocs/htdocs sauber aus Git entfernen.
```

## Technischer Stand Overlay-Monitor

```text
backend/modules/overlay_monitor.js
Version: 0.1.8
Status API: 1.0.8
Build: CAN-26.2
```

## CAN-27.0 Befund htdocs/htdocs

```text
- htdocs/htdocs existiert.
- Enthalten sind dashboard/modules/overlays.js, overlays/Overlay Birthday.html und overlays/_rahmen.html.
- Alle drei Dateien sind Git-getrackt.
- Es gibt keine Runtime-Referenzen auf htdocs/htdocs.
- Referenzen existieren nur in Doku-/Projektstandsdateien.
```

Bewertung:

```text
htdocs/htdocs/dashboard/modules/overlays.js ist ein alter/abweichender Stand der echten Datei htdocs/dashboard/modules/overlays.js.
htdocs/htdocs/overlays/Overlay Birthday.html ist ein Duplikat von htdocs/overlays/_overlay-birthday.html.
htdocs/htdocs/overlays/_rahmen.html ist ein alter/abweichender Stand der echten Datei htdocs/overlays/_rahmen.html.
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

## Naechster Schritt

```text
CAN-27.1 anwenden: getrackte Altlast htdocs/htdocs per git rm entfernen, Doku-ZIP entpacken, stepdone ausfuehren, danach pruefen.
```
