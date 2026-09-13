# Second pass for best-yet-frames: redo the frames where the cover is nearly edge-on (~3.15-3.45 s).
# Gold-rule detection fails there, so the cover's edge is computed from its opening angle instead.
# The angle was measured on the frames that fixed cleanly: ~46.6 deg at 2.90 s, turning ~88 deg/s.
#
#   powershell -NoProfile -ExecutionPolicy Bypass -File "C:\Users\Waqar Ahmed\Desktop\Claude\Planning\videos\fix-edge-frames.ps1"

param(
    [string]$Dir = "C:\Users\Waqar Ahmed\Desktop\Claude\Planning\videos\best-yet-frames",
    [double]$Start = 1.90,
    [int]$Fps = 24,
    [int]$FirstIndex = 30,
    [int]$LastIndex = 37,
    [double]$AngleAt290 = 46.6,
    [double]$DegPerSec = 88.0
)

Add-Type -AssemblyName System.Drawing
$raw = Join-Path $Dir "raw"
$png = [System.Drawing.Imaging.ImageFormat]::Png
$inv = [Globalization.CultureInfo]::InvariantCulture

function IsCream($c) { ($c.R + $c.G + $c.B) -gt 540 }

$log = @()
for ($i = $FirstIndex; $i -le $LastIndex; $i++) {
    $name = "f{0:d3}.png" -f $i
    $t = $Start + $i / $Fps
    $tmp = New-Object System.Drawing.Bitmap (Join-Path $raw $name)
    $img = [System.Drawing.Bitmap]::new($tmp.Width, $tmp.Height, [System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
    $gr = [System.Drawing.Graphics]::FromImage($img); $gr.DrawImage($tmp, 0, 0, $tmp.Width, $tmp.Height); $gr.Dispose(); $tmp.Dispose()
    $W = $img.Width; $H = $img.Height
    $sx = $W / 1280.0
    $bookLeft = [int][math]::Round(254 * $sx)
    $hingeX = [int][math]::Round(641 * $sx)
    $coverW = 371.0 * $sx
    $bg = $img.GetPixel([int]($W * 0.86), [int]($H / 2))

    $rows = @(); for ($y = [int]($H * 0.21); $y -le [int]($H * 0.79); $y += 4) { $rows += $y }
    $pageRight = -1; $inPage = $false
    for ($x = $bookLeft - 14; $x -lt $hingeX; $x++) {
        $k = 0; foreach ($y in $rows) { if (IsCream ($img.GetPixel($x, $y))) { $k++ } }
        if ($k -ge 0.9 * $rows.Count) { $pageRight = $x; $inPage = $true } elseif ($inPage) { break }
    }
    if ($pageRight -lt 0) { $log += ("{0}  skipped (no page found)" -f $t.ToString('0.00', $inv)); $img.Save((Join-Path $Dir $name), $png); $img.Dispose(); continue }

    $theta = $AngleAt290 + $DegPerSec * ($t - 2.90)
    if ($theta -lt 90) {
        $w = $coverW * [math]::Cos($theta * [math]::PI / 180)
        $goldX = $hingeX - $w
        $rim = [math]::Max(3, 15.0 * $sx * $w / $coverW)
        $bandEnd = [int][math]::Floor($goldX - $rim - 1)
    } else {
        $bandEnd = $hingeX - [int][math]::Round(5 * $sx)   # cover is edge-on: keep only a thin board edge at the spine
    }
    $bandStart = $pageRight + 1

    if ($bandEnd -ge $bandStart) {
        $px = $pageRight - 3; $pageTop = -1; $pageBot = -1
        for ($y = 0; $y -lt $H; $y++) { if (IsCream ($img.GetPixel($px, $y))) { if ($pageTop -lt 0) { $pageTop = $y }; $pageBot = $y } }
        for ($x = $bandStart; $x -le $bandEnd; $x++) {
            $srcX = $pageRight - 1 - (($x - $bandStart) % 8)
            for ($y = 0; $y -lt $H; $y++) {
                if ($y -ge $pageTop -and $y -le $pageBot) { $img.SetPixel($x, $y, $img.GetPixel($srcX, $y)) } else { $img.SetPixel($x, $y, $bg) }
            }
        }
        $log += ("{0}  angle {1:0}deg  fixed x {2}..{3}" -f $t.ToString('0.00', $inv), $theta, $bandStart, $bandEnd)
    } else {
        $log += ("{0}  angle {1:0}deg  nothing to fix (page already reaches the cover)" -f $t.ToString('0.00', $inv), $theta)
    }
    $img.Save((Join-Path $Dir $name), $png)
    $img.Dispose()
}

# Before/after sheet for just these frames, cropped to the area around the spine
$count = $LastIndex - $FirstIndex + 1
$cw = 150; $ch = 360
$sheet = [System.Drawing.Bitmap]::new($count * $cw, 2 * $ch)
$g = [System.Drawing.Graphics]::FromImage($sheet)
$g.Clear([System.Drawing.Color]::Black)
$g.InterpolationMode = 'HighQualityBicubic'
$font = [System.Drawing.Font]::new('Consolas', [single]10)
for ($j = 0; $j -lt $count; $j++) {
    $i = $FirstIndex + $j
    $name = "f{0:d3}.png" -f $i
    $t = $Start + $i / $Fps
    foreach ($k in 0, 1) {
        $p = if ($k -eq 0) { Join-Path $raw $name } else { Join-Path $Dir $name }
        $im = New-Object System.Drawing.Bitmap $p
        $s = $im.Width / 1280.0
        $srcRect = [System.Drawing.Rectangle]::new([int](400 * $s), 0, [int](300 * $s), $im.Height)
        $g.DrawImage($im, [System.Drawing.Rectangle]::new($j * $cw, $k * $ch, $cw, $ch), $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
        $im.Dispose()
        $tag = if ($k -eq 0) { "before" } else { "after" }
        $g.DrawString(("{0} {1}" -f $t.ToString('0.00', $inv), $tag), $font, [System.Drawing.Brushes]::White, [single]($j * $cw + 3), [single]($k * $ch + 3))
    }
}
$g.Dispose()
$sheetPath = Join-Path $Dir "contact-sheet-edge.png"
$sheet.Save($sheetPath, $png)
$sheet.Dispose()

Write-Output "Edge-frame log:"
$log | ForEach-Object { Write-Output "  $_" }
Write-Output "Review: $sheetPath"
