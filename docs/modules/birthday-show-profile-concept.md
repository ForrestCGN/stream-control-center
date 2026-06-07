# Birthday Show/Profile Concept - Modulnotiz

Stand: STEP_BIRTHDAY_SHOW_PROFILE_CONCEPT

Diese Modulnotiz verweist auf die ausführliche Konzeptdatei:

```text
docs/system-inspection/BIRTHDAY_SHOW_PROFILE_CONCEPT.md
```

Kurzfassung:

- Standard-Shows sollen anlegbar, bearbeitbar und abspielbar sein.
- User-Shows sollen pro Twitch-User anlegbar, bearbeitbar und abspielbar sein.
- Die kleine automatische Geburtstagsgratulation bleibt strikt getrennt von der großen manuellen Show.
- Die große Show wird nur manuell/gezielt gestartet.
- Bestehende Tabellen `birthday_parties`, `birthday_show_profiles` und `birthday_show_queue` bleiben die fachliche Basis.
- Nächster sinnvoller Schritt: Read-only Show-State-Audit am Live-System.

Keine Codeänderung in diesem Step.
