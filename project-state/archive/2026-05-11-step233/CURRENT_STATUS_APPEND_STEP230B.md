## STEP230B - Message-Rotator Dashboard-Modul

- `message_rotator` ist im Dashboard unter System aktiv.
- Neues Dashboard-Panel: `messageRotatorModule`.
- Neue Dashboard-Dateien:
  - `htdocs/dashboard/modules/message_rotator.js`
  - `htdocs/dashboard/modules/message_rotator.css`
- Dashboard nutzt nur Backend-APIs:
  - `/api/message-rotator/status`
  - `/api/message-rotator/admin/settings`
  - `/api/message-rotator/admin/texts`
  - `/api/message-rotator/integration-check`
  - `/api/message-rotator/start|stop|reload|next|manual`
- Settings werden ueber `message_rotator_settings` verwaltet.
- Nachrichten werden ueber `module_text_variants` mit `module_name = message_rotator` verwaltet.
- Mehrere aktive Nachrichtenvarianten bleiben moeglich; die Runtime waehlt zufaellig anhand Gewichtung.
- Backend, DB-Core, Helper, Configs und bestehende Runtime-Logik wurden nicht veraendert.
