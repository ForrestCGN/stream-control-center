# NEXT STEPS – VIP30 / 30TageVIP

Stand: 2026-06-06 09:05 UTC

## Direkt als Nächstes

STEP8.8 Dashboard-ZIP übernehmen und testen:

```powershell
cd /d D:\Git\stream-control-center
node --check htdocs\dashboard\app.js
node --check htdocs\dashboard\modules\vip30.js
.\stepdone.cmd "VIP30-STEP8.8 Dashboard Readonly"
```

Danach Live-System aktualisieren/Node neu starten und im Browser prüfen:

```txt
/dashboard
Community -> 30 Tage VIP
```

## Prüfpunkte

- [ ] „30 Tage VIP“ erscheint im Community-Bereich.
- [ ] Bestehendes „VIP-System“ bleibt unverändert.
- [ ] Übersicht lädt ohne Fehler.
- [ ] Slots werden angezeigt.
- [ ] Logs werden angezeigt.
- [ ] Diagnose-Tab zeigt Statusdaten.
- [ ] Keine produktiven Aktionsbuttons vorhanden.

## Danach

STEP8.9 planen:

```txt
VIP30 Alert bei erfolgreicher VIP30-Vergabe
```

Vor Umsetzung klären:

- bestehendes Alert-System oder eigenes VIP30-Overlay
- Trigger nur bei erfolgreichem Stage-B-Success
- keine Alerts bei `external_removed`, Cleanup, Blockern oder Refund
- Textvarianten im CGN-/Altersheim-/Rentner-Stil
- Dashboardfähigkeit der Alert-Konfiguration
- Diagnose-/Registry-Pflicht prüfen
