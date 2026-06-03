# Current Chat Handoff CAN-42.21c

CAN-42.21c behebt den Dashboard-Diagnose-Auswahlfehler aus CAN-42.21b.

Stand:
- Communication-Bus und OBS sind in der Diagnose-Auswahl vorhanden.
- Auswahl/Klick öffnet jetzt die dynamische Detailansicht.
- VIP-System bleibt auf `/api/vip-sound/status` korrigiert.

Nächster sinnvoller Schritt:
- CAN-42.22 planen: automatische Diagnose-Registry sauber als Backend-Endpunkt, z. B. `/api/diagnostics/registry`, damit die Liste nicht mehr hart im Frontend gepflegt werden muss.
