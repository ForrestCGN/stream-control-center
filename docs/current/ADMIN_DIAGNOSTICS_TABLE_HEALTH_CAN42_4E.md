# Admin-Diagnose Tabellenstatus

## Stand

```text
CAN-42.4e
```

## Ziel

Die Modulübersicht-Tabelle in `Admin > Diagnose` nutzt dieselbe Health-/Ampellogik wie die obere Ampelübersicht.

## Änderung

Vorher:

```text
Tabelle nutzte nur Status erreichbar ja/nein.
VIP-System wurde in der Tabelle als Fehler angezeigt.
```

Nachher:

```text
Tabelle nutzt computeModuleHealth().
VIP-System mit fehlender Statusroute wird als Unbekannt angezeigt.
Todo bleibt OK, wenn die Todo-Prüfung OK ist.
```

## Keine produktiven Aktionen

```text
keine Backend-Änderung
keine API-POSTs
keine DB-Migration
keine Funktionalität entfernt
```
