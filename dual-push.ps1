# Dual Repository Push Script
# This script pushes changes to both repositories simultaneously

param(
    [string]$Message = "Update: synchronized changes",
    [string]$Branch = "main"
)

Write-Host "🚀 Dual Repository Push Script" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

# Check if there are changes to commit
$status = git status --porcelain
if ($status) {
    Write-Host "📝 Changes detected, adding files..." -ForegroundColor Yellow
    git add .
    
    Write-Host "💾 Committing changes..." -ForegroundColor Yellow
    git commit -m $Message
} else {
    Write-Host "✅ No new changes to commit" -ForegroundColor Green
}

# Push to both repositories
Write-Host "📤 Pushing to repositories..." -ForegroundColor Blue

Write-Host "  → Pushing to AbdallahMohamedDotnet/CoralGuard..." -ForegroundColor White
try {
    git push origin $Branch
    Write-Host "  ✅ Successfully pushed to origin (AbdallahMohamedDotnet)" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Failed to push to origin: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "  → Pushing to Ahmed22193/CoralGuard..." -ForegroundColor White
try {
    git push ahmed-repo $Branch
    Write-Host "  ✅ Successfully pushed to ahmed-repo (Ahmed22193)" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Failed to push to ahmed-repo: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "🎉 Dual push completed!" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Repository Status:" -ForegroundColor Yellow
Write-Host "  • Origin: https://github.com/AbdallahMohamedDotnet/CoralGuard.git" -ForegroundColor White
Write-Host "  • Ahmed Repo: https://github.com/Ahmed22193/CoralGuard.git" -ForegroundColor White
Write-Host ""
