# STEP030 - VIP Referenzstand

Stand: 2026-05-04

## Zweck

Dieser STEP dokumentiert den stabilen VIP-Zwischenstand nach STEP026 bis STEP029, bevor weitere Dashboard-/Config-Arbeiten beginnen.

## Bestaetigt

- VIP-Modul live auf Version 1.7.6 getestet.
- `!vip @araglor` wird automatisch als Mod-Sound erkannt.
- Twitch-Mod-Erkennung laeuft ueber `backend/modules/helpers/helper_twitch_roles.js`.
- `config/vip_sound_roles.json` bleibt als Fallback/Override bestehen.
- Sichtbare Texte sagen `Heimaufsicht` statt `Heimleitung`.
- Interne SQLite-Style-ID `heimleitung` bleibt unveraendert.
- Daily-Usage API wurde korrigiert:
  - `/api/vip-sound/daily-usage` zeigt alle Eintraege.
  - `/api/vip-sound/daily-usage/today` zeigt nur heute.
  - `/api/vip-sound/daily-usage/reset` loescht ohne Filter alle Eintraege.
  - `/api/vip-sound/daily-usage/reset-today` loescht nur den aktuellen Tag.

## Aktueller Ablauf

- Streamer.bot nimmt den Command `!vip` an.
- Streamer.bot sendet Minimaldaten per Fetch URL an `/api/vip-sound/command`.
- Node loest Actor und Target auf.
- Node prueft Target-Rolle zuerst ueber Twitch.
- Wenn Twitch nicht verfuegbar ist, bleibt der Rollen-Fallback aktiv.
- Node prueft Daily-Usage pro Stream-Tag.
- Node sucht die Sounddatei aktuell nach `Anzeigename.mp3`.
- Node queued den Sound ueber `/api/sound/play`.
- Sound-System liefert Visualdaten fuer Overlay V2.
- Chat-Ausgabe laeuft zentral ueber `helper_chat_output` / Heimaufsicht-Bot.

## Wichtige offene Punkte vor Dashboard

- VIP-Settings in SQLite vorbereiten.
- Soundpfad und Dateiregel aus DB lesen.
- Rollen-Fallbacks/Overrides in DB ueberfuehren.
- VIP-Texte per API bearbeitbar machen.
- Admin-/Test-Routen vereinheitlichen.
- Erst danach Dashboard bauen.
