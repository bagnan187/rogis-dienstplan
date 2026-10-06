using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;

namespace ROGIS.ControlCentre;

public static class OmsiSlotScanner
{
    static readonly Regex MarkerRx = new(@"ROGIS_DepotSlot_(DS|DG|ES|EG)\.sco$", RegexOptions.IgnoreCase | RegexOptions.Compiled);
    static readonly Regex SlotRx = new(@"^[MSH]\d{3,4}$", RegexOptions.IgnoreCase | RegexOptions.Compiled);

    public static List<DepotSlot> Scan(string mapDir, Action<string>? log = null)
    {
        if (!Directory.Exists(mapDir)) throw new DirectoryNotFoundException(mapDir);
        var result = new List<DepotSlot>();
        foreach (var file in Directory.EnumerateFiles(mapDir, "*.map", SearchOption.TopDirectoryOnly))
        {
            var text = OmsiText.Read(file);
            var lines = text.Replace("\r\n", "\n").Replace('\r','\n').Split('\n');
            for (var i = 0; i < lines.Length; i++)
            {
                if (!lines[i].Trim().Equals("[object]", StringComparison.OrdinalIgnoreCase) || i + 11 >= lines.Length) continue;
                var objectPath = lines[i + 2].Trim();
                var mm = MarkerRx.Match(objectPath.Replace('/', '\\'));
                if (!mm.Success) continue;

                if (!TryNum(lines[i + 4], out var x) || !TryNum(lines[i + 5], out var y) ||
                    !TryNum(lines[i + 6], out var z) || !TryNum(lines[i + 7], out var heading)) continue;

                var label = "";
                // OMSI speichert an dieser Stelle die Anzahl der Stringvariablen,
                // nicht ein Bit-Flag. Bei unseren DepotSlots ist das normalerweise 1
                // und direkt danach folgt z. B. M001. Zur Sicherheit durchsuchen wir
                // alle deklarierten Stringwerte sowie als Fallback den kompletten
                // Objektblock bis zur nächsten Sektion.
                var blockEnd=i+1;
                while(blockEnd<lines.Length && (blockEnd==i+1 || !lines[blockEnd].TrimStart().StartsWith("[")))
                    blockEnd++;

                if (int.TryParse(lines[i + 10].Trim(), out var stringCount) && stringCount > 0)
                {
                    for (var k=0; k<stringCount && i+11+k<blockEnd; k++)
                    {
                        var candidate=lines[i+11+k].Trim().ToUpperInvariant();
                        if (SlotRx.IsMatch(candidate)) { label=candidate; break; }
                    }
                }

                if (string.IsNullOrEmpty(label))
                {
                    for(var k=i+11;k<blockEnd;k++)
                    {
                        var candidate=lines[k].Trim().ToUpperInvariant();
                        if(SlotRx.IsMatch(candidate)){label=candidate;break;}
                    }
                }

                if (!SlotRx.IsMatch(label))
                {
                    log?.Invoke($"Slot ohne gültige Beschriftung ignoriert: {Path.GetFileName(file)} @ {x:0.0}/{y:0.0}. Erwartet M001/S001/H001.");
                    continue;
                }

                var depot = label[0] switch
                {
                    'S' => "Betriebshof Spryndorf",
                    'H' => "Betriebshof Hechem",
                    _ => "Betriebshof Mitte"
                };
                result.Add(new DepotSlot(label,depot,mm.Groups[1].Value.ToUpperInvariant(),
                    Path.GetFileNameWithoutExtension(file),lines[i + 3].Trim(),file,x,y,z,heading));
            }
        }

        var dup = result.GroupBy(s=>s.slotId,StringComparer.OrdinalIgnoreCase).Where(g=>g.Count()>1).Select(g=>g.Key).ToArray();
        if (dup.Length > 0) throw new InvalidOperationException("Doppelte Stellplatznummer(n): "+string.Join(", ",dup));
        return result.OrderBy(s=>s.slotId,StringComparer.OrdinalIgnoreCase).ToList();
    }

    static bool TryNum(string raw,out double value) =>
        double.TryParse(raw.Trim().Replace(',','.'),NumberStyles.Float,CultureInfo.InvariantCulture,out value);
}

public static class OmsiText
{
    public static string Read(string path)
    {
        var b=File.ReadAllBytes(path);
        if(b.Length>=2&&b[0]==0xFF&&b[1]==0xFE)return Encoding.Unicode.GetString(b);
        if(b.Length>=2&&b[0]==0xFE&&b[1]==0xFF)return Encoding.BigEndianUnicode.GetString(b);
        return Encoding.UTF8.GetString(b);
    }

    public static void WriteLikeOriginal(string path,string text)
    {
        var b=File.ReadAllBytes(path);
        var enc=b.Length>=2&&b[0]==0xFF&&b[1]==0xFE?Encoding.Unicode:new UTF8Encoding(false);
        File.WriteAllText(path,text,enc);
    }
}
