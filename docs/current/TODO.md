# TODO – Loyalty-Giveaways / CGN-Glücksrad

Stand: 2026-06-19

## Bestätigt / erledigt

- [x] `LWG_WHEEL_OVERLAY_RUNTIME_1` getestet.
- [x] Wheel-Overlay-Quelle refresh/getestet.
- [x] Wheel-Overlay initial unsichtbar.
- [x] Direkter Spin-Test mit Giveaway-Bound-Wheel-Feldern ausgeführt.
- [x] Overlay blendet bei Spin ein.
- [x] Overlay blendet nach Ergebnis automatisch aus.
- [x] Winner-/Finale-Overlay bleibt beim Wheel-Spin aus.
- [x] Segmenttexte radial mit Segmentrichtung umgesetzt.
- [x] Lange Titel akzeptabel dargestellt.
- [x] `€` korrekt dargestellt.
- [x] Statuspanel links entfernt.
- [x] Gewinnerbanner ohne Subtext.
- [x] Gewinnerbanner für lange Namen kleiner.
- [x] `loyalty_giveaways` Status grün.
- [x] `loyalty_games` Status grün.
- [x] Bound-Wheel-Felder geprüft: 8 Felder vorhanden, Bound-Wheel aktiv.
- [x] Regression-Spin mit echten Bound-Wheel-Feldern: Ergebnis `Valheim`.

## Sofort / nächster technischer Schritt

- [ ] Backend/Wheel-Feldanzahl für Giveaway-bound Wheels korrigieren:
  - Bound-Wheel soll exakt verfügbare Gewinne anzeigen.
  - Kein optisches Auffüllen auf 12 Felder bei Giveaway-bound Wheels.
  - Aktuelle Beobachtung: Bound-Wheel liefert 8 Felder, davon 7 verfügbar; Spin-Metadata zeigte `fieldsCount=7`, aber `visualFieldsCount=12`.
- [ ] Single-Remaining-Gewinn-Regel umsetzen:
  - 2+ verfügbare Gewinne → normaler Spin mit exakt diesen Feldern.
  - 1 verfügbarer Gewinn → kein normaler Spin, letzten Gewinn direkt vergeben oder separates "Letzter Gewinn"-Overlay anzeigen.
  - 0 verfügbare Gewinne → Claim/Spin blockieren.
- [ ] `minVisibleSlots`/Default 12 prüfen:
  - In der hochgeladenen `loyalty_games.json` steht kein `minVisibleSlots`.
  - Der Wert kommt vermutlich aus Backend-Default/Fallback.
  - Für Giveaway-bound Wheels muss diese Auffülllogik ignoriert oder begrenzt werden.

## Overlay / Runtime State

- [x] Wheel-Overlay initial unsichtbar.
- [x] Show bei `loyalty.wheel.spin`.
- [x] Auto-Hide nach Ergebnis.
- [x] Winner-/Finale-Overlay isoliert und bleibt beim Wheel aus.
- [ ] Direkten Reset-/Hide-Test sauber möglich machen:
  - Route `/api/communication-bus/publish` existiert nicht.
  - Entweder vorhandene echte Bus-Test-/Diagnose-Route dokumentieren oder eine geschützte Dashboard-/Diagnose-Testfunktion ergänzen.
- [ ] Einheitliche Overlay-State-Regel dokumentieren: Overlays sollen nicht dauerhaft sichtbar bleiben, außer bewusst gewollt.
- [ ] Bei Node-Neustart letzten gewünschten Overlay-Zustand prüfen.

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

## Weitere Auffälligkeiten

- [ ] `!gamble` Alias-Bug separat prüfen: Status zeigt `aliases: ["[object", "object]"]`.
- [ ] Test-Giveaway `giveaway_1781856708568_9653eba68a211017` nach Abschluss löschen oder eindeutig als Test markieren.
- [ ] Test-Entries/Winner nicht produktiv verwenden.
