# NEXT_STEPS – Loyalty Giveaways / Glücksrad

Aktualisiert: 2026-06-09 09:08:00 UTC

## Direkt nächster empfohlener Schritt

### LWG-4M.9 – New Giveaway Wheel Option deaktivieren bis Field-Editor vorhanden ist

Grund:

Die Option `Neues Rad für dieses Giveaway` erzeugt derzeit ein Bound-Wheel ohne eigene Feldbasis. Der erfolgreiche Runtime-Test zeigt, dass Wheel-Giveaways mit kopierter Vorlage funktionieren. Ohne Vorlage fehlt aber aktuell noch der Editor/Snapshot für eigene Giveaway-Rad-Felder.

Ziel:

- Im Dashboard bei Wheel-Giveaways nur `Vorlage kopieren: <Preset-Name>` als nutzbare Auswahl anbieten.
- `Neues Rad für dieses Giveaway` ausblenden oder disabled anzeigen.
- Keine Backend-Änderung nötig, außer es wird bewusst ein zusätzlicher Guard gewünscht.

## Danach

### LWG-4N.0 – Bound-Wheel Field Snapshot / Giveaway-Rad-Editor

Ziel:

- Eigenes Giveaway-Rad mit eigenen Feldern ermöglichen.
- Preset-Vorlagen wirklich in Giveaway-Kontext kopieren.
- Bound-Wheel darf nach Start unabhängig von globalen Preset-Änderungen bleiben.

## Nicht als nächstes empfohlen

- Keine Command-Aktivierung vor sauberem UI-/Bound-Wheel-Stand.
- Keine Punktebuchung vor separater sicherer Buchungslogik.
- Kein Streamer.bot-Anteil für dieses System.
