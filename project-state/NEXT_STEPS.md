# NEXT_STEPS

## Direkt nächster Schritt

```text
CAN-42.8 anwenden und prüfen.
```

## Prüfung

```text
GET http://127.0.0.1:8080/api/tagebuch/status
```

Erwartung:

```text
diagnostics.ok
diagnostics.health
diagnostics.counts.state
diagnostics.counts.runtimeEvents
diagnostics.counts.userStats
diagnostics.counts.dailyUserStats
diagnostics.counts.settings
diagnostics.counts.textVariants
diagnostics.counts.legacyTexts
diagnostics.state
diagnostics.webhook
```

## Danach

```text
CAN-42.9 - Admin-Diagnose liest Tagebuch diagnostics-Block bevorzugt
```

## Weiterhin nicht machen ohne separaten Go-Schritt

```text
Keine produktiven Aktionen auslösen.
Keine Backend-Routen entfernen.
Keine DB-Migration.
Keine Dashboard-Testbuttons für produktive Aktionen.
Keine Funktionalität entfernen.
```
