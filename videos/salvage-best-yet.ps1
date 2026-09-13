# Salvage "best yet.mp4": export the opening as a PNG frame sequence and paint out the fake spine
# Veo drew along the lifting edge of the cover (~2.2-3.5 s). Uses only built-in Windows/.NET components.
#
#   powershell -NoProfile -STA -ExecutionPolicy Bypass -File "C:\Users\Waqar Ahmed\Desktop\Claude\Planning\videos\salvage-best-yet.ps1"
#
# Output (videos\best-yet-frames\):
#   f000.png ...        frames for the scroll animation (retouched where needed)
#   raw\                untouched frames
#   contact-sheet.png   before/after of the retouched frames, for review

param(
    [string]$Video = "C:\Users\Waqar Ahmed\Downloads\best yet.mp4",
    [string]$Out = "C:\Users\Waqar Ahmed\Desktop\Claude\Planning\videos\best-yet-frames",
    [double]$Start = 1.90,
    [double]$End = 5.60,
    [int]$Fps = 24,
    [double]$FixStart = 2.15,
    [double]$FixEnd = 3.50
)

if ([Threading.Thread]::CurrentThread.ApartmentState -ne 'STA') { throw "Run with: powershell -STA (see the command at the top of this file)" }

Add-Type -AssemblyName PresentationCore
Add-Type -AssemblyName WindowsBase
Add-Type -AssemblyName System.Drawing

$raw = Join-Path $Out "raw"
New-Item -ItemType Directory -Force -Path $raw | Out-Null
$inv = [Globalization.CultureInfo]::InvariantCulture
$png = [System.Drawing.Imaging.ImageFormat]::Png

# ---------- 1. Export frames ----------
$player = New-Object System.Windows.Media.MediaPlayer
$player.ScrubbingEnabled = $true
$player.Volume = 0
$script:opened = $false
$player.Add_MediaOpened({ $script:opened = $true })
$player.Open([Uri]$Video)
$player.Play()
$player.Pause()
function Pump($ms) {
    [System.Windows.Threading.Dispatcher]::CurrentDispatcher.Invoke([System.Windows.Threading.DispatcherPriority]::Background, [action] {})
    Start-Sleep -Milliseconds $ms
}
$deadline = (Get-Date).AddSeconds(20)
while (-not $script:opened -and (Get-Date) -lt $deadline) { Pump 100 }
if (-not $script:opened) { throw "Could not open $Video" }

$nw = $player.NaturalVideoWidth
$nh = $player.NaturalVideoHeight
$count = [int][math]::Floor(($End - $Start) * $Fps) + 1
Write-Output ("Exporting {0} frames ({1}x{2}), {3:0.00}s to {4:0.00}s ..." -f $count, $nw, $nh, $Start, $End)
$frames = @()
for ($i = 0; $i -lt $count; $i++) {
    $t = $Start + $i / $Fps
    $player.Position = [TimeSpan]::FromSeconds($t + 0.25 / $Fps)
    for ($k = 0; $k -lt 5; $k++) { Pump 120 }
    $visual = New-Object System.Windows.Media.DrawingVisual
    $dc = $visual.RenderOpen()
    $dc.DrawVideo($player, (New-Object System.Windows.Rect 0, 0, $nw, $nh))
    $dc.Close()
    $rtb = New-Object System.Windows.Media.Imaging.RenderTargetBitmap($nw, $nh, 96, 96, [System.Windows.Media.PixelFormats]::Pbgra32)
    $rtb.Render($visual)
    $enc = New-Object System.Windows.Media.Imaging.PngBitmapEncoder
    $enc.Frames.Add([System.Windows.Media.Imaging.BitmapFrame]::Create($rtb))
    $name = "f{0:d3}.png" -f $i
    $fs = [System.IO.File]::Create((Join-Path $raw $name))
    $enc.Save($fs)
    $fs.Close()
    $frames += [pscustomobject]@{ Name = $name; T = $t }
    if ($i % 20 -eq 0) { Write-Output ("  exported {0}/{1}" -f $i, $count) }
}
$player.Close()

