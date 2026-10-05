# ROGIS Dienstplan v6.1

## Neu: Personalbewegungen

Im Adminbereich gibt es jetzt eine Personalverwaltung für Neueinstellungen und Austritte/Rente. Neue Mitarbeiter erhalten automatisch eine ROGIS-ID und einen Login mit Erstpasswort `Start123`. Auszubildende werden beim Eintritt auf ein Mindestalter von 17 Jahren geprüft. Eintritts- und Austrittsdaten wirken auf die Dienstgenerierung: vor dem Eintritt bzw. nach dem letzten Beschäftigungstag wird die Person nicht eingeplant; nach dem Austritt ist der Login gesperrt. Kommende und vergangene Personalbewegungen werden im Adminbereich angezeigt.

Nach dem Update einmal ausführen:

```bash
npx wrangler d1 migrations apply rogis-dienstplan-db --remote
```

> Bereits gespeicherte Planversionen werden nicht automatisch umgeschrieben. Wenn ein Austritt eine schon erzeugte Woche betrifft, diese Woche bitte neu generieren/durchwürfeln.

---

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

## v6.1 – Nur persönliche Generationskriterien

- Die globalen Generationskriterien wurden aus dem Adminbereich entfernt und werden vom Generator nicht mehr verwendet.
- Mitarbeiter ohne gespeicherte persönliche Kriterien haben keine persönlichen Start-/Endzeit-, Fahrzeit-, Dienstspannen- oder Umlaufblock-Limits.
- Persönliche Kriterien gelten ausschließlich für die jeweilige Person und können Mo–Fr und am Wochenende getrennt gesetzt werden.
- Leere Felder bedeuten keine Einschränkung.
- Betriebliche TTData-Regeln wie echte Hotspot-Ablösungen, gleicher Ablöseort für Pause/zweiten Umlauf und notwendige Pausen zwischen zwei Fahrblöcken bleiben bestehen.
- Der Fehler „Kein Fahrer erfüllt … die zwingenden persönlichen Zeit-/Pausenkriterien“ wird dadurch bei uneingeschränkten Fahrern vermieden.



## v6.4

Personalübersicht kompakter, tagesaktuelle Personalereignisse, sichtbare Azubi-Mitfahrten bei Mentoren und ein generationstypisch diversifizierter Personalbestand. Keine neue D1-Migration erforderlich.


## v6.4.2 – Ausbildung Klasse D
- 2. Lehrjahr August bis Dezember: Theorie/Schulungen; ein automatischer MPU-Termin.
- Ab Januar: Praxis; Begleitfahrten nur vereinzelt und pro Fahrerdienst maximal ein Azubi.
- Begleitfahrten sind bei normalen Busfahrern und Betriebsleitern möglich.
- Eigene Busdienste erst nach automatisch terminierter Klasse-D-Prüfung und ab 18 Jahren.
- 3. Lehrjahr weiterhin selbstständiger Ausbildungsfahrdienst.


## v6.4.3 – Wochen- und Tagesgenerierung

- Wochen können weiterhin einzeln nacheinander erzeugt werden.
- Neuer Button **Nächste Woche erzeugen** erzeugt direkt die Folgewoche und wechselt anschließend dorthin.
- Im Adminbereich kann ein einzelner Wochentag ausgewählt und **nur dieser Tag neu generiert** werden.
- Eine Tagesgenerierung erzeugt eine neue aktive Planversion; die anderen sechs Tage bleiben unverändert.
- Individuelle Mitarbeiterkriterien und der aktuelle Fuhrpark werden auch bei der Tagesgenerierung berücksichtigt.


## v6.4.7 – Zufällige Krankmeldungen und Urlaubswünsche
- Pro Woche werden bei der großen Belegschaft nur einige wenige, stabile Krankmeldungen erzeugt (1–4 Tage).
- Krankmeldungen werden sofort als Krank-Override gespeichert und im Adminbereich nur zur Kenntnis angezeigt.
- Einige Mitarbeiter stellen zufällig Urlaubsanträge für zukünftige Zeiträume; Urlaub wird erst nach Admin-Genehmigung eingetragen.
- Die Ereignisse werden pro Woche nur einmal erzeugt und ändern sich nicht bei jedem Refresh.
- Azubis im 2. Lehrjahr fahren in der Praxisphase weiterhin nur vereinzelt mit (höchstens wenige Begleitfahrten pro Tag, nie täglich).


## v6.4.9
- Einzelne Mitarbeiter können nun nicht nur wochenweise, sondern auch für genau einen ausgewählten Tag neu generiert werden.
- Dabei bleibt der restliche Wochenplan unverändert; bei Fahrdiensten wird nur für diesen Tag mit einem passenden Tauschpartner gearbeitet.
- Persönliche Kriterien der ausgewählten Person werden auch bei der Tages-Neugenerierung berücksichtigt.


## v6.4.10

