# Clean repository script
$filesToRemove = @(
    "API_TEST_RESULTS.md",
    "DTO-INTEGRATION-REPORT.md", 
    "DTO_IMPLEMENTATION.md",
    "DTO_MAPPERS.md",
    "GITHUB_UPLOAD_COMPLETE.md",
    "GITHUB_UPLOAD_SUMMARY.md",
    "LOGIN_API_README.md",
    "LOGIN_API_SUMMARY.md", 
    "PROJECT_REPORT.md",
    "PROJECT_RUNNING_STATUS.md",
    "PROJECT_SUMMARY.md",
    "RUNNING_STATUS.md",
    "SETUP_GUIDE.md",
    "UPDATE_SUMMARY.md",
    "demo-server.js",
    "dto-api-server.js",
    "http-login-api.js",
    "login-api.js",
    "server.js",
    "start.js",
    "simple-login-api.js",
    "test-server.js",
    "test-dto-mapping.js",
    "test-dto-simple.js",
    "quick-test.ps1",
    "setup-mongodb.ps1",
    "simple-dto-test.ps1",
    "test-all-apis.ps1",
    "test-api.bat",
    "test-api.ps1",
    "test-dto-apis.ps1",
    "test-login-api.ps1",
    "upload-to-github.ps1"
)

foreach ($file in $filesToRemove) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Write-Host "Removed: $file"
    }
}

Write-Host "Cleanup complete!"
