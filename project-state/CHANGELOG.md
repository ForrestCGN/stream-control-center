# CHANGELOG

Stand: 2026-05-26

## Kanalpunkte-System – Konsolidierung STEP484 bis STEP516

### Hinzugefügt

- ReadOnly Twitch Reward Sync inklusive Tokenstore-Fix.
- Dashboard-Import/Mapping für Twitch Rewards.
- Sichere Aktivierungslogik für importierte Rewards ohne Aktion.
- Twitch Reward Push/Create/Update über `channel:manage:redemptions`.
- Stale-ID-Fallback: bei nicht mehr existierender Twitch-ID kann der Reward neu auf Twitch erstellt werden.
- Twitch Reward Delete mit Confirm und `localAction`.
- EventBus-Brücke für echte Twitch-Redemptions.
- Redemption-Verlauf mit User, Reward, Eingabe, Status und Ergebnis.
- Statistik und Filter für Kanalpunkte-Einlösungen.
- Completion Policy je Reward:
  - Sofort bei Twitch abschließen
  - Nach erfolgreicher Ausführung abschließen
  - Bei Fehler Punkte zurückgeben
  - Twitch pausieren
- Farbauswahlfeld, Hex-Feld, Live-Vorschau und Farbpresets für Twitch Reward-Farben.

### Geändert

- Normale Kanalpunkte-Logik vereinfacht:

```text
Reward inaktiv → nicht ausführen
Reward aktiv + Aktion vollständig → ausführen
Reward ohne Aktion → nicht aktivierbar / nicht ausführbar
```

- Shadow-/Live-/Allowlist-Bedienkonzepte wurden aus dem normalen Dashboard-Konzept entfernt.
- EventSub-Redemptions werden nicht per interner HTTP-Brücke, sondern per EventBus verarbeitet.
- Twitch Reward Write unterstützt erweiterte Reward-Parameter wie Farbe, User-Input, Limits, Cooldown und Queue-Verhalten.

### Behoben

- ReadOnly-Sync Tokenstore-Problem.
- Dashboard Mapping nach Preview/Sync.
- Lokaler Sync mit falschem DryRun-Verhalten.
- Aktivieren importierter Rewards ohne Aktion.
- `Unknown named parameter 'created_at'` beim Update von Rewards/Redemptions.
- Stale Twitch Reward ID bei Gewürzgurke.
- EventSub kam zwar in `twitch.js` an, wurde aber noch nicht an `channelpoints.js` weitergereicht.

### Erfolgreich getestet

- Reward `Gewürzgurke` lokal konfiguriert.
- Reward `Gewürzgurke` auf Twitch erstellt.
- EventSub-Abo `channel.channel_points_custom_reward_redemption.add` aktiv.
- Echte Twitch-Einlösung durch `EngelCGN` gespeichert und ausgeführt.
- Status:

```text
status=executed
queue_group=eventsub_redemption
reason=reward_active_and_executable
execution.executed=true
execution.failed=false
```

### Nicht geändert

- Keine neue Datenbankdatei.
- Keine DB-Ersetzung.
- Keine Dashboard-Modi Shadow/Live/Allowlist.
- Keine HTTP-Brücke zwischen `twitch.js` und `channelpoints.js`.
