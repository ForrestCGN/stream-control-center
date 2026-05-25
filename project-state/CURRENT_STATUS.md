# CURRENT_STATUS – STEP429

- Sound EventBus: aktiv und beobachtbar.
- Sound Command Dry-Run-Consumer: aktiv in `sound_system` 0.1.16.
- VIP EventBus: aktiv und beobachtbar.
- VIP Sound-Bus Shadow-Command: aktiv in `vip_sound_overlay` 1.8.13.
- VIP kann den Shadow-Command nun gegen den Sound-System Dry-Run-Consumer prüfen.
- Produktiver VIP-Flow nutzt weiterhin `/api/sound/play`.
- Alerts bleiben vorbereitet/beobachtbar und werden noch nicht produktiv über den Bus gesteuert.
