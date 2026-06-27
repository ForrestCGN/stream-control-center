# CURRENT_CHAT_HANDOFF – LWG-4N.3b

## Stand
Der Preset-/Glücksrad-Editor ist ein gemeinsamer Editor für globale Presets und Giveaway-Glücksräder. In LWG-4N.3b wurde die sichtbare UX abhängig vom Einstieg angepasst.

## Regeln

- Aus dem Presets-Tab bleibt es ein Preset-Editor.
- Aus dem Giveaway-Editor wirkt derselbe Editor wie ein Glücksrad-Editor.
- Unnötige technische Felder werden im Giveaway-Kontext ausgeblendet.
- Das Statusfeld wird beim Erstellen aus dem Giveaway-Kontext nicht angezeigt; intern bleibt der Status `draft`.
- Das Layout wurde bewusst nicht neu aufgebaut.

## Nächste Schritte

1. Sichttest des Modals im Presets- und Giveaway-Kontext.
2. Danach Preset-/Glücksrad-Feldbearbeitung im Modal weiter verbessern.
3. Danach Runtime-Umstellung: Wheel-Spin aus Bound-Wheel-Feldern statt nur aus Source-Preset.
