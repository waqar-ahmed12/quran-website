# Builds the light hero's frames: picks them out of the exported video frames, resizes them to the dark
# footage's size, renumbers them f000 upward into the site, and measures where the book's right edge is in
# each one.
#
#   powershell -NoProfile -ExecutionPolicy Bypass -File "C:\Users\ICONNECT\quran-website\videos\make-light-frames.ps1"
#
# Then run `node videos/build-light-geom.js`, which turns the measurements into main.js's LIGHT_RIGHT.
# Uses WPF imaging, as export-light-frames.ps1 does: no ffmpeg, no Python.

param(
    [string]$Raw = (Join-Path $PSScriptRoot 'light-frames\raw'),
    [string]$Edges = (Join-Path $PSScriptRoot 'light-frames\edges.json'),
    [string]$Out = (Join-Path (Split-Path $PSScriptRoot) 'site\assets\hero\light-frames')
)

# Which of the 192 exported frames the site uses.
$held = @(1, 2, 3, 4, 84, 85)   # identical to the frame before: a pause in the video, like the dark footage's 39-40
# The book is NOT flat yet at 131 — the right page is still lifted and the back cover still stands up, which is
# where the site used to stop and rest (the user, 2026-09-19: "doesn't look fully open"). It keeps opening to 151,
# the last frame of this shot before a light washes across the pages at 152-155.
$settled = 151
$every = 2                      # the light take runs about twice as long as the dark one for the same movement
$w = 1280                       # the dark footage's size: 184 frames of 1920x1080 is ~1.5 GB of decoded bitmaps
$h = 720

Add-Type -AssemblyName PresentationCore
Add-Type -AssemblyName WindowsBase

$usable = 0..$settled | Where-Object { $held -notcontains $_ }
$frames = @()
for ($k = 0; $k -lt $usable.Count; $k += $every) { $frames += $usable[$k] }
# Taking every other frame can stop one short of the end. The last frame is the one the open book rests on, so it
# always has to be the flattest one there is.
if ($frames[-1] -ne $usable[-1]) { $frames += $usable[-1] }

New-Item -ItemType Directory -Force -Path $Out | Out-Null
Get-ChildItem -LiteralPath $Out -Filter 'f*.png' | Remove-Item -Force

# The book's right edge, the one thing that has to be measured per frame: main.js centres the book on it as it
# opens, exactly as it does for the dark footage. A brightness threshold can't find it, because the ivory book
# is only three levels darker than its backdrop and its drop shadow is darker still; the edge itself is a sharp
# step, though, and the shadow is a slow ramp, so the strongest step right of the fold is the edge.
$stride = $w * 3
$pixels = New-Object byte[] ($stride * $h)
function Measure-RightEdge {
    param($bitmap)
    $bitmap.CopyPixels($pixels, $stride, 0)
    $mean = New-Object double[] $w
    for ($x = 0; $x -lt $w; $x++) {
        $sum = 0.0
        for ($y = 120; $y -lt 600; $y += 8) {
            $o = $y * $stride + $x * 3
            $sum += 0.114 * $pixels[$o] + 0.587 * $pixels[$o + 1] + 0.299 * $pixels[$o + 2]
        }
        $mean[$x] = $sum
    }
    $best = 0.0
    $edge = 640
    for ($x = 642; $x -lt $w - 3; $x++) {
        $step = [math]::Abs($mean[$x + 2] - $mean[$x - 2])
        if ($step -gt $best) { $best = $step; $edge = $x }
    }
    return $edge
}

$right = @()
$n = 0
foreach ($i in $frames) {
    $in = Join-Path $Raw ("f{0:d3}.png" -f [int]$i)
    if (-not (Test-Path -LiteralPath $in)) { throw "Missing frame $in" }

    # Decoded straight to the target size: WIC scales it in one step, in the frame's own 24-bit colour. Going
    # through a render surface instead leaves a pixel of rounding noise everywhere, which PNG can't compress.
    $bi = New-Object System.Windows.Media.Imaging.BitmapImage
    $bi.BeginInit()
    $bi.UriSource = [Uri](Resolve-Path -LiteralPath $in).Path
    $bi.DecodePixelWidth = $w
    $bi.DecodePixelHeight = $h
    $bi.CacheOption = [System.Windows.Media.Imaging.BitmapCacheOption]::OnLoad
    $bi.CreateOptions = [System.Windows.Media.Imaging.BitmapCreateOptions]::PreservePixelFormat
    $bi.EndInit()

    # 24-bit, like the frames coming in: an alpha channel the footage doesn't use costs a quarter of every file.
    $opaque = New-Object System.Windows.Media.Imaging.FormatConvertedBitmap($bi, [System.Windows.Media.PixelFormats]::Bgr24, $null, 0)
    $enc = New-Object System.Windows.Media.Imaging.PngBitmapEncoder
    $enc.Interlace = [System.Windows.Media.Imaging.PngInterlaceOption]::Off
    $enc.Frames.Add([System.Windows.Media.Imaging.BitmapFrame]::Create($opaque))
    $fs = [System.IO.File]::Create((Join-Path $Out ("f{0:d3}.png" -f $n)))
    $enc.Save($fs)
    $fs.Close()

    $right += (Measure-RightEdge $opaque)
    $n++
}

@{ width = $w; height = $h; frames = $frames; right = $right } | ConvertTo-Json -Compress |
    Set-Content -LiteralPath $Edges -Encoding utf8

$size = (Get-ChildItem -LiteralPath $Out -Filter 'f*.png' | Measure-Object -Property Length -Sum).Sum / 1MB
Write-Output ("{0} frames written to {1} at {2}x{3}, {4:N1} MB total." -f $n, $Out, $w, $h, $size)
Write-Output ("Right edge: closed {0}, open {1}. Measurements in {2}." -f $right[0], $right[-1], $Edges)
