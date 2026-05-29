# Alert Tech History – konsolidiert

Stand: 2026-05-29  
Erstellt in: STEP536A_ALERT_TECH_DOCS_CONSOLIDATION

## Ziel

Diese Datei konsolidiert alte Alert-/Alert-Dashboard-/Alert-Overlay-/Alert-Handoff-STEP-Dokumente, die bisher verstreut unter `docs/backend`, `docs/dashboard`, `docs/overlays`, `docs/README_STEP*` und `docs/sound_system` lagen.

Die ursprünglichen Einzeldateien werden nicht vergessen, sondern nach Prüfung per Quarantine-Skript aus dem aktiven Doku-Bereich verschoben.

## Konsolidierter Scope

```text
docs/backend/ALERT_RULE_IMAGE_MEDIAID_STEP276H.md
docs/backend/ALERT_RULE_MEDIA_DURATION_STEP276F.md
docs/backend/ALERT_SOUNDBUS_CORRELATION_STEP340.md
docs/backend/ALERT_SYSTEM_MEDIA_RULE_COLUMNS_STEP276B.md
docs/backend/ALERT_SYSTEM_MEDIA_RULE_COLUMNS_STEP276B_FIX1.md
docs/backend/ALERT_SYSTEM_MEDIAID_PLAYBACK_STEP276C.md
docs/backend/ALERT_SYSTEM_MEDIAID_PLAYBACK_STEP276C_FIX1.md
docs/backend/ALERT_SYSTEM_MEDIAID_REFACTOR_PLAN_STEP276.md
docs/backend/ALERT_SYSTEM_MEDIAID_STEP276_SUMMARY.md
docs/dashboard/ALERT_DASHBOARD_BUS_CORRELATION_STEP350.md
docs/dashboard/ALERT_DASHBOARD_MEDIAID_STEP276_SUMMARY.md
docs/dashboard/ALERT_DISPLAY_GRAPHIC_MEDIAPICKER_LAYOUT_STEP276G_FIX1.md
docs/dashboard/ALERT_DISPLAY_GRAPHIC_MEDIAPICKER_STEP276G.md
docs/dashboard/ALERT_GRAPHIC_FALLBACK_CARD_STYLE_STEP276H_FIX3.md
docs/dashboard/ALERT_IMAGE_FALLBACK_DUPLICATE_LABEL_STEP276H_FIX2.md
docs/dashboard/ALERT_LEGACY_SOUND_FOLDOUT_LAYOUT_FIX_STEP276E_FIX1.md
docs/dashboard/ALERT_LEGACY_SOUND_FOLDOUT_STEP276E.md
docs/dashboard/ALERT_LEGACY_SOUND_NO_LAYOUT_SHIFT_STEP276E_FIX2.md
docs/dashboard/ALERT_RULE_IMAGE_FALLBACK_TEXT_CLEANUP_STEP276H_FIX1.md
docs/dashboard/ALERT_RULE_IMAGE_MEDIAPICKER_STEP276H.md
docs/dashboard/ALERT_RULE_MEDIA_DURATION_STEP276F.md
docs/dashboard/ALERT_RULE_MEDIAPICKER_SOUND_LAYOUT_FIX_STEP276D_FIX1.md
docs/dashboard/ALERT_RULE_MEDIAPICKER_SOUND_STEP276D.md
docs/dashboard/ALERT_SOUNDBUS_HANDOFF_STEP351.md
docs/overlays/STEP393_ALERT_OVERLAY_DIRECT_RECONNECT.md
docs/README_STEP278H_I_MASTER_OVERLAY_ALERT_MIRROR.md
docs/sound_system/STABLE_sound_system_alert_handoff_runtime_dashboard_2026-05-02.md
```

## Kurzfassung

Die alten Alert-Dokus beschreiben vor allem diese Entwicklungslinie:

