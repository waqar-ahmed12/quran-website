# Decodes a phone recording (.m4a, or anything else Windows can play) to a 16-bit PCM .wav, using Windows' own media
# decoder. ffmpeg and python are not safe to run on this PC (CLAUDE.md) and node has no AAC decoder, so this needs neither.
# The .wav keeps the file's own sample rate and channels; tools/cut-letters.js reads it.
#
#   powershell -NoProfile -ExecutionPolicy Bypass -File tools\m4a-to-wav.ps1 "<in.m4a>" "<out.wav>"
param(
  [Parameter(Mandatory = $true, Position = 0)][string]$In,
  [Parameter(Mandatory = $true, Position = 1)][string]$Out
)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Runtime.WindowsRuntime

$null = [Windows.Storage.StorageFile, Windows.Storage, ContentType = WindowsRuntime]
$null = [Windows.Storage.StorageFolder, Windows.Storage, ContentType = WindowsRuntime]
$null = [Windows.Media.Transcoding.MediaTranscoder, Windows.Media.Transcoding, ContentType = WindowsRuntime]
$null = [Windows.Media.MediaProperties.MediaEncodingProfile, Windows.Media.MediaProperties, ContentType = WindowsRuntime]
$null = [Windows.Media.MediaProperties.AudioEncodingProperties, Windows.Media.MediaProperties, ContentType = WindowsRuntime]

# Windows' file and media calls are asynchronous; these wait for one to finish.
$asTask = [System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object { $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 }
function Wait-Result($operation, [Type]$type) {
  $method = $asTask | Where-Object { $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1' } | Select-Object -First 1
  $task = $method.MakeGenericMethod($type).Invoke($null, @($operation))
  $null = $task.Wait(-1)
  $task.Result
}
function Wait-Done($action) {
  $method = $asTask | Where-Object { $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncActionWithProgress`1' } | Select-Object -First 1
  $task = $method.MakeGenericMethod([double]).Invoke($null, @($action))
  $null = $task.Wait(-1)
}

$inPath = (Resolve-Path -LiteralPath $In).Path
$outPath = [System.IO.Path]::GetFullPath($Out)

$source = Wait-Result ([Windows.Storage.StorageFile]::GetFileFromPathAsync($inPath)) ([Windows.Storage.StorageFile])
$folder = Wait-Result ([Windows.Storage.StorageFolder]::GetFolderFromPathAsync([System.IO.Path]::GetDirectoryName($outPath))) ([Windows.Storage.StorageFolder])
$target = Wait-Result ($folder.CreateFileAsync([System.IO.Path]::GetFileName($outPath), [Windows.Storage.CreationCollisionOption]::ReplaceExisting)) ([Windows.Storage.StorageFile])

$found = Wait-Result ([Windows.Media.MediaProperties.MediaEncodingProfile]::CreateFromFileAsync($source)) ([Windows.Media.MediaProperties.MediaEncodingProfile])
$wav = [Windows.Media.MediaProperties.MediaEncodingProfile]::CreateWav([Windows.Media.MediaProperties.AudioEncodingQuality]::High)
$wav.Audio = [Windows.Media.MediaProperties.AudioEncodingProperties]::CreatePcm($found.Audio.SampleRate, $found.Audio.ChannelCount, 16)

$transcoder = New-Object Windows.Media.Transcoding.MediaTranscoder
$prepared = Wait-Result ($transcoder.PrepareFileTranscodeAsync($source, $target, $wav)) ([Windows.Media.Transcoding.PrepareTranscodeResult])
if (-not $prepared.CanTranscode) { throw "Windows can't convert this file: $($prepared.FailureReason)" }
Wait-Done ($prepared.TranscodeAsync())

$bytes = (Get-Item -LiteralPath $outPath).Length
"wrote $outPath ($bytes bytes, $($found.Audio.SampleRate) Hz, $($found.Audio.ChannelCount) channel(s))"
