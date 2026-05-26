# STEP276H_FIX1 – Alert Rule Image Fallback Text Cleanup

## Ziel

Unnötige Erklärungstexte aus den Grafik-Fallback-Bereichen entfernen, damit die Boxen nicht unnötig hoch werden und nicht über darunterliegende Regler wirken.

## Dateien

- `htdocs/dashboard/modules/alerts.js`
- `docs/dashboard/ALERT_RULE_IMAGE_FALLBACK_TEXT_CLEANUP_STEP276H_FIX1.md`

## Prüfung

- `node --check htdocs/dashboard/modules/alerts.js` OK
- Dashboard-Funktionen vorher: 164
- Dashboard-Funktionen nachher: 164
- Entfernte Funktionen: 0

## Hinweis

Dies ist ein reiner UI-Text-Cleanup. Speichern, MediaPicker, MediaId und Fallback-Logik bleiben unverändert.
