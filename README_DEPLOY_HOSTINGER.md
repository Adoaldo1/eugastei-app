# 🚀 Deploy do Eugastei na Hostinger VPS

## 📋 Pré-requisitos

1. **VPS ativo na Hostinger**
2. **Acesso SSH configurado**
3. **Domínio apontando para o VPS**
4. **Node.js instalado localmente** (para build)

## 🎯 Opções de Deploy

### **Opção 1: Upload Manual via FTP/SFTP (Mais Simples)**

#### Passos:
1. **Build da aplicação:**
   ```bash
   npm run build
   ```

2. **Compactar arquivos:**
   - Windows: `Compress-Archive -Path build\* -DestinationPath eugastei-build.zip`
   - Linux/Mac: `cd build && tar -czf ../eugastei-build.tar.gz *`

3. **Upload via hPanel:**
   - Acesse o painel da Hostinger
   - Vá em **Gerenciador de Arquivos**
   - Navegue até `public_html` (ou pasta do seu domínio)
   - Faça upload do arquivo compactado
   - Extraia os arquivos na pasta raiz do domínio

4. **Configurar .htaccess:**
   - O arquivo `.htaccess` já está incluído no build
   - Garante que as rotas do React funcionem corretamente

---

### **Opção 2: Deploy Automático via SSH (Recomendado)**

#### 1. Configurar SSH:
```bash
# Gerar chave SSH (se não tiver)
ssh-keygen -t rsa -b 4096 -C "seu-email@exemplo.com"

# Copiar chave pública para o servidor
ssh-copy-id seu_usuario@seu_servidor.hostinger.com
```

#### 2. Configurar deploy:
```bash
# Copiar arquivo de configuração
cp deploy-config.example.sh deploy-config.sh

# Editar com suas informações
nano deploy-config.sh
```

#### 3. Executar deploy:
```bash
# Dar permissão de execução
chmod +x deploy.sh

# Executar deploy
./deploy.sh
```

---

## ⚙️ Configuração do Servidor

### **Arquivo .htaccess (já incluído):**
```apache
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
```

---

## 🔧 Configuração das Variáveis de Ambiente

### **No servidor (via SSH):**
```bash
# Conectar ao servidor
ssh seu_usuario@seu_servidor.hostinger.com

# Criar arquivo .env na pasta do projeto
nano public_html/.env
```

### **Conteúdo do .env:**
```env
# Configurações do Supabase
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase

# Configurações do app
VITE_APP_NAME=Eugastei
VITE_APP_VERSION=1.0.0
```

---

## 🔍 Verificação Pós-Deploy

### **Checklist:**
- [ ] Site carrega corretamente
- [ ] Rotas funcionam (ex: `/login`, `/dashboard`)
- [ ] Login com Supabase funciona
- [ ] Assets estáticos carregam
- [ ] HTTPS está ativo
- [ ] Performance está boa

### **Comandos úteis para debug:**
```bash
# Verificar logs do Apache
tail -f /var/log/apache2/error.log

# Verificar permissões
ls -la public_html/

# Testar conectividade
curl -I https://seudominio.com
```

---

## 🚨 Troubleshooting

### **Problema: Página em branco**
**Solução:**
- Verificar console do navegador para erros
- Confirmar se arquivo `.htaccess` está presente
- Verificar se as variáveis de ambiente estão corretas

### **Problema: Rotas 404**
**Solução:**
- Verificar se `.htaccess` está configurado corretamente
- Confirmar se mod_rewrite está habilitado no Apache

### **Problema: Erro de CORS**
**Solução:**
- Verificar configurações do Supabase
- Adicionar domínio nas configurações permitidas

### **Problema: Assets não carregam**
**Solução:**
- Verificar permissões dos arquivos (755 para pastas, 644 para arquivos)
- Confirmar se o caminho base está correto

---

## 📞 Suporte

Para problemas específicos da Hostinger:
- **Chat ao vivo:** Disponível 24/7
- **Base de conhecimento:** help.hostinger.com
- **Tickets:** Via painel da conta

---

## 🔄 Atualizações Futuras

Para atualizar o app:
1. Fazer alterações no código local
2. Executar `npm run build`
3. Executar `./deploy.sh` (se usando SSH)
4. Ou fazer upload manual dos novos arquivos

---

**✅ Pronto! Seu app Eugastei está no ar! 🎉** 