# Export every frame of the ivory Qur'an opening as PNG, full size and untouched, for light mode.
# Uses only built-in Windows/.NET parts (WPF MediaPlayer): no ffmpeg, no Python.
#
#   powershell -NoProfile -STA -ExecutionPolicy Bypass -File "C:\Users\Waqar Ahmed\Desktop\Claude\Planning\videos\export-light-frames.ps1"
#
# Output, videos\light-frames\raw\:
#   f000.png ... f191.png   one per frame of the 24 fps video, each taken from the middle of its 1/24 s
#   export-log.csv          time asked for, tries, and a fingerprint of each frame's pixels
#
# inspect-video.js shows every frame of this video carries new picture data, so two neighbours coming out
# identical means the player hadn't caught up. It then waits longer and tries again, and reports any it couldn't fix.

param(
    [string]$Video = "C:\Users\Waqar Ahmed\Downloads\whtie-quran-opening.mp4",
    [string]$Out = "C:\Users\Waqar Ahmed\Desktop\Claude\Planning\videos\light-frames\raw",
    [int]$Fps = 24
)

if ([Threading.Thread]::CurrentThread.ApartmentState -ne 'STA') { throw "Run with: powershell -STA (see the command at the top of this file)" }
if (-not (Test-Path -LiteralPath $Video)) { throw "Video not found: $Video" }

Add-Type -AssemblyName PresentationCore
Add-Type -AssemblyName WindowsBase

New-Item -ItemType Directory -Force -Path $Out | Out-Null
$inv = [Globalization.CultureInfo]::InvariantCulture

$player = New-Object System.Windows.Media.MediaPlayer
$player.ScrubbingEnabled = $true
$player.Volume = 0
$script:opened = $false
$script:failed = $null
$player.Add_MediaOpened({ $script:opened = $true })
$player.Add_MediaFailed({ param($s, $e) $script:failed = $e.ErrorException.Message })
$player.Open([Uri](Resolve-Path -LiteralPath $Video).Path)
$player.Play()
$player.Pause()

function Pump($ms) {
    [System.Windows.Threading.Dispatcher]::CurrentDispatcher.Invoke([System.Windows.Threading.DispatcherPriority]::Background, [action] {})
    Start-Sleep -Milliseconds $ms
}

$deadline = (Get-Date).AddSeconds(30)
while (-not $script:opened -and -not $script:failed -and (Get-Date) -lt $deadline) { Pump 100 }
if (-not $script:opened) { throw "Could not open $Video $script:failed" }

$w = $player.NaturalVideoWidth
$h = $player.NaturalVideoHeight
$dur = $player.NaturalDuration.TimeSpan.TotalSeconds
$count = [int][math]::Round($dur * $Fps)
Write-Output ("Video {0}x{1}, {2:0.000} s, exporting {3} frames to {4}" -f $w, $h, $dur, $count, $Out)

$md5 = [System.Security.Cryptography.MD5]::Create()
$pixels = New-Object byte[] ($w * $h * 4)
$blank = [BitConverter]::ToString($md5.ComputeHash($pixels))

# Seeks, waits $settle rounds for the picture to catch up, and renders the frame.
function Grab([double]$t, [int]$settle) {
    $player.Position = [TimeSpan]::FromSeconds($t)
    for ($k = 0; $k -lt $settle; $k++) { Pump 120 }
    $visual = New-Object System.Windows.Media.DrawingVisual
    $dc = $visual.RenderOpen()
    $dc.DrawVideo($player, (New-Object System.Windows.Rect 0, 0, $w, $h))
    $dc.Close()
    $rtb = New-Object System.Windows.Media.Imaging.RenderTargetBitmap($w, $h, 96, 96, [System.Windows.Media.PixelFormats]::Pbgra32)
    $rtb.Render($visual)
    $rtb.CopyPixels($pixels, $w * 4, 0)
    return [pscustomobject]@{ Bitmap = $rtb; Hash = [BitConverter]::ToString($md5.ComputeHash($pixels)).Replace('-', '') }
}

$log = New-Object System.Collections.Generic.List[string]
$log.Add('frame,time,tries,hash')
$previous = $null
$retried = 0
$stuck = @()
$started = Get-Date

for ($i = 0; $i -lt $count; $i++) {
    $t = ($i + 0.5) / $Fps
    $tries = 1
    $shot = Grab $t 5
    while (($shot.Hash -eq $previous -or $shot.Hash -eq $blank) -and $tries -lt 4) {
        # Step back a frame and come again, waiting longer each time.
        $player.Position = [TimeSpan]::FromSeconds([math]::Max(0, $t - 1.0 / $Fps))
        for ($k = 0; $k -lt 4; $k++) { Pump 120 }
        $tries++
        $shot = Grab $t (5 * $tries)
    }
    if ($tries -gt 1) { $retried++ }
    if ($shot.Hash -eq $previous -or $shot.Hash -eq $blank) { $stuck += $i }

    $opaque = New-Object System.Windows.Media.Imaging.FormatConvertedBitmap($shot.Bitmap, [System.Windows.Media.PixelFormats]::Bgr24, $null, 0)
    $enc = New-Object System.Windows.Media.Imaging.PngBitmapEncoder
    $enc.Interlace = [System.Windows.Media.Imaging.PngInterlaceOption]::Off
    $enc.Frames.Add([System.Windows.Media.Imaging.BitmapFrame]::Create($opaque))
    $fs = [System.IO.File]::Create((Join-Path $Out ("f{0:d3}.png" -f $i)))
    $enc.Save($fs)
    $fs.Close()

    $log.Add(("{0},{1},{2},{3}" -f $i, $t.ToString('0.0000', $inv), $tries, $shot.Hash))
    $previous = $shot.Hash
    if ($i % 24 -eq 0) { Write-Output ("  {0}/{1}" -f $i, $count) }
}
$player.Close()
[System.IO.File]::WriteAllLines((Join-Path $Out 'export-log.csv'), $log)

Write-Output ""
Write-Output ("Done in {0:0} s. {1} frames written." -f ((Get-Date) - $started).TotalSeconds, $count)
Write-Output ("Frames that needed a second try: {0}" -f $retried)
if ($stuck.Count) { Write-Output ("STILL identical to the frame before (or blank): {0}" -f ($stuck -join ', ')) }
else { Write-Output "Every frame differs from the one before it." }

# Then measure the frames and make the contact sheets (analyze-light-frames.js; node only reads the frames).
$folder = Split-Path $Out
$report = Join-Path $folder 'report.txt'
if (-not (Get-Command node -ErrorAction SilentlyContinue)) { Write-Output "node not found, so the frames weren't checked."; return }
Write-Output ""
Write-Output "Checking the frames (a minute or two) ..."
$env:FRAMES = $Out
$env:FRAMES_OUT = $folder
& node (Join-Path $PSScriptRoot 'analyze-light-frames.js') 2>$null | Out-File -Encoding utf8 $report
Write-Output "Saved $report and the contact sheets in $folder"
Get-Content $report | Select-String -Pattern '^Background|^Book|^Flags' -Context 0, 6 | ForEach-Object { $_.ToString() }
