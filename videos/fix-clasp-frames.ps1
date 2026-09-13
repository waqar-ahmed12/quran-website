# Paints out the two small metal clasps Veo drew on the book's left edge as the cover starts to lift.
# A pixel counts as clasp when it is clearly brighter than its column's clean leather (the median of the same column
# above and below the clasps); it is replaced by the leather straight above it.
# The untouched frames are kept in videos\best-yet-frames\before-clasp-fix (each copied once, never overwritten). The
# script always works from those, so running it again is safe, and writes to videos\best-yet-frames and
# site\assets\hero\frames. Undo: copy the files in before-clasp-fix back into both folders.
#
#   powershell -NoProfile -ExecutionPolicy Bypass -File "C:\Users\Waqar Ahmed\Desktop\Claude\Planning\videos\fix-clasp-frames.ps1"

param(
    [int]$FirstIndex = 4,
    [int]$LastIndex = 22,
    [int]$BandLeft = 224,  # the book's left edge in the 1280x720 frames, where the clasps sit
    [int]$BandRight = 268, # stops short of the gold rule (~271)
    [int]$Top = 330,       # rows searched for clasps
    [int]$Bottom = 520,
    [int]$Lift = 130,      # replacement leather is taken from this many rows above
    [int]$Brighter = 45    # how much brighter (R+G+B) than the clean leather a pixel must be
)

Add-Type -AssemblyName System.Drawing
$plan = "C:\Users\Waqar Ahmed\Desktop\Claude\Planning"
$vid = Join-Path $plan "videos\best-yet-frames"
$site = Join-Path $plan "site\assets\hero\frames"
$backup = Join-Path $vid "before-clasp-fix"
$png = [System.Drawing.Imaging.ImageFormat]::Png
if (-not (Test-Path -LiteralPath $backup)) { New-Item -ItemType Directory -Path $backup | Out-Null }

function Sum($c) { [int]$c.R + $c.G + $c.B }

function Load($path) {
    $tmp = New-Object System.Drawing.Bitmap $path
    $img = [System.Drawing.Bitmap]::new($tmp.Width, $tmp.Height, [System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
    $g = [System.Drawing.Graphics]::FromImage($img); $g.DrawImage($tmp, 0, 0, $tmp.Width, $tmp.Height); $g.Dispose(); $tmp.Dispose()
    return $img
}

$log = @()
$changed = @()
for ($i = $FirstIndex; $i -le $LastIndex; $i++) {
    $name = "f{0:d3}.png" -f $i
    $original = Join-Path $backup $name
    if (-not (Test-Path -LiteralPath $original)) { Copy-Item -LiteralPath (Join-Path $vid $name) -Destination $original }
    $img = Load $original

    # Clean leather per column: the median brightness above and below the rows searched.
    $clean = @{}
    for ($x = $BandLeft; $x -le $BandRight; $x++) {
        $sums = New-Object System.Collections.Generic.List[int]
        for ($y = $Top - $Lift + 10; $y -lt $Top - 10; $y += 2) { $sums.Add((Sum ($img.GetPixel($x, $y)))) }
        for ($y = $Bottom + 10; $y -lt $Bottom + 90; $y += 2) { $sums.Add((Sum ($img.GetPixel($x, $y)))) }
        $sums.Sort()
        $clean[$x] = $sums[[int]($sums.Count / 2)]
    }

    # Mark clasp pixels, then grow each mark a little so no bright fringe is left behind.
    $marks = New-Object 'System.Collections.Generic.HashSet[int]'
    for ($y = $Top; $y -le $Bottom; $y++) {
        for ($x = $BandLeft; $x -le $BandRight; $x++) {
            if ((Sum ($img.GetPixel($x, $y))) - $clean[$x] -gt $Brighter) {
                for ($dy = -4; $dy -le 4; $dy++) {
                    for ($dx = -2; $dx -le 2; $dx++) {
                        $mx = $x + $dx; $my = $y + $dy
                        if ($mx -ge $BandLeft - 2 -and $mx -le $BandRight + 2 -and $my -ge $Top - 4 -and $my -le $Bottom + 4) { [void]$marks.Add($my * 2000 + $mx) }
                    }
                }
            }
        }
    }

    if ($marks.Count -eq 0) {
        $log += "$name  nothing found"
        $img.Dispose()
        continue
    }

    $x0 = 9999; $x1 = -1; $y0 = 9999; $y1 = -1
    $source = $img.Clone()
    foreach ($m in $marks) {
        $x = $m % 2000; $y = [math]::Floor($m / 2000)
        $img.SetPixel($x, $y, $source.GetPixel($x, $y - $Lift))
        if ($x -lt $x0) { $x0 = $x }; if ($x -gt $x1) { $x1 = $x }; if ($y -lt $y0) { $y0 = $y }; if ($y -gt $y1) { $y1 = $y }
    }
    $source.Dispose()
    $img.Save((Join-Path $vid $name), $png)
    $img.Save((Join-Path $site $name), $png)
    $img.Dispose()
    $log += "$name  painted $($marks.Count) px, x $x0-$x1, y $y0-$y1"
    $changed += $i
}

# Before/after sheet of the book's left edge for the frames that changed.
if ($changed.Count -gt 0) {
    $cw = 150; $ch = $Bottom - $Top + 80
    $sheet = [System.Drawing.Bitmap]::new($changed.Count * $cw, 2 * $ch)
    $g = [System.Drawing.Graphics]::FromImage($sheet)
    $g.Clear([System.Drawing.Color]::Black)
    $font = [System.Drawing.Font]::new('Consolas', [single]9)
    for ($j = 0; $j -lt $changed.Count; $j++) {
        $name = "f{0:d3}.png" -f $changed[$j]
        foreach ($k in 0, 1) {
            $path = if ($k -eq 0) { Join-Path $backup $name } else { Join-Path $site $name }
            $im = New-Object System.Drawing.Bitmap $path
            $src = [System.Drawing.Rectangle]::new($BandLeft - 50, $Top - 40, $cw, $ch)
            $g.DrawImage($im, [System.Drawing.Rectangle]::new($j * $cw, $k * $ch, $cw, $ch), $src, [System.Drawing.GraphicsUnit]::Pixel)
            $im.Dispose()
            $tag = if ($k -eq 0) { 'before' } else { 'after' }
            $g.DrawString("$name $tag", $font, [System.Drawing.Brushes]::White, [single]($j * $cw + 3), [single]($k * $ch + 3))
        }
    }
    $g.Dispose()
    $sheetPath = Join-Path $vid "contact-sheet-clasps.png"
    $sheet.Save($sheetPath, $png)
    $sheet.Dispose()
}

Write-Output "Clasp log:"
$log | ForEach-Object { Write-Output "  $_" }
if ($changed.Count -gt 0) { Write-Output "Review: $sheetPath" }