# ---------- 2. Paint out the fake spine ----------
# Geometry measured on the 1280x720 take, scaled to the actual size. The book never moves.
$sx = $nw / 1280.0
$bookLeft = [int][math]::Round(254 * $sx)     # left edge of the page block
$hingeX   = [int][math]::Round(641 * $sx)     # spine / right edge of the book
$flatGold = [int][math]::Round(270 * $sx)     # cover's outer gold rule when closed
$flatRim  = 15.0 * $sx                        # leather between cover edge and gold rule when closed
$maxBand  = [int][math]::Round(55 * $sx)      # the fake spine was never wider than ~41px

$rows = @(); for ($y = [int]($nh * 0.21); $y -le [int]($nh * 0.79); $y += 4) { $rows += $y }
$n = $rows.Count
function IsGold($c)      { ($c.R -gt 110) -and ($c.G -gt 80) -and (($c.R - $c.B) -gt 45) }
function IsGoldLoose($c) { ($c.R -gt 70) -and (($c.R - $c.B) -gt 25) }
function IsCream($c)     { ($c.R + $c.G + $c.B) -gt 540 }
function ColumnShare($bmp, $x, $test) {
    $k = 0
    foreach ($y in $rows) { if (& $test ($bmp.GetPixel($x, $y))) { $k++ } }
    return $k / $n
}