- Krankmeldungen werden nur noch als aktuelle Krankmeldung erzeugt: Start immer am heutigen Tag, Dauer 1–7 Tage.
- Keine zufälligen Krankmeldungen mehr Wochen im Voraus.
- Urlaubswünsche bleiben zukünftige, genehmigungspflichtige Anträge.
- Pro Kalendertag werden bei der großen Belegschaft nur wenige neue Krankfälle erzeugt und stabil gespeichert.

### Ergänzungen v6.4.10
- Krankmeldungen beginnen ausschließlich heute und laufen nur die folgenden Tage weiter; alte zukünftige Zufalls-Krankmeldungen werden automatisch bereinigt.
- Samstag/Sonntag: regulär nur Fahrdienst; alle anderen Bereiche haben frei. Emil Breitbau und Tim Neumann bleiben als fahrende Betriebsleiter für Fahrdienste verfügbar.
- Dienstkarten von MAN Lion's City/New Lion's City sind wieder anklickbar; Apostrophe im Modellnamen beschädigen das Datenattribut nicht mehr.

## v6.4.12 – Bearbeiten mit aktuellen Werten vorausgefüllt

- Beim Klick auf **Bearbeiten** werden jetzt immer die Werte des aktuell sichtbaren Dienstes in das Formular übernommen.
- Das gilt auch für bereits manuell geänderte Dienste: Dienstbezeichnung, Dienstort, Beginn, Ende und Notiz werden aus dem wirksamen Tagesdienst übernommen.
- Dadurch muss nur noch das Feld geändert werden, das tatsächlich angepasst werden soll.


## v6.4.13 – Harte Dienstzeitgrenzen
- Kein automatisch erzeugter Fahrdienst darf länger als 14 Stunden (840 Minuten) dauern.
- Dienste über 10 Stunden sind nur noch als echter geteilter Dienst mit mindestens 120 Minuten Unterbrechung zulässig.
- Ein einzelner Fahrblock ist auf 9:30 Stunden begrenzt; lange OMSI-Umläufe werden an echten TTData-Fahrtgrenzen geteilt.
- Bevorzugt bleiben die bekannten Ablöse-Hotspots; nur wenn sonst ein unzulässig langer Block entstehen würde, greift eine Sicherheitsablösung an einer realen Fahrtgrenze.
- Individuelle Maximal-Dienstspanne kann höchstens 14 Stunden betragen.
- Die Validierung prüft alle sieben Wochentage auf diese Grenzen.


## v6.4.14 – Urlaubskonto & Reservebegrenzung

- Jeder Mitarbeiter hat maximal 30 Urlaubstage pro Kalenderjahr. Genehmigungen und manuelle Urlaubstage werden gegen das Jahreskontingent geprüft.
- Zufällige Urlaubswünsche werden nur erzeugt, wenn das Restkontingent reicht.
- Pro Betriebshof/Dienstort sind gleichzeitig maximal zwei Reservekräfte zulässig. Früh-/Spätreserve sind standardmäßig 06:00–13:00 und 13:00–21:00 ohne Überlappung.
- Auch manuell gesetzte Reserve wird auf Konflikte mit bereits eingeteilter Reserve geprüft.

## v6.4.15 – Wageneinsatz nach Tag

- Neuer Admin-Tab **Wageneinsatz** mit frei wählbarem Tag innerhalb der angezeigten Woche.
- Zeigt nur tatsächlich disponierte ROGIS-Wagen des ausgewählten Tages.
- Pro Einsatzabschnitt werden Wagen, Modell, Umlauf, Beginn, Ende, Fahrer, Start-/Zielort und Linien angezeigt.
- Bei Fahrerwechseln erscheint derselbe Wagen mit getrennten Zeitabschnitten und den jeweiligen Fahrern.
- Azubi-Begleitfahrten werden nicht als eigener Fahrer des Fahrzeugs doppelt gezählt.
- TL-/GR-Leistungen mit **Wagen manuell nachtragen** werden nicht als ROGIS-Wagen in der Übersicht gezählt.
- Kennzahlen zeigen Wagen im Einsatz, einsatzfähige ROGIS-Wagen und an diesem Tag nicht eingesetzte Wagen.
- Keine neue D1-Migration erforderlich.

## v6.4.16
Wageneinsatz zeigt jeden einsatzfähigen ROGIS-Wagen genau einmal. Nicht eingesetzte Wagen bleiben sichtbar; Fahrerwechsel und Umläufe werden je Wagen zusammengefasst.


## v6.4.17

- Wageneinsatz wird jetzt ausschließlich nach Wagennummer sortiert.
- Eingesetzte und nicht eingesetzte Fahrzeuge bleiben gemeinsam in derselben numerischen Reihenfolge; nicht eingesetzte Wagen werden nicht mehr gesammelt ans Tabellenende verschoben.
- Fahrerwechsel und Umläufe bleiben weiterhin je Wagennummer zusammengefasst.
