# TTData-basierte Ablöse- und Pausenlogik (v5.9)

Grundlage ist der vom Betreiber bereitgestellte OMSI-Ordner `TTData`. Eine Pause wird nicht in einen weiterfahrenden Umlauf hineinerfunden.

## Ablöseorte

Fahrerablösungen werden nur an betrieblich sinnvollen Hotspots vorgesehen. Der aktuelle feste Hotspot-Pool umfasst insbesondere:

- Fachhochschule
- Botanischer Garten
- Nordbahnhof
- Laupendahl Hauptbahnhof / Hbf/ZOB
- S-Bahn-Stationen wie Oesdorf S, Germaniaviertel S und Spryndorf S

Ein TTData-Schnitt wird nur gesetzt, wenn die ankommende Fahrt und die folgende Fahrt am selben Hotspot anschließen. Wenn in einem sinnvollen Zeitfenster kein Hotspot vorhanden ist, bleibt der Fahrer lieber länger auf dem Umlauf, statt an einer abgelegenen Endstelle künstlich abgelöst zu werden.

## Zwei Umläufe in einem Dienst

Nach dem ersten Fahrblock bleibt der Fahrer am Ablöseort. Die Pause findet dort statt. Ein zweiter Umlauf darf nur übernommen werden, wenn er nach der vorgeschriebenen Pause am **gleichen Ablöseort** beginnt. Ein Wechsel auf einen anderen Stadtteil oder eine andere Endstelle während der Pause wird nicht mehr erzeugt.

Die Generierung zielt auf einen gesamten Dienst von ungefähr 8 Stunden inklusive Pause. Abweichungen sind erlaubt, wenn TTData, persönliche Verfügbarkeit oder Umlaufabdeckung keine passendere Kombination zulassen.

## Betriebshof aus TTData

Der Hof wird aus der ersten Ausrückfahrt des Umlaufs bestimmt:

- `Ausr_...` → Betriebshof Mitte
- `AusrS_...` → Betriebshof Spryndorf
- `AusrH_...` → Betriebshof Hechem

Dadurch ist der Fahrer für diesen Tag dem Hof zugeordnet, von dem sein Umlauf ausrückt. Bei einem Dienst mit mehreren ROGIS-Umläufen werden nur Umläufe desselben Betriebshofs miteinander kombiniert.

## Gegenseitige Ablöseanzeige

Wenn Fahrer A einen Umlauf am Hotspot an Fahrer B übergibt, erhält A den Eintrag „Du wirst von B abgelöst“ und B den Eintrag „Du löst A ab“. Diese Verknüpfung wird nur angelegt, wenn TTData denselben Hotspot bestätigt.

Wenn ein Umlauf endet, ohne dass tatsächlich ein anderer Fahrer übernimmt, wird nicht mehr fälschlich „du wirst abgelöst“ angezeigt, sondern „Umlaufende“.
