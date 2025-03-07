# API Documentation - blog-nodejs-api

API RESTful para gerenciamento de blogs com Express, PostgreSQL e autenticação JWT.

## Tecnologias Principais

- **Node.js & Express**: Framework web
- **PostgreSQL & Sequelize**: Banco de dados relacional e ORM
- **JWT & bcrypt**: Autenticação e segurança
- **Helmet, CORS, XSS-Clean**: Proteção contra vulnerabilidades
- **Express-validator & Zod**: Validação de dados
- **Winston**: Sistema de logs

## Guia de Configuração Completo

### 1. Requisitos

- Node.js (v20.x)
- PostgreSQL
- NPM ou Yarn

### 2. Clone o Repositório

```bash
git clone https://github.com/esdrassantos06/blog-nodejs-api.git
cd blog-nodejs-api
```

### 3. Instale as Dependências

```bash
npm install
```

### 4. Configure o Banco de Dados PostgreSQL

Crie um banco de dados PostgreSQL para a aplicação:

```sql
CREATE DATABASE blogapi;
CREATE USER bloguser WITH ENCRYPTED PASSWORD 'sua_senha';
GRANT ALL PRIVILEGES ON DATABASE blogapi TO bloguser;
```

### 5. Configure o Arquivo .env

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```bash
# Configuração do Banco de Dados
DATABASE_URI=postgres://bloguser:sua_senha@localhost:5432/blogapi

# Configuração do Servidor
PORT=3000
NODE_ENV=development  # Opções: development, production


# Configuração de Segurança 
JWT_SECRET=chave_jwt_super_secreta  # Use uma string aleatória forte
ALLOWED_ORIGINS=http://localhost:3000  # Origens permitidas para CORS (separadas por vírgula)

# Configuração de Logs
LOG_LEVEL=info  # Opções: error, warn, info, debug
```

### 6. Inicie o Servidor pela Primeira Vez

```bash
npm start
```

Isso criará automaticamente as tabelas no banco de dados através do Sequelize.

### 7. Crie o Primeiro Usuário Admin

Como o registro de usuários requer privilégios de administrador, você precisa criar o primeiro admin diretamente no banco de dados:

```sql
INSERT INTO "Users" (
  username, 
  email, 
  password, 
  role, 
  "isActive", 
  "createdAt", 
  "updatedAt"
) VALUES (
  'admin', 
  'admin@example.com', 
  '$2b$10$FGYGfLOBtLFiVdSmlJGq4etaGIUYqIoLYOeUUgCR52g.IQ3amckZq', -- Senha: admin123
  'admin', 
  true, 
  NOW(), 
  NOW()
);
```

Este comando insere um usuário admin com:
- Username: admin
- Email: admin@example.com
- Senha: admin123 (já com hash bcrypt)
- Role: admin

### 8. Faça Login e Obtenha o Token JWT

Faça uma requisição POST para autenticar e obter o token:

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

Ou use ferramentas como Postman ou Insomnia com:
- Método: POST
- URL: http://localhost:3000/auth/login
- Body (JSON): {"username":"admin","password":"admin123"}

A resposta incluirá um token JWT que você precisará para fazer requisições autenticadas.

### 9. Use o Token para Operações Autenticadas

Inclua o token JWT no cabeçalho Authorization para todas as operações que exigem autenticação:

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Authorization: Bearer seu_token_jwt" \
  -H "Content-Type: application/json" \
  -d '{"username":"editor","email":"editor@example.com","password":"senha123","role":"editor"}'
