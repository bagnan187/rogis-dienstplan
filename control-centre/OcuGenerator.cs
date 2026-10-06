using System.Text;

namespace ROGIS.ControlCentre;

public static class OcuGenerator
{
    public static string Write(AppConfig cfg, AiDay day, Action<string>? log=null)
    {
        var mapDir=Path.Combine(cfg.OmsiRoot,"maps",cfg.MapFolder);
        var carUse=Path.Combine(mapDir,"car_use");
        Directory.CreateDirectory(carUse);

        var aiList=Path.Combine(mapDir,"ailists.cfg");
        var aiText=File.Exists(aiList)?OmsiText.Read(aiList):"";
        if(!File.Exists(aiList)) log?.Invoke("WARNUNG: ailists.cfg nicht gefunden; Wagennummern können nicht gegengeprüft werden.");

        foreach(var a in day.assignments)
            if(aiText.Length>0 && !aiText.Contains(a.vehicleNumber,StringComparison.OrdinalIgnoreCase))
                log?.Invoke($"Hinweis: Wagen {a.vehicleNumber} wurde in ailists.cfg nicht direkt gefunden. OCU wird trotzdem geschrieben.");

        var ymd=day.date.Replace("-","");
        var sb=new StringBuilder();
        sb.AppendLine("[valid]").AppendLine(ymd).AppendLine(ymd).AppendLine();
        sb.AppendLine("[line]").AppendLine(day.timetableLine).AppendLine();
        sb.AppendLine("[number_tour]");
        foreach(var a in day.assignments.OrderBy(x=>x.tour,StringComparer.OrdinalIgnoreCase))
            sb.AppendLine($"{a.vehicleNumber}\t{a.tour}");
        sb.AppendLine("[end]");

        var path=Path.Combine(carUse,$"000_ROGIS_Dienstplan_{ymd}.ocu");
        File.WriteAllText(path,sb.ToString(),new UTF8Encoding(false));
        return path;
    }
}
