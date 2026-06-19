## TODO – Hype-Train Rekord nach STEP_HT1_FIX1_HYPETRAIN_MEDIA_SAVE

- [ ] Dashboard-Speichern mit Media-Auswahl erneut testen.
- [ ] Prüfen, dass `recordSound.mediaId` nach Speichern erhalten bleibt.
- [ ] Rekord-Test mit Sound-System-Queue prüfen.
- [ ] Echten Twitch-Hype-Train-Flow im Stream beobachten.
- [ ] Danach ggf. Texte in DB-/Textvarianten-System überführen.

---

# TODO – stream-control-center

Stand: 2026-06-17 06:55

## Neu erledigt – EventSound / Sound-System

- EventSound-Testflow mit echter Media-Datei bestätigt.
- Globale 2s Sound-Pause bestätigt.
- Recent Playback trennt Audio-Ende und Gap-Ende.
- Sound-Dashboard zeigt globale Sound-Pause und Zuletzt gespielt.
- Dashboard-Badge `Verlauf aktiv`.

## Neu offen – EventSound / Sound-System

- `EVENT-SOUND-DASH-1`: EventSound-Konfiguration ins Dashboard bringen.
- Sound-Snippet-Auswahl über vorhandenes Media-System.
- Runtime-Overlay Ergebnis-/Auswertungsphase ausbauen.
- Reveal-Video nach erkanntem Sound über vorhandenes Media-System planen.
- `SOUND-DASH-3`: Recent Playback Filter/Details ergänzen.
- Pause zwischen Sounds später editierbar machen.

---

# TODO – stream-control-center

Stand: 2026-06-15 19:55

## Erledigt

- Loyalty Core live geschaltet.
- StreamElements-Punkte additiv importiert.
- Watch-Punkte im Stream produktiv gebucht.
- Twitch-Event-Boni über `twitch_events` verarbeitet und gebucht.
- Alerts weiterhin Shadow gehalten.
- `!raffle` / `!join` im bestehenden `loyalty_giveaways` integriert.
- Raffle bucht Gewinnerpunkte als `raffle_win`.
- Raffle-Config-Routen ergänzt: `/api/loyalty/raffle/status`, `/api/loyalty/raffle/config`.
- Config-Endpoint-Fix: `loyalty_giveaways` Version 0.1.9.
- Dashboard-Tab `Mini-Spiele` ergänzt.
- Gamble aus Hauptnavigation in Mini-Spiele-Struktur überführt.
- Raffle im Dashboard sichtbar und speicherbar.
- Mini-Spiele Layout bereinigt.
- Raffle-Gewinnerregel und Textkeys optisch sauber dargestellt.

## Offen

- `LC-MINIGAMES-2A`: Struktur-Cleanup, Config/Texte/Commands sauber trennen.
- Raffle-Chattexte im nächsten Live-/Chat-Test final prüfen.
- Raffle-Texte im zentralen Texte-Bereich komfortabler filtern/anzeigen.
- Subscriber-Tier-Erkennung prüfen.
- GiftSub-Receiver-Konfig/Buchung abgleichen.
- Alert-Twitch-Events weiter im Shadow-Modus beobachten.
- Status-Warnings in `loyalty_giveaways` bei Gelegenheit auf aktuelle STEP-Stände aktualisieren, falls dort noch alte Hinweise stehen.

## Nicht tun ohne explizite Freigabe

- Alerts produktiv auf Twitch-Events/Bus umschalten.
- Produktive DB ersetzen oder überschreiben.
- Raffle als neues Parallelmodul bauen.
- Bestehende Giveaway-/Wheel-/Gamble-Logik umbauen.
- Funktionalität entfernen.

## Hype-Train Rekord

- [ ] STEP_HT1_FIX2 einspielen und Media-Speichern im Dashboard erneut testen.
- [ ] Danach synthetischen Rekord-Test mit gesetztem Sound ausfuehren.
- [ ] `soundQueued` und Sound-System-Playback pruefen.
- [ ] Echten Hype-Train im Stream beobachten.
