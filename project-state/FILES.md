# FILES

Stand: 2026-06-19

## Shot-Alarm Backend

- `backend/modules/shot_alarm.js` – Backend-Regeln, Bus-Consumer, Auslosung, Counter, Chat/Sound/Overlay-Ausgabe. Aktueller Stand `0.2.2`, Build `STEP_SHOT_ALARM_2D_DASHBOARD_AUDIT_SAFETY`. Neu in 2D: Dashboard-Audit, Safety-Status, Confirm-Schutz für kritische Aktionen.
- `config/shot_alarm.json` – Mirror/Fallback für Regeln, Zeiten, Texte, Soundpool, Chat-/Overlay-Config.

## Command-System

- `backend/modules/commands.js` – bestehendes Command-System. Neu in STEP 2C: `!shotdone` / `!shotgetrunken`, Version `0.2.4`, Build `STEP_SHOT_ALARM_2C_SHOTDONE_COMMAND`.

## Shot-Alarm Dashboard

- `htdocs/dashboard/modules/stream_events.js` – Event-System Dashboard, Tabs, Texte-/Config-Integration, Shot-Alarm-Tab. Neu in 2D: ConfirmWrite bei kritischen Shot-Alarm-Aktionen, Safety-/Audit-Infos im Shot-Tab, Hinweis `!shotdone ist aktiv`.
- `htdocs/dashboard/modules/stream_events.css` – Event-System Styles inkl. Config-Auswahl und Shot-Alarm-Safety-Ansicht.
- `htdocs/dashboard/modules/shot_alarm.js` – Shot-Alarm Dashboard-Modulbestand, in 2D mit ConfirmWrite-/Audit-Safety-Anpassungen.
- `htdocs/dashboard/modules/shot_alarm.css` – Shot-Alarm Styles.

## Shot-Alarm Overlay

- `htdocs/overlays/shot_alarm/shot_alarm_overlay.html` – OBS-Overlay mit oberer Karte und unterer Statusleiste.

## Shot-Alarm Doku

- `docs/modules/shot_alarm.md` – Moduldokumentation.
- `docs/current/CURRENT_CHAT_HANDOFF_SHOT_ALARM_2D_FINAL.md` – Übergabe für nächsten Chat.

## Projektstand

- `project-state/CURRENT_STATUS.md`
- `project-state/NEXT_STEPS.md`
- `project-state/TODO.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`
