using System.Text.Json;
using System.Text.Json.Serialization;
using NAudio.CoreAudioApi;

const string Version = "0.1.1";

try
{
    var argsList = args.Select(a => a.Trim()).Where(a => !string.IsNullOrWhiteSpace(a)).ToArray();
    var command = argsList.Length > 0 ? argsList[0].ToLowerInvariant() : "help";
    var json = argsList.Any(a => a.Equals("--json", StringComparison.OrdinalIgnoreCase));

    switch (command)
    {
        case "version":
            WriteJsonOrText(json, new HelperVersion("AudioDeviceHelper", Version, Environment.OSVersion.ToString()), $"AudioDeviceHelper {Version}");
            return 0;

        case "devices":
            var devices = ListRenderDevices();
            WriteJson(new DevicesResponse(true, "AudioDeviceHelper", Version, devices));
            return 0;

        case "help":
        case "--help":
        case "-h":
            WriteHelp();
            return 0;

        default:
            WriteError($"Unbekannter Befehl: {command}");
            WriteHelp();
            return 2;
    }
}
catch (Exception ex)
{
    WriteJson(new ErrorResponse(false, "AudioDeviceHelper", Version, "helper_failed", ex.Message));
    return 1;
}

static List<AudioDeviceInfo> ListRenderDevices()
{
    using var enumerator = new MMDeviceEnumerator();
    var defaultId = "";

    try
    {
        defaultId = enumerator.GetDefaultAudioEndpoint(DataFlow.Render, Role.Multimedia)?.ID ?? "";
    }
    catch
    {
        defaultId = "";
    }

    var result = new List<AudioDeviceInfo>
    {
        new(
            Id: "default",
            Name: "Windows Standardgerät",
            Type: "output",
            State: "Virtual",
            IsDefault: true,
            DeviceFriendlyName: "Windows Standardgerät",
            InterfaceFriendlyName: "Default"
        )
    };

    var devices = enumerator.EnumerateAudioEndPoints(DataFlow.Render, DeviceState.Active);
    foreach (var device in devices)
    {
        var isDefault = !string.IsNullOrWhiteSpace(defaultId) && string.Equals(device.ID, defaultId, StringComparison.OrdinalIgnoreCase);
        result.Add(new AudioDeviceInfo(
            Id: device.ID,
            Name: SafeName(device.FriendlyName),
            Type: "output",
            State: device.State.ToString(),
            IsDefault: isDefault,
            DeviceFriendlyName: SafeName(device.DeviceFriendlyName),
            InterfaceFriendlyName: SafeName(device.AudioEndpointVolume?.HardwareSupport.ToString() ?? "")
        ));
    }

    return result;
}

static string SafeName(string? value)
{
    return string.IsNullOrWhiteSpace(value) ? "Unbekanntes Audiogerät" : value.Trim();
}

static void WriteHelp()
{
    Console.WriteLine("AudioDeviceHelper " + Version);
    Console.WriteLine();
    Console.WriteLine("Befehle:");
    Console.WriteLine("  version --json");
    Console.WriteLine("  devices --json");
    Console.WriteLine();
    Console.WriteLine("Hinweis: STEP 3A listet nur Geräte. Playback folgt in STEP 3B/3C.");
}

static void WriteError(string message)
{
    Console.Error.WriteLine(message);
}

static void WriteJson<T>(T value)
{
    var options = new JsonSerializerOptions
    {
        WriteIndented = false,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
    };
    Console.OutputEncoding = System.Text.Encoding.UTF8;
    Console.WriteLine(JsonSerializer.Serialize(value, options));
}

static void WriteJsonOrText<T>(bool json, T value, string text)
{
    if (json) WriteJson(value);
    else Console.WriteLine(text);
}

public sealed record HelperVersion(string Module, string Version, string OS);

public sealed record AudioDeviceInfo(
    string Id,
    string Name,
    string Type,
    string State,
    bool IsDefault,
    string DeviceFriendlyName,
    string InterfaceFriendlyName
);

public sealed record DevicesResponse(
    bool Ok,
    string Module,
    string Version,
    List<AudioDeviceInfo> Devices
);

public sealed record ErrorResponse(
    bool Ok,
    string Module,
    string Version,
    string Error,
    string Message
);
