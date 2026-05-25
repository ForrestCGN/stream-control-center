# STEP459_SHOUTOUT_DISPLAY_COOLDOWN_AFTER_FINISH

## Ziel

Der 2-Minuten-Cooldown der Shouti-Anzeige startet erst nach dem Ende der laufenden Shouti-Anzeige.

## Änderungen

- `backend/modules/clip_shoutout.js` Runtime-Version `0.2.2`
- Display-Cooldown wird nicht mehr ab Display-Start berechnet.
- Display-Cooldown wird ab `finished_at` des letzten abgeschlossenen Shoutis berechnet.
- `displayQueue.cooldownStartsAfterFinish` wird im Status ausgegeben.
- Dashboard-Hinweis auf Cooldown nach Anzeige-Ende ergänzt.

## Erwarteter Ablauf

```text
!so @urlug
→ urlug Anzeige startet
→ urlug Anzeige endet
→ ab jetzt 120 Sekunden warten
→ danach darf der nächste Shouti starten
```

## Nicht geändert

- Sound-System
- Alerts
- VIP
- Twitch-Modul
- offizielle Twitch-Shoutout-Queue
- bestehende Clip-Erstellung
- SQLite wird nicht ersetzt oder überschrieben
