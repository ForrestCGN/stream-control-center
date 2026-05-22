# STEP273B2 – Commands Dashboard Tabs

## Ziel

Commands-Dashboard nicht als überladene Einzelseite, sondern als aufgeteiltes Dashboard-Modul.

## Inhalt

- `htdocs/dashboard/modules/commands.js`
- `htdocs/dashboard/modules/commands.css`
- `tools/easy/STEP273B2_APPLY_DASHBOARD_COMMANDS_TABS.cjs`

## Tabs

- Übersicht
- Command-Verwaltung
- Rechte & Cooldowns
- Logs
- Diagnose

## Regeln

- Kein Backend-Core-Umbau.
- Keine bestehende Funktionalität entfernt.
- Twitch-Presence-Status sichtbar, weil echte Chatbefehle nur bei aktiver Presence funktionieren.
- Rohdaten nur aufklappbar, nicht dauerhaft auf der Hauptseite.
