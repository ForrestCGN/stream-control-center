# STEP425 - VIP Bus Diagnostics

## Ziel
VIP wird in der zentralen Bus-Diagnose sichtbar, bevor echte Bus-Steuerung aktiviert wird.

## Neu
- `/api/bus-diagnostics/status` aggregiert zusätzlich:
  - `/api/vip-sound/status`
  - `/api/vip-sound/integration-check`
- Dashboard zeigt VIP-System und VIP-Integration.

## Schutz
- readOnly bleibt true.
- flowTouched bleibt false.
- queueTouched bleibt false.
- soundSystemTouched bleibt false.
- alertSystemTouched bleibt false.
- vipSystemTouched bleibt false.
- overlayTouched bleibt false.

## Hinweis
Alert ist bis hier vorbereitet/beobachtbar und korrelierbar, aber noch nicht produktiv über Bus gesteuert.
