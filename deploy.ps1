# GitHub Pages 배포 스크립트 (무료)
# 사용법: PowerShell에서 .\deploy.ps1 실행

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

Write-Host "=== GitHub Pages 배포 ===" -ForegroundColor Cyan

# 1. GitHub CLI 로그인 확인
$auth = gh auth status 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "GitHub 로그인이 필요합니다." -ForegroundColor Yellow
    gh auth login -h github.com -p https -w
}

# 2. 원격 저장소 설정
$remote = git remote get-url origin 2>$null
if (-not $remote) {
    gh repo create mongsil-e/mobilewedding --public --source=. --remote=origin --description "Instagram-style mobile wedding invitation"
    if ($LASTEXITCODE -ne 0) {
        git remote add origin https://github.com/mongsil-e/mobilewedding.git
    }
}

# 3. Push
git push -u origin main

# 4. GitHub Pages 활성화
gh api repos/mongsil-e/mobilewedding/pages -X POST -f build_type=workflow 2>$null

Write-Host ""
Write-Host "배포 완료!" -ForegroundColor Green
Write-Host "사이트 URL: https://mongsil-e.github.io/mobilewedding/" -ForegroundColor Green
Write-Host "Actions 확인: https://github.com/mongsil-e/mobilewedding/actions" -ForegroundColor Gray
