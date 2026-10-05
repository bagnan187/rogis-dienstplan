# TTData-basierte Ablöse- und Pausenlogik (v5.5)

Grundlage ist der vom Betreiber bereitgestellte OMSI-Ordner `TTData` mit den Tagesfahrplänen `Montag-Freitag.ttl`, `Samstag.ttl` und `Sonn- und Feiertag.ttl` sowie den zugehörigen `.ttp`-Tripdateien.

## Ergebnis der Prüfung

Eine frei erfundene 45-Minuten-Pause "im Umlauf" ist nicht zulässig. Der Bus muss seinen Fahrplan weiterfahren. Eine Pause beim gleichen Umlauf darf nur dann als Pause behandelt werden, wenn zwischen zwei echten Fahrplanfahrten eine ausreichend lange fahrplanmäßige Standzeit vorhanden ist.

Aus den Fahrplandaten ergeben sich nur wenige solche langen Standzeiten:

- Montag-Freitag: 5.592 untersuchte Übergänge; 117 mindestens 30 Minuten, davon nur 33 mindestens 45 Minuten.
- Samstag: 2.749 untersuchte Übergänge; 92 mindestens 30 Minuten, davon nur 1 mindestens 45 Minuten.
- Sonn-/Feiertag: 1.920 untersuchte Übergänge; 108 mindestens 30 Minuten, davon nur 4 mindestens 45 Minuten.

Damit sind echte 45-Minuten-Standpausen im selben Umlauf die Ausnahme und dürfen nicht zufällig erzeugt werden.

## Neue Generationslogik

- Umläufe werden an echten Tripgrenzen aus TTData geteilt.
- Ziel ist eine Fahrerablösung ungefähr nach vier Stunden; die Schnittstelle wird auf eine tatsächlich vorhandene End-/Start-Haltestelle gelegt.
- Ein Fahrer endet am realen Ankunftszeitpunkt seiner letzten Fahrt; der nächste Fahrer übernimmt zur realen Abfahrtszeit der folgenden Fahrt.
- Ein Fahrer darf zwei Blöcke nur dann selbst übernehmen, wenn die echte Zeitlücke die eingestellte Pausenanforderung erfüllt.
- Es werden keine künstlichen Pausen mehr in einen durchfahrenden Umlauf eingefügt.
- Fahrzeug und Umlauf bleiben über die Fahrerablösung erhalten; nur der Fahrer wechselt.
- Alte Haltestellennamen werden anschließend über die ROGIS-Umbenennungskette auf den aktuellen Namen aufgelöst.
- Falls ein Umlauf wider Erwarten nicht in TTData gefunden wird, gibt es einen gekennzeichneten Fallback. Die normalen Tagesfahrpläne aus dem gelieferten TTData sind jedoch vollständig den Dienstplan-Umläufen zugeordnet.

Die Oberfläche kennzeichnet TTData-basierte Fahrdienstblöcke mit `TTData geprüft`.
