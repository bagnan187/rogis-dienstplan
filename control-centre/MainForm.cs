using System.Diagnostics;
using System.Net.Sockets;
using System.Text;

namespace ROGIS.ControlCentre;

public sealed class MainForm : Form
{
    readonly TextBox _url=new(){Dock=DockStyle.Fill};
    readonly TextBox _token=new(){Dock=DockStyle.Fill,UseSystemPasswordChar=true,ReadOnly=true,TabStop=false};
    readonly TextBox _omsi=new(){Dock=DockStyle.Fill};
    readonly TextBox _map=new(){Dock=DockStyle.Fill};
    readonly TextBox _openOmsi=new(){Dock=DockStyle.Fill};
    readonly DateTimePicker _date=new(){Format=DateTimePickerFormat.Short};
    readonly Label _status=new(){AutoSize=true,Text="Bereit"};
    readonly Label _slotStatus=new(){AutoSize=true};
    readonly Label _aiStatus=new(){AutoSize=true};
    readonly Label _depotStatus=new(){AutoSize=true};
    readonly Label _liveAiStatus=new(){AutoSize=true,Text="Live KI-Sync: wird gestartet …"};
    readonly CheckBox _liveAi=new(){AutoSize=true,Text="Live KI-Sync automatisch"};
    readonly DataGridView _grid=new(){Dock=DockStyle.Fill,ReadOnly=true,AllowUserToAddRows=false,AutoSizeColumnsMode=DataGridViewAutoSizeColumnsMode.Fill};
    readonly TextBox _log=new(){Dock=DockStyle.Fill,Multiline=true,ScrollBars=ScrollBars.Vertical,ReadOnly=true};
    AppConfig _cfg;
    UdpClient? _udp;
    CancellationTokenSource? _udpCts;
    readonly System.Windows.Forms.Timer _liveAiTimer=new();
    bool _liveAiBusy;
    string? _lastLiveAiSignature;
    string? _lastLiveAiError;

    public MainForm()
    {
        Text="ROGIS Control Centre v6.4.57";
        Width=1250;Height=820;StartPosition=FormStartPosition.CenterScreen;
        _cfg=AppConfig.Load();
        BuildUi();
        LoadConfigToUi();
        _liveAiTimer.Interval=Math.Max(3,_cfg.LiveAiSyncSeconds)*1000;
        _liveAiTimer.Tick+=async(_,__)=>await LiveAiTickAsync();
        _liveAi.CheckedChanged+=async(_,__)=>
        {
            _cfg.LiveAiSyncEnabled=_liveAi.Checked;
            _cfg.Save();
            if(_liveAi.Checked)
            {
                _liveAiStatus.Text="Live KI-Sync: aktiv · prüfe Plan …";
                await LiveAiTickAsync(true);
            }
            else _liveAiStatus.Text="Live KI-Sync: aus";
        };
        _date.ValueChanged+=async(_,__)=>
        {
            _lastLiveAiSignature=null;
            if(_liveAi.Checked)await LiveAiTickAsync(true);
        };
        Shown+=(_,__)=>{StartPluginListener();StartLiveAiSync();_=StartupRefreshAsync();};
        FormClosed+=(_,__)=>{try{_liveAiTimer.Stop();_udpCts?.Cancel();_udp?.Dispose();}catch{}};
    }

