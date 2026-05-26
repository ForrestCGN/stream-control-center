# STEP_BIRTHDAY_004C – Birthday Show Asset-/Dauerstatus

## Ziel

Birthday-Show-Timing sichtbar und robuster machen.

## Änderungen

- Backend liefert neuen Asset-/Dauerstatus über `/api/birthday/admin/show/assets`.
- Backend liefert Recheck-Route `/api/birthday/admin/show/recheck`.
- `birthday.js` gibt für Intro-Video, Standardsong und User-Songs aus:
  - Datei vorhanden ja/nein
  - Größe
  - erkannte Laufzeit
  - Dauerquelle (`ffprobe`, `fallback`, `unknown`)
  - Audio/Video erkannt
  - Sound-System abspielbar ja/nein
  - SoundPegel/Loudness bekannt ja/nein, sofern `sound_loudness_files` existiert
- Dashboard-Tab `Party-Show` zeigt Medienstatus und Laufzeiten sichtbar an.
- Dashboard zeigt Warnung, wenn Fallback-Dauer genutzt wird.
- Timing-Prinzip dokumentiert: Intro-Dauer → Songstart/Partyphase → Songdauer → Overlay aus.

## Wichtig

Das Sound-System bekommt beim Start der Show explizite `durationMs`-Werte. Das Birthday-Overlay eskaliert weiterhin erst bei `phase=party`, also nach Intro-Dauer und nach Songstart.

## Nicht geändert

- Keine neue SoundPegel-Scan-Logik eingebaut.
- Keine Alert-Logik verändert.
- Keine bestehende Funktionalität entfernt.
