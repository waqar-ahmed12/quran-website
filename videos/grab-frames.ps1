# Extract evenly-spaced frames from a video using pure .NET WPF.
# System ffmpeg is a broken install and Python is blocked in the Claude sandbox,
# so this uses MediaPlayer + ScrubbingEnabled, which needs no external binaries.
#
#   powershell -NoProfile -STA -ExecutionPolicy Bypass -File videos\grab-frames.ps1 `
#       -Video videos\clip.mp4 -Out videos\frames -Count 12

param(
    [Parameter(Mandatory = $true)][string]$Video,
    [string]$Out = "frames",
    [int]$Count = 12,
    [int]$Width = 640
)

Add-Type -AssemblyName PresentationCore
Add-Type -AssemblyName WindowsBase

$Video = (Resolve-Path $Video).Path
New-Item -ItemType Directory -Force -Path $Out | Out-Null
$Out = (Resolve-Path $Out).Path

$player = New-Object System.Windows.Media.MediaPlayer
$player.ScrubbingEnabled = $true
$player.Volume = 0

$script:opened = $false
$player.Add_MediaOpened({ $script:opened = $true })
$player.Add_MediaFailed({ param($s, $e) Write-Error ("open failed: " + $e.ErrorException.Message) })

$player.Open([Uri]$Video)
$player.Play()
$player.Pause()

function Pump($ms) {
    [System.Windows.Threading.Dispatcher]::CurrentDispatcher.Invoke(
        [System.Windows.Threading.DispatcherPriority]::Background, [action] {}
    )
    Start-Sleep -Milliseconds $ms
}

$deadline = (Get-Date).AddSeconds(20)
while (-not $script:opened -and (Get-Date) -lt $deadline) { Pump 100 }
if (-not $script:opened) { throw "timed out opening $Video" }

$nw = $player.NaturalVideoWidth
$nh = $player.NaturalVideoHeight
$dur = $player.NaturalDuration.TimeSpan.TotalSeconds
Write-Host "source ${nw}x${nh}  ${dur}s"

$ow = $Width
$oh = [int][math]::Round($nh * ($Width / [double]$nw))

for ($i = 0; $i -lt $Count; $i++) {
    $t = $dur * $i / ($Count - 1)
    if ($t -ge $dur) { $t = $dur - 0.05 }

    $player.Position = [TimeSpan]::FromSeconds($t)
    for ($k = 0; $k -lt 6; $k++) { Pump 150 }   # let the scrubber settle

    $visual = New-Object System.Windows.Media.DrawingVisual
    $dc = $visual.RenderOpen()
    $dc.DrawVideo($player, (New-Object System.Windows.Rect 0, 0, $ow, $oh))
    $dc.Close()

    $rtb = New-Object System.Windows.Media.Imaging.RenderTargetBitmap(
        $ow, $oh, 96, 96, [System.Windows.Media.PixelFormats]::Pbgra32)
    $rtb.Render($visual)

    $enc = New-Object System.Windows.Media.Imaging.PngBitmapEncoder
    $enc.Frames.Add([System.Windows.Media.Imaging.BitmapFrame]::Create($rtb))

    $path = "{0}\f{1:d2}_{2:00.00}s.png" -f $Out, $i, $t
    $fs = [System.IO.File]::Create($path)
    $enc.Save($fs)
    $fs.Close()
    Write-Host "wrote $path"
}

$player.Close()
