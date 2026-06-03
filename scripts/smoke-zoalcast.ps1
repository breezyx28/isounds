$ErrorActionPreference = "Stop"

$BaseUrl = if ($env:BASE_URL) { $env:BASE_URL } else { "https://api.zoalcast.com/api" }
$PortalId = if ($env:PORTAL_ID) { $env:PORTAL_ID } else { "6" }

Write-Host "Smoke test: $BaseUrl (portal $PortalId)"

function Assert-200 {
  param([string]$Url)
  try {
    $response = Invoke-WebRequest -Uri $Url -Method GET -UseBasicParsing
    if ($response.StatusCode -ne 200) {
      throw "Unexpected status: $($response.StatusCode)"
    }
    Write-Host "OK: $Url"
  } catch {
    Write-Error "FAIL: $Url - $($_.Exception.Message)"
    exit 1
  }
}

Assert-200 "$BaseUrl/portal/$PortalId/categories"
Assert-200 "$BaseUrl/podcast/$PortalId/top?criteria=latest&page=1&per_page=20"
Assert-200 "$BaseUrl/podcast/$PortalId/search?q=music&page=1"

$top = Invoke-RestMethod -Uri "$BaseUrl/podcast/$PortalId/top?criteria=latest&page=1&per_page=20" -Method GET
$podcastId = $top.data[0].id
if (-not $podcastId) {
  Write-Error "FAIL: Could not resolve podcast id from top list."
  exit 1
}
Assert-200 "$BaseUrl/podcast/$podcastId"

Write-Host "Smoke test completed successfully."