    void BuildUi()
    {
        var root=new TableLayoutPanel{Dock=DockStyle.Fill,ColumnCount=1,RowCount=4,Padding=new Padding(12)};
        root.RowStyles.Add(new RowStyle(SizeType.AutoSize));
        root.RowStyles.Add(new RowStyle(SizeType.AutoSize));
        root.RowStyles.Add(new RowStyle(SizeType.Percent,65));
        root.RowStyles.Add(new RowStyle(SizeType.Percent,35));

        var cfgBox=new GroupBox{Text="Verbindung / OMSI",Dock=DockStyle.Top,AutoSize=true};
        var cfgGrid=new TableLayoutPanel{Dock=DockStyle.Fill,ColumnCount=4,AutoSize=true};
        cfgGrid.ColumnStyles.Add(new ColumnStyle(SizeType.AutoSize));
        cfgGrid.ColumnStyles.Add(new ColumnStyle(SizeType.Percent,50));
        cfgGrid.ColumnStyles.Add(new ColumnStyle(SizeType.AutoSize));
        cfgGrid.ColumnStyles.Add(new ColumnStyle(SizeType.Percent,50));
        AddField(cfgGrid,0,"Dienstplan-URL",_url,"Depot-Verbindungsschlüssel (automatisch)",_token);
        AddField(cfgGrid,1,"OMSI-Root",_omsi,"Map-Ordner",_map);
        AddField(cfgGrid,2,"openOMSI.exe",_openOmsi,"Betriebstag",_date);

        var buttons=new FlowLayoutPanel{Dock=DockStyle.Fill,AutoSize=true};
        buttons.Controls.Add(Button("Einstellungen speichern",(_,__)=>SaveConfig()));
        buttons.Controls.Add(Button("Status aktualisieren",async(_,__)=>await Safe(RefreshOnlyAsync)));
        buttons.Controls.Add(_liveAi);
        buttons.Controls.Add(Button("KI + Hof-Sync (FPS-schonend)",async(_,__)=>await Safe(SyncAndWriteAsync)));
        buttons.Controls.Add(Button("Synchronisieren + openOMSI starten",async(_,__)=>await Safe(LaunchAsync)));
        cfgGrid.Controls.Add(buttons,0,3);cfgGrid.SetColumnSpan(buttons,4);
        cfgBox.Controls.Add(cfgGrid);

        var statusBox=new GroupBox{Text="Planstatus",Dock=DockStyle.Top,AutoSize=true};
        var statusFlow=new FlowLayoutPanel{Dock=DockStyle.Fill,AutoSize=true,FlowDirection=FlowDirection.TopDown,WrapContents=false};
        statusFlow.Controls.Add(_status);statusFlow.Controls.Add(_slotStatus);statusFlow.Controls.Add(_aiStatus);statusFlow.Controls.Add(_liveAiStatus);statusFlow.Controls.Add(_depotStatus);
        statusBox.Controls.Add(statusFlow);

        _grid.Columns.Add("vehicle","Wagen");
        _grid.Columns.Add("used","Status");
        _grid.Columns.Add("start","Abholen");
        _grid.Columns.Add("time","Einsatz");
        _grid.Columns.Add("end","Zurückbringen");
        _grid.Columns.Add("model","Modell");

        root.Controls.Add(cfgBox,0,0);
        root.Controls.Add(statusBox,0,1);
        root.Controls.Add(_grid,0,2);
        root.Controls.Add(_log,0,3);
        Controls.Add(root);
    }

    static void AddField(TableLayoutPanel p,int row,string l1,Control c1,string l2,Control c2)
    {
        while(p.RowCount<=row)p.RowCount++;
        p.Controls.Add(new Label{Text=l1,AutoSize=true,Anchor=AnchorStyles.Left},0,row);
        p.Controls.Add(c1,1,row);
        p.Controls.Add(new Label{Text=l2,AutoSize=true,Anchor=AnchorStyles.Left},2,row);
        p.Controls.Add(c2,3,row);
    }

    static Button Button(string text,EventHandler click)
    {
        var b=new Button{Text=text,AutoSize=true,Padding=new Padding(8,4,8,4)};
        b.Click+=click;return b;
    }

    void LoadConfigToUi()
    {
        _url.Text=_cfg.DienstplanBaseUrl;_token.Text=_cfg.DepotSyncToken;_omsi.Text=_cfg.OmsiRoot;
        _map.Text=_cfg.MapFolder;_openOmsi.Text=_cfg.OpenOmsiExe;_date.Value=DateTime.Today;
        _liveAi.Checked=_cfg.LiveAiSyncEnabled;
    }

