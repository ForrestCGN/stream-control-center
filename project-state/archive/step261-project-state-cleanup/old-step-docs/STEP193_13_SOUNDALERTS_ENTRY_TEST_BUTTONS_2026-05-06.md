# STEP193.13 - SoundAlerts Entry Test Buttons

Stand: 2026-05-06

## Ziel

Einzelne SoundAlerts-Eintraege sollen direkt im Dashboard getestet werden koennen, ohne dafuer echte SoundAlerts ausloesen zu muessen.

## Geaendert

- `htdocs/dashboard/modules/soundalerts.js`
  - Eintragskarten haben nun eine Icon-Aktion zum Testen.
  - Der Detail-Editor hat nun Icon-Aktionen fuer Speichern/Freigeben, Testen, Ignorieren und Loeschen.
  - Aktive Eintraege koennen im Editor direkt gespeichert werden; der Speichern-Button ist nicht mehr nur bei Review-Eintraegen sichtbar.
  - Ein Test wird ueber die bestehende `/api/soundalerts/test/chat`-Route ausgefuehrt.
  - Der Test erzeugt einen normalen SoundAlerts-Test-Chattext anhand des aktuellen Eintragsnamens.
  - Testen ist nur sichtbar, wenn ein Eintrag mindestens SoundAlerts-Name und Datei hat.
- `htdocs/dashboard/modules/soundalerts.css`
  - Icon-Button-Styles ergaenzt.
  - Screenreader-Text fuer Icon-Buttons ergaenzt.

## Nicht geaendert

- Keine Backend-Aenderung.
- Keine API-Aenderung.
- Keine DB-Schemaaenderung.
- Keine bestehende Funktionalitaet entfernt.

## Test

```text
node --check htdocs/dashboard/modules/soundalerts.js
```

Dashboard-Test:

1. `SoundAlerts > Eintraege` oeffnen.
2. Bei einem Eintrag mit Datei den Play-Button klicken.
3. Der Eintrag soll ueber das Sound-System abgespielt werden.
4. Speichern/Bearbeiten/Loeschen muessen weiterhin funktionieren.
