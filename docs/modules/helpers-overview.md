# Helper-Doku: Übersicht

Stand: 2026-05-26 / STEP476_MODULE_DOCS_CORE_HELPERS_DEEP_DIVE  
Quelle: `backend/modules/helpers/*.js`

## Zweck

Diese Datei ist die Übersicht über vorhandene Helper. Neue Module sollen vorhandene Helper nutzen, statt parallele Strukturen zu bauen.

## Helper-Liste

| Helper | Zweck |
|---|---|
| `helper_audit_log.js` | Audit-Logger-Core, Audit-ID, JSONL/Memory-Einträge, Filter |
| `helper_chat_output.js` | Twitch-Chat-Ausgabe, Token-/Account-Reihenfolge, Chat-Status |
| `helper_communication.js` | Communication-Bus-Core, Clients, Events, ACK, Replay, Issues |
| `helper_config.js` | Root-/Pfadauflösung, Env, JSON-Config lesen/schreiben, Defaults |
| `helper_cooldown.js` | Cooldown-Prüfung, Role-Cooldowns, Cooldown-Store |
| `helper_core.js` | Basisfunktionen für IO, JSON, Parameter, API-Responses, Async-Routen |
| `helper_dashboard_audit.js` | kompakte Dashboard-Audit-Einträge |
| `helper_dashboard_auth.js` | Dashboard-Rollen/Rechte, lokale Requests, Permissions |
| `helper_media.js` | Medienpfade, erlaubte Endungen, ffprobe, Audio-/Video-Dauer |
| `helper_messages.js` | Chat-/Discord-Payloads, Sanitizing, Placeholder-Replace |
| `helper_queue.js` | generische Queue mit Priorität/IDs |
| `helper_routes.js` | Route-Registrierung, Aliase, Normalisierung |
| `helper_security.js` | lokale/API-Zugriffssicherheit, IP/Auth-Prüfung |
| `helper_security_context.js` | Actor-/Source-/Trust-Kontext, Permission-Prüfung, Masking |
| `helper_settings.js` | DB-basierte Settings mit Config-Fallback |
| `helper_state.js` | JSON-State-Dateien atomar laden/speichern/backupen |
| `helper_texts.js` | Textdateien, DB-Textvarianten, Texteditor-Payload, Rendering |
| `helper_twitch_roles.js` | Twitch VIP-/Mod-Rollenauflösung über Helix mit Cache |

## Grundregeln

```text
1. Vor neuer Helper-Datei erst prüfen, ob ein bestehender Helper passt.
2. Keine parallelen Config-/Text-/Security-/Queue-/State-Systeme bauen.
3. Helper-Funktionen nicht umbauen, ohne abhängige Module zu prüfen.
4. Bei neuen Modulen Pfade über helper_config lösen.
5. Texte über helper_texts/helper_messages planen.
6. Settings bevorzugt über helper_settings/DB-Muster planen.
7. Audit/Security-Kontext über helper_security_context verwenden.
```

## Helper mit DB-Bezug

```text
helper_settings.js
helper_texts.js
sqlite_core.js / backend/core/database.js
```

## Helper mit Security-/Audit-Bezug

```text
helper_security.js
helper_security_context.js
helper_audit_log.js
helper_dashboard_auth.js
helper_dashboard_audit.js
```

## Helper mit Medien-/Overlay-Bezug

```text
helper_media.js
helper_state.js
helper_messages.js
helper_chat_output.js
```

## Offene Punkte

- Pro Helper später eine Detailseite nur dann erstellen, wenn er häufig geändert wird oder komplex genug ist.
- `helper_texts.js`, `helper_settings.js`, `helper_communication.js` und `helper_security_context.js` sind komplex und sollten vor jeder Änderung einzeln gelesen werden.
