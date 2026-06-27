# CURRENT CHAT HANDOFF – VIP30 STEP8.15.1 No Dashboard Dots

Stand: 2026-06-06

## Ergebnis

Die dekorativen zwei Neon-Punkte auf den VIP30-Dashboard-Cards wurden entfernt.

## Grund

Die Punkte wirken neben Buttons wie Status-/Notification-Anzeigen und sind im Dashboard nicht nötig.

## Geändert

```txt
htdocs/dashboard/modules/vip30.css
```

## Änderung

```css
.vip30-card::after {
  display: none !important;
  content: none !important;
}
```

## Nicht geändert

```txt
Backend
Overlay
Sound-System
Media-System
Dashboard-JS
```

## Hinweis

Das betrifft nur die VIP30-Dashboard-Cards. Das allgemeine CGN Split Lounge Overlay-Design bleibt unverändert.
