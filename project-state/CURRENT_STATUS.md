# CURRENT_STATUS – Birthday-System

Aktueller Stand: `STEP_BIRTHDAY_005`.

## Bestätigt bis STEP_BIRTHDAY_004D

- Backend lädt sauber.
- Birthday-Status funktioniert.
- Intro-Video, Standardsong und User-Songs werden mit ffprobe-Dauer erkannt.
- Sound-System kann die Dateien abspielen.
- Loudness-Status wird angezeigt, wenn Pegel-Scan vorhanden ist.
- User-Songs können unabhängig von registrierten Geburtstagen gespeichert werden.

## Neu in STEP_BIRTHDAY_005

- Party-Presets über `birthday_parties`.
- Standard-Party als Fallback.
- User-Zuordnung über `birthday_show_profiles.party_key`.
- Overlay-Styles: Classic, CGN Neon, Epic, Heimaufsicht, Cute Soft.
- Overlay zeigt Herzen, Konfetti, Ballons, Glitzer und Szenenwechsel während der Partyphase.

## Regel

Wenn ein User eine aktive Party-Zuordnung hat, nutzt die Show diese Party.
Wenn nicht, nutzt die Show Standard-Party und Standardsong.

Automatische Geburtstagsgrüße bleiben klein und starten keine Show.
