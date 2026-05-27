# Channelpoints STEP517 – Unified Activation Twitch Sync

Stand: 2026-05-26  
Backend: `0.9.5 · unified-activation-twitch-sync`  
Dashboard: `1.0.4 · unified-activation-ui`

## Problem

Der Dashboard-Button „Aktivieren“ war missverständlich und technisch zu halbgar: lokal aktivierte Rewards konnten existieren, ohne dass Twitch korrekt erstellt/aktiviert war. Bei stale Twitch-IDs konnte Twitch mit `The custom reward specified in the id query parameter was not found.` abbrechen.

## Lösung

„Aktiv“ bedeutet ab diesem Stand: System + Twitch.

Beim Aktivieren:

1. Aktion muss vollständig sein.
2. Reward wird zu Twitch gepusht.
3. Falls keine Twitch-ID existiert, wird der Reward auf Twitch erstellt.
4. Falls eine stale Twitch-ID existiert, wird sie entfernt und der Reward neu erstellt.
5. Twitch wird aktiviert.
6. Erst nach erfolgreichem Twitch-Schritt wird der lokale Reward aktiv gesetzt.

Beim Deaktivieren:

1. Wenn Twitch verknüpft ist, wird der Reward auf Twitch deaktiviert.
2. Bei stale Twitch-ID wird die lokale Verknüpfung entfernt.
3. Der lokale Reward wird deaktiviert und pausiert.

## Keine Änderungen

- Keine neue DB-Tabelle.
- Keine neuen Modi.
- EventBus-Redemption-Flow bleibt unverändert.
- Completion-Policy bleibt unverändert.
