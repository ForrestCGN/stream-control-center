# CURRENT_STATUS Ergänzung – STEP229

Stand: 2026-05-11

## STEP229 - Message-Rotator Backend Admin Basis

- `backend/modules/message_rotator.js` nutzt jetzt zusätzlich `helper_settings`.
- Message-Rotator-Settings werden über die Tabelle `message_rotator_settings` vorbereitet.
- JSON `config/message_rotator.json` bleibt Fallback/Seed-Grundlage.
- Effektive Config wird als DB-Settings + JSON-Fallback + Code-Defaults geladen.
- Neue Admin-Routen:
  - `GET /api/message-rotator/admin/settings`
  - `POST /api/message-rotator/admin/settings`
  - `GET /api/message-rotator/admin/texts`
  - `POST /api/message-rotator/admin/texts`
- Textvarianten für `module_name = message_rotator` werden über `helper_texts` vorbereitet.
- Bestehende Runtime-Routen und Legacy-Routen bleiben erhalten.
- Dashboard-Dateien wurden in diesem STEP bewusst noch nicht geändert.
- Keine bestehende Funktionalität wurde entfernt.
- Keine neue Datenbank wurde gebaut oder ersetzt.

Referenzdokument:

```text
project-state/STEP229_MESSAGE_ROTATOR_BACKEND_ADMIN_BASIS_2026-05-11.md
```
