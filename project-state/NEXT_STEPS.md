# NEXT_STEPS

## Direkt nächster Schritt

```text
CAN-42.9 anwenden und Sichttest machen.
```

## Prüfung

```text
Dashboard > Admin > Diagnose > Tagebuch
```

Erwartung:

```text
Tagebuch bleibt OK
State = 1
Runtime-Events gefüllt
User-Stats gefüllt
Daily-Stats gefüllt
Settings gefüllt
Textvarianten gefüllt
Legacy-Texte gefüllt
DB = sqlite oder ok
Webhook = ok
Rohdaten enthalten status.diagnostics
```

## Danach

```text
CAN-42.10 - Tagebuch-Diagnose-Extension aus Modul-Seite entfernen/deaktivieren
```

## Weiterhin nicht machen ohne separaten Go-Schritt

```text
Keine produktiven Aktionen auslösen.
Keine Backend-Routen entfernen.
Keine DB-Migration.
Keine Dashboard-Testbuttons für produktive Aktionen.
Keine Funktionalität entfernen.
```
