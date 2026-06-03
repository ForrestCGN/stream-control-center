# NEXT_STEPS

## Direkt nächster Schritt

```text
CAN-42.1b anwenden und Sichttest machen.
```

## Prüfung

```text
Dashboard > Admin > Diagnose > Modul auswählen
```

Erwartung:

```text
Routenanzahl oben sichtbar
keine sichtbare Routenliste unten
Rohdaten einklappbar weiterhin vorhanden
Statuswerte weiterhin sichtbar
keine API-POSTs
keine produktive Aktion
```

## Danach

```text
CAN-42.2 - Modul-Diagnose-/Hinweis-Inventar erstellen
```

Ziel:

```text
Welche Diagnose-/Hinweisdateien liegen aktuell noch direkt in Modul-Seiten?
Welche davon sind nur Frontend-Erweiterungen?
Welche können später aus index/app entfernt werden?
Welche Statuswerte sollen in Admin > Diagnose nachgebildet werden?
```

## Weiterhin nicht machen ohne separaten Go-Schritt

```text
Keine produktiven Aktionen auslösen.
Keine Backend-Routen entfernen.
Keine DB-Migration.
Keine Dashboard-Testbuttons für produktive Aktionen.
Keine Funktionalität entfernen.
```
