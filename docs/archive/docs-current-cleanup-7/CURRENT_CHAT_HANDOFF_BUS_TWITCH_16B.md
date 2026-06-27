# CURRENT CHAT HANDOFF – BUS-TWITCH.16b

Stand: BUS-TWITCH.16b gebaut.

VIP30 nutzt den neuen TwitchEvents-Bus-Weg produktiv testbar. Die Legacy-Bridge bleibt als Fallback vorhanden, hat aber jetzt einen Hard-Disable-Gate: Wenn sie gestoppt ist, darf der alte Legacy-Pfad keine VIP30-Decision mehr ausführen. TwitchEvents-Verarbeitung zählt nicht mehr in Legacy-Stats hinein.

Nächster Test: Legacy stoppen, 30 Tage VIP auslösen, `twitchEvents.stats` und `legacyBridge.stats` vergleichen.
