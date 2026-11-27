# Helper: matikan dev server lama di port 3000, lalu jalankan Playwright
# Usage: .\scripts\playwright-run.ps1 [playwright args...]
#
# Contoh:
#   .\scripts\playwright-run.ps1 tests/e2e/TC.DRV.003.spec.ts --headed

# Matikan proses yang mendengarkan port 3000
$port = 3000
$pids = (netstat -ano | Select-String ":$port\s" | ForEach-Object {
    ($_ -split '\s+')[-1]
}) | Sort-Object -Unique | Where-Object { $_ -match '^\d+$' }

foreach ($p in $pids) {
    try {
        Stop-Process -Id $p -Force -ErrorAction Stop
        Write-Host "Killed PID $p (was using port $port)"
        Start-Sleep -Milliseconds 500
    } catch {
        # already gone
    }
}

# Jalankan Playwright dengan argumen yang diberikan
$playwrightArgs = $args
npx playwright test @playwrightArgs
