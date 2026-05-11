# NEXT STEP - Nach STEP248 DeathCounter Spieler-Detail Quick-Corrections

## Direkt testen

```text
Community → DeathCounter → Spieler
```

Prüfen:

```text
- Spieler per Details-Button auswählen
- Detailkarte zeigt Quick-Correction-Bereich
- +1 Tod zählt beim ausgewählten Spieler im aktuellen Spiel hoch
- -1 Tod fragt nach Bestätigung und zählt wieder runter
- Steuerung öffnen springt in den Steuerungs-Tab
```

## Nächster sinnvoller Bau-Step

```text
STEP249: DeathCounter DB-/Event-Historie planen und Migrationsstrategie vorbereiten
```

Noch nicht direkt blind bauen:

```text
- bestehende JSON-State-Datei ersetzen
- app.sqlite neu bauen oder überschreiben
- alte Count-Logik entfernen
```