    void SaveConfig()
    {
        _cfg.DienstplanBaseUrl=_url.Text.Trim();
        _cfg.EnsureDepotCredentials();
        _token.Text=_cfg.DepotSyncToken;
        _cfg.OmsiRoot=_omsi.Text.Trim();
        _cfg.MapFolder=_map.Text.Trim();
        _cfg.OpenOmsiExe=_openOmsi.Text.Trim();
        _cfg.LiveAiSyncEnabled=_liveAi.Checked;
        _cfg.Save();
        Log("Einstellungen gespeichert.");
    }

    string MapDir()=>Path.Combine(_cfg.OmsiRoot,"maps",_cfg.MapFolder);

    void StartLiveAiSync()
    {
        _liveAiTimer.Start();
        _liveAiStatus.Text=_liveAi.Checked?"Live KI-Sync: aktiv · prüft alle "+Math.Max(3,_cfg.LiveAiSyncSeconds)+" s":"Live KI-Sync: aus";
        if(_liveAi.Checked)_=LiveAiTickAsync(true);
    }

    static string AiSignature(AiDay ai) =>
        ai.date+"|"+ai.planVersion+"|"+string.Join(";",(ai.assignments??Array.Empty<AiAssignment>())
            .OrderBy(x=>x.tour,StringComparer.OrdinalIgnoreCase)
            .Select(x=>x.tour+"="+x.vehicleNumber));

    async Task LiveAiTickAsync(bool force=false)
    {
        if(!_liveAi.Checked||_liveAiBusy||IsDisposed||UseWaitCursor)return;
        _liveAiBusy=true;
        try
        {
            using var api=new DienstplanApi(_cfg);
            var ai=await api.GetAiDayAsync(_date.Value.Date);
            var sig=AiSignature(ai);
            var path=Path.Combine(MapDir(),"car_use",$"000_ROGIS_Dienstplan_{ai.date.Replace("-","")}.ocu");
            if(force||!string.Equals(sig,_lastLiveAiSignature,StringComparison.Ordinal)||!File.Exists(path))
            {
                var ocu=OcuGenerator.Write(_cfg,ai,Log);
                _lastLiveAiSignature=sig;
                _lastLiveAiError=null;
                _liveAiStatus.Text=$"Live KI-Sync: aktiv · Plan {ai.planVersion} · {ai.assignmentCount} Umläufe";
                Log($"Live KI-Sync: Planversion {ai.planVersion} übernommen · {ai.assignmentCount} Wagen/Umläufe · {ocu}");
            }
            else
            {
                _liveAiStatus.Text=$"Live KI-Sync: aktuell · Plan {ai.planVersion} · {ai.assignmentCount} Umläufe";
                _lastLiveAiError=null;
            }
        }
        catch(Exception ex)
        {
            _liveAiStatus.Text="Live KI-Sync: Fehler · "+ex.Message;
            if(!string.Equals(_lastLiveAiError,ex.Message,StringComparison.Ordinal))
            {
                Log("Live KI-Sync FEHLER: "+ex.Message);
                _lastLiveAiError=ex.Message;
            }
        }
        finally{_liveAiBusy=false;}
    }

    async Task StartupRefreshAsync()
    {
        try
        {
            await RefreshOnlyAsync();
        }
        catch(Exception ex)
        {
            _status.Text="Bereit · Hofbelegung bei Bedarf mit „KI + Hofbelegung schreiben“ synchronisieren.";
            Log("Startstatus noch nicht vollständig verfügbar: "+ex.Message);
        }
    }

    async Task RefreshOnlyAsync()
    {
        SaveConfig();
        using var api=new DienstplanApi(_cfg);
        var date=_date.Value.Date;
        var aiTask=api.GetAiDayAsync(date);
        var depotTask=api.GetDepotDayAsync(date);
        await Task.WhenAll(aiTask,depotTask);
        Render(await aiTask,await depotTask,null);
    }

