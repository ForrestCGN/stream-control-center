-- VIP30 STEP8.19.18 optionaler Check/Fix, nur falls channelpoints_rewards.twitch_is_enabled lokal noch 0 ist.
-- Vorher DB-Backup machen.
SELECT reward_key, twitch_reward_id, title, cost, system_enabled, twitch_is_enabled, is_paused, action_type, action_key, auto_fulfill
FROM channelpoints_rewards
WHERE reward_key = 'vip30' OR action_key = 'vip30.redeem';

-- Nur ausführen, wenn der Reward wirklich der Twitch-VIP30-Reward ist:
-- UPDATE channelpoints_rewards
-- SET twitch_is_enabled = 1, updated_at = datetime('now')
-- WHERE reward_key = 'vip30' OR action_key = 'vip30.redeem';
