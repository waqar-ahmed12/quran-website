# Paints out the small metal clasps Veo drew on the book's left edge as the cover starts to lift (f009-f017).
#
# In each frame the left edge of the cover's gold rule is found first; the clasps sit 19-40 px left of it, between
# rows 290 and 500. The book's edge there runs straight up and down, so a pixel normally matches the average of the
# pixels a few rows above and below it; the curly clasps are what breaks that. Those pixels are grouped into clasps,
# and each clasp's box, padded, is repainted column by column, blending from the rows just above the box to the rows
# just below.
#
# Always starts from the untouched frames in videos\best-yet-frames\before-clasp-fix (copied there once, never
# overwritten), so running it again is safe and replaces earlier results. Frames without clasps are put back exactly
# as they were. Writes to videos\best-yet-frames and site\assets\hero\frames, and saves contact-sheet-clasps.png: the
# book's left edge at 3x, before above and after below. -DryRun saves only the sheet.
# Undo: copy the files in before-clasp-fix back into both folders.
#
#   powershell -NoProfile -ExecutionPolicy Bypass -File "C:\Users\Waqar Ahmed\Desktop\Claude\Planning\videos\fix-clasp-frames.ps1"

param(
    [int]$FirstIndex = 0,
    [int]$LastIndex = 30,
    [switch]$DryRun,
    [string]$SheetPath = ''
)

Add-Type -AssemblyName System.Drawing
$plan = 'C:\Users\Waqar Ahmed\Desktop\Claude\Planning'
$vid = Join-Path $plan 'videos\best-yet-frames'
$site = Join-Path $plan 'site\assets\hero\frames'
$backup = Join-Path $vid 'before-clasp-fix'
if (-not $SheetPath) { $SheetPath = Join-Path $vid 'contact-sheet-clasps.png' }
$fmt = [System.Drawing.Imaging.PixelFormat]::Format24bppRgb
$png = [System.Drawing.Imaging.ImageFormat]::Png

# Frame pixels (1280x720). Near, Far and KeepClear are distances to the left of the rule.
$Near = 16; $Far = 44                 # clasps are looked for between these
$KeepClear = 10                       # nothing closer to the rule than this is repainted
$RuleMaxX = 320                       # further right, the cover has swung and the cream pages show at the edge
$Top = 286; $Bottom = 506             # rows searched for clasps
$Step = 3                             # rows above and below that a pixel is compared with
$Deviation = 45                       # red + green + blue of |2 x pixel - above - below| that counts as clasp
$MinPixels = 8                        # smaller groups are video noise
$PadX = 3; $PadY = 6
$RefRows = 4                          # rows averaged just above and below each box
$Zoom = 3

if (-not $DryRun -and -not (Test-Path -LiteralPath $backup)) { New-Item -ItemType Directory -Path $backup | Out-Null }

function Read-Frame([string]$path) {
    $src = New-Object System.Drawing.Bitmap $path
    $bmp = [System.Drawing.Bitmap]::new($src.Width, $src.Height, $fmt)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.DrawImage($src, 0, 0, $src.Width, $src.Height)
    $g.Dispose(); $src.Dispose()
    $lock = $bmp.LockBits([System.Drawing.Rectangle]::new(0, 0, $bmp.Width, $bmp.Height), [System.Drawing.Imaging.ImageLockMode]::ReadOnly, $fmt)
    $bytes = New-Object byte[] ($lock.Stride * $bmp.Height)
    [System.Runtime.InteropServices.Marshal]::Copy($lock.Scan0, $bytes, 0, $bytes.Length)
    $frame = [pscustomobject]@{ Bytes = $bytes; Stride = $lock.Stride; Width = $bmp.Width; Height = $bmp.Height }
    $bmp.UnlockBits($lock); $bmp.Dispose()
    return $frame
}

function ConvertTo-Bitmap($frame, [byte[]]$bytes) {
    $bmp = [System.Drawing.Bitmap]::new($frame.Width, $frame.Height, $fmt)
    $lock = $bmp.LockBits([System.Drawing.Rectangle]::new(0, 0, $frame.Width, $frame.Height), [System.Drawing.Imaging.ImageLockMode]::WriteOnly, $fmt)
    [System.Runtime.InteropServices.Marshal]::Copy($bytes, 0, $lock.Scan0, $bytes.Length)
    $bmp.UnlockBits($lock)
    return $bmp
}

# The left edge of the gold rule: the first gold pixel from the left, on rows above and below the clasps.
function Find-Rule($f) {
    $hits = New-Object System.Collections.Generic.List[int]
    foreach ($y in 270, 276, 282, 526, 532, 538) {
        $row = $y * $f.Stride
        for ($x = 180; $x -le $RuleMaxX; $x++) {
            $k = $row + $x * 3
            $r = [int]$f.Bytes[$k + 2]
            if ($r -ge 120 -and $r - [int]$f.Bytes[$k] -ge 40) { $hits.Add($x); break }
        }
    }
    if ($hits.Count -lt 4) { return -1 }
    $hits.Sort()
    return $hits[[int][math]::Floor($hits.Count / 2)]
}

