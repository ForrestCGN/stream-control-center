# Helper-Doku: Texte / Settings / Messages

Stand: 2026-05-26 / STEP476_MODULE_DOCS_CORE_HELPERS_DEEP_DIVE  
Quellen: `helper_texts.js`, `helper_settings.js`, `helper_messages.js`

## Zweck

Diese Helper sind zentral für dashboardfähige Texte, Varianten, Placeholder und DB-basierte Modul-Settings.

## `helper_texts.js`

### Zweck

Verwaltet Textdateien, DB-Textvarianten, Texteditor-Payloads und Rendering.

### Wichtige Exporte

```text
DEFAULT_MODULE_TEXTS_TABLE
DEFAULT_MODULE_TEXT_VARIANTS_TABLE
ensureModuleTextsTable
ensureModuleTextVariantsTable
seedModuleTexts
seedModuleTextVariants
listModuleTexts
listModuleTextVariants
listModuleTextEditor
getModuleTexts
pickModuleText
renderModuleText
setModuleText
setModuleTexts
setModuleTextVariant
deleteModuleTextVariant
handleModuleTextEditorPayload
getMessagesDir
ensureDefaultMessageFiles
reload
getStatus
hasKey
getEntry
getTexts
getPlaceholders
pickText
flattenContext
renderTemplate
renderKey
buildChatResult
```

### Tabellen

Erkannt aus Funktionsnamen und SQL-Buildern:

```text
module_texts
module_text_variants
```

Die konkreten Tabellenspalten müssen vor Migration/Änderung direkt in `helper_texts.js` geprüft werden, da der Helper sehr umfangreich ist.

### Relevanz

Für neue Chat-/Discord-/Overlay-Texte gilt:

```text
mehrere Varianten pro Text-Key
aktiv/inaktiv
kategorisiert
dashboardfähig
zufällige Auswahl aktiver Varianten
```

## `helper_settings.js`

### Zweck

DB-basierte Settings mit Config-Fallback. Geeignet für Module, deren Einstellungen später dashboardfähig werden sollen.

### Wichtige Exporte

```text
DEFAULT_SETTINGS_TABLE
ensureSettingsTable
seedDefaults
getSettingRow
getSetting
setSetting
listSettings
deleteSetting
readConfigFallback
getNestedValue
getSettingWithFallback
encodeValue
decodeValue
rowToSetting
```

### Tabelle

Default aus Export:

```text
module_settings
```

Die konkrete Tabelle kann über Parameter/Helper-Funktion variieren. Vor Nutzung echte Aufrufe im Modul prüfen.

## `helper_messages.js`

### Zweck

Kleine Message-/Payload-Hilfen für Chat und Discord.

### Wichtige Exporte

```text
sanitizeChatMessage
isEmptyMessage
streamerbotChatPayload
buildSendResponse
buildNoSendResponse
buildErrorResponse
splitLongMessage
discordWebhookPayload
standardSystemMessage
escapeMentions
replacePlaceholders
```

## Regeln

- Neue ausgebbare Texte nicht hart codieren, wenn sie später editierbar sein sollen.
- Für Modultexte bevorzugt `helper_texts` verwenden.
- Für einfache Payloads/Antworten `helper_messages` verwenden.
- Für Einstellungen `helper_settings` prüfen, bevor neue JSON-only Settings gebaut werden.
- JSON darf Seed/Fallback bleiben, primäre Verwaltung soll langfristig dashboard-/DB-fähig sein.

## Tests / Prüfungen

Direkte API-Tests hängen vom nutzenden Modul ab. Für reine Helper gibt es keine eigenen HTTP-Routen.

Bei Moduländerungen prüfen:

```text
Welche Text-Keys nutzt das Modul?
Welche Kategorie?
Welche Placeholder?
Sind Varianten aktiv/inaktiv möglich?
Welche Settings liegen in DB und welche in JSON?
```

## Offene Punkte

- Konkrete Tabellen-Spalten aus `helper_texts.js` noch separat tief dokumentieren.
- Bestehende Module einzeln erfassen: welche Text-Keys und Settings sie wirklich nutzen.
