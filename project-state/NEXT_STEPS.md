# NEXT_STEPS – EVS-7c

Stand: EVS-7c / Event Overview + Editor Modal Flow Cleanup

## Nach Entpacken

```powershell
node -c .ackend\modules\stream_events.js
node -c .\htdocs\dashboard\modules\stream_events.js
.\stepdone.cmd "EVS-7c Event Overview Editor Flow"
```

Erst danach Dashboard testen.

## Dashboard-Test

- Tab Übersicht prüfen: nur laufende Events / leere Meldung.
- Tab Events prüfen: alle konfigurierten Events mit Status.
- Event auswählen.
- Bearbeiten öffnet Modal.
- Neues Event öffnet Modal.
- Texte-Tab prüfen.
- Config-Tab Platzhalter prüfen.
- Statistik/Overlay Platzhalter prüfen.

## Danach

- Config-Tab planen und ausbauen.
- Event-Statistik pro Event planen.
- Runtime für Sound/Text vorbereiten.
