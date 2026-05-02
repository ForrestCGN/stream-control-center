using System.Runtime.InteropServices;
using System.Text.Json;
using System.Text.Json.Serialization;
using NAudio.CoreAudioApi;
using NAudio.Wave;

const string Version = "0.4.2";

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
            WriteJson(new DevicesResponse(true, "AudioDeviceHelper", Version, ListRenderDevices()));
            return 0;
        case "probe":
            WriteJson(ProbeDevice(argsList));
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
    WriteJson(new ErrorResponse(false, "AudioDeviceHelper", Version, "helper_failed", ex.Message, HResultHex(ex)));
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

static ProbeResponse ProbeDevice(string[] argsList)
{
    var options = ParseOptions(argsList);
    var deviceId = options.TryGetValue("device", out var deviceValue) ? deviceValue : "default";
    using var enumerator = new MMDeviceEnumerator();
    using var device = ResolveRenderDevice(enumerator, deviceId, true);
    if (device == null)
    {
        return new ProbeResponse(false, "AudioDeviceHelper", Version, "device_not_found", $"Audiogerät nicht gefunden: {deviceId}", deviceId, "", "", false);
    }
    return new ProbeResponse(true, "AudioDeviceHelper", Version, "", "OK", deviceId, SafeName(device.FriendlyName), FormatText(device.AudioClient.MixFormat), true);
}

static PlayResponse PlayFile(string[] argsList)
{
    var options = ParseOptions(argsList);
    var file = options.TryGetValue("file", out var fileValue) ? fileValue : "";
    var deviceId = options.TryGetValue("device", out var deviceValue) ? deviceValue : "default";
    var volume = options.TryGetValue("volume", out var volumeValue) ? ClampInt(volumeValue, 80, 0, 100) : 80;
    var mode = options.TryGetValue("mode", out var modeValue) ? modeValue.Trim().ToLowerInvariant() : "auto";

    if (string.IsNullOrWhiteSpace(file)) return Fail("file_missing", "Parameter --file fehlt.", file, deviceId, "", volume, 0, mode, "");
    var fullPath = Path.GetFullPath(file);
    if (!File.Exists(fullPath)) return Fail("file_not_found", $"Datei nicht gefunden: {fullPath}", fullPath, deviceId, "", volume, 0, mode, "");

    if (mode == "auto")
    {
        if (IsDefaultDevice(deviceId)) return PlayWaveOut(fullPath, deviceId, volume, "waveout");
        var direct = PlayDirectSound(fullPath, deviceId, volume, "directsound");
        if (direct.Ok) return direct;
        var wasapi = PlayWasapi(fullPath, deviceId, volume, false, "wasapi");
        if (wasapi.Ok) return wasapi;
        var resampled = PlayWasapi(fullPath, deviceId, volume, true, "wasapi-resample");
        if (resampled.Ok) return resampled;
        return resampled with { Error = direct.Error + "; " + wasapi.Error + "; " + resampled.Error, Message = direct.Message + " | " + wasapi.Message + " | " + resampled.Message };
    }

    if (mode == "waveout") return PlayWaveOut(fullPath, deviceId, volume, mode);
    if (mode == "directsound") return PlayDirectSound(fullPath, deviceId, volume, mode);
    if (mode == "wasapi") return PlayWasapi(fullPath, deviceId, volume, false, mode);
    if (mode == "wasapi-resample") return PlayWasapi(fullPath, deviceId, volume, true, mode);
    return Fail("mode_unknown", $"Unbekannter Modus: {mode}", fullPath, deviceId, "", volume, 0, mode, "");
}

static PlayResponse PlayWaveOut(string fullPath, string deviceId, int volume, string mode)
{
    try
    {
        using var reader = new AudioFileReader(fullPath) { Volume = Math.Clamp(volume / 100f, 0f, 1f) };
        using var output = new WaveOutEvent { DeviceNumber = -1, DesiredLatency = 100 };
        return RunPlayback(output, reader, fullPath, deviceId, "Windows Standardgerät", volume, mode, FormatText(reader.WaveFormat), FormatText(reader.WaveFormat));
    }
    catch (Exception ex)
    {
        return Fail("waveout_failed", ex.Message, fullPath, deviceId, "Windows Standardgerät", volume, 0, mode, HResultHex(ex));
    }
}

