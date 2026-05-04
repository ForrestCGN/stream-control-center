# STEP041 - TTS / Alert-TTS / Sound-System Analyse- und Umbauplan

Stand: 2026-05-04

## Zweck

Dieser STEP beschreibt den geplanten Umbau von TTS, Alert-TTS und Sound-System, bevor Code angepasst wird.

Ziel ist ein dashboardfaehiges, DB-basiertes TTS-System, das weiterhin den bestehenden Chat-TTS-Ablauf erhaelt, aber zusaetzlich Alert-TTS fuer Ko-fi/Tipeee-Nachrichten sauber unterstuetzt.

Keine Codeaenderung in diesem STEP.

## Ausgangslage

Aktueller Stand laut Projektdateien und sichtbaren Repo-Dateien:

- TTS laeuft aktuell stabil als Chat-TTS mit eigenem Overlay.
- TTS nutzt aktuell eigene JSON-/State-Dateien:
  - `config/tts_config.json`
  - `config/tts_messages.json`
  - `config/tts_bans.json`
  - `config/tts_state.json`
- TTS erzeugt Audiodateien unter:
  - `htdocs/assets/tts/generated/`
- TTS sendet aktuell WebSocket-Events wie `tts_state`, `tts_play`, `tts_error`, `tts_stop` an das TTS-Overlay.
- TTS enthaelt aktuell eigene Logik fuer:
  - Config laden/speichern
  - Messages
  - Bans/Mutes
  - Usage-Zaehler
  - Cooldowns
  - Queue
  - Google/Piper Synthese
- Sound-System ist bereits moderner aufgebaut und nutzt Config/DB-Runtime-Settings teilweise.
- Alert-System hat bereits DB-Tabellen und vorbereitete TTS-Spalten in `alert_rules`:
  - `tts_enabled`
  - `tts_timing`
  - `tts_mode`
  - `tts_template`
  - `tts_max_chars`
  - `tts_min_amount`
- VIP nutzt bereits das Sound-System und gilt als Referenz fuer schrittweisen Umbau ohne Funktionsverlust.

## Neue fachliche Anforderung

Bisher:

- User schreibt `!tts Text`.
- TTS erzeugt Audio.
- TTS-Overlay zeigt User/Text.
- TTS-Overlay spielt Audio ab.

Neu zusaetzlich:

- Ko-fi und Tipeee koennen Text/Nachricht mitliefern.
- Diese Nachricht soll per TTS abgespielt werden.
- Die Ausgabe gehoert zum Alert, nicht zum normalen TTS-Overlay.
- Der Alert-Sound soll zuerst laufen.
- Danach soll die TTS-Nachricht abgespielt werden.
- Der Alert soll sichtbar bleiben, bis auch die TTS-Nachricht komplett fertig ist.
- Das normale TTS-Overlay darf dabei nicht erscheinen.

## Zukuenftige Trennung

TTS wird in zwei Ebenen getrennt:

### 1. TTS-Core

Der TTS-Core ist nur fuer die Erzeugung und Verwaltung von TTS verantwortlich:

- Text bereinigen
- Quelle/Modus pruefen
- Stimme auswaehlen
- Limits pruefen
- Audio erzeugen
- Datei speichern
- Dauer ermitteln
- Statistik/Event schreiben
- Ergebnis zurueckgeben

Der TTS-Core entscheidet nicht selbst, welches Overlay angezeigt wird.

### 2. Ausgabe-Modi

#### Chat-TTS

- Quelle: Twitch-Chat / Streamer.bot `!tts`
- Modus: `chat`
- Ausgabe: TTS-Overlay
- WebSocket: `tts_play`
- Sichtbar: User/Text im TTS-Overlay

#### Alert-TTS

- Quelle: Alert-System, z. B. Ko-fi/Tipeee
- Modus: `alert`
- Ausgabe: Alert-Overlay
- Kein separates TTS-Overlay
- TTS-Audio wird als Teil des Alert-Lifecycle behandelt

## Ziel-Ablauf fuer Alert-TTS

Kuenftiger Ablauf fuer Ko-fi/Tipeee mit Nachricht:

1. Webhook kommt im Alert-System an.
2. Alert-Payload wird normalisiert.
3. Passende Alert-Regel wird gefunden.
4. Alert-Sound und Alert-Dauer werden ermittelt.
5. Wenn `tts_enabled` aktiv ist und eine Nachricht vorhanden ist:
   - TTS-Text aus Template bauen.
   - TTS-Text bereinigen/kuerzen.
   - TTS-Core erzeugt Audiodatei.
   - Audiodauer wird ermittelt.
6. Alert-Item bekommt fertige TTS-Daten.
7. Alert wird erst danach ans Overlay geschickt.
8. Overlay spielt zuerst den Alert-Sound.
9. Nach Ende des Alert-Sounds startet Alert-TTS.
10. Alert bleibt sichtbar, bis Alert-TTS fertig ist.
11. Alert wird erst danach ausgeblendet.
12. Event/Statistik wird gespeichert.

