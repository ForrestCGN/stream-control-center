# NEXT_STEPS

## Direkt nächster Schritt

CAN-42.12b anwenden und testen:

```powershell
.\stepdone.cmd "CAN-42.12b Dashboard Hug diagnostics display fix"
node -c htdocs\dashboard\modules\diagnostics_hug_display_fix.js
```

Danach im Browser/Dashboard:

```text
1. Dashboard hart neu laden, notfalls STRG+F5.
2. Admin > Diagnose öffnen.
3. Hug-System auswählen.
4. Status aktualisieren klicken.
```

Erwartung:

```text
Version = 0.1.1
Routen = 1 oder echte Routenzahl
Config-Quelle = database
Textsystem = database
Letzter Fehler = -
```

## Danach

Nächstes Modul auf diagnostics-Standard prüfen/angleichen. Sinnvolle Kandidaten:

```text
Message-Rotator
VIP-System / VIP-Sound
Media / Sound-System Detailstatus
```

## Weiterhin nicht ohne separaten Go-Schritt

```text
Keine produktiven Aktionen auslösen
Keine Backend-Routen entfernen
Keine DB-Migration erzwingen
Keine Dashboard-Testbuttons für produktive Aktionen ergänzen
Keine Funktionalität entfernen
```
