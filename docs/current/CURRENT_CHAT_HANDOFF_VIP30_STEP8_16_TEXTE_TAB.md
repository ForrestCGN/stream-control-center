# CURRENT CHAT HANDOFF – VIP30 STEP8.16 Texte Tab

Stand: 2026-06-06

## Ergebnis

Die VIP30 OverlaySets/Zufallstexte wurden aus dem Config-Tab in einen eigenen Dashboard-Tab verschoben:

```txt
Übersicht | Slots | Logs | Config | Texte | Aktionen | Diagnose
```

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

## Neuer Aufbau

### Config

```txt
VIP30 Alert-Sound
sichere technische Settings
kritische/gesperrte Settings
```

### Texte

```txt
VIP30 Overlay-Textsets
Textset hinzufügen
Textset duplizieren
Textset entfernen
aktiv/deaktivieren
Gewichtung
Kicker/Headline/Subline/Message/Brand
Perks als Zeilen
```

## Wichtig

Das Setting bleibt weiterhin:

```txt
alerts.overlaySets
```

Backend und Overlay nutzen unverändert die gleichen Daten.

## Auto-Reload

Der Dirty-/Focus-Schutz gilt jetzt für:

```txt
Config
Texte
```

Aktive Eingaben werden beim Auto-Reload nicht überschrieben.

## Test

```powershell
cd /d D:\Git\stream-control-center
node --check htdocs\dashboard\modules\vip30.js
.\stepdone.cmd "VIP30-STEP8.16 Texte Tab"
```

Danach Dashboard mit Strg+F5 neu laden.
