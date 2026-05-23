# CHANGELOG

## STEP276B_ALERT_RULE_MEDIA_COLUMNS

- Alert-System Schema-Version auf 6 erhöht.
- `alert_rules.sound_media_id` und `alert_rules.image_media_id` als optionale Media-Registry-Referenzen ergänzt.
- `saveRule()` speichert neue Media-ID-Felder zusätzlich zu bestehenden Legacy-Asset-IDs.
- Keine bestehende Alert-Asset-/Legacy-Funktionalität entfernt.

## STEP275B_FIX1_MEDIA_UPLOAD_FIELD_ORDER

- MediaPicker sendet Upload-Metadaten (`type`, `moduleKey`, `categoryKey`) vor der Datei.
- Zusätzlich Query-Fallback für `/api/media/upload` ergänzt.
- Behebt Fälle, in denen Dateien physisch unter `assets/media/general/general` landeten, obwohl die Registry `birthday/user-songs` zeigte.

## STEP275B_BIRTHDAY_MEDIAID_NO_DUPLICATE_COPY

- Birthday MediaPicker-Import speichert neue Medien als `mediaid:<id>` statt Kopien unter `assets/sounds/birthday` zu erzeugen.
- Birthday-Sound-Bundles übergeben bei `mediaid:<id>` direkt `mediaId` an das Sound-System.
- Legacy-Dateien unter `assets/sounds/birthday` bleiben kompatibel.

## STEP275A_SOUND_SYSTEM_MEDIAID_DIRECT

- Sound-System kann Media-Registry-Assets direkt per `mediaId` / `media_id` abspielen.
- `/api/media/resolve?useCase=sound_system` markiert `assets/media/...`-Assets als kompatibel, wenn direkte mediaId-Wiedergabe möglich ist.
- Keine Entfernung bestehender `assets/sounds/...`-Kompatibilität.

## STEP274Z_FIX1_REMOVE_FILTER_HINT

- MediaPicker-Hinweis `Filter, nicht Upload-Ziel` aus dem sichtbaren Zusatzkategorie-Label entfernt.
- Verhalten bleibt unverändert: sichtbarer Filter startet auf `Alle Zusatzkategorien`, Upload-Ziel bleibt separat pro Button gesetzt.

## STEP276B_FIX1_ALERT_RULE_MEDIA_COLUMNS_ENSURE

- Alert-System stellt die neuen `alert_rules.sound_media_id` und `alert_rules.image_media_id` Spalten beim Modulstart zusätzlich idempotent sicher.
- Behebt Live-DB-Stände, bei denen `schemaVersion` bereits 6 war, die Spalten aber in `/api/alerts/rules` noch nicht sichtbar waren.
- Keine bestehende Alert-Regel-, Asset-, Upload-, Dashboard- oder Playback-Logik entfernt.