$hist = New-Object System.Collections.Generic.List[object]
$log = @()
foreach ($f in $frames) {
    $src = Join-Path $raw $f.Name
    $dst = Join-Path $Out $f.Name
    if ($f.T -lt $FixStart -or $f.T -gt $FixEnd) { Copy-Item -LiteralPath $src -Destination $dst -Force; continue }

    $tmp = New-Object System.Drawing.Bitmap $src
    $img = [System.Drawing.Bitmap]::new($tmp.Width, $tmp.Height, [System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
    $gr = [System.Drawing.Graphics]::FromImage($img)
    $gr.DrawImage($tmp, 0, 0, $tmp.Width, $tmp.Height)
    $gr.Dispose(); $tmp.Dispose()
    $H = $img.Height
    $bg = $img.GetPixel([int]($nw * 0.86), [int]($nh / 2))
    $label = $f.T.ToString('0.00', $inv)

    # Visible page: contiguous cream columns starting at the book's left edge
    $pageRight = -1; $inPage = $false
    for ($x = $bookLeft - 14; $x -lt $hingeX; $x++) {
        if ((ColumnShare $img $x ${function:IsCream}) -ge 0.9) { $pageRight = $x; $inPage = $true } elseif ($inPage) { break }
    }

    # Cover's outer gold rule (the fake spine's ornaments are too sparse to count as a rule)
    $from = if ($pageRight -ge 0) { $pageRight + 1 } else { $bookLeft - 14 }
    $goldX = -1; $how = "gold rule"
    for ($x = $from; $x -le $hingeX -and $goldX -lt 0; $x++) { if ((ColumnShare $img $x ${function:IsGold}) -ge 0.40) { $goldX = $x } }
    if ($goldX -lt 0) {
        $how = "faint gold rule"
        for ($x = $from; $x -le $hingeX -and $goldX -lt 0; $x++) { if ((ColumnShare $img $x ${function:IsGoldLoose}) -ge 0.30) { $goldX = $x } }
    }
    if ($goldX -lt 0 -and $hist.Count -ge 2) {
        $a = $hist[$hist.Count - 2]; $b = $hist[$hist.Count - 1]
        $slope = ($b.G - $a.G) / ($b.T - $a.T)
        $goldX = [int][math]::Min([double]($hingeX - 6), [double]($b.G + $slope * ($f.T - $b.T)))
        $how = "predicted"
    }
    if ($goldX -lt 0) { $img.Save($dst, $png); $img.Dispose(); $log += "$label  untouched (cover edge not found)"; continue }
    if ($how -ne "predicted") { $hist.Add([pscustomobject]@{ T = $f.T; G = $goldX }) }

    $rim = [int][math]::Max(3, [math]::Round($flatRim * ($hingeX - $goldX) / ($hingeX - $flatGold)))
    $bandEnd = $goldX - $rim - 1

    if ($pageRight -ge 0) {
        # Page visible: continue the page up to the cover's real edge
        $bandStart = $pageRight + 1
        $bandEnd = [math]::Min($bandEnd, $bandStart + $maxBand)
        $px = $pageRight - 3; $pageTop = -1; $pageBot = -1
        for ($y = 0; $y -lt $H; $y++) { if (IsCream ($img.GetPixel($px, $y))) { if ($pageTop -lt 0) { $pageTop = $y }; $pageBot = $y } }
        for ($x = $bandStart; $x -le $bandEnd; $x++) {
            $srcX = $pageRight - 1 - (($x - $bandStart) % 8)
            for ($y = 0; $y -lt $H; $y++) {
                if ($y -ge $pageTop -and $y -le $pageBot) { $img.SetPixel($x, $y, $img.GetPixel($srcX, $y)) } else { $img.SetPixel($x, $y, $bg) }
            }
        }
        $log += "$label  fixed x $bandStart..$bandEnd  ($how, page visible)"
    } else {
        # No page yet: fake thickness left of the book -> background, the rest -> cover leather
        $bandStart = -1
        $bgSum = $bg.R + $bg.G + $bg.B
        for ($x = $bookLeft - 34; $x -lt $goldX -and $bandStart -lt 0; $x++) {
            $d = 0
            foreach ($y in $rows) { $c = $img.GetPixel($x, $y); if ([math]::Abs(($c.R + $c.G + $c.B) - $bgSum) -gt 18) { $d++ } }
            if ($d -ge 0.5 * $n) { $bandStart = $x }
        }
        if ($bandStart -ge 0 -and $bandStart -lt $bookLeft) {
            for ($x = $bandStart; $x -le $bandEnd; $x++) {
                for ($y = 0; $y -lt $H; $y++) {
                    if ($x -lt $bookLeft) { $img.SetPixel($x, $y, $bg) } else { $img.SetPixel($x, $y, $img.GetPixel($goldX - 3, $y)) }
                }
            }
            $log += "$label  fixed x $bandStart..$bandEnd  ($how, no page yet)"
        } else {
            $log += "$label  nothing to fix"
        }
    }
    $img.Save($dst, $png)
    $img.Dispose()
}

# ---------- 3. Contact sheet (before / after) ----------
$fixed = @($frames | Where-Object { $_.T -ge $FixStart -and $_.T -le $FixEnd })
$pick = @(); for ($i = 0; $i -lt $fixed.Count; $i += 2) { $pick += $fixed[$i] }
$cols = 9; $cw = 200; $ch = 288
$pairs = [int][math]::Ceiling($pick.Count / $cols)
$sheet = [System.Drawing.Bitmap]::new($cols * $cw, $pairs * 2 * $ch)
$g = [System.Drawing.Graphics]::FromImage($sheet)
$g.Clear([System.Drawing.Color]::Black)
$g.InterpolationMode = 'HighQualityBicubic'
$font = [System.Drawing.Font]::new('Consolas', [single]11)
$srcRect = [System.Drawing.Rectangle]::new([int](200 * $sx), 0, [int](500 * $sx), $nh)
for ($i = 0; $i -lt $pick.Count; $i++) {
    $c = $i % $cols; $r = [int][math]::Floor($i / $cols)
    foreach ($k in 0, 1) {
        $p = if ($k -eq 0) { Join-Path $raw $pick[$i].Name } else { Join-Path $Out $pick[$i].Name }
        $im = New-Object System.Drawing.Bitmap $p
        $dest = [System.Drawing.Rectangle]::new($c * $cw, ($r * 2 + $k) * $ch, $cw, $ch)
        $g.DrawImage($im, $dest, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
        $im.Dispose()
        $tag = if ($k -eq 0) { "before" } else { "after" }
        $g.DrawString(("{0} {1}" -f $pick[$i].T.ToString('0.00', $inv), $tag), $font, [System.Drawing.Brushes]::White, [single]($c * $cw + 4), [single](($r * 2 + $k) * $ch + 4))
    }
}
$g.Dispose()
$sheet.Save((Join-Path $Out 'contact-sheet.png'), $png)
$sheet.Dispose()

Write-Output ""
Write-Output "Retouch log:"
$log | ForEach-Object { Write-Output "  $_" }
Write-Output ""
Write-Output "Done. Frames: $Out"
Write-Output "Review:  $(Join-Path $Out 'contact-sheet.png')"
