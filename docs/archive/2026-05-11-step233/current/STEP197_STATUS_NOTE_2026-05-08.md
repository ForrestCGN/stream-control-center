# STEP197 Status Note – Alert Overlay Duplicate Audio

Datum: 2026-05-08

STEP197 ergänzt `_overlay-alerts-v2.html`, damit das Alert-Overlay keinen lokalen Browser-Sound mehr startet, wenn der Alert-Sound bereits erfolgreich über das zentrale Sound-System übernommen wurde.

Zielzustand:

- Alert-Overlay: Bild, Text, Animation
- Sound-System: Audio/Device-Ausgabe
- keine doppelte Audio-Ausgabe

JSON/DB-Strategie bleibt unverändert:

- JSON = Seed/Fallback/technische Boot-Konfiguration
- DB = dashboardfähige Runtime-Settings
- DB-Settings haben Vorrang vor JSON-Fallback
