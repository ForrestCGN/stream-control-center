# NEXT_STEPS – Loyalty Giveaways / Glücksrad

## Nächster Schritt

### LWG-4M.5 live testen

Vorher:

```powershell
node -c .\backend\modules\loyalty_giveaways.js
.\stepdone.cmd "STEP LWG-4M.5 Bound Wheel aktivieren und beim Claim/Spin verwenden"
```

Testfolge:
1. Wheel-Giveaway mit aktivem globalem Preset erstellen.
2. Bound-Wheel abrufen:
   - `GET /api/loyalty/giveaways/:giveawayUid/wheel/bound`
   - erwartet im Draft: `status=draft`.
3. Giveaway öffnen.
4. Bound-Wheel erneut abrufen:
   - erwartet: `status=active`, `locked=true`.
5. Ticket eintragen.
6. Close ausführen.
7. Draw ausführen.
8. Wheel-Permission prüfen.
9. Claim ausführen.
10. Prüfen, dass Spin mit Bound-Wheel-Kontext protokolliert wurde.

## Danach

### LWG-4M.6
Dashboard UI für Giveaway-Wheel-Dropdown.

### LWG-4M.7
Entscheidung/Umsetzung für echten Bound-Wheel-Field-Snapshot, damit globale Preset-Änderungen laufende Giveaway-Wheels nicht mehr beeinflussen.
