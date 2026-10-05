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

Globale Zeitfenster bleiben Planungsziele. Individuell gespeicherte Mitarbeiter-Zeitfenster sind dagegen harte Grenzen: diese Person darf außerhalb ihres Zeitfensters nicht eingeplant werden. Falls zur Umlaufabdeckung ein Dienst außerhalb der globalen Standardzeiten nötig ist, wird dafür ein Mitarbeiter ohne persönliche Sondergrenze verwendet.


## v5 – Google-Sheets-Fuhrpark
Der Fuhrpark wird automatisch alle 30 Minuten, per Admin-Button und vor jeder neuen Wochenplan-Generierung aus der Google-Sheets-Tabelle synchronisiert. Nur `Im Betrieb` wird disponiert. Die neue Statusspalte ist K. Ein fehlgeschlagener Sync lässt den letzten D1-Stand unangetastet.

Dienstkategorien: 03:00–08:59 Frühdienst, 09:00–12:59 Tagdienst, 13:00–16:59 Spätdienst, ab 17:00 sowie vor 03:00 Nachtdienst. Echte geteilte Dienste bleiben `Geteilter Dienst`.

Haltestellen-Historie wird bis zum aktuellen Namen aufgelöst: `Lütge Varney → Popperstraße → Nordstrander Straße` und `Spielburg → Patermannstraße → Europaviertel`.

### Wochenendregel Büro / Verwaltung
Klassische Büro- und Verwaltungsbereiche (Geschäftsführung, Betriebsleitung Transport, Außendienst, IT / Digital, Marketing, Personal, Verkehrsplanung und Verwaltung) werden samstags und sonntags automatisch als **Frei** eingeplant. Emil Breitbau und Tim Neumann bleiben als fahrende Betriebsleiter von dieser Büroregel ausgenommen. Operative Schichtbereiche wie Fahrdienst, Leitstelle, Disposition, Werkstatt, Reinigung, Hofdienst und Kundenservice können weiterhin am Wochenende eingeplant werden. Manuelle Admin-Overrides bleiben möglich.


## v5.5 – TTData-basierte Ablösung
Die Fahrdienstgenerierung verwendet nun die echten OMSI-TTData-Tripgrenzen. Künstliche Pausen mitten in weiterfahrenden Umläufen wurden entfernt; Ablösungen werden bevorzugt ungefähr nach vier Stunden an realen Fahrplan-Endpunkten geplant. Details: `docs/TTDATA_PAUSENLOGIK.md`.


## v5.6 – Planversionen & Einzelgenerierung

- Jede komplette Neugenerierung erzeugt eine neue Planversion und aktiviert sie sofort.
- Frühere Versionen bleiben gespeichert und können im Adminbereich wieder aktiviert werden.
- „Komplett verwerfen & neu erzeugen“ löscht alle Versionen der ausgewählten Woche und erzeugt Version 1 neu. Manuelle Overrides können wahlweise erhalten bleiben oder mit gelöscht werden.
- Pro Mitarbeiter können eigene Generationskriterien gespeichert werden.
- Einzelne Mitarbeiter können neu generiert werden. Bei Fahrdienst werden komplette Dienstpakete mit passenden Fahrern getauscht, damit kein Umlaufstück unbesetzt oder doppelt belegt wird.
- „Durchwürfeln“ verwendet einen neuen Zufalls-Seed; eine neue Version ist daher tatsächlich anders und nicht nur dieselbe deterministische Verteilung.

Nach dem Deploy einmal die neue Migration ausführen:

```bash
npx wrangler d1 migrations apply rogis-dienstplan-db --remote
```

## v5.7 – echte Fahrerablösungen und mehrere Umläufe pro Dienst

Die Fahrdienst-Generierung bevorzugt jetzt realistische Dienste mit zwei Fahrblöcken auf unterschiedlichen Umläufen. Ein typischer Dienst besteht aus etwa vier Stunden Fahrt, einer echten Pause und anschließend einem anderen Umlauf. Der zweite Umlauf wird bevorzugt an derselben Haltestelle bzw. demselben Ablösepunkt übernommen.

Bei jedem Umlaufwechsel werden die beteiligten Fahrer miteinander verknüpft. In der Dienstkarte steht deshalb z. B. „Du löst Max Mustermann ab“ bzw. „Du wirst von Erika Beispiel abgelöst“. Die Ablösezeit und der Ort stammen aus den TTData-basierten Umlaufstücken. Eine Pause wird nur zwischen zwei Fahrblöcken eingeplant; sie ist keine erfundene Pause, während der eigene Bus weiterfährt.


## v5.8 – persönliche Verfügbarkeit & Live-Aktualisierung

- Persönliche Zeitkriterien werden bei der kompletten Wochen-Generierung tatsächlich berücksichtigt und nicht mehr beim Nachbesetzen umgangen.
- Montag–Freitag und Samstag/Sonntag haben getrennte Zeitfenster.
- Für das Wochenende gibt es „ganztägig verfügbar“.
- Pro Bereich stehen frühester Dienstbeginn, spätester Dienstbeginn und **spätester Dienstschluss** zur Verfügung.
- Beispiel: Mo–Fr frühestens 16:00 bedeutet, dass ein 08:00-Dienst für diese Person ausgeschlossen ist.
- Die Ansicht prüft alle 7 Sekunden, ob eine neue Planversion oder eine manuelle Tagesänderung vorliegt, und aktualisiert die sichtbaren Pläne automatisch. Zusätzlich gibt es „↻ Aktualisieren“.
- Wiederkehrende Schema-Prüfungen im Worker werden pro Worker-Instanz nur einmal durchgeführt; Admin-Daten werden teilweise parallel geladen, damit die Oberfläche schneller reagiert.

Für v5.8 ist **keine neue D1-Migration** erforderlich.


## v5.9 – Hotspot-Ablösungen / Hofzuordnung
Ablösungen erfolgen nur an definierten Hotspots, Pausen und Folgeumlauf bleiben am selben Ort, ROGIS-Umläufe werden über Ausr_/AusrS_/AusrH_ dem Betriebshof zugeordnet und Dienste werden bevorzugt um ca. 8 Stunden Gesamtspanne gebaut.