function Find-Clasps($f, [int]$rule) {
    $x0 = $rule - $Far
    $W = $Far - $Near + 1
    $H = $Bottom - $Top + 1

    $odd = New-Object bool[] ($W * $H)
    $cells = New-Object System.Collections.Generic.List[int]
    for ($y = 0; $y -lt $H; $y++) {
        $row = ($Top + $y) * $f.Stride
        $up = ($Top + $y - $Step) * $f.Stride
        $down = ($Top + $y + $Step) * $f.Stride
        for ($x = 0; $x -lt $W; $x++) {
            $o = ($x0 + $x) * 3
            $d = 0
            for ($c = 0; $c -lt 3; $c++) {
                $d += [math]::Abs(2 * [int]$f.Bytes[$row + $o + $c] - [int]$f.Bytes[$up + $o + $c] - [int]$f.Bytes[$down + $o + $c])
            }
            if ($d -gt $Deviation) {
                $odd[$y * $W + $x] = $true
                $cells.Add($y * $W + $x)
            }
        }
    }

    # Odd pixels within 3 px of each other belong to the same clasp.
    $seen = New-Object bool[] ($W * $H)
    $boxes = New-Object System.Collections.Generic.List[object]
    foreach ($s in $cells) {
        if ($seen[$s]) { continue }
        $stack = New-Object System.Collections.Generic.Stack[int]
        $stack.Push($s); $seen[$s] = $true
        $n = 0; $bx0 = $W; $bx1 = -1; $by0 = $H; $by1 = -1
        while ($stack.Count -gt 0) {
            $q = $stack.Pop(); $qx = $q % $W; $qy = ($q - $qx) / $W
            $n++
            if ($qx -lt $bx0) { $bx0 = $qx }; if ($qx -gt $bx1) { $bx1 = $qx }
            if ($qy -lt $by0) { $by0 = $qy }; if ($qy -gt $by1) { $by1 = $qy }
            for ($dy = -3; $dy -le 3; $dy++) {
                $ny = $qy + $dy
                if ($ny -lt 0 -or $ny -ge $H) { continue }
                for ($dx = -3; $dx -le 3; $dx++) {
                    $nx = $qx + $dx
                    if ($nx -lt 0 -or $nx -ge $W) { continue }
                    $nq = $ny * $W + $nx
                    if ($odd[$nq] -and -not $seen[$nq]) { $seen[$nq] = $true; $stack.Push($nq) }
                }
            }
        }
        if ($n -lt $MinPixels) { continue }
        $boxes.Add([pscustomobject]@{
            X0 = $x0 + $bx0 - $PadX
            X1 = [math]::Min($x0 + $bx1 + $PadX, $rule - $KeepClear)
            Y0 = $Top + $by0 - $PadY
            Y1 = $Top + $by1 + $PadY
            N  = $n
        })
    }

    # Boxes so close that one's reference rows would fall inside the other are repainted as one.
    do {
        $joined = $false
        for ($i = 0; $i -lt $boxes.Count -and -not $joined; $i++) {
            for ($j = $i + 1; $j -lt $boxes.Count; $j++) {
                $a = $boxes[$i]; $c = $boxes[$j]
                if ($a.X0 -le $c.X1 + 1 -and $c.X0 -le $a.X1 + 1 -and $a.Y0 -le $c.Y1 + $RefRows + 1 -and $c.Y0 -le $a.Y1 + $RefRows + 1) {
                    $a.X0 = [math]::Min($a.X0, $c.X0); $a.X1 = [math]::Max($a.X1, $c.X1)
                    $a.Y0 = [math]::Min($a.Y0, $c.Y0); $a.Y1 = [math]::Max($a.Y1, $c.Y1)
                    $a.N += $c.N
                    $boxes.RemoveAt($j)
                    $joined = $true
                    break
                }
            }
        }
    } while ($joined)
    return , $boxes
}

# Repaints each box on a copy of the frame, blending from the rows just above it to the rows just below.
function Repair-Frame($f, $boxes) {
    $after = [byte[]]$f.Bytes.Clone()
    $s = $f.Stride
    foreach ($box in $boxes) {
        $span = $box.Y1 - $box.Y0 + 2
        for ($x = $box.X0; $x -le $box.X1; $x++) {
            $above = @(0, 0, 0); $below = @(0, 0, 0)
            for ($j = 1; $j -le $RefRows; $j++) {
                $ka = ($box.Y0 - $j) * $s + $x * 3
                $kb = ($box.Y1 + $j) * $s + $x * 3
                for ($ch = 0; $ch -lt 3; $ch++) {
                    $above[$ch] += $f.Bytes[$ka + $ch]
                    $below[$ch] += $f.Bytes[$kb + $ch]
                }
            }
            for ($y = $box.Y0; $y -le $box.Y1; $y++) {
                $t = ($y - $box.Y0 + 1) / $span
                $k = $y * $s + $x * 3
                for ($ch = 0; $ch -lt 3; $ch++) {
                    $after[$k + $ch] = [byte][math]::Round(($above[$ch] + ($below[$ch] - $above[$ch]) * $t) / $RefRows)
                }
            }
        }
    }
    return , $after
}

