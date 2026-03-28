# 🚀 Como colocar o Dashboard Beza no ar

Você vai precisar de conta em dois serviços gratuitos: **Supabase** e **GitHub + Vercel**.
Tempo estimado: 15–20 minutos.

---

## PARTE 1 — Supabase (banco de dados)

### 1.1 Criar conta
1. Acesse **https://supabase.com** e clique em "Start your project"
2. Entre com sua conta Google
3. Clique em **"New project"**
4. Dê um nome (ex: `dashboard-beza`), escolha uma senha forte, região **South America (São Paulo)** e clique em **Create project**
5. Aguarde ~2 minutos até o projeto ficar pronto

### 1.2 Criar o banco de dados
1. No menu lateral, clique em **SQL Editor**
2. Abra o arquivo `supabase-schema.sql` que está nesta pasta
3. Copie todo o conteúdo e cole no editor do Supabase
4. Clique em **Run** (ou Ctrl+Enter)
5. Se aparecer "Success" ✅, o banco foi criado!

### 1.3 Pegar as credenciais
1. No menu lateral, clique em **Settings → API**
2. Copie dois valores:
   - **Project URL** → algo como `https://abcxyz.supabase.co`
   - **anon / public key** → uma chave longa começando com `eyJ...`
3. **Guarde esses dois valores** — você vai precisar deles no Passo 3

---

## PARTE 2 — GitHub (guardar o código)

### 2.1 Criar conta (se não tiver)
1. Acesse **https://github.com** e crie uma conta grátis

### 2.2 Subir o projeto
1. Acesse **https://github.com/new** para criar um repositório
2. Nome: `dashboard-beza`, marque como **Private**, clique em **Create repository**
3. Na página do repositório, clique em **"uploading an existing file"**
4. Arraste **toda a pasta `dashboard-beza`** para o campo de upload
   (ou faça o upload arquivo por arquivo: `package.json`, `vite.config.js`, `index.html`, `.gitignore`, e a pasta `src` completa)
5. Clique em **Commit changes**

> ⚠️ **NÃO suba o arquivo `.env`** — ele nunca deve ir para o GitHub!

---

## PARTE 3 — Vercel (hospedar o site)

### 3.1 Criar conta
1. Acesse **https://vercel.com** e entre com sua conta GitHub

### 3.2 Importar o projeto
1. Clique em **"Add New Project"**
2. Encontre o repositório `dashboard-beza` e clique em **Import**
3. Em **Framework Preset**, selecione **Vite**
4. Antes de clicar em Deploy, clique em **"Environment Variables"**

### 3.3 Configurar as variáveis de ambiente (IMPORTANTE!)
Adicione as duas variáveis abaixo com os valores que você copiou no Passo 1.3:

| Nome | Valor |
|------|-------|
| `VITE_SUPABASE_URL` | `https://seuprojeto.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJ...sua chave...` |

5. Clique em **Deploy** e aguarde ~2 minutos
6. Pronto! Você vai receber um link tipo `dashboard-beza.vercel.app` 🎉

---

## PARTE 4 — Usar como Web App no iPhone/Mac

### No iPhone:
1. Abra o link no Safari
2. Toque no botão de compartilhar (□↑)
3. Role e toque em **"Adicionar à Tela de Início"**
4. Dê o nome "Beza" e confirme

### No Mac:
1. Abra no Chrome ou Safari
2. No Chrome: menu ⋮ → "Salvar e compartilhar" → "Instalar como app"
3. No Safari: menu "Arquivo" → "Adicionar ao Dock"

---

## ✅ Checklist rápido

- [ ] Conta Supabase criada
- [ ] Banco de dados criado (SQL executado)
- [ ] URL e chave do Supabase anotadas
- [ ] Repositório GitHub criado
- [ ] Arquivos do projeto enviados para o GitHub
- [ ] Projeto importado no Vercel
- [ ] Variáveis de ambiente configuradas no Vercel
- [ ] Deploy feito com sucesso
- [ ] Link funcionando no navegador

---

## ❓ Problemas comuns

**"Failed to fetch" ou tela em branco:**
→ As variáveis de ambiente não foram configuradas. Vá em Vercel → Seu projeto → Settings → Environment Variables.

**Tarefas não aparecem:**
→ Verifique se o SQL foi executado corretamente no Supabase SQL Editor.

**Rollover não funcionou:**
→ O rollover acontece automaticamente quando você abre o app. Se não aparecer o aviso amarelo, significa que não havia tarefas pendentes de dias anteriores.
