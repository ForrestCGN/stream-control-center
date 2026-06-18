# TODO – stream-control-center

Stand: 2026-06-18 – EVS52.9 Doku/Handoff

## Bestätigt / erledigt

- [x] Punkte-Historie im aktuellen Event.
- [x] Sound- und Satz-/Text-Punkte werden gemeinsam addiert und getrennt angezeigt.
- [x] Punkte-Check Sound + Satz bestanden.
- [x] Satz-Testbereich Backend/Dashboard funktioniert.
- [x] Falsche Antwort gibt keine Punkte.
- [x] Worttreffer können erkannt werden.
- [x] Wortpunkte bleiben optional; bei `wordPointsEnabled=false` keine Wortpunkte.
- [x] Satzlösung gibt Satzpunkte.
- [x] Duplicate gibt keine Punkte.
- [x] Kombi-Abschluss Text+Sound im Test bestätigt.
- [x] Sound-Automatik plant beim Eventstart den ersten Schnipsel.
- [x] Dauerhaftes Satzstatus-Overlay versteckt; Feature vorbereitet gelassen.
- [x] Satzlösungs-Celebration-Overlay vorbereitet.
- [x] Satz-Spiel-Textvarianten/Fallbacks vorbereitet.
- [x] Diagnoseauswertung EVS52.9 dokumentiert.

## Kritisch offen

- [ ] Echte produktive Chatquelle finden, über die Sound-Antworten wirklich laufen.
- [ ] Sound- und Satz-System an dieselbe zentrale normalisierte Chatmessage hängen.
- [ ] Dedupe sicherstellen: eine Twitch-Nachricht darf nicht doppelt verarbeitet werden.
- [ ] EVS52.6 Direct-Bridge prüfen und entfernen/deaktivieren, wenn nicht gebraucht.
- [ ] EVS52.7 Presence-Direct-Bridge prüfen und entfernen/deaktivieren, wenn nicht gebraucht.
- [ ] EVS52.8 Wildcard-Bus-Fallback prüfen und entfernen/deaktivieren, wenn nicht gebraucht.
- [ ] Nach Fix zwingend Sound-Spiel live testen.
- [ ] Nach Fix zwingend Satz-Spiel live testen.
- [ ] Nach Fix Punkte/Ranking/User-Historie prüfen.

## EVS52.9 nächster Schritt

- [ ] Vor Codeänderung echte Dateien prüfen:
  - `backend/modules/stream_events.js`
  - `backend/modules/twitch_events.js`
  - `backend/modules/twitch_presence.js`
  - `backend/modules/communication_bus.js`
  - `backend/modules/helpers/helper_communication.js`
- [ ] Im Code suchen:
  - `twitch.chat.message`
  - `handleIrcEvent`
  - `emitTwitchChatEvent`
  - `processParallelChatMessage`
  - `processSoundChatMessage`
  - `sound.solved`, `answer_checked`, Sound-Antwortfunktionen
  - `bus.subscribe` / `communicationBus.subscribe`
- [ ] Plan schreiben und auf Forrests `go` warten.

## Später / nach Chat-Fix

- [ ] Dashboard-Textvarianten für Satz-Spiel prüfen/bearbeiten.
- [ ] Satzlösungs-Overlay visuell finalisieren.
- [ ] Optional Overlay-Dauer dashboardfähig machen.
- [ ] Optional Satzstatus kurzzeitig nach Lösung/auf Button anzeigen, nicht dauerhaft.
- [ ] Doku Altlasten bereinigen, sobald echte Chatarchitektur stabil ist.

## Dauerhafte Regeln

- [ ] Nicht raten.
- [ ] Fehlende Dateien exakt anfordern.
- [ ] Keine Apply-/Patch-Scripte.
- [ ] Keine halben Teil-Dateien.
- [ ] Keine produktive DB ersetzen.
- [ ] ZIPs mit echten Zielpfaden ab Repo-Root.
- [ ] StepDone nach Einspielen, danach erst testen.
- [ ] Keine Funktionalität entfernen; ersetzte Diagnose-/Fallback-Altlasten nach Freigabe aber gezielt bereinigen.


## EVS52.9 erledigt / jetzt testen

- [x] Echte produktive Chatquelle als Zielpfad festgelegt: `twitch_presence → twitch_events → communication_bus → stream_events`.
- [x] Sound- und Satz-System haengen wieder an einer zentralen normalisierten Chatmessage.
- [x] EVS52.6 Direct-Bridge aus `stream_events` entfernt.
- [x] EVS52.7 Presence-Direct-Bridge aus `twitch_presence` entfernt.
- [x] EVS52.8 Wildcard-Bus-Fallback aus `stream_events` entfernt.
- [ ] Nach Einspielen StepDone ausfuehren.
- [ ] Danach Backend neu starten.
- [ ] Danach `/api/stream-events/status` pruefen: `runtime.chatSource.subscribed=True`.
- [ ] Danach Live-Test Sound + Satz durchfuehren.
- [ ] Danach Punkte/Ranking/User-Historie pruefen.

## EVS52.10 Hotfix offen zu testen

- [ ] Nach Deploy prüfen: maximal ein aktives Event.
- [ ] `runtime.activeEventGuard` im Stream-Events-Status prüfen.
- [ ] `twitch_presence.autostart` prüfen: connected/authenticated/joined müssen true werden.
- [ ] Live-Chat prüfen: `twitch_presence.chatBus.emitCount` steigt.
- [ ] Bus prüfen: `stream_events.runtime.chatSource.delivered` steigt.
- [ ] Soundantwort live testen.
- [ ] Satz-Teilwort live testen.
- [ ] Satzlösung live testen.
- [ ] Wartezeit überspringen mit genau einem aktiven Event testen.
