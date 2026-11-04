Add-Type -AssemblyName System.Drawing

$sourcePath = Join-Path $PSScriptRoot "..\public\og-image.jpg"
$outputPath = Join-Path $PSScriptRoot "..\public\og-image-opt.jpg"

if (Test-Path $sourcePath) {
    $img = [System.Drawing.Image]::FromFile($sourcePath)
    $bmp = New-Object System.Drawing.Bitmap(1200, 630)
    $graph = [System.Drawing.Graphics]::FromImage($bmp)
    $graph.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graph.DrawImage($img, 0, 0, 1200, 630)
    $img.Dispose()

    $jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
    $encoder = [System.Drawing.Imaging.Encoder]::Quality
    $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
    $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter($encoder, 75)

    $bmp.Save($outputPath, $jpegCodec, $encoderParams)
    $bmp.Dispose()
    $graph.Dispose()

    Remove-Item $sourcePath -Force
    Move-Item $outputPath $sourcePath -Force
    $newSize = (Get-Item $sourcePath).Length
    Write-Host "Compressed og-image.jpg to size: $newSize bytes"
}