static PlayResponse PlayDirectSound(string fullPath, string deviceId, int volume, string mode)
{
    try
    {
        var directDevice = ResolveDirectSoundDevice(deviceId);
        if (directDevice == null) return Fail("directsound_device_not_found", $"DirectSound-Gerät nicht gefunden: {deviceId}", fullPath, deviceId, "", volume, 0, mode, "");
        using var reader = new AudioFileReader(fullPath) { Volume = Math.Clamp(volume / 100f, 0f, 1f) };
        using var output = new DirectSoundOut(directDevice.Guid, 100);
        return RunPlayback(output, reader, fullPath, deviceId, directDevice.Description, volume, mode, FormatText(reader.WaveFormat), FormatText(reader.WaveFormat));
    }
    catch (Exception ex)
    {
        return Fail("directsound_failed", ex.Message, fullPath, deviceId, "", volume, 0, mode, HResultHex(ex));
    }
}

static PlayResponse PlayWasapi(string fullPath, string deviceId, int volume, bool resample, string mode)
{
    try
    {
        using var enumerator = new MMDeviceEnumerator();
        using var device = ResolveRenderDevice(enumerator, deviceId, true);
        if (device == null) return Fail("device_not_found", $"Audiogerät nicht gefunden: {deviceId}", fullPath, deviceId, "", volume, 0, mode, "");
        using var reader = new AudioFileReader(fullPath) { Volume = Math.Clamp(volume / 100f, 0f, 1f) };
        var inputFormat = FormatText(reader.WaveFormat);
        var outputFormat = FormatText(device.AudioClient.MixFormat);
        using var output = new WasapiOut(device, AudioClientShareMode.Shared, false, 100);
        if (!resample) return RunPlayback(output, reader, fullPath, deviceId, SafeName(device.FriendlyName), volume, mode, inputFormat, outputFormat);
        using var resampler = new MediaFoundationResampler(reader, device.AudioClient.MixFormat) { ResamplerQuality = 60 };
        return RunPlayback(output, resampler, fullPath, deviceId, SafeName(device.FriendlyName), volume, mode, inputFormat, outputFormat);
    }
    catch (Exception ex)
    {
        return Fail("wasapi_failed", ex.Message, fullPath, deviceId, "", volume, 0, mode, HResultHex(ex));
    }
}

static PlayResponse RunPlayback(IWavePlayer output, IWaveProvider provider, string fullPath, string deviceId, string deviceName, int volume, string mode, string inputFormat, string outputFormat)
{
    var done = new ManualResetEventSlim(false);
    Exception? playbackError = null;
    output.PlaybackStopped += (_, e) => { playbackError = e.Exception; done.Set(); };
    output.Init(provider);
    output.Play();
    var durationMs = provider is WaveStream ws ? (int)Math.Round(ws.TotalTime.TotalMilliseconds) : 3000;
    if (durationMs <= 0) durationMs = 3000;
    done.Wait(Math.Max(1000, durationMs + 2500));
    if (output.PlaybackState != PlaybackState.Stopped) output.Stop();
    if (playbackError != null) return Fail("playback_failed", playbackError.Message, fullPath, deviceId, deviceName, volume, durationMs, mode, HResultHex(playbackError), inputFormat, outputFormat);
    return new PlayResponse(true, "AudioDeviceHelper", Version, "", "Playback beendet.", fullPath, deviceId, deviceName, volume, durationMs, mode, "", inputFormat, outputFormat);
}

static DirectSoundDeviceInfo? ResolveDirectSoundDevice(string deviceId)
{
    var devices = DirectSoundOut.Devices.ToList();
    if (IsDefaultDevice(deviceId)) return devices.FirstOrDefault();
    var normalized = NormalizeName(deviceId);
    foreach (var device in devices)
    {
        if (string.Equals(device.Guid.ToString(), deviceId, StringComparison.OrdinalIgnoreCase)) return device;
        var desc = NormalizeName(device.Description);
        if (desc.Contains(normalized) || normalized.Contains(desc)) return device;
        if (deviceId.Contains("cb4b9f28", StringComparison.OrdinalIgnoreCase) && desc.Contains("cable-c")) return device;
    }
    return null;
}

static string NormalizeName(string value)
{
    return (value ?? string.Empty).ToLowerInvariant().Replace(" ", "").Replace("(", "").Replace(")", "");
}

static MMDevice? ResolveRenderDevice(MMDeviceEnumerator enumerator, string deviceId, bool allowDefault)
{
    if (allowDefault && IsDefaultDevice(deviceId)) return enumerator.GetDefaultAudioEndpoint(DataFlow.Render, Role.Multimedia);
    var devices = enumerator.EnumerateAudioEndPoints(DataFlow.Render, DeviceState.Active);
    foreach (var device in devices)
    {
        if (string.Equals(device.ID, deviceId, StringComparison.OrdinalIgnoreCase)) return device;
        if (string.Equals(device.FriendlyName, deviceId, StringComparison.OrdinalIgnoreCase)) return device;
    }
    return null;
}

