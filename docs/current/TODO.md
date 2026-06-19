# TODO – Loyalty-Giveaways / Glücksrad

Stand: 2026-06-19

## Sofort / nächster Chat

- [ ] `LWG_WHEEL_OVERLAY_RUNTIME_1` einspielen/StepDone bestätigen, falls noch nicht erledigt.
- [ ] Wheel-Overlay-Quelle refreshen.
- [ ] Prüfen, ob Wheel-Overlay initial unsichtbar ist.
- [ ] Direkten Spin-Test mit Giveaway-Bound-Wheel-Feldern ausführen.
- [ ] Prüfen, ob Overlay über Bus/WS einblendet.
- [ ] Prüfen, ob Overlay nach Ergebnis automatisch ausblendet.
- [ ] Prüfen, ob `loyalty.wheel.reset` sauber ausblendet.
- [ ] Textlayout bei langen Feldern bewerten.
- [ ] Falls nötig: Segmenttext vertikal/zweizeilig neu bauen.

## Giveaway Copy / Bound-Wheel

- [x] Kopieren-Button bei Drafts wieder sichtbar machen.
- [x] Bound-Wheel beim Kopieren auf Kopie übertragen.
- [x] Felder beim Kopieren übernehmen.
- [x] Kopierte Testinstanz auf Startbereitschaft prüfen.
- [ ] Backend-seitigen Copy-Fix langfristig prüfen/ggf. aus Dashboard-Fallback in Backend verschieben, damit Copy-Route immer vollständig ist.

## Backend-Flow

- [x] Open testen.
- [x] Test-Entries anlegen.
- [x] Close testen.
- [x] Draw testen.
- [x] Wheel-Permission-Erzeugung testen.
- [x] Wheel-Claim testen.
- [x] Winner-Status `wheel_completed` testen.
- [x] Ergebnisfeld am Winner speichern.
- [x] Bound-Wheel-Feld `quantityRemaining` reduzieren.

## Ausschlussliste / Exclusions

- [ ] Dashboard-Config für Gewinn-Ausschlussliste planen.
- [ ] Globale Ausschlussliste unter Loyalty/Giveaways oder Loyalty/Core einordnen.
- [ ] Pro-Giveaway zusätzliche Ausschlüsse ermöglichen.
- [ ] Twitch User-ID speichern, Login/DisplayName als Anzeige/Fallback.
- [ ] Draw-Filter um Exclusions erweitern.
- [ ] Dashboard-Anzeige: ausgeschlossene User bleiben sichtbar, aber nicht gewinnberechtigt.
- [ ] Script-Workaround durch UI/Backend-Funktion ersetzen.

## Overlay / Runtime State

- [ ] Einheitliche Overlay-State-Regel dokumentieren: Overlays sollen nicht dauerhaft sichtbar bleiben, außer bewusst gewollt.
- [ ] Wheel-Overlay per Bus wie Shot-Overlay steuern.
- [ ] Bei Node-Neustart letzten gewünschten Overlay-Zustand prüfen.
- [ ] `event_winner_overlay.html` separat prüfen, warum es unerwartet sichtbar war.

## Aufräumen

- [ ] Test-Giveaway `giveaway_1781856708568_9653eba68a211017` nach Abschluss löschen oder eindeutig als Test markieren.
- [ ] Test-Entries/Winner nicht produktiv verwenden.
- [ ] Dokumentation nach finalem Overlay-Test erneut aktualisieren.
