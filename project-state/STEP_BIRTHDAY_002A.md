# STEP_BIRTHDAY_002A – Birthday Alter und Textvarianten

Stand: 2026-05-22

## Ziel

Birthday-002 bleibt erhalten und wurde erweitert:

- Jahr kann weiterhin optional per `!birthday set TT.MM.JJJJ` gespeichert werden.
- Wenn ein Jahr gespeichert ist, werden `{age}` und `{ageText}` in Texten verfügbar.
- Automatische Chat-Gratulation nutzt eigene Textkeys mit Alter.
- Tagebuch-Eintrag nutzt eigene Textkeys mit Alter.
- Mehrere Default-Varianten im Heimaufsicht-/Rentner-Stil wurden ergänzt.
- Texte bleiben über das bestehende `module_text_variants`-System dashboardfähig.

## Betroffene Datei

- `backend/modules/birthday.js`

## Neue/erweiterte Textkeys

- `register_success_with_year`
- `register_updated_with_year`
- `show_own_birthday_with_year`
- `birthday_greeting_chat_with_age`
- `birthday_diary_entry_with_age`

## Platzhalter

- `{displayName}`
- `{login}`
- `{username}`
- `{birthdayDate}`
- `{day}`
- `{month}`
- `{year}`
- `{age}`
- `{ageText}`
- `{localDate}`

## Verhalten

Ohne Jahr:

```text
!birthday set 22.05
```

- Geburtstag wird ohne Alter gespeichert.
- Automatische Gratulation nutzt `birthday_greeting_chat`.

Mit Jahr:

```text
!birthday set 22.05.1980
```

- Geburtstag wird inklusive Jahr gespeichert.
- Am Geburtstag wird das Alter berechnet.
- Automatische Gratulation nutzt `birthday_greeting_chat_with_age`.
- Tagebuch nutzt `birthday_diary_entry_with_age`.

## Bewusst nicht geändert

- Keine Dashboard-Dateien.
- Kein Overlay.
- Kein Sound.
- Keine Video-/Party-Show.
- Keine Änderung am Command-System.
- Keine bestehende Funktionalität entfernt.

## Tests

```powershell
node --check backend\modules\birthday.js
```

API nach Deploy/Restart:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/birthday/status"
Invoke-RestMethod "http://127.0.0.1:8080/api/commands/execute" -Method POST -ContentType "application/json" -Body '{"message":"!birthday set 22.05.1980","userLogin":"testuser","displayName":"TestUser"}'
Invoke-RestMethod "http://127.0.0.1:8080/api/commands/execute" -Method POST -ContentType "application/json" -Body '{"message":"!birthday show","userLogin":"testuser","displayName":"TestUser"}'
```

## Nächster sinnvoller Schritt

`STEP_BIRTHDAY_003`:

- Dashboard-Seite für Birthday.
- Userliste.
- Settings bearbeiten.
- Textvarianten/Kategorien bearbeiten.
- Später manuelle Show: `!birthday party username`.
