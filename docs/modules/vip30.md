# VIP30 – BUS-TWITCH.16b

VIP30 unterstützt zwei Channelpoints-Quellen:

1. Neuer Primärweg: `twitch.channelpoints.redemption.created` über `twitch_events` und `communication_bus`.
2. Legacy-Fallback: `channelpoints.redemption / received`.

Mit BUS-TWITCH.16b wurde der Legacy-Fallback hart absicherbar gemacht. Wenn die Legacy-Bridge gestoppt ist, führt sie keine Decision aus. TwitchEvents-Verarbeitung wird nicht mehr in die Legacy-Bridge-Stats gezählt.
