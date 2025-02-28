# Define directories
$sourceDir = "C:\Users\Test\PhpstormProjects\ReactBotWeb\GrabBagGreenScreen"  # Replace with your source directory
$outputDir = "C:\Users\Test\PhpstormProjects\ReactBotWeb\GrabBag"  # Replace with your output directory

# Create output directory if it doesn't exist
if (!(Test-Path -Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir
}

# Get all MP4 files in source directory
Get-ChildItem -Path $sourceDir -Filter "*.mp4" | ForEach-Object {
    $inputFile = $_.FullName
    $outputFile = Join-Path $outputDir ($_.BaseName + ".webm")  # WebM format supports alpha channel

    Write-Host "Processing: $($_.Name)"

    # FFMPEG command to remove green screen and convert to WebM with alpha channel
    # Adjusting the chromakey filter values might be needed based on your green screen color
    ffmpeg -i $inputFile `
           -filter_complex "[0:v]scale=-1:240,chromakey=0x00FF00:0.4:0.08[ckout]" `
           -map "[ckout]" `
           -map 0:a `
           -c:v libvpx-vp9 `
           -c:a libopus `
           -pix_fmt yuva420p `
           -auto-alt-ref 0 `
           -b:v 500K `
           $outputFile

    Write-Host "Completed: $($_.Name) -> $($outputFile)"
}

Write-Host "All files processed!"
