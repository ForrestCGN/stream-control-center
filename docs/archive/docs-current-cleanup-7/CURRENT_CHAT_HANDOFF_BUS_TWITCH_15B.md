# CURRENT CHAT HANDOFF – BUS-TWITCH.15b

Aktueller Step: BUS-TWITCH.15b – VIP30 TwitchEvents Payload Mapping Fix.

Problem im Live-Test: `twitch_events` sah `30 Tage VIP`, VIP30 TwitchEvents Subscriber empfing das Event, bewertete es aber als `not_vip30_reward`. Ursache ist die Payload-Form: `twitch_events` emittiert normalisierte Daten unter `payload.twitch`.

Aenderung: `backend/modules/vip30.js` Version `0.8.32 / BUS_TWITCH_15B_VIP30_TWITCH_EVENTS_PAYLOAD_MAPPING`.

Naechster Test: Node neu starten, Subscriber starten, `Gewuerzgurke` und danach `30 Tage VIP` einloesen. Bei VIP30 muss `lastNormalized.rewardTitle` `30 Tage VIP` zeigen und `lastResultReason` darf nicht mehr `not_vip30_reward` sein.
