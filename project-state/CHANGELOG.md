## 2026-06-21 – STEP_HT2_3_HYPETRAIN_PRODUCTIVE_END_ACTIONS

### Added

- `hypetrain` Modul auf `0.1.2` erweitert.
- Sichere End-Aktionen vorbereitet:
  - Discord-Nachricht bei HypeTrain-Ende, wenn `discord.enabled` und `discord.writeOnEnd` aktiv sind.
  - Tagebuch-Systemeintrag bei HypeTrain-Ende, wenn `diary.enabled` und `diary.writeOnEnd` aktiv sind.
  - Rekord-Sound bei HypeTrain-Ende, wenn ein Rekord erkannt wurde und `sound.recordSoundEnabled` aktiv ist.
- Sound-Aufruf nutzt `/api/sound/play` mit `mediaId`/`soundId`.
- Tagebuch-Aufruf nutzt `/api/tagebuch/entry`.
- Discord-Aufruf nutzt vorhandene Discord-Bridge.
- Neue Testroute: `POST /api/hypetrain/test/end-actions?confirm=1`.
- Status ergaenzt um `lastEndActions` und End-Action-Counter.

### Safety

- Produktive Aktionen bleiben standardmaessig AUS.
- Dry-Run-Test ist Standard.
- Manueller produktiver Test braucht `confirmProductive=HYPETRAIN_PRODUCTIVE_ACTIONS`.
- Keine Namen/Top-Unterstuetzer standardmaessig.
- Kein Sound am Sound-System vorbei.

---

## 2026-06-21 – STEP_HT2_2_HYPETRAIN_DASHBOARD_TABS

### Added

- Neues Dashboard-Modul `hypetrain` mit Tabs: Übersicht, Config, Texte, Statistik und Tests.
- Dashboard-Einbindung in `htdocs/dashboard/index.html` und `htdocs/dashboard/app.js`.
- HypeTrain-Dashboard nutzt die vorhandenen `/api/hypetrain/*` Routen.

### Wichtig

- Keine produktiven Discord-/Tagebuch-Sends aktiviert.
- Keine eigene Upload-Lösung gebaut. Medienauswahl/Uploads bleiben beim zentralen Media-System-Fenster/Modal.
- `twitch_events` bleibt EventSub-Owner.

---

## 2026-06-21 – STEP_DOC_MEDIA_SYSTEM_UPLOAD_MODAL_RULE

### Added

- Master-Prompt-Regel ergänzt: Sounds, Videos, Bilder/Grafiken und sonstige Medienauswahlen/-Uploads sollen über das vorhandene Media-System laufen.
- Dashboard-Module sollen keine eigenen Upload-/Dateiauswahl-Insellösungen bauen; bevorzugt Media-System-Fenster/Modal nutzen.
- TODO für spätere HypeTrain-Alerts ergänzt: Start, Ende und Level-Up mit optionalem Sound, Video und Grafik.

### Not changed

- Kein Backend-Code geändert.
- Kein Dashboard-Code geändert.
- Keine Datenbank geändert.
- Keine produktive Runtime geändert.

---

## 2026-06-21 – STEP_DOC_MASTER_PROMPT_STEPDONE_DESCRIPTION_RULE

### Changed

- Master-Prompt ergänzt: Jede ZIP-Step-Lieferung muss künftig `installstep.cmd`, Node-/Neustart-Hinweis, Testbefehle, erwartete Status-/Versionswerte, konkreten `stepdone.cmd`-Befehl mit Beschreibung und `stepundo.cmd`-Hinweis enthalten.
- Ziel: STEP-Abschlüsse bleiben nachvollziehbar und `stepdone.cmd` wird nicht mehr ohne passende Beschreibung vergessen.

### Not changed

- Keine Code-, Dashboard-, Datenbank-, HypeTrain- oder Runtime-Änderung.

---

## 2026-06-21 – STEP_HT2_1_FIX1_HYPETRAIN_PREVIEW_LINEBREAK

### Fixed

- `hypetrain` Preview-Nachrichten setzen jetzt zuverlässig einen Zeilenumbruch zwischen Beitragsübersicht und HypeTrain-Punkte-Zeile.
- Betrifft nur Formatierung der Discord-/Preview-Message.
- Keine produktiven Discord-/Tagebuch-Aktionen aktiviert.
- Keine Änderung an `twitch_events`, Sound-System, Discord-Core oder produktiver DB-Logik.

