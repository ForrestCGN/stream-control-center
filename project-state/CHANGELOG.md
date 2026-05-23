# CHANGELOG

## STEP276I
- Dokumentations- und Status-Sync für den abgeschlossenen Alert-MediaId-Block.
- Keine Code-Änderungen.
- Aktuellen Stand von STEP276B bis STEP276H_FIX3 zusammengefasst.
- Offene Redesign-Punkte für das Alert-Dashboard dokumentiert.

## STEP276H_FIX3
- Grafik-Fallback-Kachel im Dashboard optisch vereinfacht.
- Fallback-Auswahl als normale Kachel dargestellt.
- Keine Logikänderung.

## STEP276H_FIX2
- Doppelte Beschriftung bei „Alte Grafik / Fallback“ entfernt.
- Keine Logikänderung.

## STEP276H_FIX1
- Unnötige Erklärungstexte aus Grafik-Fallback-Boxen entfernt.
- Keine Logikänderung.

## STEP276H
- `image_media_id` für Alert-Regeln nutzbar gemacht.
- Regel-Grafik aus Media-Registry im Dashboard ergänzt.
- Backend-Payload bevorzugt Media-Registry-Bild/Grafik, wenn `image_media_id` gesetzt ist.
- Legacy `image_asset_id` / `image_url` bleibt Fallback.

## STEP276G
- Design-Grafik „Grafik über dem Alert“ kann aus der Media-Registry gewählt werden.
- Alte Design-Grafik bleibt Fallback.

## STEP276F
- Alert-Regeln-API reichert Media-Registry-Sounddetails an.
- Dashboard zeigt echte Media-Registry-Dauer statt Legacy-Dauer.
- Beispiel: MediaId 1333 zeigt ca. 24.3s statt altem falschen 11.2s-Wert.

## STEP276E / Fixes
- Legacy-Sound/Fallback im Dashboard umbenannt und einklappbar/kompakter gemacht.
- UI-Feinschliff bleibt für späteres Dashboard-Redesign offen.

## STEP276D / FIX1
- Dashboard-Regel-Editor um Sound-MediaPicker ergänzt.
- `sound_media_id` kann ausgewählt/gespeichert werden.
- Layout-Fix für Sound-Auswahl.

## STEP276C / FIX1
- Alert-Playback bevorzugt `sound_media_id`.
- Legacy `sound_url` bleibt Fallback.
- Fix: Main-Sound-Item wird wieder korrekt zurückgegeben; TTS läuft danach im Bundle.

## STEP276B / FIX1
- `sound_media_id` und `image_media_id` in `alert_rules` vorbereitet.
- Spalten werden idempotent sichergestellt.
- Rules-API gibt neue Felder aus.
