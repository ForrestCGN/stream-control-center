## TODO / Regel – ZIP-Step Abschlussblock

- [x] Master-Prompt-Regel ergänzen: Jeder ZIP-Step muss künftig `installstep.cmd`, Neustart-Hinweis, Testbefehle, erwartete Status-/Versionswerte, konkrete `stepdone.cmd`-Beschreibung und `stepundo.cmd`-Hinweis enthalten.
- [ ] Bei künftigen ZIP-/Fix-Antworten aktiv prüfen, dass die `stepdone.cmd`-Beschreibung nicht fehlt.

---

## TODO – HypeTrain HT2 nach STEP_HT2_1_FIX1_HYPETRAIN_PREVIEW_LINEBREAK

- [x] HT2.1 Backend-Modul installiert und Statusroute bestätigt.
- [x] DB-Schema, Settings-Tabelle und Textvarianten-Modul bestätigt.
- [x] Preview-Routen bestätigt.
- [x] Synthetischer DB-Test bestätigt.
- [x] Preview-Zeilenumbruch zwischen Beitragsübersicht und HypeTrain-Punkten korrigiert.
- [ ] Fix1 einspielen und Preview erneut prüfen.
- [ ] Danach `stepdone.cmd` ausführen.
- [ ] HT2.2 Dashboard-Tabs planen/bauen: Übersicht, Config, Texte, Statistik, Tests.
- [ ] Später produktive Discord-/Tagebuch-Ausgabe erst nach Dashboard-/Config-Freigabe aktivieren.
- [ ] Config-Zentralisierung als eigener späterer Step: zentraler Modul-Config-Helper/Config-Service mit DB-Settings, JSON-Fallback, Code-Defaults, Kategorien, Labels, Tooltips, sensitive Werte und Dashboard-Payloads.

Nicht tun:

- [ ] Keine Top-Unterstützer-Namen standardmäßig posten.
- [ ] Keine produktive DB ersetzen oder überschreiben.
- [ ] Keine Funktionalität entfernen.

---

## TODO – HypeTrain HT2 nach STEP_HT2_1_HYPETRAIN_BACKEND_DB_STATUS_PREVIEW

- [x] Neues Backend-Fachmodul `hypetrain` geplant.
- [x] Config-Zentralisierung als spaeteres eigenes Thema aufgenommen.
- [x] DB-Config fuer HypeTrain ueber vorhandenen `helper_settings` vorbereitet.
- [x] Textvarianten fuer HypeTrain ueber vorhandenen `helper_texts` vorbereitet.
- [x] Tabellen fuer Runs, Contributions und Runtime-Events vorbereitet.
- [x] Discord-/Tagebuch-Vorschau ohne produktives Senden vorbereitet.
- [x] Top-Unterstuetzer/Namen standardmaessig deaktiviert.
- [ ] HT2.1 einspielen und Node neu starten.
- [ ] `/api/hypetrain/status` pruefen.
- [ ] `/api/hypetrain/preview` fuer normal/raid und rekord/kein rekord testen.
- [ ] Synthetischen DB-Test mit `confirm=1` pruefen.
- [ ] Echten HypeTrain im Stream beobachten, ob Bus-Events erfasst werden.
- [ ] Danach HT2.2 Dashboard-Tabs bauen: Übersicht, Config, Texte, Statistik, Tests.

### Spaeteres eigenes Thema: Config-Zentralisierung

- [ ] Zentralen Modul-Config-Helper bzw. Config-Service planen.
- [ ] Ziel: DB-Settings, JSON-Fallback, Code-Defaults, Kategorien, Labels, Tooltips, sensitive Werte und Dashboard-Payloads einheitlich verwalten.
- [ ] Optional spaeter: `module_settings_v2` mit `module_name`, damit weniger eigene Settings-Logik pro Modul noetig ist.
- [ ] Bestehende Module nur schrittweise migrieren, keine Big-Bang-Umstellung.

Nicht tun:

- [ ] Keine produktive DB ersetzen oder ueberschreiben.
- [ ] Keine alte HypeTrain-Logik entfernen, bevor HT2 live getestet ist.
- [ ] Keine Supporter-Namen/Top-Unterstuetzer standardmaessig posten.
- [ ] Keine Funktionalitaet entfernen.

---

## TODO – Clip-Shoutout / SO Sync nach STEP_SO_SYNC_FINISH_EVENT_LISTENER_FIX_VERIFIED

- [x] Problem analysiert: offizieller Twitch-SO konnte vor echtem Clip-Ende ausgelöst werden, wenn Sound-System/Overlay noch beschäftigt war.
- [x] `clip_shoutout` auf echtes Sound-System-/Overlay-Ende gekoppelt.
- [x] SoundSync-Listener korrigiert und aktiv bestätigt.
- [x] Finaler Offline-/Grace-Test bestätigt:
  - DisplayQueue wird nach `client_audio_ended` auf `done` gesetzt.
  - OfficialQueue wird erst nach Clip-Ende befüllt.
  - Kein zu frühes offizielles SO mehr.
- [ ] Beim nächsten echten Live-Stream final prüfen, ob `officialStatus=sent` / Twitch-204 nach Cooldown sauber erreicht wird.
- [ ] Danach ggf. diesen Live-Send als final bestätigt dokumentieren.

Nicht tun:

- [ ] Keine Timer-Freigabe zurückbauen.
- [ ] Keine Sound-System-Owner-Logik umgehen.
- [ ] Keine produktive DB ersetzen oder überschreiben.
- [ ] Keine Funktionalität entfernen.

---

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


## Hype-Train Rekord-System
- [ ] Nach FIX3 testen, ob Dashboard vollständig lädt.
- [ ] Media-Auswahl speichern und `recordSound.mediaId` prüfen.
- [ ] Rekord-Sound-Queue über Sound-System testen.
