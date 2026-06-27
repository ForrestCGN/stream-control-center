# CAN-42.24 Dashboard Diagnostics integrated details cleanup

## Ziel
Die Standard-Diagnoseanzeige wird direkt in `diagnostics.js` integriert. Dadurch ist `diagnostics_generic_details.js` nicht mehr als laufender Zusatz-Patcher nötig.

## Geändert
- `htdocs/dashboard/modules/diagnostics.js`
  - rendert den `diagnostics`-Block direkt in der Modul-Detailansicht
  - zeigt Zähler, Datenbank, Status, Warteschlange, Laufzeit, Warnungen und Fehler
  - nutzt deutsche Labels und einfache Formatierung für ms/Timestamps
- `htdocs/dashboard/index.html`
  - lädt `diagnostics_generic_details.js` nicht mehr

## Nicht geändert
- Keine Backend-Logik
- Keine Statusrouten
- Keine OBS-/Sound-/Show-/Chat-/Admin-Aktionen
- Keine DB-Migration
- Keine neue Moduldatei

## Nachprüfung
- Communication-Bus zeigt wieder Standard-Diagnose
- OBS zeigt Standard-Diagnose
- VIP-System nutzt `/api/vip-sound/status`
- Hug-System bleibt ohne Spezialfix nutzbar

## Aufräumhinweis
Wenn dieser Stand stabil getestet ist, können später die nicht mehr eingebundenen Dateien als Löschkandidaten geprüft werden:
- `htdocs/dashboard/modules/diagnostics_generic_details.js`
- `htdocs/dashboard/modules/diagnostics_hug_display_fix.js`
