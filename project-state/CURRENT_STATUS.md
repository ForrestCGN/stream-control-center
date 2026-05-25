# CURRENT_STATUS

Aktueller Stand: STEP449 – VIP Productive Bus Access/Target Hook Fix.

VIP-Sound-Overlay: `1.8.31` mit Feature `vip_productive_bus_access_target_hook_fix`.
Sound-System: `0.1.20` unverändert aus STEP448.

Der produktive VIP-Bus-First-Pfad bleibt aktiv. STEP449 korrigiert gezielt den Zugriff vor dem Bus-Hook: Rollen aus Command-Payloads sowie lokale Rollen-Fallbacks werden jetzt für Actor/Target berücksichtigt, damit der echte `/api/vip-sound/command`-Flow den produktiven Bus erreichen kann.
