namespace ROGIS.ControlCentre;

public sealed record DepotSlot(string slotId,string depot,string slotType,string tile,string objectId,string mapPath,double? x,double? y,double? z,double? heading);
public sealed record AiAssignment(string tour,string sourceRun,string timetableLine,string vehicleNumber,string vehicleLabel,string vehicleModel,string aiGroup,string[] serviceLines);
public sealed record AiDay(bool ok,string date,string dayType,string timetableLine,int planVersion,int assignmentCount,AiAssignment[] assignments,string? note);
public sealed record SlotReservation(int from,int to,string? vehicle,string? kind);
public sealed record SlotConflict(string slotId,SlotReservation? a,SlotReservation? b);
public sealed record DepotVehicle(string? vehicle,int? vehicleNumber,string? model,bool used,string[]? runs,string? startDepot,string? startSlot,string? endDepot,string? endSlot,string? slotType,string? startTime,string? endTime);
public sealed record DepotDay(bool ok,string date,int planVersion,bool depotAssignmentsFixed,bool previewMode,int[]? missingVehicleAssignments,int slotCount,Dictionary<string,object>? depotOccupancy,Dictionary<string,SlotReservation[]>? slotReservations,SlotConflict[]? slotConflicts,DepotVehicle[] vehicles);
public sealed record SlotSyncResult(bool ok,int slotCount,string? syncedAt,string? source);
