# Next Steps

Nach `0.2.20C`:

```text
0.2.21 - OBS Allowlist-/Rechte-Modell read-only vorbereiten
```

Ziel:

```text
- produktive Szenen ohne `_` bleiben sichtbare Basis
- schaltbare Szenen werden spaeter zusaetzlich per Allowlist freigegeben
- Rechte vorbereiten: obs.read, obs.scene.switch, obs.audio.mute, obs.source.visibility, obs.admin.diagnostics
- UI zeigt spaetere Bedienbarkeit nur als read-only Vorschau
- keine echten Buttons/Aktionen aktivieren
- keine OBS-Kommandos senden
```

Dabei beachten:

```text
Heartbeat klein lassen.
Live-State fuer schnelle kleine Daten nutzen.
Inventory langsam/groesser lassen.
Keine grossen Daten in den Heartbeat packen.
```
