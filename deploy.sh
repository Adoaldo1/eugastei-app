#!/bin/bash

# Script de Deploy para VPS Hostinger
# Configure as variáveis abaixo com suas informações

# Configurações do servidor
SERVER_USER="seu_usuario"
SERVER_HOST="seu_servidor.hostinger.com" 
SERVER_PATH="/home/seu_usuario/public_html"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🚀 Iniciando deploy do Eugastei...${NC}"

# 1. Build da aplicação
echo -e "${YELLOW}📦 Fazendo build da aplicação...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erro no build. Deploy cancelado.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build concluído com sucesso!${NC}"

# 2. Criar arquivo .htaccess para SPA
echo -e "${YELLOW}📝 Criando arquivo .htaccess...${NC}"
cat > build/.htaccess << 'EOF'
Options -MultiViews
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.html [QSA,L]

# Cache para assets estáticos
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
</IfModule>

# Compressão
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>
EOF

# 3. Upload via rsync
echo -e "${YELLOW}📤 Fazendo upload dos arquivos...${NC}"
rsync -avz --delete build/ $SERVER_USER@$SERVER_HOST:$SERVER_PATH/

if [ $? -eq 0 ]; then
    echo -e "${GREEN}🎉 Deploy concluído com sucesso!${NC}"
    echo -e "${GREEN}🌐 Seu app está disponível em: https://seudominio.com${NC}"
else
    echo -e "${RED}❌ Erro no upload. Verifique suas credenciais SSH.${NC}"
    exit 1
fi 