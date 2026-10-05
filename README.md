# ROGIS Dienstplan – GitHub + Cloudflare Workers

Diese Version ist für **GitHub + Cloudflare Workers + D1** vorbereitet.

## Enthalten

- `src/index.js` – Backend/API, Login, D1, Dienstplan-Generator, Cron
- `public/index.html` – mobile/PC-taugliche Oberfläche
- `public/assets/` – ROGIS-Logos
- `wrangler.jsonc` – Cloudflare-Konfiguration
- `migrations/0001_initial.sql` – dokumentiertes D1-Schema (optional; der Worker initialisiert selbst)
- `docs/HANDY_SETUP.md` – genaue Einrichtung vom iPhone/Android

## Benutzer

Benutzername: `vorname.nachname` (klein). Erstpasswort: `Start123`. Beim ersten Login muss ein eigenes Passwort gesetzt werden.

Admins: Andreas Neubaum, Emil Breitbau, Tim Neumann, Oliver Schesch, Patric Gehen.

## Wichtig vor dem ersten GitHub-Deploy

In `wrangler.jsonc` steht:

```json
"database_id": "PASTE_D1_DATABASE_ID_HERE"
```

Diesen Wert durch die echte ID deiner D1-Datenbank `rogis-dienstplan-db` ersetzen. Die ID findest du im Cloudflare-Dashboard auf der D1-Datenbankseite.

Danach kann Cloudflare das GitHub-Repo mit dem normalen Deploy-Befehl `npx wrangler deploy` bereitstellen.


## Manuelle Dienstbearbeitung durch Admins

Admins können in **Alle Dienste → Tagesübersicht → Bearbeiten** einen einzelnen Mitarbeitertag überschreiben. Unterstützt werden:

- Urlaub
- Krank
- Frei
- Reserve (inkl. Betriebshof und Zeit)
- Organisation / Betriebsleitung
- individueller Dienst mit eigener Bezeichnung, Dienstort und Beginn/Ende

Die Änderung wird separat in D1 gespeichert. **Neuladen und auch eine Neugenerierung des Wochenplans löschen diese manuellen Änderungen nicht.** Über „Manuelle Änderung entfernen“ gilt wieder der automatisch generierte Dienst.

Urlaubswünsche können in der Admin-Ansicht außerdem direkt mit **„Urlaub eintragen“** übernommen werden.

## Freitagsgenerierung

Der Cron ist bereits in `wrangler.jsonc` eingetragen: `0 16 * * fri`. Die Folgewoche wird nur erzeugt, wenn noch kein gespeicherter Wochenplan vorhanden ist. Seiten-Neuladen generiert keinen neuen Plan.

## Test

Nach dem Deployment:

- `/api/health` muss JSON mit `"ok": true` liefern.
- Danach die Startseite öffnen und z. B. `emil.breitbau` / `Start123` testen.

## Generationskriterien (Admin)

Administratoren können unter **Administration → Generationskriterien** die Dienstbildung steuern. Einstellbar sind u. a. frühester/spätester Dienstbeginn, spätestes Dienstende, Ziel- und Maximalfahrzeit, maximale Dienstspanne, maximale Zahl der Umlaufblöcke, Pausenregeln und Reservezeiten. Die Werte werden zentral in D1 gespeichert.

Wichtig: Bereits gespeicherte Wochen werden durch eine Änderung der Kriterien **nicht** verändert. Die neuen Kriterien gelten erst bei einer neu erzeugten Woche oder wenn ein Administrator ausdrücklich **Woche neu generieren** auswählt. Die jeweilige Woche speichert eine Kopie der verwendeten Kriterien, damit spätere Änderungen alte Pläne nicht nachträglich verändern.

Umlaufabdeckung hat Vorrang: Falls ein einzelner Umlauf außerhalb eines bevorzugten Start-/Endfensters liegt, bleibt er trotzdem besetzt. Die Grenzen steuern vor allem, welche Umlaufblöcke zu einem gemeinsamen Tagesdienst kombiniert werden.