---

## 2026-06-21 – STEP_HT2_1_HYPETRAIN_BACKEND_DB_STATUS_PREVIEW

### Added

- Neues Backend-Fachmodul `backend/modules/hypetrain.js`.
- DB-Schema fuer HypeTrain-Runs, Contributions und Runtime-Events.
- DB-Settings ueber `hypetrain_settings` mit vorhandenem `helper_settings`.
- Textvarianten-Vorbereitung ueber `module_text_variants` / Modul `hypetrain`.
- Bus-Subscriber fuer bestehende Twitch-/HypeTrain-/Support-Events.
- Status-, Config-, Texte-, Statistik- und Preview-Routen.
- Synthetischer Preview-/DB-Test ohne produktives Discord-/Tagebuch-Senden.

### Changed

- Projektplanung ergaenzt: Config-Zentralisierung als eigenes spaeteres Thema aufnehmen.
- HypeTrain-Architektur vorbereitet: `twitch_events` bleibt EventSub-Quelle, `hypetrain` wird Fachmodul.

### Not changed

- Keine produktive DB ersetzt.
- Kein Dashboard eingebaut.
- Kein Discord-Core umgebaut.
- Kein Tagebuch-System umgebaut.
- Kein Sound-System umgebaut.
- Keine alte HypeTrain-Logik entfernt.
- Keine Funktionalitaet entfernt.

---

## 2026-06-21 – STEP_SO_SYNC_FINISH_EVENT_LISTENER_FIX_VERIFIED

### Fixed

- `clip_shoutout`: Offizielle Twitch-Shoutouts werden nicht mehr vor dem echten Clip-Ende vorbereitet.
- SoundSync-Listener verarbeitet Sound-System-/Overlay-Ende (`client_audio_ended`, `finished`, `bundle.lock_finished`) korrekt.
- DisplayQueue wird nach echtem Clip-Ende auf `done` gesetzt.
- OfficialQueue wird erst danach befüllt (`trigger=sound_system_real_clip_end`).

### Confirmed

- Finaler Test `so_sync_final_test_20260621_124845.txt` bestätigt:
  - Clip-Shoutout läuft über Sound-System/Overlay.
  - Sound-System meldet `client_audio_ended`.
  - DisplayQueue-ID `236` wurde beendet.
  - OfficialQueue-ID `177` wurde nach Clip-Ende erstellt.
  - Kein zu frühes offizielles Twitch-SO mehr.

### Follow-up

- Echten Live-Test noch durchführen, um `officialStatus=sent` / Twitch-204 nach Cooldown final zu bestätigen.
- Test lief im Offline-/Grace-Zustand; Sync-Reihenfolge ist bestätigt, Twitch-Sendebestätigung noch nicht.

---

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

## STEP_HT1_FIX2_HYPETRAIN_MEDIA_STATE_SAVE

### Fixed

- Dashboard `twitch_events`: Hype-Train-Rekord-Sound-Auswahl wird jetzt nach `media-field:change` sofort im Modul-State gespeichert.
- Speichern liest die Media-ID robuster aus Hidden-Input, MediaField-Dataset oder Modul-State.
- MediaField bekommt `data-hype-media-field` und `data-media-id`, damit die Auswahl beim Render/Save nicht verloren geht.


## STEP_HT1_FIX3_HYPETRAIN_DASHBOARD_RENDER_FIX
- Fix: Twitch-Events-Dashboard blieb bei `Lade Twitch-Events...`, weil `selectedMediaId` im Hype-Train-Renderpfad nicht definiert war.
- Keine Backend-/DB-/Sound-System-Änderung.

## STEP_HT2_4_HYPETRAIN_DASHBOARD_END_ACTION_CONTROLS

- HypeTrain-Dashboard erweitert:
  - Übersicht mit Statusblock für produktive End-Aktionen.
  - Tests-Tab mit sicherem End-Actions-Dry-Run.
  - Config-Tab mit klarer Aktivierungslogik für Discord, Tagebuch und Rekord-Sound.
  - Media-System-Button öffnet die zentrale Medienverwaltung in einem eigenen Fenster.
- Keine Backend-/DB-Änderung.
- Keine produktive Aktion standardmäßig aktiviert.
