# LWG Evening Tests – Giveaway/Glücksrad

## Zweck
Diese Scripts testen das bestehende Loyalty-Giveaway-/Glücksrad-System vor dem Stream.
Sie ändern nur dann etwas, wenn im Script ausdrücklich bestätigt wird.
Lange API-Antworten werden in `.log` Dateien im aktuellen Ordner geschrieben.

## Scripts

### tools/lwg_evening_giveaway_wheel_test.ps1
Interaktiver Haupttest:
- Dashboard optional öffnen
- Glücksrad-Overlay optional öffnen
- Status prüfen
- Giveaway auswählen
- Bound-Wheel/Felder prüfen
- optional Test-Entries hinzufügen
- optional Gewinn-Ausschluss anwenden
- optional öffnen/schließen/ziehen
- Wheel-Permissions prüfen

Start:
```powershell
powershell -ExecutionPolicy Bypass -File .\tools\lwg_evening_giveaway_wheel_test.ps1
```

Mit Ausschlussliste:
```powershell
powershell -ExecutionPolicy Bypass -File .\tools\lwg_evening_giveaway_wheel_test.ps1 -ExclusionList ".\lwg_excluded_winners_resolved_YYYYMMDD_HHMMSS.json"
```

### tools/lwg_copy_giveaway_wheel_check.ps1
Testet die vorhandene Backend-Route `POST /api/loyalty/giveaways/:giveawayUid/copy` und prüft, ob bei Wheel-Giveaways ein eigenes gebundenes Wheel mit Feldern entsteht.

Start:
```powershell
powershell -ExecutionPolicy Bypass -File .\tools\lwg_copy_giveaway_wheel_check.ps1
```

## TODO für sauberen späteren Ausbau
- Gewinn-Ausschlussliste direkt im Giveaway-Dashboard integrieren.
- Ausschlüsse bevorzugt mit stabiler Twitch User-ID speichern.
- Beim Draw direkt gegen User-ID und Login filtern.
- Giveaway-Kopieren im Dashboard final prüfen/verbessern: ein vorhandenes bound Wheel muss als neues bound Wheel für die Kopie entstehen, nicht wiederverwendet werden.
