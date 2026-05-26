# NEXT_STEPS

## Nach STEP473

1. ZIP nach `D:\Git\stream-control-center` entpacken.
2. Keine JS-Dateien geändert, daher kein `node --check` nötig.
3. STEP abschließen:

```bat
.\stepdone.cmd "STEP473 Todo Rule in General Prompt"
```

## Nächster sinnvoller Arbeitsstep

```text
STEP474_SHOUTOUT_DASHBOARD_TABS
```

Ziel:

- Shoutout-Dashboard aufräumen.
- Tabs/Unterbereiche ergänzen:
  - Übersicht
  - Queues
  - Statistik
  - Timeline
  - Settings/Test
- Keine Backend-Logik ändern, sofern nicht zwingend nötig.

## Danach offen

- Eingehende Twitch-Shoutouts per EventSub loggen.
- Inbound-Shoutouts getrennt in Statistik und Dashboard anzeigen.
- `stream_status` bei echtem Streamstart/Streamende live testen.
- Weitere Module schrittweise auf zentralen Stream-Status umstellen.
