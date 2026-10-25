$taskWorkspace = [IO.Path]::GetFullPath('D:\New folder')
$archiveRoot = Join-Path $taskWorkspace 'input-extracted'
New-Item -ItemType Directory -Path $archiveRoot -Force | Out-Null
$packageCheck = Get-Content -LiteralPath (Join-Path $taskWorkspace 'qa\package-verification.json') -Raw | ConvertFrom-Json
foreach ($templateLetter in @('a','b','c')) {
    $siteRoot = [IO.Path]::GetFullPath((Join-Path $taskWorkspace ('website-' + $templateLetter)))
    $savedRoot = [IO.Path]::GetFullPath((Join-Path $archiveRoot $templateLetter))
    if (-not $siteRoot.StartsWith($taskWorkspace + '\') -or -not $savedRoot.StartsWith($taskWorkspace + '\')) { throw 'Path outside workspace' }
    New-Item -ItemType Directory -Path $savedRoot -Force | Out-Null
    foreach ($folderName in @($templateLetter, '__MACOSX')) {
        $sourcePath = [IO.Path]::GetFullPath((Join-Path $siteRoot $folderName))
        $destinationPath = [IO.Path]::GetFullPath((Join-Path $savedRoot $folderName))
        if (-not $sourcePath.StartsWith($siteRoot + '\') -or -not $destinationPath.StartsWith($savedRoot + '\')) { throw 'Invalid move target' }
        if (Test-Path -LiteralPath $sourcePath) { Move-Item -LiteralPath $sourcePath -Destination $destinationPath }
    }
    $siteCheck = $packageCheck.PSObject.Properties[$templateLetter].Value
    $keepFiles = [Collections.Generic.HashSet[string]]::new([StringComparer]::OrdinalIgnoreCase)
    foreach ($entry in $siteCheck.entries) { [void]$keepFiles.Add([IO.Path]::GetFullPath((Join-Path $taskWorkspace $entry))) }
    $siteFiles = @(Get-ChildItem -LiteralPath $siteRoot -Recurse -File -Force)
    foreach ($siteFile in $siteFiles) {
        if ($keepFiles.Contains($siteFile.FullName)) { continue }
        $relativeFile = [IO.Path]::GetRelativePath($siteRoot, $siteFile.FullName)
        $destinationFile = [IO.Path]::GetFullPath((Join-Path (Join-Path $savedRoot 'unused') $relativeFile))
        if (-not $siteFile.FullName.StartsWith($siteRoot + '\') -or -not $destinationFile.StartsWith($savedRoot + '\')) { throw 'Invalid file move' }
        New-Item -ItemType Directory -Path ([IO.Path]::GetDirectoryName($destinationFile)) -Force | Out-Null
        Move-Item -LiteralPath $siteFile.FullName -Destination $destinationFile
    }
    Write-Output ('Clean delivery directory: ' + $siteRoot)
}
