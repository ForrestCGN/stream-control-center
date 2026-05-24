# NEXT_STEPS

## Nach STEP278B

1. Backend nach Deploy starten und prüfen, dass bestehende Module unverändert laden.
2. `node --check backend/modules/helpers/helper_communication.js` ist bereits im ZIP-Bau geprüft.
3. Danach STEP278C planen: `helper_security_context.js`.
4. Danach STEP278D planen: `helper_audit.js` mit dashboardfähigen Logs und Retention.
5. Erst danach SoundSystem-/Alert-Migration planen.

## Nach STEP277A_FIX10

1. `/api/clip-shoutout/clips?target=urlug` prüfen.
2. Clip-Anzahl, Dauer und Repeat-Guard-Preview bewerten.
3. Danach `!vso @urlug` im Chat testen.
