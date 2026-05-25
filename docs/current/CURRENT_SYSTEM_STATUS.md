# CURRENT SYSTEM STATUS

Stand: STEP457_SHOUTOUT_SYSTEM_QUEUE_DASHBOARD_EVENTBUS

Das Clip-Shoutout-System ist zum SO-System erweitert:

- Command: `!so @user`
- Aliases: `!vso`, `!clipso`, `!videoso`
- Clip-Suche: zuerst 90 Tage, danach 365 Tage, danach all_time
- offizieller Twitch-Shoutout wird nach Ende der Anzeige queued
- Cooldowns: 120 Sekunden global, 3600 Sekunden pro Zielkanal
- Event-Bus: `shoutout.system`
- Dashboard-Moduldateien vorbereitet
