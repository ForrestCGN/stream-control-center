using System.Text.Json;
using System.Text.Json.Serialization;
using NAudio.CoreAudioApi;
using NAudio.Wave;

const string Version = "0.2.0";

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

        case "play":
            var playResult = PlayFile(argsList);
            WriteJson(playResult);
            return playResult.Ok ? 0 : 3;

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

static Dictionary<string, string> ParseOptions(string[] argsList)
{
    var result = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);

    for (var i = 1; i < argsList.Length; i++)
    {
        var key = argsList[i];
        if (!key.StartsWith("--", StringComparison.Ordinal)) continue;
        var cleanKey = key[2..];
        var value = "true";
        if (i + 1 < argsList.Length && !argsList[i + 1].StartsWith("--", StringComparison.Ordinal))
        {
            value = argsList[i + 1];
            i++;
        }
        result[cleanKey] = value;
    }

    return result;
}

static PlayResponse PlayFile(string[] argsList)
{
    var options = ParseOptions(argsList);
    var file = options.TryGetValue("file", out var fileValue) ? fileValue : "";
    var device = options.TryGetValue("device", out var deviceValue) ? deviceValue : "default";
    var volume = options.TryGetValue("volume", out var volumeValue) ? ClampInt(volumeValue, 80, 0, 100) : 80;

    if (string.IsNullOrWhiteSpace(file))
    {
        return new PlayResponse(false, "AudioDeviceHelper", Version, "file_missing", "Parameter --file fehlt.", file, device, volume, 0);
    }

    var fullPath = Path.GetFullPath(file);
    if (!File.Exists(fullPath))
    {
        return new PlayResponse(false, "AudioDeviceHelper", Version, "file_not_found", $"Datei nicht gefunden: {fullPath}", fullPath, device, volume, 0);
    }

    if (!string.Equals(device, "default", StringComparison.OrdinalIgnoreCase))
    {
        return new PlayResponse(false, "AudioDeviceHelper", Version, "device_playback_not_implemented", "STEP 3B unterstützt nur --device default. Geräteauswahl folgt in STEP 3C.", fullPath, device, volume, 0);
    }

    using var reader = new AudioFileReader(fullPath)
    {
        Volume = Math.Clamp(volume / 100f, 0f, 1f)
    };

    using var output = new WaveOutEvent
    {
        DeviceNumber = -1,
        DesiredLatency = 100
    };

    var done = new ManualResetEventSlim(false);
    output.PlaybackStopped += (_, _) => done.Set();
    output.Init(reader);
    output.Play();

    var timeoutMs = Math.Max(1000, (int)Math.Ceiling(reader.TotalTime.TotalMilliseconds) + 2500);
    done.Wait(timeoutMs);

    if (output.PlaybackState != PlaybackState.Stopped)
    {
        output.Stop();
    }

    return new PlayResponse(true, "AudioDeviceHelper", Version, "", "Playback beendet.", fullPath, device, volume, (int)Math.Round(reader.TotalTime.TotalMilliseconds));
}

static int ClampInt(string value, int fallback, int min, int max)
{
    return int.TryParse(value, out var parsed) ? Math.Max(min, Math.Min(max, parsed)) : fallback;
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
    Console.WriteLine("  play --file \"D:\\Pfad\\sound.wav\" --device default --volume 80");
    Console.WriteLine();
    Console.WriteLine("Hinweis: STEP 3B spielt nur auf dem Windows-Standardgerät. Geräteauswahl folgt in STEP 3C.");
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

public sealed record PlayResponse(
    bool Ok,
    string Module,
    string Version,
    string Error,
    string Message,
    string File,
    string Device,
    int Volume,
    int DurationMs
);

public sealed record ErrorResponse(
    bool Ok,
    string Module,
    string Version,
    string Error,
    string Message
);
