# NEXT_STEPS

## Direkt nächster Schritt

```text
CAN-42.3 anwenden.
```

## Danach empfohlen

```text
CAN-42.4 - Todo-Modul-Diagnose aus Modul-Seite entfernen und zentral prüfen
```

Warum Todo zuerst:

```text
kleines Modul
bereits Statuswerte in Admin > Diagnose sichtbar
guter Test für die neue Zentralisierungsregel
geringes Risiko
```

## Geplanter Ablauf für CAN-42.4

```text
1. Prüfen, was todo_readonly_diagnostics.js/css genau macht.
2. Prüfen, ob Admin > Diagnose die wichtigen Todo-Werte abdeckt.
3. Falls ja: Einbindung aus index.html entfernen.
4. Dateien physisch nur entfernen, wenn sicher nicht mehr gebraucht.
5. Keine Backend-Routen entfernen.
6. Keine Todo-Funktionalität entfernen.
```

## Weitere Reihenfolge

```text
CAN-42.5 Tagebuch Diagnose aus Modul-Seite entfernen.
CAN-42.6 Commands Diagnose aus Modul-Seite entfernen.
CAN-42.7 Hug/Message-Rotator prüfen.
CAN-42.x Bus-Diagnose/Overlay-Monitor gesondert prüfen.
```

## Weiterhin nicht machen ohne separaten Go-Schritt

```text
Keine produktiven Aktionen auslösen.
Keine Backend-Routen entfernen.
Keine DB-Migration.
Keine Dashboard-Testbuttons für produktive Aktionen.
Keine Funktionalität entfernen.
```
