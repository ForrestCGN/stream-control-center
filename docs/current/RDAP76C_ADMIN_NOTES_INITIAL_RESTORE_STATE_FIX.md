# RDAP76C_ADMIN_NOTES_INITIAL_RESTORE_STATE_FIX

Datum: 2026-06-26  
Projekt: `stream-control-center` / Remote-Modboard / RDAP  
Art: Frontend-only Korrekturstep nach RDAP76

## Ausgangslage

RDAP76 hat den Navigations-Klickpfad verbessert:

```text
Admin -> Admin-Notizen setzt nach Klick korrekt:
- Haupt-Header: Admin-Notizen
- Tab: read/create
- aktive Navigation: Admin-Notizen
- sichtbares Panel: Admin-Notizen
```

Im Browser blieb aber ein Restbefund beim Initial-/Restore-State sichtbar:

```text
Haupt-Header: User-Detail · read-only
aktive Navigation: User-Detail
sichtbarer Inhalt: Admin-Notizen
```

Damit war RDAP76 fachlich nur teilweise erfolgreich. Der Fehler liegt nicht im Backend, sondern in der Restore-/State-Synchronisation der injizierten Admin-Notes/User-Detail-Panels.

## Ziel

```text
- Beim Laden/Restore muss das sichtbare Admin-Notes-Panel den Haupt-Router auf admin-notes ziehen.
- Wenn Admin-Notes sichtbar ist, muessen Header, Navigation und Router-State Admin-Notizen zeigen.
- Wenn User-Detail sichtbar ist, muessen Header, Navigation und Router-State User-Detail zeigen.
- Kein CSS-Verstecken als Ersatz fuer falschen State.
- Kein paralleler Router.
```

## Geaendert

```text
remote-modboard/backend/public/assets/rdap28-admin-notes.js
```

Aenderungen:

```text
- restoreInjectedAdminPanelVisibility() bewertet jetzt zuerst wirklich sichtbare injizierte Panels.
- Neuer Restore-Repair nach DOMContentLoaded mit kurzen verzögerten Checks.
- Wenn sichtbares Panel, Header, aktive Navigation und Haupt-Router auseinanderlaufen, wird der bestehende Haupt-Router erneut sauber gesetzt.
- Admin-Notes/User-Detail bleiben weiterhin ueber window.RdapMainRouter.setPage(...) synchronisiert.
```

## Nicht geaendert

```text
Kein Backend.
Keine Backend-Route.
Keine DB-Migration.
Keine neue Permission.
Kein Deactivate.
Kein Delete.
Keine Community-Read-Freigabe.
Keine Rollen-/Gruppen-/Permission-Writes.
Keine Agent-/OBS-/Sound-/Overlay-/Command-Steuerung.
Keine neuen Schreibbuttons.
Keine Write-Freigabe nebenbei.
```

## Testfokus

```text
1. Seite neu laden, auch wenn vorher User-Detail aktiv war.
2. Wenn Admin-Notizen sichtbar sind:
   - Haupt-Header muss Admin-Notizen zeigen.
   - Navigation muss Admin-Notizen aktiv zeigen.
   - User-Detail darf nicht aktiv wirken.
3. Admin -> User-Detail anklicken:
   - Haupt-Header muss User-Detail zeigen.
   - Navigation muss User-Detail aktiv zeigen.
4. Wieder Admin -> Admin-Notizen anklicken:
   - Header/Nav/Panel muessen Admin-Notizen zeigen.
```

## Deploy-Hinweis

Da `remote-modboard/` geaendert wurde, ist nach lokalem Test und `stepdone.cmd` ein Webserver-Deploy aus frischem GitHub/dev noetig.
