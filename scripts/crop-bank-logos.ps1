Add-Type -AssemblyName System.Drawing

$srcPath = "frontend/public/images/chapa_banks_showcase.jpg"
if (-not (Test-Path $srcPath)) {
    Write-Error "Source file not found: $srcPath"
    exit 1
}

$bmp = [System.Drawing.Bitmap]::new((Resolve-Path $srcPath).Path)
$outDir = "frontend/public/images/banks"
if (-not (Test-Path $outDir)) {
    New-Item -ItemType Directory -Path $outDir -Force | Out-Null
}

$crops = @(
    @{ Name = "ahadu"; X = 0; Y = 25; W = 175; H = 90 },
    @{ Name = "zamzam"; X = 220; Y = 35; W = 145; H = 55 },
    @{ Name = "tsedey"; X = 390; Y = 60; W = 160; H = 50 },
    @{ Name = "tsehay"; X = 565; Y = 12; W = 170; H = 125 },
    @{ Name = "global"; X = 775; Y = 25; W = 125; H = 95 },
    @{ Name = "amhara"; X = 10; Y = 135; W = 140; H = 105 },
    @{ Name = "zemen"; X = 215; Y = 105; W = 170; H = 65 },
    @{ Name = "enat"; X = 615; Y = 145; W = 165; H = 110 },
    @{ Name = "hibret"; X = 780; Y = 130; W = 120; H = 105 },
    @{ Name = "abyssinia"; X = 145; Y = 220; W = 255; H = 85 },
    @{ Name = "awash"; X = 395; Y = 265; W = 325; H = 90 },
    @{ Name = "oromia"; X = 770; Y = 275; W = 130; H = 70 },
    @{ Name = "buna"; X = 5; Y = 350; W = 140; H = 130 },
    @{ Name = "lion"; X = 195; Y = 340; W = 165; H = 100 },
    @{ Name = "dashen"; X = 415; Y = 380; W = 115; H = 95 },
    @{ Name = "goh"; X = 620; Y = 375; W = 115; H = 105 },
    @{ Name = "nib"; X = 800; Y = 375; W = 100; H = 90 },
    @{ Name = "berhan"; X = 10; Y = 475; W = 330; H = 80 },
    @{ Name = "addis"; X = 55; Y = 535; W = 130; H = 65 },
    @{ Name = "coop"; X = 370; Y = 505; W = 170; H = 80 },
    @{ Name = "wegagen"; X = 645; Y = 475; W = 220; H = 110 }
)

foreach ($c in $crops) {
    # Ensure within bounds
    $x = [Math]::Max(0, $c.X)
    $y = [Math]::Max(0, $c.Y)
    $w = [Math]::Min($bmp.Width - $x, $c.W)
    $h = [Math]::Min($bmp.Height - $y, $c.H)
    
    $rect = [System.Drawing.Rectangle]::new($x, $y, $w, $h)
    $targetBmp = $bmp.Clone($rect, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    
    $destFile = Join-Path $outDir "bank_$($c.Name).png"
    $targetBmp.Save($destFile, [System.Drawing.Imaging.ImageFormat]::Png)
    $targetBmp.Dispose()
    Write-Host "Saved: $destFile ($w x $h)"
}

$bmp.Dispose()
Write-Host "All $($crops.Count) bank logos extracted successfully to $outDir!"

