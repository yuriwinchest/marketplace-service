# ServiçoJá - Marketplace de Serviços

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Status](https://img.shields.io/badge/status-em%20desenvolvimento-orange)
![Version](https://img.shields.io/badge/version-1.0.0-green)

## 📌 Descrição

O **ServiçoJá** é uma plataforma moderna de marketplace de serviços que conecta clientes a profissionais qualificados. O sistema permite que usuários publiquem demandas (como reparos elétricos, pintura, limpeza) e recebam propostas de freelancers cadastrados.

O projeto foi construído com foco em **experiência do usuário (UX)**, **segurança** e **performance**, utilizando tecnologias de ponta no ecossistema JavaScript.

---

## 🚀 Funcionalidades Principais

### 🏢 Para Clientes
- **Publicação de Serviços**: Criação de pedidos com título, descrição, orçamento estimado e urgência.
- **Gestão de Demandas**: Dashboard para acompanhar status dos serviços (Aberto, Em andamento, Concluído).
- **Busca de Profissionais**: (Em breve) Visualização de perfis de profissionais na região.
- **Perfil de Usuário**: Gestão de dados pessoais e foto de perfil.

### 💼 Para Profissionais
- **Painel de Oportunidades**: Visualização de serviços disponíveis filtrados por categoria e região.
- **Filtros Avançados**: Busca por orçamento, urgência e tipo de serviço.
- **Perfil Profissional**: Edição de bio, habilidades, telefone e portfólio.
- **Candidatura**: (Em breve) Sistema de envio de propostas diretas.

### ⚙️ Funcionalidades do Sistema
- **Autenticação Segura**: Login e Registro com criptografia (bcrypt) e tokens JWT.
- **Upload de Imagens**: Sistema de avatar para usuários com armazenamento local.
- **Design Responsivo**: Interface adaptada para desktop, tablets e mobile.
- **Dark Mode**: Tema visual moderno em tons de verde esmeralda.

---

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 19**: Biblioteca UI para construção de interfaces reativas.
- **TypeScript**: Superset JavaScript para tipagem estática e segurança.
- **Vite**: Build tool de próxima geração, ultra-rápida.
- **CSS Modules / Variáveis**: Estilização moderna e organizada sem frameworks pesados.

### Backend
- **Node.js + Express**: Servidor robusto e escalável.
- **PostgreSQL**: Banco de dados relacional.
- **Supabase**: Infraestrutura de banco de dados e autenticação (usado como DB provider).
- **Zod**: Validação de esquemas e dados.
- **Multer**: Middleware para upload de arquivos.
- **JWT + Bcrypt**: Segurança e autenticação.

---

## 📂 Estrutura do Projeto

```
/
├── backend/            # API Server (Express + Node.js)
│   ├── src/
│   │   ├── server.ts   # Ponto de entrada e rotas
│   │   └── migrate.ts  # Gerenciador de migrações
│   ├── migrations/     # Scripts SQL de estrutura do banco
│   └── uploads/        # Armazenamento de arquivos
│
├── frontend/           # Client App (React + Vite)
│   ├── src/
│   │   ├── App.tsx     # Componente principal e rotas
│   │   └── App.css     # Estilos globais e componentes
│   └── vite.config.ts
│
└── README.md           # Documentação do projeto
```

---

## 🚀 Como Executar

### Pré-requisitos
- Node.js (v18+)
- Banco de dados PostgreSQL (ou URL do Supabase)

### 1. Configuração do Backend

1. Entre na pasta do backend:
   ```bash
   cd backend
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Crie um arquivo `.env` na pasta `backend` com as variáveis:
   ```env
   PORT=5000
   DB_HOST=seu-host-supabase.pool.supabase.co
   DB_PORT=5432
   DB_NAME=postgres
   DB_USER=postgres.sua-instancia
   DB_PASSWORD=sua-senha
   JWT_SECRET=sua-chave-secreta-super-segura
   ```

4. Execute as migrações do banco:
   ```bash
   npx ts-node src/migrate.ts
   ```

5. Inicie o servidor:
   ```bash
   npm run dev
   ```

### 2. Configuração do Frontend

1. Em outro terminal, entre na pasta do frontend:
   ```bash
   cd frontend
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Inicie a aplicação:
   ```bash
   npm run dev
   ```

4. Acesse `http://localhost:8080` (ou a porta indicada).

---

## 🔒 Segurança

Este projeto segue boas práticas de segurança:
- Senhas salvas com hash (bcrypt).
- Autenticação via Token JWT.
- Proteção contra CORS e Headers de segurança (Helmet).
- Validação rigorosa de inputs (Zod).

> **Nota sobre segurança de chaves**: Certifique-se de nunca commitar o arquivo `.env`. As chaves de API devem ser gerenciadas via variáveis de ambiente.

---

## 👨‍💻 Autor

Desenvolvido por **Yuri Almeida**.

---

## 📄 Licença

Este projeto está sob a licença MIT.
