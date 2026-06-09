# Handoff – LWG-4N.3c

Bestätigte Grundlage: LWG-4N.1b, LWG-4N.1c, LWG-4N.2 und LWG-4N.3/3b.

Dieser Step ändert nur `htdocs/dashboard/modules/loyalty_games.js`.

UX-Entscheidung:
- Der Preset-/Glücksrad-Editor bleibt gleich im Design.
- Felder werden kontextabhängig ein-/ausgeblendet.
- Im Giveaway-Formular darf die Grundstruktur nicht unnötig zwischen Classic/Wheel springen.
- Wheel-spezifische Auswahl wird daher als eigener Bereich unterhalb des Modus angezeigt.
- Speichern im Giveaway-Glücksrad-Editor schließt das Modal und übernimmt die Auswahl.
