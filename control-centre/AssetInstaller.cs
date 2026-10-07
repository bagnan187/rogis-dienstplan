namespace ROGIS.ControlCentre;

public static class AssetInstaller
{
    public static void Install(AppConfig cfg, Action<string>? log=null)
    {
        var srcRoot=Path.Combine(AppContext.BaseDirectory,"omsi");
        if(!Directory.Exists(srcRoot)){log?.Invoke("OMSI-Zusatzdateien sind im Programmordner nicht enthalten.");return;}

        var srcScenery=Path.Combine(srcRoot,"Sceneryobjects","ROGIS_DepotSlots");
        var dstScenery=Path.Combine(cfg.OmsiRoot,"Sceneryobjects","ROGIS_DepotSlots");
        if(Directory.Exists(srcScenery))
        {
            var copied=CopyTreeMissingOnly(srcScenery,dstScenery);
            log?.Invoke(copied>0
                ? $"ROGIS-DepotSlots: {copied} fehlende Datei(en) ergänzt. Vorhandene .sco/.o3d und sonstige Slot-Dateien wurden NICHT überschrieben."
                : "ROGIS-DepotSlots: vorhandener Stand bleibt unverändert; keine Datei überschrieben.");
        }

        var lua=Path.Combine(srcRoot,"plugins","ROGIS_DepotSync.lua");
        if(File.Exists(lua)&&!string.IsNullOrWhiteSpace(cfg.OpenOmsiExe))
        {
            var openRoot=Path.GetDirectoryName(cfg.OpenOmsiExe);
            if(!string.IsNullOrWhiteSpace(openRoot))
            {
                var plugins=Path.Combine(openRoot,"Plugins");
                Directory.CreateDirectory(plugins);
                File.Copy(lua,Path.Combine(plugins,"ROGIS_DepotSync.lua"),true);
                log?.Invoke("ROGIS_DepotSync.lua im openOMSI-Plugins-Ordner installiert/aktualisiert.");
            }
        }
    }

    static int CopyTreeMissingOnly(string source,string target)
    {
        Directory.CreateDirectory(target);
        foreach(var dir in Directory.EnumerateDirectories(source,"*",SearchOption.AllDirectories))
            Directory.CreateDirectory(Path.Combine(target,Path.GetRelativePath(source,dir)));
        var copied=0;
        foreach(var file in Directory.EnumerateFiles(source,"*",SearchOption.AllDirectories))
        {
            var dst=Path.Combine(target,Path.GetRelativePath(source,file));
            Directory.CreateDirectory(Path.GetDirectoryName(dst)!);
            if(File.Exists(dst))continue;
            File.Copy(file,dst,false);
            copied++;
        }
        return copied;
    }
}
