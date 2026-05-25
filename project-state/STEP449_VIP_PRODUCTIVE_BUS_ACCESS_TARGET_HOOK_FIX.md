# STEP449 – VIP Productive Bus Access/Target Hook Fix

## Ziel

STEP448 hat den produktiven VIP-Bus-First-Pfad aktiviert, aber der echte `/api/vip-sound/command`-Flow wurde vor dem Bus-Hook durch den Rollencheck abgelehnt (`not_twitch_vip_or_mod`).

STEP449 behebt gezielt diese Stelle, ohne neue Bus-Testpfade einzubauen.

## Geänderte Dateien

- `backend/modules/vip_sound_overlay.js`
- `backend/modules/sound_system.js` bleibt unverändert aus STEP448 enthalten
- Status-/Projektdateien

## Änderungen

- VIP-Modulversion auf `1.8.31` erhöht.
- Feature auf `vip_productive_bus_access_target_hook_fix` gesetzt.
- Rolleninformationen aus echten Command-Payloads werden beim Actor/Target berücksichtigt:
  - `actorIsBroadcaster`, `actorIsMod`, `actorIsModerator`, `actorIsVip`
  - `targetIsBroadcaster`, `targetIsMod`, `targetIsModerator`, `targetIsVip`
  - `badges`, `actorBadges`, `targetBadges`
- Lokale Rollen-Fallbacks (`vip_sound_role_overrides` / `vip_sound_roles.json`) werden beim Zugriff berücksichtigt, wenn `fallbackRolesEnabled=true` ist.
- Der produktive Bus-Flow bleibt aktiv, sobald der Rollencheck bestanden ist.

## Bewusst nicht geändert

- Keine neue Bus-Route.
- Keine neue Admin-Test-Route.
- Kein weiterer Shadow-/Play-Test-Ausbau.
- Kein DailyUsage-Umbau.
- Kein Dashboard-Umbau.
- Keine DB-Migration.
- Legacy bleibt nur als Fallback bei Bus-Fehler.

## Erwartung

Der echte Command-Flow kann den produktiven Bus erreichen, sobald der User über Twitch-Cache, Command-Rollenflags oder lokale Rollen-Fallbacks als VIP/Mod/Broadcaster erkannt wird.
