# STEP209 – Alert Message Text Settings abgeschlossen

Stand: 2026-05-09

## Kurzfassung

STEP209 erweitert das Alert-System um echte Einstellungen für den kleinen Nachrichtentext im Alert-Overlay. Der Text unter Headline/Wert kann jetzt im Display-Profil gesteuert werden, ohne Alert-Regeln, Sound-System, TTS, Queue oder Backend-Logik zu verändern.

Der Step wurde nach mehreren UI-/Preview-Fixes funktional geprüft und als Arbeitsstand akzeptiert. Das allgemeine Dashboard-Design ist noch nicht final und bleibt als späterer UI-Cleanup offen.

## Betroffene Dateien

- `htdocs/dashboard/modules/alerts.js`
- `htdocs/dashboard/modules/alerts.css`
- `htdocs/overlays/_overlay-alerts-v2.html`

## Neue Display-Profil-Settings

Die Nachrichtentext-Einstellungen werden im bestehenden Display-Profil-Settings-Objekt gespeichert:

- `messageEnabled`
- `messageScale`
- `messageWidthMode`
- `messageMaxLines`
- `messageWeight`

Es wurde keine neue Parallelstruktur eingeführt.

## Neue Dashboard-Einstellungen

Im Bereich `Design / Live-Vorschau` gibt es für den Nachrichtentext neue Steuerungen:

- Nachricht anzeigen
- Nachrichtengröße
- Nachrichtenbreite
- Max. Zeilen
- Nachricht fett

Diese Einstellungen betreffen ausschließlich den kleinen User-Text unter dem Alert, z. B. Bits-, Resub- oder Donation-Nachrichten.

Nicht betroffen sind:

- Headline
- Betrag/Wert-Zeile
- Sound
- TTS
- Alert-Queue
- Regeln
- Provider-Logik

## Funktionaler Stand

Geprüft und bestätigt:

- Alle Einstellungen sind im Dashboard erreichbar.
- Das Formular läuft nicht mehr rechts aus dem sichtbaren Bereich.
- Nachrichtentext-Felder funktionieren.
- Nachrichtengröße reagiert sichtbar.
- Live-Vorschau übernimmt die Einstellungen.
- Overlay übernimmt die Einstellungen.
- Keine Backend-Änderung.
- Keine DB-Migration.
- Keine Funktionalität entfernt.

## Wichtige Zwischenfixes

### STEP209

Grundfunktion für Nachrichtentext-Einstellungen eingebaut.

### STEP209.1

Preview-/UI-Fix:
- längerer Vorschautext
- bessere Preview-Aktualisierung
- erster Versuch zur UI-Verbesserung

### STEP209.2

Layout-/Preview-Reparatur:
- Nachrichtentext-Block volle Breite
- Preview-Iframe stabiler aktualisiert
- messageScale-Bereich erweitert

### STEP209.3

Scale-/CSS-Fix:
- alte spezifische Overlay-CSS-Regeln überstimmten die neue Nachrichtengröße
- messageScale greift nun auch bei Bits-Alerts
- Nachrichtentext-Felder wieder stärker an normales Design-Grid angelehnt

### STEP209.4

Finaler Layout-Fix:
- Designformular läuft nicht mehr aus dem sichtbaren Bereich
- alle Regler erreichbar
- einheitlicheres Kartenlayout
- responsive Grid-Korrektur
- keine Backend-/DB-/Sound-/TTS-/Queue-Änderung

## Bewusst offen

Das allgemeine Dashboard-Design ist noch nicht final. Es gibt noch uneinheitliche Kachel-/Farb-Stile im Designbereich. Das wurde bewusst nicht in STEP209 gelöst, um Funktionsänderungen und allgemeines UI-Redesign nicht zu vermischen.

Offener späterer Step:

- Alert Dashboard UI Cleanup
- einheitliche Kachelfarben
- einheitliche Abstände
- einheitliche Feldhöhen
- einheitliche Label-/Hilfetext-Optik
- Designbereich insgesamt ruhiger und konsistenter machen

## Commit-Empfehlung

```powershell
cd D:\Git\stream-control-center
.\stepdone.cmd "docs: document alert message text settings"
```

Falls der letzte Code-Step noch nicht committed wurde:

```powershell
cd D:\Git\stream-control-center
.\stepdone.cmd "fix: make alert design form layout uniform and reachable"
```
