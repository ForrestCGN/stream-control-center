# CHANGELOG — stream-control-center

## 2026-05-26

### Commands

#### Backend `0.1.4` — safe-modal-editor

- Safe-Edit-Logik eingeführt.
- Bearbeiten vorhandener Commands speichert auf bestehenden Datensatz.
- Unbeabsichtigtes Neu-Anlegen beim Speichern wurde verhindert.
- Löschen mit Rückfrage vorbereitet.

#### Dashboard `0.1.5` — exact-saved-command-editor

- Editor zeigt gespeicherte Daten als maßgeblich.
- Katalogwerte überschreiben bestehende Commands nicht mehr automatisch.
- Benutzerdefinierte gespeicherte Aktionen werden korrekt erkannt.

#### Dashboard `0.1.6` — unified-action-dropdown-text-output

- Aktionsauswahl im Dropdown vereinheitlicht.
- Textausgabe vorbereitet.
- Benutzerdefinierte Aktionen in Dropdown integriert.

#### Dashboard `0.1.7` — action-type-driven-editor

- Dropdown bestimmt die passende Maske.
- Neue Commands starten mit benutzerfreundlichen Aktionen.
- Bearbeiten zeigt gespeicherte Aktionsart und passende Maske.

#### Dashboard `0.1.8` — separated-action-chat-media-picker

- Chat-Ausgabe aus dem Aktionsblock entfernt.
- Sound- und Video-Masken benutzerfreundlicher aufgebaut.
- MediaPicker für Audio/Video eingebunden.

#### Backend `0.1.5` — safe-edit-param-fix

- Fehler `Unknown named parameter 'createdAt'` beim Bearbeiten behoben.

#### Dashboard `0.1.9` — preserve-modal-draft-state

- Draft-State im Modal bleibt stabil.
- Trigger/Aliase/Basisdaten bleiben erhalten, wenn MediaPicker oder Aktionswechsel das UI aktualisieren.

### Kanalpunkte

#### Backend/Dashboard `0.7.0` — safe-modal-editor

- Modal-Editor analog zu Commands aufgebaut.
- Reward erstellen, bearbeiten, kopieren, lokal löschen, aktivieren/deaktivieren.
- Suche, Filter, Kategorie-Ansicht.

#### Dashboard `0.7.1` — preserve-modal-draft-state

- Reward-Key/Titel/Prompt/Kosten bleiben beim Medienauswählen erhalten.

#### Backend/Dashboard `0.7.2` — redemption-execution-flow

- Lokale Test-Einlösungen eingeführt.
- Einlösungen werden in `channelpoints_redemptions` gespeichert.
- Dashboard-Tab für Einlösungsverlauf ergänzt.

#### Backend/Dashboard `0.7.3` — text-reward-redemption-polish

- Text-Rewards lokal testbar.
- Ergebnisvorschau im Einlösungsverlauf.

#### Backend/Dashboard `0.7.4` — twitch-sync-readiness

- Twitch-Sync-Readiness-Panel ergänzt.
- Readiness-/Safety-Routen ergänzt.
- Weiterhin keine Twitch-Schreibzugriffe.

#### Backend/Dashboard `0.7.5` — eventbus-docs-final-polish

- EventBus-Domain-Events dokumentiert und ergänzt.
- Route `/api/channelpoints/bus-events` ergänzt.
- EventBus-Status bestätigt.

#### Backend/Dashboard `0.8.0` — twitch-auth-scope-check

- Route `/api/channelpoints/twitch/auth-check` ergänzt.
- Bestehenden Twitch Auth-Validate-Status angebunden.
- Token/Scope/Broadcaster-Match geprüft.
- Read-only Sync Bereitschaft bestätigt.
- Keine Twitch-Schreibzugriffe.

