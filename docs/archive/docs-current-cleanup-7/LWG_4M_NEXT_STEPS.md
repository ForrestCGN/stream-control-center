# LWG-4M – Nächste Steps

## LWG-4M.2 Backend: Close-Endpoint
- Endpoint für Giveaway schließen prüfen/ergänzen.
- Statuswechsel `open -> closed_for_entries`.
- Neue Tickets danach blockieren.
- Chatmeldung/Event für Close vorbereiten.

## LWG-4M.3 Backend: Draw-Guard
- Draw nur aus `closed_for_entries` erlauben.
- Draw aus `open` blockieren.
- Fehler/Textkey `giveaway.draw_not_closed`.

## LWG-4M.4 Backend: Giveaway-bound Wheel
- Scope für globale Presets und giveaway-bound Wheels festlegen.
- Beim Giveaway-Erstellen aus Auswahl eine gebundene Kopie erzeugen.
- `sourcePresetUid` und `giveawayUid` speichern.
- Nutzung außerhalb Giveaway-Kontext blockieren.

## LWG-4M.5 Dashboard: Giveaway UI
- Dropdown für Wheel-Basis.
- Bound Wheel Anzeige.
- Rad bearbeiten Modal im Giveaway-Kontext.

## LWG-4M.6 Dashboard: Preset Modal
- Ein Editor, zwei Kontexte.
- Global: normales Preset.
- Giveaway: gebundenes Rad.
