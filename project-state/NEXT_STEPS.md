# Next Steps

## Sofort

1. Prüfen, ob CAN-43.16 lokal entpackt ist.
2. Falls noch offen:

```powershell
.\stepdone.cmd "CAN-43.16 Diagnostics registry consolidation"
```

3. Committen/pushen.

## Danach

Zurück zum Feature-/Modulbau.

Der Nutzer möchte erstmal an anderen Modulen weiterbauen.

## Arbeitsmodus für neue Module

Bei neuem Modul oder größerer Änderung:

- echten Dateistand prüfen
- Ziel klären
- bestehende Helper nutzen
- keine Funktionalität entfernen
- Modul sauber dokumentieren
- Diagnose-/Registry-Standard direkt einbauen
- project-state aktualisieren
- bei Prüfungen Batch-Export nutzen

## Batch-Regel

Keine langen Einzel-Copy/Paste-Blöcke mehr für mehrere Module.

Stattdessen:

```text
Read-only Endpunkte -> Export-Ordner -> ZIP -> hochladen -> gesammelt auswerten
```
