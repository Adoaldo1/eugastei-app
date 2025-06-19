# Script de Deploy PowerShell para VPS Hostinger
param(
    [string]$ServerUser = "seu_usuario",
    [string]$ServerHost = "seu_servidor.hostinger.com",
    [string]$ServerPath = "/home/seu_usuario/public_html",
    [string]$DomainUrl = "https://seudominio.com"
)

Write-Host "Iniciando deploy do Eugastei..." -ForegroundColor Yellow

# 1. Build da aplicação
Write-Host "Fazendo build da aplicacao..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "Erro no build. Deploy cancelado." -ForegroundColor Red
    exit 1
}

Write-Host "Build concluido com sucesso!" -ForegroundColor Green

# 2. Criar arquivo ZIP para upload
Write-Host "Criando arquivo ZIP..." -ForegroundColor Yellow
$zipPath = "eugastei-build-$(Get-Date -Format 'yyyyMMdd-HHmmss').zip"

if (Test-Path $zipPath) {
    Remove-Item $zipPath
}

Compress-Archive -Path "build\*" -DestinationPath $zipPath

Write-Host "Arquivo ZIP criado: $zipPath" -ForegroundColor Green
Write-Host ""
Write-Host "Para fazer upload manual:" -ForegroundColor Yellow
Write-Host "1. Acesse o painel da Hostinger (hPanel)"
Write-Host "2. Vá em Gerenciador de Arquivos"
Write-Host "3. Navegue até public_html"
Write-Host "4. Faça upload do arquivo: $zipPath"
Write-Host "5. Extraia o arquivo na pasta raiz"
Write-Host ""
Write-Host "Deploy finalizado!" -ForegroundColor Green 