1. Alert-Regeln bekamen Media-Registry/MediaId-Anbindung.
2. Sound- und Bildauswahl wurden im Dashboard über MediaPicker/MediaId stabilisiert.
3. Alert-Sound wurde an das Sound-System übergeben.
4. Sound-System und Overlay wurden synchronisiert, damit Visual nicht nach Sound erscheint.
5. Dashboard-Vorschau und echter Live-Test wurden fachlich getrennt.
6. Alert-Overlay bleibt produktiv direkt über `_overlay-alerts-v2.html`; Bus/Bridge war/ist Diagnose-/Shadow-Thema.
7. Alte Einzelnotizen sind Verlaufshistorie und können nach dieser Konsolidierung aus dem aktiven Doku-Bereich verschoben werden.

## Alert-System / MediaId / Media-Registry

Die STEP276-Dokumente beschreiben den Umbau von alertbezogenen Sound-/Bildreferenzen auf Media-Registry/MediaId.

Konsolidierter Stand:

- Alert-Regeln können Medien über Media-Registry-IDs referenzieren.
- Sound- und Bildauswahl sollen über standardisierte MediaPicker-/Media-Feldlogik laufen.
- Keine losen Parallelstrukturen für Alert-Sounds/Bilder aufbauen.
- Medienauflösung gehört in bestehende Media-/Sound-Helfer beziehungsweise Modulstandards.
- Alte Legacy-Soundfelder bleiben sichtbar/kompatibel, sollen aber nicht als neue langfristige Struktur ausgebaut werden.

## Dashboard / MediaPicker / Alert-Regeln

Die Dashboard-STEP-Dokus beschreiben UI-Fixes für:

- MediaPicker für Alert-Sounds
- MediaPicker für Alert-Grafiken/Bilder
- korrekte Reihenfolge und Darstellung von Upload-/Auswahlfeldern
- Legacy-Sound-Foldout ohne Layout-Verschiebung
- Bild-Fallback ohne doppelte Labels
- Fallback-Text-Cleanup
- Rule Media Duration Anzeige/Verwendung

Konsolidierter Stand:

- Alert-Regel-UI soll Medien über MediaPicker auswählen.
- Legacy-Bereiche dürfen vorhandene Regeln sichtbar halten, aber nicht dominieren.
- Dashboard-UX-Fixes waren schrittweise; die Einzeldateien sind keine dauerhaften Referenzdokus.
- Bei künftigen Alert-UI-Änderungen immer echte `htdocs/dashboard/modules/alerts.js` und `alerts.css` prüfen.

## Alert-Handoff an Sound-System

Der alte STABLE-Handoff dokumentiert einen wichtigen Arbeitsstand:

Ablauf:

```text
1. Alert-System erzeugt Alert-Event.
2. Alert-System sendet prepare an Alert-Overlay.
3. Alert-System ruft /api/sound/play auf.
4. Sound-System queued/sortiert nach Priorität.
5. Wenn Sound-Item dran ist, sendet Sound-System item_starting.
6. Alert-Overlay zeigt den vorbereiteten Alert.
7. Sound-System wartet visualLeadMs, dokumentiert mit 150 ms.
8. Sound startet über outputTarget, meist device.
```

Ziel:

```text
Sound startet nicht vor dem Overlay.
Overlay erscheint möglichst gleichzeitig oder minimal vor Sound.
```

Wichtige Werte aus dem alten Handoff:

```text
queue.alertSync.enabled=true
queue.alertSync.visualLeadMs=150
queue.alertSync.maxVisualLeadMs=500
```

## Dashboard Vorschau vs. Live-Test

Wichtige fachliche Trennung:

Lokale Vorschau:

```text
- nur auf Bearbeiter-Rechner
- Popout/Iframe lokal
- Sound lokal im Dashboard-Browser
- kein OBS
- keine Alert-Queue
- kein Sound-System
- kein Voicemeeter
```

Live-Test:

