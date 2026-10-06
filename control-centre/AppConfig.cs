using System.Text.Json;

namespace ROGIS.ControlCentre;

public sealed class AppConfig
{
    public string DienstplanBaseUrl { get; set; } = "https://DEINE-DIENSTPLAN-DOMAIN";
    public string DepotSyncToken { get; set; } = "";
    public string OmsiRoot { get; set; } = @"C:\Program Files (x86)\Steam\steamapps\common\OMSI 2";
    public string MapFolder { get; set; } = "St#U00e4dtedreieck21 V2";
    public string OpenOmsiExe { get; set; } = "";
    public string StaticObjectFolder { get; set; } = @"Sceneryobjects\ROGISstatic";
    public string StaticObjectPattern { get; set; } = "ROGIS_{0}.sco";
    public int DepotPluginPort { get; set; } = 47830;

    public static string ConfigPath => Path.Combine(AppContext.BaseDirectory, "control-centre.json");

    public static AppConfig Load()
    {
        if (!File.Exists(ConfigPath)) return new AppConfig();
        return JsonSerializer.Deserialize<AppConfig>(File.ReadAllText(ConfigPath),
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? new AppConfig();
    }

    public void Save() =>
        File.WriteAllText(ConfigPath, JsonSerializer.Serialize(this, new JsonSerializerOptions { WriteIndented = true }));
}
