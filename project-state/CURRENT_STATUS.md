# CURRENT_STATUS – stream-control-center

Stand: 2026-06-17 06:55

## Aktueller Zusatzstand – EventSound / Sound-System / Runtime-Dashboard

EventSound, globale Sound-Pause, Recent Playback und Sound-Dashboard sind bestätigt.

```text
stream_events = 0.5.36 / STEP_EVENT_SOUND_5B_OUTPUT_TARGET_CONFIG
sound_system = 0.1.30 / STEP_SOUND_GAP_2_PLAYBACK_LOG_AUDIO_END_AND_GAP_END
event_runtime_overlay.html = 0.2.6
Dashboard Sound-System = SOUND-DASH-2B_RECENT_PLAYBACK_BADGE_UX
```

Wichtige offene Punkte: EventSound-Konfiguration ins Dashboard, Runtime-Overlay Result-Phase, Reveal-Video über Media-System, Recent Playback Filter/Details, Pause zwischen Sounds später editierbar.

---

# CURRENT_STATUS – stream-control-center

Stand: 2026-06-15 19:55

## Aktueller bestätigter Stand

Loyalty Core ist produktiv live.

```text
loyalty version = 0.1.23
mode = live
eventBonusesEnabled = true
watchEarningEnabled = true
currency = Kekskrümel
```

StreamElements-Punkte wurden additiv importiert:

```text
Erfolgreich importiert: 479 User / 1.832.557 Kekskrümel
Fehler: 0
```

Twitch-Events laufen über `twitch_events` / Communication Bus:

```text
Support-Events wurden produktiv als event_bonus gebucht.
Alerts bleiben Shadow.
```

## Raffle Backend

`loyalty_giveaways` enthält die einfache Chat-Raffle.

```text
moduleVersion = 0.1.9
moduleBuild = STEP_LC_RAFFLE_2A_FIX1_CONFIG_ENDPOINT
lastError = leer
```

Raffle-Konfiguration:

```text
durationSeconds = 120
prizePoolAmount = 5000
entryCostAmount = 0
entryCostEnabled = false
startPermission = mod
raffleCommand = raffle
joinCommand = join
showPoolInChat = false
```

Raffle bucht live Loyalty-Punkte:

```text
interner Gewinn = 5000 Kekskrümel
Auszahlung = floor(5000 / Gewinneranzahl)
type = raffle_win
reason = loyalty_raffle_win
```

## Dashboard Mini-Spiele

Aktueller Stand umgesetzt und sichtbar:

```text
LC-MINIGAMES-1B Dashboard-Tab Mini-Spiele
LC-MINIGAMES-1C Dashboard Layout-Cleanup
LC-MINIGAMES-1D Raffle Detail-Layout unten
```

Bestätigt sichtbar:

```text
Loyalty -> Mini-Spiele
Raffle-Karte
Gamble-Karte
saubere KPIs
Raffle-Gewinn gesamt
Gewinnerregel als Liste
Textkeys als Chips
Raffle-Config lädt und speichert
```

## Bekannte offene Punkte

```text
Mini-Spiele strukturell aufräumen: Config in Einstellungen, Texte in Texte, Commands in Chat & Befehle.
Subscriber-Tier-Erkennung prüfen.
GiftSub-Receiver-Konfig/Buchung abgleichen.
Alert-Twitch-Events weiter im Shadow-Modus beobachten.
```
