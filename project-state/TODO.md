# TODO – stream-control-center

Stand: 2026-06-22

## HypeTrain / Tagebuch – nach HT2.8

- [x] HT2.8 Tagebuch Stream-State-Freigabe getestet.
- [x] `/api/tagebuch/status` zeigt bei aktivem Stream-State/Override `effectiveActiveStreamForEntries=true`.
- [x] `entryStreamSource=twitch_events_stream_state` bestätigt.
- [x] Produktiver HypeTrain-Tagebuch-Test wurde gespeichert.
- [x] Tagebuch-Webhook hat gepostet.
- [x] HypeTrain-End-Actions-Ergebnis bestätigt: `diary ok`, Direkt-Discord skipped, Rekord-Sound skipped, errors leer.
- [ ] Beim nächsten echten Twitch-HypeTrain beobachten, ob Ende automatisch sauber ins Tagebuch schreibt.
- [ ] Danach Live-Ergebnis in `project-state/CURRENT_STATUS.md`, `CHANGELOG.md` und `docs/modules/hypetrain.md` ergänzen.

## HypeTrain – aktueller Standard nach HT2.7/HT2.8

- [x] `diaryEndEnabled=true` als gewünschter Standard dokumentiert.
- [x] `directDiscordEndEnabled=false` als Standard dokumentiert.
- [x] `recordSoundEndEnabled=false` als Standard dokumentiert.
- [ ] Rekord-Sound später separat über Media-/Sound-System konfigurieren und testen.
- [ ] Direkt-Discord nur später bewusst als Zusatzweg testen, nicht als Standard.

## HypeTrain Alert-/Media-Erweiterung

- [ ] HypeTrain-Alerts später vorbereiten:
  - Alert beim Start eines HypeTrains
  - Alert beim Ende eines HypeTrains
  - Alert bei neuer HypeTrain-Stufe / Level-Up
- [ ] Pro Alert-Typ optional Sound, Video und/oder Grafik unterstützen.
- [ ] Medienauswahl und Uploads ausschließlich über das bestehende Media-System umsetzen.
- [ ] Upload/Medienauswahl im Dashboard nicht inline als Insellösung bauen, sondern über ein eigenes Media-System-Fenster/Modal öffnen.
- [ ] Dashboard-Config vorbereiten:
  - Start-Alert aktiv/inaktiv
  - Level-Up-Alert aktiv/inaktiv
  - Ende-Alert aktiv/inaktiv
  - jeweilige Media-ID / Sound / Video / Grafik
  - Queue-/Prioritätsregeln über Sound-System
- [ ] Produktive Wiedergabe ausschließlich über bestehendes Sound-/Media-System, nicht direkt aus dem HypeTrain-Modul.
- [ ] Alert-/Discord-/Tagebuch-Texte später über DB-/Textvarianten-System pflegen.

## HypeTrain – Produktive Einzeltests

- [ ] `all_off` testen, wenn an End-Actions weitergearbeitet wird.
- [ ] `diary_only` bleibt Standard und ist für Tagebuch-Endeinträge vorgesehen.
- [ ] Produktiven Tagebuch-Einzeltest nur mit zusätzlichem Confirm durchführen.
- [ ] Danach optional `discord_only` mit Webhook/Channel prüfen.
- [ ] Danach optional `record_sound_only` mit Media-ID/Sound-ID aus Media-System prüfen.
- [ ] Nach jedem Test Status, Logs und End-Actions-Counter prüfen.
- [ ] Dashboard später um geführten Assistenten für diese Reihenfolge erweitern.

## Clip-Shoutout / SO Sync

- [x] Problem analysiert: offizieller Twitch-SO konnte vor echtem Clip-Ende ausgelöst werden, wenn Sound-System/Overlay noch beschäftigt war.
- [x] `clip_shoutout` auf echtes Sound-System-/Overlay-Ende gekoppelt.
- [x] SoundSync-Listener korrigiert und aktiv bestätigt.
- [x] Finaler Offline-/Grace-Test bestätigt.
- [ ] Beim nächsten echten Live-Stream final prüfen, ob `officialStatus=sent` / Twitch-204 nach Cooldown sauber erreicht wird.
- [ ] Danach ggf. diesen Live-Send als final bestätigt dokumentieren.

Nicht tun:

