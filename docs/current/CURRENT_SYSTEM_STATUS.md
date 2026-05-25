# CURRENT_SYSTEM_STATUS

Aktueller Stand: STEP461_SHOUTOUT_COMMAND_COOLDOWN_AND_WAITING_MESSAGE_FIX

Clip-Shoutout Runtime-Version: 0.2.4

- Testbetrieb weiterhin ueber `!vso`, sofern Config so gesetzt ist.
- Display-Queue ist aktiv.
- 2-Minuten-Display-Cooldown startet erst nach Ende der Shouti-Anzeige.
- Command-Level-Cooldowns werden fuer den Queue-Betrieb deaktiviert, damit mehrere VSO-Aufnahmen direkt nacheinander angenommen und in die Queue gelegt werden.
- Offizielle Twitch-Shoutout-Queue bleibt getrennt aktiv.