```

### 10. Crie e Gerencie Usuários

Com o token admin, você pode criar outros usuários (editores e usuários regulares):

- **Registrar um Editor**:
  ```bash
  curl -X POST http://localhost:3000/auth/register \
    -H "Authorization: Bearer seu_token_jwt" \
    -H "Content-Type: application/json" \
    -d '{"username":"editor","email":"editor@example.com","password":"senha123","role":"editor"}'
  ```

- **Registrar um Usuário Comum**:
  ```bash
  curl -X POST http://localhost:3000/auth/register \
    -H "Authorization: Bearer seu_token_jwt" \
    -H "Content-Type: application/json" \
    -d '{"username":"usuario","email":"usuario@example.com","password":"senha123","role":"user"}'
  ```

  ### 11. Comece a Usar a API para Gerenciar Blogs

Com usuários configurados, você pode agora:
- Criar blogs (como editor ou admin)
- Listar e visualizar blogs (qualquer pessoa)
- Atualizar blogs (como editor ou admin)
- Excluir blogs (somente admin)

## Gerenciamento de Usuários

Algumas operações úteis para gerenciar usuários:

- **Listar todos os usuários** (apenas admin):
  ```bash
  curl -X GET http://localhost:3000/users/all \
    -H "Authorization: Bearer seu_token_jwt"
  ```

- **Obter um usuário específico** (apenas admin):
  ```bash
  curl -X GET http://localhost:3000/users/1 \
    -H "Authorization: Bearer seu_token_jwt"
  ```

- **Desativar um usuário** (apenas admin):
  ```bash
  curl -X DELETE http://localhost:3000/users/2 \
    -H "Authorization: Bearer seu_token_jwt"
  ```

- **Reativar um usuário** (apenas admin):
  ```bash
  curl -X POST http://localhost:3000/users/2/restore \
    -H "Authorization: Bearer seu_token_jwt"
  ```

Observações importantes:
- Admins não podem desativar sua própria conta
- Um usuário desativado não pode fazer login
- Apenas admins podem ver usuários desativados através de `?inactive=true`

- ## Estrutura do Projeto

```
src/
├── config/            # Configurações (database, server, logger)
├── controllers/       # Controladores para auth, blog e users
├── middlewares/       # Middlewares (auth, error, validation)
├── models/            # Modelos Sequelize (blog, user)
├── routes/            # Rotas da API
├── services/          # Serviços (lógica de negócio)
└── app.js             # Ponto de entrada
```

## Modelos de Dados

### User
- `id, username, email, password, role, isActive, createdAt, updatedAt`
- Roles: user, editor, admin

### Blog
- `id, title, author, description, age, isDeleted, createdAt, updatedAt`

## Autenticação e Autorização

- JWT com expiração em 24h
- Hierarquia de permissões: admin > editor > user > guest
- Proteção de rotas baseada em roles

- ## Endpoints

### Autenticação
- `POST /auth/register` - Registro (somente admin)
- `POST /auth/login` - Login e obtenção de token JWT

### Usuários
- `GET /users/all` - Lista todos usuários
  - Parâmetros: `?inactive=true` (opcional, para ver usuários inativos)
- `GET /users/:id` - Obtém usuário por ID
  - Parâmetros: `id` - ID do usuário
- `DELETE /users/:id` - Desativa usuário (soft delete)
  - Parâmetros: `id` - ID do usuário
  - Obs: Admins não podem excluir própria conta
- `POST /users/:id/restore` - Restaura usuário desativado
  - Parâmetros: `id` - ID do usuário a restaurar
 
  - ### Blogs
- `GET /` - Lista blogs com paginação e filtros
  - Parâmetros: `page, limit, search, author, title, minAge, maxAge, sortBy, sortOrder`
- `GET /:id` - Obtém blog específico
  - Parâmetros: `id` - ID do blog
- `POST /` - Cria novo blog (editor/admin)
  - Body: `title, author, description, age`
- `PUT /:id` - Atualiza blog (editor/admin)
  - Parâmetros: `id` - ID do blog
  - Body: `title, author, description, age` (todos opcionais)
- `DELETE /:id` - Remove blog (admin)
  - Parâmetros: `id` - ID do blog
- `POST /:id/restore` - Restaura blog removido (admin)
  - Parâmetros: `id` - ID do blog
 
  - ## Exemplos de Requisições

### 1. Login

**Request:**
```http
POST /auth/login HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "role": "admin",
    "isActive": true,
    "createdAt": "2025-03-07T15:20:30.000Z",
    "updatedAt": "2025-03-07T15:20:30.000Z"
  }
}
```

### 2. Listar Usuários

**Request:**
```http
GET /users/all HTTP/1.1
Host: localhost:3000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
[
  {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "role": "admin",
    "isActive": true,
    "createdAt": "2025-03-07T15:20:30.000Z",
    "updatedAt": "2025-03-07T15:20:30.000Z"
  },
  {
    "id": 2,
    "username": "editor",
    "email": "editor@example.com",
    "role": "editor",
    "isActive": true,
    "createdAt": "2025-03-07T16:45:20.000Z",
    "updatedAt": "2025-03-07T16:45:20.000Z"
  }
]
```

### 3. Criar Blog

**Request:**
```http
POST / HTTP/1.1
Host: localhost:3000
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "title": "Como usar Node.js",
  "author": "João Silva",
  "description": "Dicas para aprender Node.js",
  "age": 25
}
```

**Response:**
```json
{
  "id": 1,
  "title": "Como usar Node.js",
  "author": "João Silva",
  "description": "Dicas para aprender Node.js",
  "age": 25,
  "isDeleted": false,
  "createdAt": "2025-03-07T16:45:20.000Z",
  "updatedAt": "2025-03-07T16:45:20.000Z"
}
```

### 4. Listar Blogs com Filtros

**Request:**
```http
GET /?page=1&limit=10&search=Node.js&sortBy=createdAt&sortOrder=DESC HTTP/1.1
Host: localhost:3000
```

**Response:**
```json
{
  "totalItems": 1,
  "totalPages": 1,
  "currentPage": 1,
  "items": [
    {
      "id": 1,
      "title": "Como usar Node.js",
      "author": "João Silva",
      "description": "Dicas para aprender Node.js",
      "age": 25,
      "isDeleted": false,
      "createdAt": "2025-03-07T16:45:20.000Z",
      "updatedAt": "2025-03-07T16:45:20.000Z"
    }
  ]
}
```

### 5. Desativar um Usuário

**Request:**
```http
DELETE /users/3 HTTP/1.1
Host: localhost:3000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "message": "User deleted successfully"
}
```

### 6. Restaurar um Usuário

**Request:**
```http
POST /users/3/restore HTTP/1.1
Host: localhost:3000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "message": "User restored successfully"
}
```

## Resolução de Problemas Comuns

### Problema: Falha na Conexão com o Banco de Dados
- Verifique se o PostgreSQL está em execução
- Confirme se o DATABASE_URI está correto no .env
- Verifique se as credenciais do usuário do banco estão corretas

### Problema: Erro "JWT Secret is not defined"
- Certifique-se de que JWT_SECRET está definido no arquivo .env

### Problema: Erros de Autenticação
- Verifique se o token JWT está sendo enviado corretamente no header Authorization
- Confirme se o token não expirou (24h de validade)
- Verifique se o usuário tem a role necessária para a operação