$results = New-Object System.Collections.Generic.List[object]
$log = New-Object System.Collections.Generic.List[string]
for ($i = $FirstIndex; $i -le $LastIndex; $i++) {
    $name = 'f{0:d3}.png' -f $i
    $current = Join-Path $vid $name
    $saved = Join-Path $backup $name
    if (-not (Test-Path -LiteralPath $current)) { continue }
    $original = $current
    if (Test-Path -LiteralPath $saved) { $original = $saved }
    $f = Read-Frame $original
    $rule = Find-Rule $f
    $boxes = $null
    if ($rule -ge 0) { $boxes = Find-Clasps $f $rule }
    $after = $null
    if ($boxes.Count -gt 0) {
        $after = Repair-Frame $f $boxes
        $parts = foreach ($b in $boxes) { "x $($b.X0)-$($b.X1) y $($b.Y0)-$($b.Y1) ($($b.N) px)" }
        $log.Add("$name  rule at x $rule, repainted $($boxes.Count): $($parts -join '; ')")
    } elseif ($rule -lt 0) {
        $log.Add("$name  no gold rule near the left edge, kept as it was")
    } else {
        $log.Add("$name  rule at x $rule, no clasps, kept as it was")
    }
    $results.Add([pscustomobject]@{ Index = $i; Name = $name; Current = $current; Saved = $saved; Frame = $f; Rule = $rule; After = $after; Count = $boxes.Count })
}

if (-not $DryRun) {
    foreach ($r in $results) {
        if ($r.Count -gt 0) {
            if (-not (Test-Path -LiteralPath $r.Saved)) { Copy-Item -LiteralPath $r.Current -Destination $r.Saved }
            $bmp = ConvertTo-Bitmap $r.Frame $r.After
            $bmp.Save($r.Current, $png)
            $bmp.Save((Join-Path $site $r.Name), $png)
            $bmp.Dispose()
        } elseif (Test-Path -LiteralPath $r.Saved) {
            Copy-Item -LiteralPath $r.Saved -Destination $r.Current -Force
            Copy-Item -LiteralPath $r.Saved -Destination (Join-Path $site $r.Name) -Force
        }
    }
}

# Review sheet: every frame from one before the first clasp to one after the last.
$flagged = @($results | Where-Object { $_.Count -gt 0 })
if ($flagged.Count -gt 0) {
    $from = $flagged[0].Index - 1
    $to = $flagged[-1].Index + 1
    $shown = @($results | Where-Object { $_.Index -ge $from -and $_.Index -le $to })
    $cropW = 55; $cropH = 232
    $cw = $cropW * $Zoom; $ch = $cropH * $Zoom
    $sheet = [System.Drawing.Bitmap]::new($shown.Count * $cw, 2 * $ch)
    $g = [System.Drawing.Graphics]::FromImage($sheet)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half
    $font = [System.Drawing.Font]::new('Consolas', [single]10)
    $ruleX = 280
    for ($j = 0; $j -lt $shown.Count; $j++) {
        $r = $shown[$j]
        if ($r.Rule -ge 0) { $ruleX = $r.Rule }
        $src = [System.Drawing.Rectangle]::new($ruleX - 52, 280, $cropW, $cropH)
        foreach ($row in 0, 1) {
            $bytes = $r.Frame.Bytes
            if ($row -eq 1 -and $r.Count -gt 0) { $bytes = $r.After }
            $bmp = ConvertTo-Bitmap $r.Frame $bytes
            $g.DrawImage($bmp, [System.Drawing.Rectangle]::new($j * $cw, $row * $ch, $cw, $ch), $src, [System.Drawing.GraphicsUnit]::Pixel)
            $bmp.Dispose()
            $tag = 'before'
            if ($row -eq 1) { $tag = 'after' }
            $g.DrawString("$($r.Name.Substring(0, 4)) $tag", $font, [System.Drawing.Brushes]::White, [single]($j * $cw + 4), [single]($row * $ch + 4))
        }
    }
    $g.Dispose()
    $sheet.Save($SheetPath, $png)
    $sheet.Dispose()
}

if ($DryRun) { Write-Output 'Dry run: no frames were changed.' }
Write-Output 'Clasp log:'
$log | ForEach-Object { Write-Output "  $_" }
if ($flagged.Count -gt 0) { Write-Output "Review: $SheetPath (3x zoom, before above, after below)" }
