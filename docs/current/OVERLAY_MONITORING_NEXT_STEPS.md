# Overlay-Monitoring – nächste Schritte

## Direkt offen

1. Reparaturbuttons in der Praxis weiter testen
   - `↻` Browserquelle neu laden
   - `🧹` Browsercache neu laden
   - `👁️/🙈` Ein-/Ausblenden
   - `⚡` Kurz aus/an

2. Prüfen, ob alle tatsächlich genutzten CGN-Overlays im OBS-Inventar Heartbeats senden.

3. Falls ein CGN-Overlay in aktiver Szene ohne Bus/Heartbeat auftaucht:
   - prüfen, ob OBS eine Legacy-Datei nutzt
   - Legacy-Datei anbinden oder OBS später gezielt auf neue Datei umstellen

## Danach sinnvoll

### Optional: Reparaturaktionen auditieren

Die manuellen Reparaturaktionen könnten später in das Audit-/Monitoring-System aufgenommen werden:

- wer hat gedrückt
- wann
- welche Quelle
- welche Aktion
- Ergebnis OK/Fehler

Aktuell wurde kein zusätzlicher Audit-Step umgesetzt.

### Optional: Overlay-Designs nachziehen

Rahmen wurde bereits auf neuen Stil angepasst. Weitere Kandidaten:

- Pause Overlay
- Ende Overlay
- Start Overlay Altbestände
- Birthday Overlay
- Firework Overlay
- Mega-Shoutout Overlay

### Optional: Dashboard-Design später vereinheitlichen

Die Icon-Buttons sind bewusst kompakt gehalten und eignen sich später gut für ein Dashboard-Redesign.

## Nicht vergessen

Bei jedem weiteren STEP:

```powershell
cd D:\Git\stream-control-center
node --check backend\modules\overlay_monitor.js
node --check htdocs\dashboard\modules\overlays.js
.\stepdone.cmd "PASSENDE COMMIT MESSAGE"
```

Backend nur neu starten, wenn Backend-Dateien geändert wurden.
