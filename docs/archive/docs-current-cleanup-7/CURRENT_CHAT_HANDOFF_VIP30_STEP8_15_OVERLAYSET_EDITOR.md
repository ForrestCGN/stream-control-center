# CURRENT CHAT HANDOFF – VIP30 STEP8.15 OverlaySet Editor + Auto-Reload

Stand: 2026-06-06

## Ergebnis

STEP8.15 ergänzt den VIP30-Dashboard-Config-Tab um einen komfortableren Editor für `alerts.overlaySets` und führt einen input-sicheren Auto-Reload ein.

## Geändert

```txt
htdocs/dashboard/modules/vip30.js
htdocs/dashboard/modules/vip30.css
```

## Nicht geändert

```txt
backend/modules/vip30.js
htdocs/overlays/sound_system_overlay.html
backend/modules/sound_system.js
backend/modules/media.js
```

## OverlaySet-Editor

Der bisherige JSON-Textarea-Weg bleibt technisch erhalten, wird aber im normalen Dashboard durch Karten ersetzt:

```txt
ID
enabled
weight
kicker
headline
subline
message
perks / chips
brand
```

Funktionen:

```txt
Textset hinzufügen
Textset duplizieren
Textset entfernen
JSON intern synchronisieren
Sichere Settings speichern über /api/vip30/settings/save
```

## Auto-Reload ohne Eingabeverlust

Neu:

```txt
Auto-Refresh alle ca. 10 Sekunden
Status/Slots/Logs/EventSub werden aktualisiert
wenn im Config-Tab gerade Eingaben aktiv sind, werden Inputs geschützt
dirty fields bleiben erhalten
fokussierte Eingaben werden nicht überschrieben
```

Wenn ungespeicherte Änderungen existieren:

```txt
Ungespeichert: x Änderungen
Auto-Reload schützt deine Eingaben
Änderungen verwerfen & neu laden
```

## Test

```powershell
cd /d D:\Git\stream-control-center
node --check htdocs\dashboard\modules\vip30.js
.\stepdone.cmd "VIP30-STEP8.15 OverlaySet Editor"
```

Danach Browser-Hard-Refresh im Dashboard.

## Erwartetes Verhalten

```txt
VIP30 Config öffnen
OverlaySets als Karten sehen
ein Feld ändern
10+ Sekunden warten
Eingabe bleibt erhalten
Speichern
Alert testweise auslösen
neuer Text erscheint im Overlay
```
