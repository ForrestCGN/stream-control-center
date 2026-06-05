# CURRENT_STATUS – stream-control-center

## Aktueller Bereich

Aktiver Arbeitsbereich: **CAN-44 Shoutout-System / Clip-Shoutout Overlay**

Aktueller stabiler Stand nach letzter Änderung:

- `clip_shoutout` Modulversion: **0.2.42**
- Hauptcommand: **`!so`**
- Alias: **`!vso`**
- Command-Quelle: **`command_definitions`**
- Direct-Intake: liest Commands aus `command_definitions`
- altes Dashboard-Modul `shoutout`: im Dashboard deaktiviert
- neues Dashboard-Modul `shoutout_v2`: produktiv als **Shoutout** eingebunden
- Sound-System-Overlay nutzt das kompakte H15/CAN44.24f Layout für Clip-Shoutouts
- Dashboard-Texte für das Shoutout-Overlay nutzen jetzt bevorzugt **Headline/Subline-Paare** über `shoutout.overlay.sets`

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

### CAN-44.24f – Sound-System-Overlay H15

- Shoutout-Darstellung im bestehenden `sound_system_overlay.html` auf H15-Layout stabilisiert.
- Avatar-Positionierung im runden Avatar-Bereich gefixt.
- H15 bleibt vorläufig akzeptierte visuelle Basis.

### CAN-44.26 – Overlay-Textpaare

- `clip_shoutout.js` nutzt `overlaySets` als bevorzugtes Paar-System für Headline/Subline.
- Neue API:
  - `GET /api/clip-shoutout/overlay-sets`
  - `POST /api/clip-shoutout/overlay-sets`
- Alte Textkeys bleiben als Fallback erhalten:
  - `shoutout.overlay.headline`
  - `shoutout.overlay.subline`

### CAN-44.30 – Dropdown sichtbar

- `shoutout.overlay.sets` erscheint im Shoutout-Dashboard unter:
  - Community -> Shoutout -> Texte
  - Kategorie: `Shoutout Overlay`
- Der Spezialeditor ersetzt bei diesem Key den normalen Varianteneditor.

### CAN-44.31 – Overlay-Set-Editor kompakt

- Vorschau-Zeile unter jedem Set entfernt.
- `Set löschen` sitzt oben rechts in der Set-Kopfzeile neben `aktiv`.
- Set-Karten sind kompakter.
- Nutzer bestätigte: **Sieht gut aus**.

## Aktuelle Overlay-Set-Textliste

Diese 10 Textpaare wurden als aktuell gewünschte Liste festgelegt und können über `POST /api/clip-shoutout/overlay-sets` eingespielt werden:

1. `Kurze Werbeunterbrechung!` / `Die Heimleitung empfiehlt heute {displayName}`
2. `Die Heimleitung schaltet um!` / `Auf der vergilbten Leinwand läuft jetzt {displayName}`
3. `Ein Rentner hat umgeschaltet!` / `Jetzt hängt er bei {displayName} fest`
4. `Rentner-Kino läuft!` / `Heute auf der alten Leinwand: {displayName}`
5. `Aus dem VHS-Archiv!` / `Gezeigt wird ein Clip von {displayName}`
6. `Der Beamer brummt!` / `Auf der vergilbten Leinwand läuft {displayName}`
7. `Werbepause im Fernsehraum!` / `Die Rentnercrew schaut bei {displayName} rein`
8. `CGN-Altersheim-TV!` / `Im Fernsehraum läuft jetzt {displayName}`
9. `Reklame war geplant!` / `Geworden ist es ein Clip von {displayName}`
10. `Die Heimleitung empfiehlt!` / `Heute im Programm: {displayName}`

## Nicht online getestet / Beobachten

Noch zu beobachten:

- normale AutoShoutout-Zählung mit Mindestnachrichten
- Sofort-Auslöser `!lurk`
- OfficialQueue-Retry-Verhalten über längere Laufzeit
- Shoutout-Overlay-Sets in mehreren echten Shoutouts beobachten

## Wichtige Projektregeln

- Keine Funktionalität entfernen.
- Bestehende produktive SQLite-Datenbank niemals ersetzen/überschreiben.
- Command-Definitionen sind Source of Truth für Chatcommands.
- Shoutout-Dashboard darf Commands anzeigen, aber Command-Konfiguration erfolgt im Commands-Dashboard.
- Clip-Player/Playback nicht anfassen, solange nicht explizit beauftragt.
