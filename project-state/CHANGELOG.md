# CHANGELOG

## 0.2.110 - Admin Note Write Status Reconcile

- `/api/remote/routes` um `adminNoteWriteLiveStatus` erweitert.
- Status-Widerspruch geklaert:
  - `adminNoteWritePlan` bleibt read-only.
  - Confirmed Admin-Note Create/Update Backend bleibt bewusst produktiv/restricted aktiv.
- Status-Erklaerungen fuer `adminNoteWritePlan`, `adminNoteWriteConfirmed`, `adminNoteUpdateConfirmed` ergaenzt.
- Keine Write-Logik geaendert.
- Keine Gates geaendert.
- Keine UI-Buttons aktiviert.
- Keine DB-Migration.

## 0.2.109 - Admin Users Readonly Status Recheck

- Kurze Server-Check-Doku fuer Admin/User/Permission erstellt.
- Live-Pruefung vorbereitet.
