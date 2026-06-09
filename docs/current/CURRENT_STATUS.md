# Current Status – LWG-4M.9

Stand: STEP LWG-4M.9 – Bound-Wheel Field Foundation vorbereitet.

Bestaetigte Vorarbeit:
- LWG-4M.5 Backend Bound-Wheel Aktivierung/Claim/Spin funktioniert.
- LWG-4M.6 Dashboard Wheel-Preset Visibility Fix funktioniert.
- LWG-4M.7 Runtime-Test erfolgreich: Draw, Permission, Claim/Spin, Giveaway finished.
- LWG-4M.8 Runtime-Test dokumentiert.

Neu in LWG-4M.9:
- Neue Tabelle `loyalty_giveaway_bound_wheel_fields` fuer Giveaway-gebundene Radfelder.
- Preset-Felder werden beim Erstellen/Binden eines Wheel-Giveaways in den Bound-Wheel-Snapshot kopiert.
- Bound-Wheel GET liefert `fieldCount` und `fields` mit aus.
- Neue Backend-Routen fuer kommende Editor-Funktionen hinzugefuegt.

Aktuelle Grenze:
- Der Dashboard-Editor fuer Bound-Wheel-Felder ist noch nicht gebaut.
- Runtime-Spin nutzt weiterhin die vorhandene Preset-Feldbasis; die Umstellung auf Bound-Wheel-Felder folgt separat.

Naechster sinnvoller Step:
- LWG-4M.10 – Dashboard Bound-Wheel Field Editor.
