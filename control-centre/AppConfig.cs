using System.Security.Cryptography;
using System.Text.Json;

namespace ROGIS.ControlCentre;

public sealed class AppConfig
{
    public string DienstplanBaseUrl { get; set; } = "https://DEINE-DIENSTPLAN-DOMAIN";
    public string DepotSyncToken { get; set; } = "";
    public string OmsiRoot { get; set; } = @"C:\Program Files (x86)\Steam\steamapps\common\OMSI 2";
    public string MapFolder { get; set; } = "Städtedreieck21 V2";
    public string OpenOmsiExe { get; set; } = "";
    public string StaticObjectFolder { get; set; } = @"Sceneryobjects\ROGISstatic";
    public string StaticObjectPattern { get; set; } = "ROGIS_{0}.sco";
    public int DepotPluginPort { get; set; } = 47830;

    public static string ConfigDirectory => Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "ROGIS", "ControlCentre");
    public static string ConfigPath => Path.Combine(ConfigDirectory, "control-centre.json");
    public static string LegacyConfigPath => Path.Combine(AppContext.BaseDirectory, "control-centre.json");

    public static AppConfig Load()
    {
        AppConfig cfg;
        var source = File.Exists(ConfigPath) ? ConfigPath : (File.Exists(LegacyConfigPath) ? LegacyConfigPath : null);
        if (source is null) cfg = new AppConfig();
        else cfg = JsonSerializer.Deserialize<AppConfig>(File.ReadAllText(source),
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? new AppConfig();
        cfg.EnsureDepotSyncToken();
        // Alte portable Konfiguration einmalig nach LocalAppData übernehmen,
        // damit ein EXE-/ZIP-Update den Depot-Schlüssel nicht mehr austauscht.
        if (source != ConfigPath) cfg.Save();
        return cfg;
    }

    public void EnsureDepotSyncToken()
    {
        if (!string.IsNullOrWhiteSpace(DepotSyncToken)) return;
        DepotSyncToken = "depot-" + Convert.ToHexString(RandomNumberGenerator.GetBytes(32)).ToLowerInvariant();
        Save();
    }

    public void Save()
    {
        Directory.CreateDirectory(ConfigDirectory);
        File.WriteAllText(ConfigPath, JsonSerializer.Serialize(this, new JsonSerializerOptions { WriteIndented = true }));
    }
}