## Warum TTS vor Alert-Start vorbereitet werden muss

Das Alert-System muss vor dem Anzeigen wissen, wie lange der Alert sichtbar bleiben muss.

Die reine Textlaenge reicht nicht aus, weil echte Audiodauer je nach Stimme, Engine, Satzzeichen, Zahlen, Pausen und Sprechgeschwindigkeit abweicht.

Darum muss Alert-TTS vor dem Alert-Start erzeugt oder mindestens sicher vorbereitet werden.

Minimal benoetigte Werte:

- `ttsText`
- `ttsAudioUrl`
- `ttsAudioFile`
- `ttsDurationMs`
- `ttsVoice`
- `ttsEngine`
- `ttsStartedAfterMs`
- `ttsEndsAtMs`
- `finalDurationMs`

## Timing-Modell

Grundformel:

```text
alertSoundStartMs = 0
alertSoundEndMs = alertSoundDurationMs
ttsStartAfterMs = alertSoundEndMs + optionalDelayMs
ttsEndMs = ttsStartAfterMs + ttsDurationMs
finalAlertDurationMs = max(ruleDurationMs, ttsEndMs + outroBufferMs)
```

Wichtig:

- Der Alert-Sound bleibt zuerst.
- TTS startet erst nach Alert-Sound-Ende.
- Alert bleibt mindestens bis TTS-Ende sichtbar.
- Wenn keine TTS-Nachricht vorhanden ist, bleibt der bisherige Alert-Ablauf unveraendert.

## Datenbank-Ziel fuer TTS

Dashboardfaehige Werte sollen primaer in die Datenbank.

Empfohlene Tabellen fuer TTS:

### `tts_settings`

DB-Settings via `helper_settings.js`.

Beispiele:

- `enabled`
- `command`
- `defaultVoice`
- `fallbackVoice`
- `rejectWhenFallbackUnavailable`
- `generatedBaseDir`
- `generatedPublicBaseUrl`
- `deleteGeneratedAfterHours`
- `googleDailyCharacterLimit`
- `googleMonthlyCharacterLimit`
- `alertTtsEnabled`
- `alertTtsDefaultVoice`
- `alertTtsMaxChars`
- `alertTtsDelayAfterSoundMs`
- `alertTtsOutroBufferMs`

### `tts_voices`

Konfigurierbare Stimmen ohne Secrets im Klartext.

Felder z. B.:

- `voice_id`
- `label`
- `engine`
- `enabled`
- `language_code`
- `voice_name`
- `audio_encoding`
- `speaking_rate`
- `pitch`
- `exe_path`
- `model_path`
- `config_path`
- `sort_order`

Wichtig:

- Google Service Account JSON bleibt Secret/Datei, nicht Dashboard-Klartext.

### `tts_role_rules`

Rollenbasierte Regeln fuer Chat-TTS.

Felder z. B.:

- `role_key`
- `enabled`
- `voice_id`
- `max_length`
- `user_cooldown_seconds`
- `global_cooldown_seconds`
- `priority`

### `tts_user_blocks`

Bans/Mutes als DB statt JSON.

Felder z. B.:

- `user_login`
- `user_display`
- `block_type` (`session_mute`, `ban`)
- `reason`
- `created_at`
- `created_by`
- `expires_at`
- `enabled`

### `tts_events`

Event-/Audit-/Statistikbasis.

Felder z. B.:

- `event_uid`
- `source` (`chat`, `alert`, `dashboard`, `test`)
- `mode` (`chat`, `alert`)
- `status`
- `user_login`
- `user_display`
- `role_key`
- `text`
- `chars`
- `voice_id`
- `engine`
- `audio_file`
- `audio_url`
- `duration_ms`
- `error`
- `created_at`
- `started_at`
- `finished_at`
- `meta_json`

### `tts_usage_daily`

Schnelle Statistik pro Tag/Engine/Quelle.

Felder z. B.:

- `usage_date`
- `source`
- `mode`
- `engine`
- `requests_total`
- `requests_ok`
- `requests_failed`
- `chars_total`
- `duration_ms_total`

## Alert-System Erweiterungen

Vorhandene Alert-Regel-Felder sollen aktiv genutzt werden:

- `tts_enabled`
- `tts_timing`
- `tts_mode`
- `tts_template`
- `tts_max_chars`
- `tts_min_amount`

Empfohlene neue/zu speichernde Eventwerte:

- `tts_text`
- `tts_audio_url`
- `tts_audio_file`
- `tts_duration_ms`
- `tts_engine`
- `tts_voice`
- `tts_start_after_ms`
- `final_duration_ms`
- `sound_duration_ms`

Diese Werte koennen zunaechst in `payload_json`/`meta_json` abgelegt werden, bevor feste Spalten ergaenzt werden.

## Helper-Ziel

TTS soll schrittweise auf vorhandene Helper umgestellt werden:

