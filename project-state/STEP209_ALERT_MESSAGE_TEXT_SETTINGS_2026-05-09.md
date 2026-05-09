# STEP209 – Alert Message Text Settings (2026-05-09)

## Ziel

Der untere Nachrichtentext im Alert-Overlay ist jetzt über das Design-/Display-Profil einstellbar. Vorher war dieser Text nur indirekt über Gesamt-Schriftgröße und Kartengröße beeinflussbar.

## Geänderte Dateien

- `htdocs/dashboard/modules/alerts.js`
- `htdocs/dashboard/modules/alerts.css`
- `htdocs/overlays/_overlay-alerts-v2.html`

## Neue Display-Settings

Die neuen Werte liegen im bestehenden Display-Profil-Settings-Objekt und bauen keine neue Parallelstruktur:

- `messageEnabled` – Nachrichtentext anzeigen/ausblenden
- `messageScale` – eigene Skalierung des Nachrichtentextes
- `messageWidthMode` – kompakt, normal, breit oder volle Breite
- `messageMaxLines` – alle, 1, 2 oder 3 Zeilen
- `messageWeight` – normal oder fett

## Dashboard

Im Bereich `Design / Live-Vorschau` wurde unter `Inhalt: Text` ein neuer Block `Nachrichtentext` ergänzt.

Einstellbar sind:

- Nachricht anzeigen
- Nachrichtengröße
- Nachrichtenbreite
- Max. Zeilen
- Nachricht fett

Die Vorschau nutzt weiterhin das echte Overlay-Iframe. Änderungen sollten deshalb in Vorschau und OBS-Overlay gleich wirken.

## Overlay

Das Overlay liest die neuen Settings aus `alert.display.settings` und setzt Klassen/CSS-Variablen:

- `--message-scale`
- `message-width-*`
- `message-lines-*`
- `message-weight-*`
- `no-message`

Der Nachrichtentext wird nur ausgeblendet, wenn `messageEnabled` explizit aus ist. Standard bleibt: Nachricht sichtbar, alle Zeilen erlaubt.

## Nicht geändert

- Kein Backend-Umbau
- Keine DB-Migration
- Keine Sound-/TTS-/Queue-Änderung
- Keine Regel-Änderung
- Keine Entfernung bestehender Funktionalität

## Teststatus

Syntax wurde geprüft:

- `node --check htdocs/dashboard/modules/alerts.js`
- Embedded Overlay-Script aus `_overlay-alerts-v2.html` per `node --check` geprüft

## Manueller Test

1. Dashboard hart neu laden.
2. `Alert-Center > Design / Live-Vorschau` öffnen.
3. Ein Design-Profil auswählen.
4. Im Bereich `Inhalt: Text > Nachrichtentext` die Werte ändern.
5. Speichern.
6. Overlay-Test oder echten Test-Alert auslösen.
7. Prüfen, ob nur der untere Nachrichtentext anders gerendert wird.

## Offene Punkte

- Feintuning der Standardwerte nach Sichttest in OBS.
- Falls gewünscht: später Presets für Nachrichtentext, z. B. `dezent`, `normal`, `groß`.
