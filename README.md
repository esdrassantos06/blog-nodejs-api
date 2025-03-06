
# Documentação da API - blog-nodejs-api

Esta documentação descreve a API desenvolvida com Express e Postgres para gerenciar blogs. A API permite criar, ler, atualizar e deletar registros de blog armazenados no Postgres.

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
- **Postgres** – Banco de dados SQL.
- **dotenv** – Carregamento de variáveis de ambiente.
- **cors** – Middleware para habilitar CORS.

---

## Instalação e Configuração

1. **Clone o repositório:**

   ```bash
   git clone https://github.com/esdrassantos06/blog-nodejs-api
   cd api-express-mongodb

2. **Instale as dependências:**

   ```bash
   npm install
    
3. **Configuração do arquivo de variáveis de ambiente (.env):**
Crie um arquivo `.env` na raiz do projeto e defina as seguintes variáveis:

   ```bash
   MONGO_URL=<sua_string_de_conexão_mongodb> 
   PORT=3000
   
Certifique-se de substituir `<sua_string_de_conexão_mongodb>` pela sua URL de conexão com o MongoDB.

## Variáveis de Ambiente

- `MONGO_URL`: URL de conexão com o banco de dados MongoDB.
- `PORT`: Porta na qual o servidor irá rodar (padrão: 3000).

## Modelo de Dados

O modelo de dados utilizado é o **Blog** com o seguinte schema:

```json
{
  "title": "String", // Título do blog.
  "author": "String", // Autor do blog.
  "description": "String", // Descrição ou conteúdo do blog.
  "age": "Number" // Pode ser usado para qualquer finalidade, por exemplo, idade do autor ou tempo de publicação.
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
    "_id": "631f5a0a7cbe4a0012345678",
    "title": "Meu primeiro Blog",
    "author": "João Silva",
    "description": "Descrição do blog...",
    "age": 30
  },
  {
    "_id": "631f5a0a7cbe4a0012345679",
    "title": "Outro Blog",
    "author": "Maria Souza",
    "description": "Outra descrição...",
    "age": 25
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
  "_id": "631f5a0a7cbe4a0012345678",
  "title": "Meu primeiro Blog",
  "author": "João Silva",
  "description": "Descrição do blog...",
  "age": 30
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
  "_id": "631f5a0a7cbe4a0012345680",
  "title": "Novo Blog",
  "author": "Ana Paula",
  "description": "Conteúdo do novo blog...",
  "age": 28
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
  "_id": "631f5a0a7cbe4a0012345680",
  "title": "Blog Atualizado",
  "author": "Ana Paula",
  "description": "Descrição atualizada...",
  "age": 29
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
  "_id": "631f5a0a7cbe4a0012345680",
  "title": "Blog a ser deletado",
  "author": "Algum Autor",
  "description": "Descrição...",
  "age": 35
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
  "_id": "631f5a0a7cbe4a0012345690",
  "title": "Como aprender Node.js",
  "author": "Carlos Eduardo",
  "description": "Dicas e truques para dominar Node.js.",
  "age": 31
}
```

---

### **Exemplo de atualização de um blog (PUT)**

**Requisição:**

```http
PUT /631f5a0a7cbe4a0012345690 HTTP/1.1
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
  "_id": "631f5a0a7cbe4a0012345690",
  "title": "Como aprender Node.js - Atualizado",
  "author": "Carlos Eduardo",
  "description": "Conteúdo atualizado com novas dicas.",
  "age": 32
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

Ao iniciar, o console exibirá mensagens informando se o MongoDB foi conectado com sucesso e que o servidor está rodando.

