# CURRENT_STATUS

## Stand: CAN-42.1 vorbereitet

CAN-42.1 baut eine zentrale Admin-Diagnose-Grundseite.

## Entscheidung

```text
Diagnose gehört zentral nach Admin > Diagnose.
Modul-Seiten bleiben Bedienseiten.
Keine neuen Diagnosekarten mehr direkt in einzelne Module einbauen.
Bestehende Modul-Diagnosen werden später schrittweise zentral nachgebildet oder entfernt.
```

## Änderung CAN-42.1

Geändert:

```text
htdocs/dashboard/index.html
htdocs/dashboard/modules/diagnostics.js
htdocs/dashboard/modules/diagnostics.css
docs/modules/diagnostics.md
project-state/*
docs/current/CURRENT_CHAT_HANDOFF_CAN42_1.md
```

Nicht geändert:

```text
backend/*
bestehende Modul-JS-Dateien
bestehende Modul-CSS-Dateien
```

## Verhalten

```text
Admin > Diagnose wird als Dashboard-Modul aktiviert.
Die Seite zeigt Gesamtübersicht und Moduldetails.
Die Seite nutzt nur GET-Statusendpunkte.
Keine API-POSTs.
Keine produktiven Aktionen.
Kein MutationObserver.
```

## Besonderheit Birthday

```text
GET /api/birthday/show/queue wird bewusst nicht genutzt.
```

Grund:

```text
Die Route kann intern stale Queue-Cleanup ausführen und ist nicht streng read-only.
```

## Nächster Schritt

```text
CAN-42.1 anwenden und Sichttest machen.
Danach CAN-42.2 Testergebnis dokumentieren oder Standardformat erweitern.
```
