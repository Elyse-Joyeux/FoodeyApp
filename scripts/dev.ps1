$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

$backend = Start-Job -ArgumentList $root -ScriptBlock {
  param($projectRoot)
  Set-Location $projectRoot
  npm run dev:backend
}

try {
  npm run dev:frontend
}
finally {
  Stop-Job $backend -ErrorAction SilentlyContinue
  Remove-Job $backend -Force -ErrorAction SilentlyContinue
}
