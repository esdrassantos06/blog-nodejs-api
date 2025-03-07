# Documentação da API - blog-nodejs-api

Esta documentação descreve a API desenvolvida com Express e PostgreSQL para gerenciar blogs. A API permite criar, ler, atualizar e deletar registros de blog armazenados no PostgreSQL.

---

## Índice

- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Instalação e Configuração](#instalação-e-configuração)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Modelo de Dados](#modelo-de-dados)
- [Endpoints](#endpoints)
  - [GET /](#get-)
  - [GET /:id](#get-id)
  - [POST /](#post-)
  - [PUT /:id](#put-id)
  - [DELETE /:id](#delete-id)
- [Exemplos de Requisições e Respostas](#exemplos-de-requisições-e-respostas)
- [Rodando a Aplicação](#rodando-a-aplicação)

---

## Tecnologias Utilizadas

- **Node.js** – Ambiente de execução JavaScript.
- **Express** – Framework web para Node.js.
- **PostgreSQL** – Banco de dados SQL relacional.
- **Sequelize** – ORM (Object-Relational Mapping) para PostgreSQL.
- **dotenv** – Carregamento de variáveis de ambiente.
- **cors** – Middleware para habilitar CORS.

---

## Instalação e Configuração

1. **Clone o repositório:**

   ```bash
   git clone https://github.com/esdrassantos06/blog-nodejs-api
   cd blog-nodejs-api
   ```

2. **Instale as dependências:**

   ```bash
   npm install
   ```
    
3. **Configuração do arquivo de variáveis de ambiente (.env):**
Crie um arquivo `.env` na raiz do projeto e defina as seguintes variáveis:

   ```bash
   DATABASE_URI=postgres://username:password@host:port/database
   PORT=3000
   ```
   
Certifique-se de substituir `postgres://username:password@host:port/database` pela sua URL de conexão com o PostgreSQL.

## Variáveis de Ambiente

- `DATABASE_URL`: URL de conexão com o banco de dados PostgreSQL.
- `PORT`: Porta na qual o servidor irá rodar (padrão: 3000).

## Modelo de Dados

O modelo de dados utilizado é o **Blog** com os seguintes campos:

```json
{
  "id": "Integer (auto-incremento)", // ID numérico sequencial gerado automaticamente
  "title": "String", // Título do blog.
  "author": "String", // Autor do blog.
  "description": "String", // Descrição ou conteúdo do blog.
  "age": "Integer", // Pode ser usado para qualquer finalidade, por exemplo, idade do autor ou tempo de publicação.
  "createdAt": "Date", // Data de criação do registro (gerado automaticamente)
  "updatedAt": "Date" // Data da última atualização (gerado automaticamente)
}
```

---

## Endpoints

### **GET /**

**Descrição:** Retorna todos os blogs cadastrados.

**Requisição:**

- **Método:** `GET`
- **URL:** `/`

**Resposta de Sucesso (200):**

```json
[
  {
    "id": 1,
    "title": "Meu primeiro Blog",
    "author": "João Silva",
    "description": "Descrição do blog...",
    "age": 30,
    "createdAt": "2025-03-06T10:00:00.000Z",
    "updatedAt": "2025-03-06T10:00:00.000Z"
  },
  {
    "id": 2,
    "title": "Outro Blog",
    "author": "Maria Souza",
    "description": "Outra descrição...",
    "age": 25,
    "createdAt": "2025-03-06T11:30:00.000Z",
    "updatedAt": "2025-03-06T11:30:00.000Z"
  }
]
```

---

### **GET /:id**

**Descrição:** Retorna um blog específico a partir do ID informado.

**Requisição:**

- **Método:** `GET`
- **URL:** `/:id`

**Resposta de Sucesso (200):**

```json
{
  "id": 1,
  "title": "Meu primeiro Blog",
  "author": "João Silva",
  "description": "Descrição do blog...",
  "age": 30,
  "createdAt": "2025-03-06T10:00:00.000Z",
  "updatedAt": "2025-03-06T10:00:00.000Z"
}
```

**Resposta de Erro (404):**

```json
{
  "message": "Blog not Found"
}
```

---

### **POST /**

**Descrição:** Cria um novo blog.

**Requisição:**

- **Método:** `POST`
- **URL:** `/`
- **Headers:** `Content-Type: application/json`

**Body:**

```json
{
  "title": "Novo Blog",
  "author": "Ana Paula",
  "description": "Conteúdo do novo blog...",
  "age": 28
}
```

**Resposta de Sucesso (201):**

```json
{
  "id": 3,
  "title": "Novo Blog",
  "author": "Ana Paula",
  "description": "Conteúdo do novo blog...",
  "age": 28,
  "createdAt": "2025-03-07T15:20:30.000Z",
  "updatedAt": "2025-03-07T15:20:30.000Z"
}
```

---

### **PUT /:id**

**Descrição:** Atualiza um blog existente a partir do ID informado.

**Requisição:**

- **Método:** `PUT`
- **URL:** `/:id`
- **Headers:** `Content-Type: application/json`

**Body:**

```json
{
  "title": "Blog Atualizado",
  "author": "Ana Paula",
  "description": "Descrição atualizada...",
  "age": 29
}
```

**Resposta de Sucesso (200):**

```json
{
  "id": 3,
  "title": "Blog Atualizado",
  "author": "Ana Paula",
  "description": "Descrição atualizada...",
  "age": 29,
  "createdAt": "2025-03-07T15:20:30.000Z",
  "updatedAt": "2025-03-07T15:25:10.000Z"
}
```

**Resposta de Erro (404):**

```json
{
  "message": "Blog não encontrado"
}
```

---

### **DELETE /:id**

**Descrição:** Deleta um blog a partir do ID informado.

**Requisição:**

- **Método:** `DELETE`
- **URL:** `/:id`

**Resposta de Sucesso (200):**

```json
{
  "id": 3,
  "title": "Blog a ser deletado",
  "author": "Algum Autor",
  "description": "Descrição...",
  "age": 35,
  "createdAt": "2025-03-07T15:20:30.000Z",
  "updatedAt": "2025-03-07T15:25:10.000Z"
}
```

**Resposta de Erro (404):**

```json
{
  "message": "Blog not Found"
}
```

---

## Exemplos de Requisições e Respostas

### **Exemplo de criação de um novo blog (POST)**

**Requisição:**

```http
POST / HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
  "title": "Como aprender Node.js",
  "author": "Carlos Eduardo",
  "description": "Dicas e truques para dominar Node.js.",
  "age": 31
}
```

**Resposta:**

```json
{
  "id": 4,
  "title": "Como aprender Node.js",
  "author": "Carlos Eduardo",
  "description": "Dicas e truques para dominar Node.js.",
  "age": 31,
  "createdAt": "2025-03-07T16:45:20.000Z",
  "updatedAt": "2025-03-07T16:45:20.000Z"
}
```

---

### **Exemplo de atualização de um blog (PUT)**

**Requisição:**

```http
PUT /4 HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
  "title": "Como aprender Node.js - Atualizado",
  "author": "Carlos Eduardo",
  "description": "Conteúdo atualizado com novas dicas.",
  "age": 32
}
```

**Resposta:**

```json
{
  "id": 4,
  "title": "Como aprender Node.js - Atualizado",
  "author": "Carlos Eduardo",
  "description": "Conteúdo atualizado com novas dicas.",
  "age": 32,
  "createdAt": "2025-03-07T16:45:20.000Z",
  "updatedAt": "2025-03-07T16:50:15.000Z"
}
```

---

## Rodando a Aplicação

**Inicie o servidor:**

```bash
npm start
```

**Acesso:**

O servidor estará rodando na porta definida na variável de ambiente (padrão: `3000`).

Exemplo: [http://localhost:3000](http://localhost:3000)

**Logs:**

Ao iniciar, o console exibirá mensagens informando se o PostgreSQL foi conectado com sucesso e que o servidor está rodando.