static bool IsDefaultDevice(string deviceId) => string.IsNullOrWhiteSpace(deviceId) || string.Equals(deviceId, "default", StringComparison.OrdinalIgnoreCase);
static int ClampInt(string value, int fallback, int min, int max) => int.TryParse(value, out var parsed) ? Math.Max(min, Math.Min(max, parsed)) : fallback;

static List<AudioDeviceInfo> ListRenderDevices()
{
    using var enumerator = new MMDeviceEnumerator();
    var defaultId = "";
    try { defaultId = enumerator.GetDefaultAudioEndpoint(DataFlow.Render, Role.Multimedia)?.ID ?? ""; } catch { }
    var result = new List<AudioDeviceInfo> { DeviceInfo("default", "Windows Standardgerät", "Virtual", true, "Windows Standardgerät", "Default", "") };
    var devices = enumerator.EnumerateAudioEndPoints(DataFlow.Render, DeviceState.Active);
    foreach (var device in devices)
    {
        var isDefault = !string.IsNullOrWhiteSpace(defaultId) && string.Equals(device.ID, defaultId, StringComparison.OrdinalIgnoreCase);
        result.Add(DeviceInfo(device.ID, SafeName(device.FriendlyName), device.State.ToString(), isDefault, SafeName(device.DeviceFriendlyName), SafeName(device.AudioEndpointVolume?.HardwareSupport.ToString() ?? ""), FormatText(device.AudioClient.MixFormat)));
    }
    return result;
}

static AudioDeviceInfo DeviceInfo(string id, string name, string state, bool isDefault, string deviceFriendlyName, string interfaceFriendlyName, string mixFormat)
    => new(id, name, "output", state, isDefault, deviceFriendlyName, interfaceFriendlyName, mixFormat);

static PlayResponse Fail(string error, string message, string file, string device, string deviceName, int volume, int durationMs, string mode, string hresult, string inputFormat = "", string outputFormat = "")
    => new(false, "AudioDeviceHelper", Version, error, message, file, device, deviceName, volume, durationMs, mode, hresult, inputFormat, outputFormat);

static string SafeName(string? value) => string.IsNullOrWhiteSpace(value) ? "Unbekanntes Audiogerät" : value.Trim();
static string FormatText(WaveFormat? format) => format == null ? "" : $"{format.Encoding} {format.SampleRate}Hz {format.Channels}ch {format.BitsPerSample}bit";
static string HResultHex(Exception ex) => $"0x{ex.HResult:X8}";
static void WriteError(string message) => Console.Error.WriteLine(message);

static void WriteHelp()
{
    Console.WriteLine("AudioDeviceHelper " + Version);
    Console.WriteLine("  version --json");
    Console.WriteLine("  devices --json");
    Console.WriteLine("  probe --device \"MMDEVICE-ID\" --json");
    Console.WriteLine("  play --file \"D:\\Pfad\\sound.mp3\" --device default --volume 80 --mode auto");
    Console.WriteLine("  play --file \"D:\\Pfad\\sound.mp3\" --device \"MMDEVICE-ID\" --volume 80 --mode directsound");
    Console.WriteLine("  play --file \"D:\\Pfad\\sound.mp3\" --device \"MMDEVICE-ID\" --volume 80 --mode wasapi-resample");
}

static void WriteJson<T>(T value)
{
    var options = new JsonSerializerOptions { WriteIndented = false, DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull, PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
    Console.OutputEncoding = System.Text.Encoding.UTF8;
    Console.WriteLine(JsonSerializer.Serialize(value, options));
}

static void WriteJsonOrText<T>(bool json, T value, string text)
{
    if (json) WriteJson(value); else Console.WriteLine(text);
}

public sealed record HelperVersion(string Module, string Version, string OS);
public sealed record AudioDeviceInfo(string Id, string Name, string Type, string State, bool IsDefault, string DeviceFriendlyName, string InterfaceFriendlyName, string MixFormat);
public sealed record DevicesResponse(bool Ok, string Module, string Version, List<AudioDeviceInfo> Devices);
public sealed record ProbeResponse(bool Ok, string Module, string Version, string Error, string Message, string Device, string DeviceName, string MixFormat, bool SharedModeAvailable);
public sealed record PlayResponse(bool Ok, string Module, string Version, string Error, string Message, string File, string Device, string DeviceName, int Volume, int DurationMs, string Mode, string HResult, string InputFormat, string OutputFormat);
public sealed record ErrorResponse(bool Ok, string Module, string Version, string Error, string Message, string HResult);
