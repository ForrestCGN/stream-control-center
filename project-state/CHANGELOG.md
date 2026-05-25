# CHANGELOG

## STEP447 – VIP Bus-First Cleanup & Konsolidierung

- `backend/modules/vip_sound_overlay.js` auf Version `1.8.29` angehoben.
- Feature auf `vip_bus_first_cleanup_consolidation` gesetzt.
- Keine neue Test-Route hinzugefügt.
- Bestehenden Bus-First-Admin-Testpfad nicht entfernt.
- Status-/Guard-Ausgabe um konsolidierte Zusammenfassung ergänzt:
  - `cleanupConsolidated`
  - `cleanupProfile`
  - `diagnosticProfile`
  - `cleanupStep`
  - `consolidatedBusFirstStatus`
- `productiveSwitchConfigReadable` auf Setting-Lesbarkeit korrigiert.
- `productiveSwitchConfigFileReadable` zusätzlich getrennt ausgewiesen, damit DB-/Setting-Lesbarkeit nicht mit optionaler Config-Datei verwechselt wird.
- Productive-Switch bleibt sicherheitsgesperrt:
  - `productiveSwitchEffectiveEnabled: false`
  - `productiveSwitchSafetyLocked: true`
  - `productiveEntryPointChanged: false`
- `backend/modules/sound_system.js` bleibt bei Version `0.1.19` unverändert enthalten.
- Keine DB-Migration.
- Kein Dashboard-Umbau.
- Kein normaler Twitch-Command-Umbau.
