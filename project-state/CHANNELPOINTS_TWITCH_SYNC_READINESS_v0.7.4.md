# Channelpoints v0.7.4 - Twitch Sync Readiness

Stand: 2026-05-26

## Inhalt
- Backend-Version: 0.7.4 (`twitch-sync-readiness`)
- Dashboard-Version: 0.7.4 (`twitch-sync-readiness`)
- Neue Readiness-Routen: `/api/channelpoints/twitch-status` und `/api/channelpoints/twitch/readiness`
- Dashboard-Panel „Twitch-Sync Vorbereitung“ ergänzt
- Zeigt lokale Reward-/Redemption-Zahlen, Twitch-ID-Mapping, geplante Scopes und späteren Flow

## Sicherheit
- Keine Twitch-Schreibzugriffe
- Lokal deaktivieren/löschen bleibt lokal
- Keine Reward-Erstellung/-Änderung/-Deaktivierung bei Twitch

## Nächste Punkte
1. Read-only Twitch Token-/Scope-Check anbinden
2. Read-only Reward-Sync vorbereiten
3. Twitch Reward-ID-Mapping im Dashboard anzeigen
4. EventSub-Redemption-Handler anbinden
5. Erst danach gezielt Schreibaktionen freischalten
