using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace ROGIS.ControlCentre;

public sealed class DienstplanApi : IDisposable
{
    readonly HttpClient _http;
    readonly JsonSerializerOptions _json = new() { PropertyNameCaseInsensitive = true };

    public DienstplanApi(AppConfig cfg)
    {
        _http = new HttpClient { BaseAddress = new Uri(cfg.DienstplanBaseUrl.TrimEnd('/') + "/"), Timeout = TimeSpan.FromSeconds(30) };
        if (!string.IsNullOrWhiteSpace(cfg.DepotSyncToken))
            _http.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", cfg.DepotSyncToken);
    }

    public async Task<SlotSyncResult> SyncSlotsAsync(IReadOnlyList<DepotSlot> slots)
    {
        var body = JsonSerializer.Serialize(new { source = "ROGIS Control Centre", slots });
        using var content = new StringContent(body, Encoding.UTF8, "application/json");
        using var res = await _http.PostAsync("api/openomsi/depot-slots", content);
        var text = await res.Content.ReadAsStringAsync();
        if (!res.IsSuccessStatusCode)
        {
            if ((int)res.StatusCode == 401)
                throw new InvalidOperationException("Depot-Sync nicht autorisiert. Bitte Website und Control Centre auf denselben aktuellen Stand bringen; der Token wird danach automatisch gekoppelt. Server: " + text);
            throw new InvalidOperationException($"Slot-Sync HTTP {(int)res.StatusCode}: {text}");
        }
        return JsonSerializer.Deserialize<SlotSyncResult>(text, _json) ?? throw new InvalidOperationException("Ungültige Slot-Sync-Antwort.");
    }

    async Task<T> GetJsonAsync<T>(string relativeUrl,string label)
    {
        using var res=await _http.GetAsync(relativeUrl);
        var text=await res.Content.ReadAsStringAsync();
        if(!res.IsSuccessStatusCode)
        {
            var detail=text;
            try
            {
                using var doc=JsonDocument.Parse(text);
                if(doc.RootElement.TryGetProperty("error",out var e))detail=e.GetString()??text;
            }
            catch { }
            throw new InvalidOperationException($"{label} HTTP {(int)res.StatusCode}: {detail}");
        }
        return JsonSerializer.Deserialize<T>(text,_json) ?? throw new InvalidOperationException($"Ungültige {label}-Antwort.");
    }

    public Task<DepotDay> GetDepotDayAsync(DateTime date) =>
        GetJsonAsync<DepotDay>($"api/openomsi/depot-day?date={date:yyyy-MM-dd}","Depot");

    public Task<AiDay> GetAiDayAsync(DateTime date) =>
        GetJsonAsync<AiDay>($"api/openomsi/day?date={date:yyyy-MM-dd}","KI");

    public void Dispose() => _http.Dispose();
}