- `helper_settings.js`
  - DB-Settings lesen/schreiben
  - JSON-Fallback optional
- `helper_config.js`
  - alte JSON-Dateien als Fallback/Import
- `helper_media.js`
  - Audiodauer/Dateiinfo
- `helper_routes.js`
  - einheitliche API-Routen
- `response_helper.js`
  - einheitliche API-Antworten, falls im Projektstandard genutzt
- `helper_chat_output.js`
  - Chat-Antworten ueber Bot statt Streamer.bot
- `helper_messages.js` / `helper_texts.js`
  - Texte/Templates langfristig vereinheitlichen
- zentrale DB-Schicht
  - keine eigene Sonderwelt fuer SQLite

## API-Ziel fuer TTS

Spaetere Backend-APIs:

- `GET /api/tts/status`
- `GET /api/tts/settings`
- `POST /api/tts/settings/upsert`
- `POST /api/tts/settings/delete`
- `POST /api/tts/settings/reset-defaults`
- `GET /api/tts/voices`
- `POST /api/tts/voices/upsert`
- `POST /api/tts/voices/delete`
- `GET /api/tts/roles`
- `POST /api/tts/roles/upsert`
- `GET /api/tts/events`
- `GET /api/tts/stats`
- `GET /api/tts/usage`
- `GET /api/tts/blocks`
- `POST /api/tts/blocks/upsert`
- `POST /api/tts/test`
- `POST /api/tts/synthesize`
- `POST /api/tts/prepare-alert`

Wichtig:

- `POST /api/tts/synthesize` erzeugt Audio, startet aber kein Overlay.
- `POST /api/tts/prepare-alert` ist fuer Alert-System gedacht und liefert Dauer/Audio/Timingdaten.

## Empfohlene STEP-Reihenfolge

### STEP042 - Vollstaendige TTS-Dateianalyse

Benötigt komplette Dateien, weil GitHub/Tools grosse Dateien kuerzen:

- `backend/modules/tts_system.js`
- `backend/modules/alert_system.js`
- `backend/modules/sound_system.js`
- relevante Overlays
- relevante Configs

Output:

- konkrete Routenliste
- konkrete Funktionsliste
- konkrete Abhaengigkeiten
- Umbaupunkte ohne Ratearbeit

### STEP043 - TTS DB-Schema vorbereiten

- migrationssicher
- keine SQLite-Datei ersetzen
- bestehende JSON-Dateien weiter als Fallback behalten
- keine Funktionsaenderung

### STEP044 - TTS Settings via `helper_settings.js`

- DB-first
- JSON-Fallback
- Code-Defaults
- neue Status-/Settings-API

### STEP045 - TTS Events/Stats einbauen

- jede Anfrage protokollieren
- Chat/Alert/Test/Dashboard unterscheiden
- Usage-Statistiken abrufbar machen

### STEP046 - TTS-Core intern trennen

- `synthesize`/`prepare` von `enqueueChatTts` trennen
- bestehendes `!tts` bleibt unveraendert nutzbar

### STEP047 - Alert-TTS Prepare-Route

- Alert-System kann TTS vorbereiten lassen
- Rueckgabe enthaelt Audio-URL und echte Dauer
- noch kein Overlay-Umbau riskieren

### STEP048 - Alert-Lifecycle erweitern

- Alert-Sound zuerst
- TTS danach
- finalDuration berechnen
- Alert bleibt bis TTS-Ende sichtbar

### STEP049 - Dashboard-APIs finalisieren

- TTS Settings
- Voices
- Role Rules
- User Blocks
- Events
- Stats
- Test/Preview

### STEP050 - Dashboard-Modul TTS

Erst nach stabilem Backend.

## Dateien, die vor Codeaenderungen benoetigt werden

Pflicht, weil sonst keine sichere Bearbeitung moeglich:

- `backend/modules/tts_system.js`
- `backend/modules/alert_system.js`
- `backend/modules/sound_system.js`

Sehr wichtig:

- `htdocs/overlays/tts*.html`
- `htdocs/overlays/*alert*.html`
- `config/tts_config.json`
- `config/tts_messages.json`
- `config/tts_bans.json`
- `config/tts_state.json`
- `config/alert_system.json`
- `config/sound_system.json`

Keine Uploads von Secrets:

- keine `.env`
- keine Google Service Account JSON
- keine Tokens
- keine SQLite-Datei

## Arbeitsregeln fuer die Umsetzung

- Keine Funktionalitaet entfernen.
- Chat-TTS muss nach jedem Schritt weiterhin laufen.
- Alert-System darf nicht blind umgebaut werden.
- Bestehende Alert-Regeln, Assets, Texte und History duerfen nicht kaputtgehen.
- SQLite nur migrationssicher erweitern.
- Dashboard schreibt spaeter nur ueber Backend-APIs.
- JSON-Dateien bleiben zuerst als Fallback/Import erhalten.
- Secrets bleiben ausserhalb von DB/Repo/Dashboard.
