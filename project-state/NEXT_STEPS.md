# NEXT_STEPS

## Direkt nächster Schritt

```text
CAN-42.6 anwenden und prüfen.
```

## Prüfung

```text
GET http://127.0.0.1:8080/api/todo/status
```

Erwartung:

```text
diagnostics.ok
diagnostics.health
diagnostics.counts.userStats
diagnostics.counts.dailyStats
diagnostics.counts.settings
diagnostics.counts.textVariants
diagnostics.counts.legacyTexts
```

## Danach

```text
CAN-42.7 - Admin-Diagnose liest Todo diagnostics-Block bevorzugt
```

## Weiterhin nicht machen ohne separaten Go-Schritt

```text
Keine produktiven Aktionen auslösen.
Keine Backend-Routen entfernen.
Keine DB-Migration.
Keine Dashboard-Testbuttons für produktive Aktionen.
Keine Funktionalität entfernen.
```
