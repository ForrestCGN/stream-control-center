## 2026-06-19 – STEP_HT1_FIX1_HYPETRAIN_MEDIA_SAVE

### Fixed

- Twitch-Events-Dashboard: Hype-Train-Rekord-Media-Auswahl wird jetzt vor dem Re-Rendern aus dem DOM gelesen und korrekt als `recordSound.mediaId` gespeichert.
- Betrifft nur das Speichern der Dashboard-Auswahl; Backend-Rekorderkennung, Tagebuch und Sound-System-Queue bleiben unverändert.

---

# CHANGELOG – stream-control-center

## 2026-06-17 – EventSound / Sound-System / Sound-Dashboard

### Added

- Sound-Dashboard-Bereich für globale Sound-Pause.
- Sound-Dashboard-Bereich `Zuletzt gespielt` / Recent Playback.
- Recent Playback Anzeige mit Audio-Ende, Gap-Ende, Audio-Dauer und Gap-Dauer.
- Neues Handoff: `docs/current/CURRENT_CHAT_HANDOFF_EVENT_SOUND_RUNTIME_2026-06-17.md`.
- Neuer Next-Chat-Prompt: `docs/current/NEXT_CHAT_PROMPT_EVENT_SOUND_RUNTIME_2026-06-17.md`.

### Changed

- `sound_system` auf `0.1.30` / `STEP_SOUND_GAP_2_PLAYBACK_LOG_AUDIO_END_AND_GAP_END`.
- Sound-Dashboard-Badge bei Recent Playback von `Aktiv` auf `Verlauf aktiv` geändert.

### Confirmed

- 2s Sound-Gap im Mischtest bestätigt.
- Queue startet nach `gapEndedAt`, nicht direkt nach Audio-Ende.

---

# CHANGELOG – stream-control-center

## 2026-06-15 – Loyalty Go-Live / Punkteimport / Raffle / Mini-Spiele

### Added

- `!raffle` und `!join` im bestehenden `loyalty_giveaways`-Modul.
- Raffle-Loyalty-Auszahlung mit internem 5000er Gewinnpool.
- Raffle-Transaktionen vom Typ `raffle_win`.
- Öffentliche Raffle-Textkeys `raffle.public.*`.
- StreamElements-Import-Tool und Importdateien für Top-489-Import.
- Raffle-API-Routen:
  - `GET /api/loyalty/raffle/status`
  - `GET /api/loyalty/raffle/config`
  - `POST /api/loyalty/raffle/config`
- Dashboard-Tab `Mini-Spiele`.
- Raffle-Bereich im Mini-Spiele-Dashboard.
- Gamble-Bereich im Mini-Spiele-Dashboard.

### Changed

- Loyalty-Modus von `shadow` auf `live` gesetzt.
- Watch-Punkte produktiv aktiv.
- Event-Boni produktiv über `twitch_events` verarbeitet.
- Raffle-Chattexte bereinigt: Pool wird öffentlich nicht mehr angezeigt.
- Loyalty-Navigation: `Gamble` als Haupttab wurde durch `Mini-Spiele` ersetzt.
- Raffle-Dashboard-Begriff `Gewinnpool intern` wurde in `Raffle-Gewinn gesamt` verbessert.
- Mini-Spiele Dashboard-Layout bereinigt.

### Fixed

- Raffle Config Endpoint: `CHAT_TEXT_VARIANTS is not defined` korrigiert.
- Dashboard-Live-Pfad-Problem erkannt: Repo-ZIPs mit `dashboard/modules` landen nicht automatisch in `htdocs/dashboard/modules`, wenn direkt nach `D:\Streaming\stramAssets` entpackt wird.
- FULLPATH-ZIPs für direkten Live-Deploy erstellt.
- Raffle-Gewinnerregel und Textkeys im Dashboard gegen zusammenklebende Darstellung bereinigt.

### Confirmed

- StreamElements-Import erfolgreich: 479 User / 1.832.557 Punkte.
- Twitch-Event-Boni produktiv verarbeitet.
- Watch-Punkte gebucht.
- Raffle-Gewinne gebucht.
- Raffle-Config lädt und speichert.
- `showPoolInChat=false` bleibt nach Dashboard-Speichern erhalten.
- Alerts weiterhin Shadow.

### Known Issues / Follow-up

- Config und Texte strukturell aus Mini-Spiele heraus sauber nach Einstellungen/Texte verschieben.
- Subscriber-Tier-Erkennung prüfen.
- GiftSub-Receiver-Konfig/Buchung abgleichen.
- Alert-Shadow weiter über mehrere Streams beobachten.
