# NEXT_STEPS – stream-control-center

Stand: 2026-06-18 – EVS52.16

## Sofort nach Deploy testen

### EVS52.16 Dashboard-Auswertungsbutton

1. Backend/Dashboard-Version pruefen:

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/status"
$s | Select-Object moduleVersion,moduleBuild | Format-List
```

Erwartung Backend:

```text
moduleVersion : 0.5.87
moduleBuild   : STEP_EVS52_16_DASHBOARD_FINALE_BUTTON
```

2. Dashboard neu laden, Bereich `Event verwalten` oeffnen.
3. Bei laufendem Event darf `Auswertung starten` nicht sichtbar sein.
4. Bei beendetem Event ohne Ranking darf `Auswertung starten` nicht sichtbar sein.
5. Bei beendetem Event mit Ranking und ohne bestehendes Finale muss `Auswertung starten` sichtbar sein.
6. Klick auf `Auswertung starten` muss bestehende Finale-Route starten.
7. Nach gestarteter Auswertung darf der Button nicht weiter sichtbar bleiben.

## Danach sinnvoll

- `!event status` Chat-Command pruefen/fixen.
- Bot-/Ignore-Liste in Dashboard-Einstellungen verschieben.
- Textvarianten fuer Teiltreffer/Satzloesung dashboardfaehig bearbeiten/pruefen.
- Satzloesungs-Overlay optisch verbessern.
- Nach stabilem Teststand Doku/Handoff aktualisieren.

## Dauerhafte Regeln

- Nicht raten; echte Dateien pruefen.
- Fehlende Dateien exakt anfordern.
- Keine Apply-/Patch-Scripte.
- ZIPs mit echten Zielpfaden ab Repo-Root.
- StepDone nach Einspielen, danach testen.
- Keine produktive DB ersetzen oder blind migrieren.
