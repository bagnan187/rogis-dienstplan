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
        if (!res.IsSuccessStatusCode) throw new InvalidOperationException($"Slot-Sync HTTP {(int)res.StatusCode}: {text}");
        return JsonSerializer.Deserialize<SlotSyncResult>(text, _json) ?? throw new InvalidOperationException("Ungültige Slot-Sync-Antwort.");
    }

    public async Task<DepotDay> GetDepotDayAsync(DateTime date)
    {
        var text = await _http.GetStringAsync($"api/openomsi/depot-day?date={date:yyyy-MM-dd}");
        return JsonSerializer.Deserialize<DepotDay>(text, _json) ?? throw new InvalidOperationException("Ungültige Depot-Antwort.");
    }

    public async Task<AiDay> GetAiDayAsync(DateTime date)
    {
        var text = await _http.GetStringAsync($"api/openomsi/day?date={date:yyyy-MM-dd}");
        return JsonSerializer.Deserialize<AiDay>(text, _json) ?? throw new InvalidOperationException("Ungültige KI-Antwort.");
    }

    public void Dispose() => _http.Dispose();
}
