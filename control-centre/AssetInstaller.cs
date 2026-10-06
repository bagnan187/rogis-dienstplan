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
            CopyTree(srcScenery,dstScenery);
            log?.Invoke("ROGIS-DepotSlot-Objekte installiert/aktualisiert.");
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

    static void CopyTree(string source,string target)
    {
        Directory.CreateDirectory(target);
        foreach(var dir in Directory.EnumerateDirectories(source,"*",SearchOption.AllDirectories))
            Directory.CreateDirectory(Path.Combine(target,Path.GetRelativePath(source,dir)));
        foreach(var file in Directory.EnumerateFiles(source,"*",SearchOption.AllDirectories))
        {
            var dst=Path.Combine(target,Path.GetRelativePath(source,file));
            Directory.CreateDirectory(Path.GetDirectoryName(dst)!);
            File.Copy(file,dst,true);
        }
    }
}
