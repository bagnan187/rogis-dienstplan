using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace ROGIS.ControlCentre;

public sealed class DienstplanApi : IDisposable
{
    readonly HttpClient _http;
    readonly JsonSerializerOptions _json = new() { PropertyNameCaseInsensitive = true };
    readonly AppConfig _cfg;

    public DienstplanApi(AppConfig cfg)
    {
        _cfg = cfg;
        _cfg.EnsureDepotCredentials();
        _http = new HttpClient { BaseAddress = new Uri(cfg.DienstplanBaseUrl.TrimEnd('/') + "/"), Timeout = TimeSpan.FromSeconds(30) };
    }

    public async Task<SlotSyncResult> SyncSlotsAsync(IReadOnlyList<DepotSlot> slots)
    {
        var first = await SyncSlotsAttemptAsync(slots);
        if (first.StatusCode == System.Net.HttpStatusCode.Unauthorized)
        {
            // Selbstheilung: neue lokale Depot-Identität erzeugen und einmal automatisch neu koppeln.
            _cfg.ResetDepotCredentials();
            first.Dispose();
            first = await SyncSlotsAttemptAsync(slots);
        }

        using (first)
        {
            var text = await first.Content.ReadAsStringAsync();
            if (!first.IsSuccessStatusCode)
                throw new InvalidOperationException($"Slot-Sync HTTP {(int)first.StatusCode}: {text}");
            return JsonSerializer.Deserialize<SlotSyncResult>(text, _json) ?? throw new InvalidOperationException("Ungültige Slot-Sync-Antwort.");
        }
    }

    async Task<HttpResponseMessage> SyncSlotsAttemptAsync(IReadOnlyList<DepotSlot> slots)
    {
        _cfg.EnsureDepotCredentials();
        var body = JsonSerializer.Serialize(new { source = "ROGIS Control Centre", slots });
        var req = new HttpRequestMessage(HttpMethod.Post, "api/openomsi/depot-slots");
        req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _cfg.DepotSyncToken);
        req.Headers.TryAddWithoutValidation("X-ROGIS-Depot-Client", _cfg.DepotClientId);
        req.Content = new StringContent(body, Encoding.UTF8, "application/json");
        return await _http.SendAsync(req);
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