    async Task SyncAndWriteAsync()
    {
        SaveConfig();
        await Task.Run(()=>AssetInstaller.Install(_cfg,Log));
        var mapDir=MapDir();
        _status.Text="Lese DepotSlots aus der Karte …";
        var slots=await Task.Run(()=>OmsiSlotScanner.Scan(mapDir,Log));
        if(slots.Count==0)throw new InvalidOperationException("Keine beschrifteten ROGIS-DepotSlot-Objekte gefunden.");

        using var api=new DienstplanApi(_cfg);
        var date=_date.Value.Date;
        _status.Text=$"Synchronisiere {slots.Count} DepotSlots …";
        var sync=await api.SyncSlotsAsync(slots,date);
        var localTypes=slots.GroupBy(x=>x.slotType).OrderBy(x=>x.Key).Select(g=>$"{g.Key}: {g.Count()}");
        Log($"{sync.slotCount} Stellplätze an den Dienstplan synchronisiert · "+string.Join(" · ",localTypes));
        if(!string.IsNullOrWhiteSpace(sync.planningWarning))
            Log("HOFPLANUNG WARNUNG: "+sync.planningWarning);

        var depot=await api.GetDepotDayAsync(date);
        var ai=await api.GetAiDayAsync(date);

        if(!depot.depotAssignmentsFixed&&!depot.previewMode)
            throw new InvalidOperationException("Die Website hat noch keine feste Stellplatzplanung gespeichert.");
        if(depot.previewMode)
            Log("TESTMODUS/Teilbelegung: Die Website hat noch keine vollständige Hofzuordnung gespeichert. Falls 401 Slots erkannt wurden, bitte die HOFPLANUNG-WARNUNG direkt darüber beachten.");
        if(depot.slotConflicts is {Length:>0})
            throw new InvalidOperationException("Stellplatzkonflikt: "+string.Join(", ",depot.slotConflicts.Select(x=>x.slotId).Distinct()));
        if(depot.missingVehicleAssignments is {Length:>0})
            Log($"WARNUNG: {depot.missingVehicleAssignments.Length} Wagen haben in dieser Planversion keinen gespeicherten Stellplatz.");
        var assigned=(depot.vehicles??Array.Empty<DepotVehicle>()).Count(v=>!string.IsNullOrWhiteSpace(v.startSlot));
        Log($"Hofplanung: {depot.vehicles?.Length??0} Wagen im Tagespayload · {assigned} mit Startstellplatz · {depot.slotCount} aktive Slots.");

        var ocu=OcuGenerator.Write(_cfg,ai,Log);
        _lastLiveAiSignature=AiSignature(ai);
        _liveAiStatus.Text=$"Live KI-Sync: aktuell · Plan {ai.planVersion} · {ai.assignmentCount} Umläufe";

        // FPS-Fix: keine vollständigen Busmodelle mehr als statische Map-Objekte vorladen.
        // Vorhandene ROGIS_RT-Blöcke aus älteren Versionen werden einmalig entfernt.
        // DepotSlot-Objekte (.sco/.o3d) und alle anderen Map-Inhalte bleiben unangetastet.
        _status.Text="Entferne alte ROGIS-Live-Hof-Objekte …";
        var removed=await Task.Run(()=>StaticRuntime.CleanupOnly(mapDir));
        Log($"KI-Datei geschrieben: {ocu}");
        Log(removed>0
            ? $"FPS-Fix: {removed} alte ROGIS_RT-Businstanz(en) aus den Map-Tiles entfernt. Es werden keine neuen statischen Busmodelle mehr vorgeladen."
            : "FPS-Fix aktiv: keine ROGIS_RT-Businstanzen in den Map-Tiles vorhanden.");
        Log("Hof-Slots bleiben vollständig erhalten; vorhandene DepotSlot-.sco/.o3d werden nicht überschrieben.");
        Render(ai,depot,slots);
    }