```text
- echte Alert-Pipeline
- OBS-Overlay
- Sound-System
- Audiogerät/Voicemeeter
```

Diese Trennung bleibt wichtig, damit Preview-Fehler nicht mit Live-Alert-Fehlern vermischt werden.

## Alert Overlay / Direct Overlay / Bridge

Die Overlay-Dokus STEP392/393/393A wurden bereits teilweise in `docs/current/CURRENT_SYSTEM_STATUS.md` aufgenommen.

Konsolidierter Stand:

```text
Produktiv:
http://127.0.0.1:8080/overlays/_overlay-alerts-v2.html
```

Nicht produktiv verwenden:

```text
_overlay-alerts-v2-bus.html?debug=1&mode=bridge
```

Der direkte Overlay-Pfad ist relevant. Bridge-/Diagnostic-Dateien sind kein produktiver Pfad, solange nicht ausdrücklich anders dokumentiert.

## Master Overlay Alert Mirror

`README_STEP278H_I_MASTER_OVERLAY_ALERT_MIRROR.md` gehört fachlich zum Alert-/Overlay-Verlauf. Der Inhalt ist als alte Umsetzungs-/Handoff-Notiz zu behandeln und nicht als aktive Produktivregel, sofern nicht durch aktuelle Overlay-/Master-Overlay-Doku bestätigt.

## Gerettete offene Punkte aus dem alten STABLE-Handoff

Diese Punkte dürfen durch Cleanup nicht verloren gehen.

### Sound-Dashboard Settings UI Teil 2

Noch auszubauen:

```text
- Interrupt-Regeln editierbar machen
- Drop-Regeln editierbar machen
- Cooldowns editierbar machen
- Dedupe editierbar machen
- Prioritäten-Tabelle editierbar machen
- Kategorie-Defaults editierbar machen
```

### Spätere Sound-/Alert-/Dashboard-Themen

```text
- Alert liveAlert/preview Settings ins Alert-Dashboard bringen
- Rollen/Rechte für Live-Test und Sound-Policy absichern
- Audit-Logging für Dashboard-Änderungen
- Discord-Ausgabe über Sound-System planen
- Sound-Bibliothek/Sound-Dateien später DB-/Dashboard-basiert verwalten
```

Diese Punkte gehören eher in Sound/Media/SoundBus-Folgearbeit und sollten bei STEP536B/weiteren Sound-Dashboard-Arbeiten erneut berücksichtigt werden.

## Bekannte Stolperfallen aus dem Handoff

### Keine `.js` Backup-Dateien in `backend/modules`

Der Server lädt alle `.js` Dateien im Modulordner. Deshalb niemals `.js`-Backups dort liegen lassen.

Richtig:

```text
*.bak
*.js.bak
Backups außerhalb von backend/modules
```

Falsch:

```text
sound_system.backup_before_xyz.js
```

### Backend-Start sichtbar prüfen

Wenn ein Modul nicht geladen wird:

```powershell
cd D:\Streaming\stramAssets
node backend\server.js
```

Oder sichtbares Neustart-Script verwenden.

## Nach dieser Konsolidierung

Die Einzeldateien im Scope können in Quarantine verschoben werden, weil:

- relevante technische Aussagen hier zusammengeführt wurden
- offene Punkte explizit gerettet wurden
- aktive Produktivregeln bereits zusätzlich in `docs/current/CURRENT_SYSTEM_STATUS.md` dokumentiert sind
- Module-Dokus (`docs/modules/*`) bleiben unberührt

## Nicht ableiten

Diese Sammeldoku ist keine Erlaubnis für Code-Änderungen.

Bei jedem späteren Alert-/Sound-/Dashboard-Umbau weiterhin:

- echte aktuelle Dateien prüfen
- keine Funktionalität entfernen
- keine DB/Secrets überschreiben oder committen
- Dashboard nur über Backend-APIs
- Syntaxcheck und Live-/API-Test passend zum betroffenen Modul