- [ ] Keine Timer-Freigabe zurückbauen.
- [ ] Keine Sound-System-Owner-Logik umgehen.
- [ ] Keine produktive DB ersetzen oder überschreiben.
- [ ] Keine Funktionalität entfernen.

## EventSound / Sound-System

- [ ] `EVENT-SOUND-DASH-1`: EventSound-Konfiguration ins Dashboard bringen.
- [ ] Sound-Snippet-Auswahl über vorhandenes Media-System.
- [ ] Runtime-Overlay Ergebnis-/Auswertungsphase ausbauen.
- [ ] Reveal-Video nach erkanntem Sound über vorhandenes Media-System planen.
- [ ] `SOUND-DASH-3`: Recent Playback Filter/Details ergänzen.
- [ ] Pause zwischen Sounds später editierbar machen.

## Loyalty / Mini-Spiele

- [ ] `LC-MINIGAMES-2A`: Struktur-Cleanup, Config/Texte/Commands sauber trennen.
- [ ] Raffle-Chattexte im nächsten Live-/Chat-Test final prüfen.
- [ ] Raffle-Texte im zentralen Texte-Bereich komfortabler filtern/anzeigen.
- [ ] Subscriber-Tier-Erkennung prüfen.
- [ ] GiftSub-Receiver-Konfig/Buchung abgleichen.
- [ ] Alert-Twitch-Events weiter im Shadow-Modus beobachten.
- [ ] Status-Warnings in `loyalty_giveaways` bei Gelegenheit auf aktuelle STEP-Stände aktualisieren, falls dort noch alte Hinweise stehen.

## Dauerhafte spätere Themen

- [ ] Config-Zentralisierung als eigener späterer Step: zentraler Modul-Config-Helper/Config-Service mit DB-Settings, JSON-Fallback, Code-Defaults, Kategorien, Labels, Tooltips, sensitive Werte und Dashboard-Payloads.
- [ ] Dashboard-Cleanup-/Refactor-Step planen: Dashboard vereinheitlichen, Modul-Logik aufräumen, UI/Config/Texte/Logs konsistent machen.
- [ ] Security-/Userverwaltungs-Step planen und umsetzen: Twitch-Login, Rollen/Rechte, Boss-Mod/Spezialrollen, serverseitige API-Absicherung, Dashboard-Zugriff für externe Mods, Audit-Logging und sichere Remote-Erreichbarkeit trotz variabler IP.

## Nicht tun ohne explizite Freigabe

- Alerts produktiv auf Twitch-Events/Bus umschalten.
- Produktive DB ersetzen, löschen, droppen oder überschreiben.
- Raffle als neues Parallelmodul bauen.
- Bestehende Giveaway-/Wheel-/Gamble-Logik umbauen.
- HypeTrain-Direkt-Discord als Standard aktivieren.
- HypeTrain-Rekord-Sound ohne Media-/Sound-Test aktivieren.
- Funktionalität entfernen.

---

## Historie / ältere erledigte HypeTrain-Punkte

- [x] Neues Backend-Fachmodul `hypetrain` geplant.
- [x] DB-Config fuer HypeTrain ueber vorhandenen `helper_settings` vorbereitet.
- [x] Textvarianten fuer HypeTrain ueber vorhandenen `helper_texts` vorbereitet.
- [x] Tabellen fuer Runs, Contributions und Runtime-Events vorbereitet.
- [x] Discord-/Tagebuch-Vorschau ohne produktives Senden vorbereitet.
- [x] Top-Unterstuetzer/Namen standardmaessig deaktiviert.
- [x] HT2.1 Backend-Modul installiert und Statusroute bestätigt.
- [x] DB-Schema, Settings-Tabelle und Textvarianten-Modul bestätigt.
- [x] Preview-Routen bestätigt.
- [x] Synthetischer DB-Test bestätigt.
- [x] Preview-Zeilenumbruch zwischen Beitragsübersicht und HypeTrain-Punkten korrigiert.
- [x] HypeTrain-Dashboard-Tabs vorbereitet: Übersicht, Config, Texte, Statistik, Tests.
- [x] HypeTrain-End-Actions vorbereitet: Tagebuch, Direkt-Discord, Rekord-Sound.
- [x] Live-Readiness-Prüfung vorbereitet.
- [x] Sichere Aktivierungsprofile vorbereitet.
- [x] HT2.7 Klartext zwischen Tagebuch/Discord und Direkt-Discord umgesetzt.