    async Task LaunchAsync()
    {
        await SyncAndWriteAsync();
        var exe=_cfg.OpenOmsiExe;
        if(string.IsNullOrWhiteSpace(exe))
        {
            var candidates=new[]{
                Path.Combine(_cfg.OmsiRoot,"openomsi.exe"),
                Path.Combine(Directory.GetParent(_cfg.OmsiRoot)?.FullName??"","openOMSI","openomsi.exe")
            };
            exe=candidates.FirstOrDefault(File.Exists)??"";
        }
        if(string.IsNullOrWhiteSpace(exe)||!File.Exists(exe))
            throw new FileNotFoundException("openOMSI.exe nicht gefunden. Bitte in den Einstellungen eintragen.",exe);
        Process.Start(new ProcessStartInfo(exe){UseShellExecute=true,WorkingDirectory=Path.GetDirectoryName(exe)!});
        Log("openOMSI gestartet. KI und Hof-Slot-Zuordnung sind synchronisiert; schwere statische Live-Hof-Busobjekte bleiben deaktiviert, damit der Betriebshof nicht die FPS einbrechen lässt.");
    }

    void Render(AiDay ai,DepotDay depot,IReadOnlyList<DepotSlot>? slots)
    {
        _status.Text=$"Dienstplan {depot.date} · Planversion {depot.planVersion} · {(depot.previewMode?"TESTMODUS · Teilbelegung":depot.depotAssignmentsFixed?"Stellplätze FEST GESPEICHERT":"Stellplätze noch nicht fest gespeichert")}";
        _slotStatus.Text=$"Slots: {depot.slotCount}"+(slots is null?"":$" · lokal erkannt: {slots.Count}");
        _aiStatus.Text=$"KI-Umläufe: {ai.assignmentCount} · TTData: {ai.timetableLine}";
        _depotStatus.Text=(depot.slotConflicts?.Length??0)==0
            ? "Stellplatzprüfung: keine Doppelbelegung"
            : $"ACHTUNG: {depot.slotConflicts!.Length} Stellplatzkonflikt(e)";

        _grid.Rows.Clear();
        foreach(var v in depot.vehicles.OrderBy(x=>x.vehicleNumber??999999))
        {
            _grid.Rows.Add(v.vehicleNumber?.ToString()??v.vehicle??"—",v.used?"im Einsatz":"auf Hof",
                Place(v.startDepot,v.startSlot),
                v.used?$"{v.startTime}–{v.endTime}":"—",
                Place(v.endDepot,v.endSlot),v.model??"");
        }
    }

    static string Place(string? depot,string? slot)
    {
        var shortDepot=depot?.Replace("Betriebshof ","")??"";
        return string.IsNullOrWhiteSpace(slot)?(shortDepot.Length>0?shortDepot+" · kein Slot":"—"):$"{shortDepot} · {slot}";
    }

    async Task Safe(Func<Task> action)
    {
        try
        {
            UseWaitCursor=true;_status.Text="Arbeite …";
            await action();
        }
        catch(Exception ex)
        {
            Log("FEHLER: "+ex.Message);
            _status.Text="Fehler: "+ex.Message;
            MessageBox.Show(this,ex.Message,"ROGIS Control Centre",MessageBoxButtons.OK,MessageBoxIcon.Error);
        }
        finally{UseWaitCursor=false;}
    }

    void Log(string s)
    {
        if(InvokeRequired){BeginInvoke(()=>Log(s));return;}
        _log.AppendText($"[{DateTime.Now:HH:mm:ss}] {s}{Environment.NewLine}");
    }

    void StartPluginListener()
    {
        try
        {
            _udpCts?.Cancel();_udp?.Dispose();
            _udpCts=new CancellationTokenSource();
            _udp=new UdpClient(_cfg.DepotPluginPort);
            _=Task.Run(async()=>{
                while(!_udpCts.IsCancellationRequested)
                {
                    try
                    {
                        var r=await _udp.ReceiveAsync(_udpCts.Token);
                        var msg=Encoding.UTF8.GetString(r.Buffer);
                        Log("openOMSI Plugin: "+msg);
                    }
                    catch(OperationCanceledException){break;}
                    catch(ObjectDisposedException){break;}
                    catch(Exception ex){Log("Plugin-UDP: "+ex.Message);await Task.Delay(1000);}
                }
            });
            Log($"openOMSI Depot-Plugin verbunden: UDP {_cfg.DepotPluginPort}.");
        }
        catch(Exception ex){Log("Plugin-Listener konnte nicht gestartet werden: "+ex.Message);}
    }

}
