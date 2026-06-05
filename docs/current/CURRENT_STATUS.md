# CURRENT_STATUS – stream-control-center

## Aktueller Bereich

Aktiver Arbeitsbereich: **CAN-44.21 Shoutout-System**

Aktueller stabiler Code-/Dashboard-Stand nach letzter Änderung:

- `clip_shoutout` Modulversion: **0.2.40**
- Hauptcommand: **`!so`**
- Alias: **`!vso`**
- Command-Quelle: **`command_definitions`**
- Direct-Intake: liest Commands aus `command_definitions`
- alte Trigger `clipso` / `videoso`: entfernt bzw. nicht mehr aktiv
- altes Dashboard-Modul `shoutout`: im Dashboard deaktiviert
- neues Dashboard-Modul `shoutout_v2`: produktiv als **Shoutout** eingebunden

## Stabil bestätigte Punkte

### CAN-44.21.34 – Direct-Intake stabil

Der nicht-live Ablaufstest mit `!so` wurde erfolgreich durchgeführt:

- `!so @pretos1 --force` wurde erkannt und eingereiht.
- `!so @together_not_alone --force` wurde erkannt und eingereiht.
- erneutes `!so @pretos1 --force` wurde korrekt als `already_active_same_target` behandelt.
- Status zeigte:
  - `moduleVersion: 0.2.38`
  - `command: so`
  - `effectiveCommandTriggers: so, vso`
  - `directIntake.source: command_definitions`
  - `commandDefinitionCount: 1`
  - `fallbackUsed: false`

### CAN-44.21.37 – Dashboard-Config editierbar

- Shoutout V2 ist im Dashboard jetzt das produktive **Shoutout**.
- Altes Shoutout-Dashboard wurde aus `index.html` entfernt/deaktiviert.
- Settings-Tab ist editierbar.
- Commands/Aliase/Rechte/Cooldowns bleiben bewusst im Commands-Dashboard.
- Shoutout-Dashboard speichert nur Modul-Config.

### CAN-44.21.38 – Settings Layout Cleanup

- Settings-Seite wurde kompakter gruppiert.
- Command-Zuordnung wurde reduziert/einklappbar gemacht.
- Basis, Clip/Display, OfficialQueue, Stream-Regeln, Streamstatus/Start-Szene und AutoShoutout wurden klarer getrennt.

### CAN-44.21.39 – Help Tooltips

- Relevante Settings haben Hilfe-Tooltips erhalten.
- Kurzhilfen bleiben weiterhin unter den Feldern sichtbar.
- Settings-Zeilen haben Hover-Zustände.

### CAN-44.21.40 – Settings Save Fix

- Bug behoben: Beim Speichern wurden Formularwerte vorher durch ein Rendern überschrieben.
- Aktuelle Formularwerte werden nun vor dem Speichern gelesen.

### CAN-44.21.41 – AutoShoutout Instant Trigger Messages

- AutoShoutout zählt normale Nachrichten weiterhin:
  - erste Nachricht zählt als 1
  - bei Mindestnachrichten 3 sind noch zwei weitere Nachrichten nötig
- Neue Sofort-Auslöser:
  - `!lurk`
  - `!lurke`
  - `lurk`
- Sofort-Auslöser können Mindestnachrichten umgehen, damit Streamer mit nur kurzem `!lurk` trotzdem verarbeitet werden können.
- `!so` und `!vso` bleiben normale Shoutout-Commands und werden nicht als AutoShoutout-Sofort-Auslöser behandelt.

## Nicht online getestet

CAN-44.21.41 konnte noch nicht vollständig live-nah getestet werden, weil der Stream aktuell nicht online ist.

Noch zu beobachten:

- normale AutoShoutout-Zählung mit Mindestnachrichten
- Sofort-Auslöser `!lurk`
- Save-Verhalten im Dashboard nach CAN-44.21.40/41
- OfficialQueue-Retry-Verhalten über längere Laufzeit

## Wichtige Projektregeln

- Keine Funktionalität entfernen.
- Bestehende produktive SQLite-Datenbank niemals ersetzen/überschreiben.
- Command-Definitionen sind Source of Truth für Chatcommands.
- Shoutout-Dashboard darf Commands anzeigen, aber Command-Konfiguration erfolgt im Commands-Dashboard.
- Clip-Player/Playback nicht anfassen, solange nicht explizit beauftragt.
