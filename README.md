# Documentação da API - blog-nodejs-api

Esta documentação descreve a API desenvolvida com Express e PostgreSQL para gerenciar blogs. A API permite criar, ler, atualizar e deletar registros de blog armazenados no PostgreSQL, com restrições de acesso para métodos de modificação.

---

## Índice

- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Instalação e Configuração](#instalação-e-configuração)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Modelo de Dados](#modelo-de-dados)
- [Autenticação](#autenticação)
- [Gerenciamento de IDs](#gerenciamento-de-ids)
- [Endpoints](#endpoints)
  - [GET /](#get-)
  - [GET /:id](#get-id)
  - [POST /](#post-)
  - [PUT /:id](#put-id)
  - [DELETE /:id](#delete-id)
  - [POST /admin/reorganize-ids](#post-adminreorganize-ids)
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
   API_KEY=sua_chave_secreta_aqui
   ```
   
Certifique-se de substituir `postgres://username:password@host:port/database` pela sua URL de conexão com o PostgreSQL e `sua_chave_secreta_aqui` por uma chave de API forte e única.

## Variáveis de Ambiente

- `DATABASE_URL`: URL de conexão com o banco de dados PostgreSQL.
- `PORT`: Porta na qual o servidor irá rodar (padrão: 3000).
- `API_KEY`: Chave secreta para autorizar operações de modificação (POST, PUT, DELETE).

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

## Autenticação

Esta API implementa um sistema de autenticação baseado em token para proteger as operações de modificação de dados:

- Endpoints **GET** são públicos e podem ser acessados por qualquer pessoa sem autenticação.
- Endpoints **POST**, **PUT** e **DELETE** requerem autenticação via token de API.

Para usar os métodos protegidos, você deve incluir o cabeçalho de autorização em suas requisições:

```
Authorization: Bearer sua_chave_secreta_aqui
```

Onde `sua_chave_secreta_aqui` deve corresponder à chave definida na variável de ambiente `API_KEY`.

### Usando Postman para Acessar Métodos Protegidos

1. Abra o Postman e crie uma nova requisição
2. Selecione o método desejado (POST, PUT ou DELETE)
3. Digite a URL da sua API
4. Na aba "Headers", adicione:
   - Key: `Authorization`
   - Value: `Bearer sua_chave_secreta_aqui`
5. Para métodos POST e PUT, configure o corpo da requisição na aba "Body":
   - Selecione "raw" e "JSON"
   - Adicione o JSON com os dados do blog
6. Clique em "Send" para enviar a requisição

Se a autenticação estiver correta, a API processará sua solicitação. Caso contrário, você receberá um erro 401 (Não Autorizado) ou 403 (Proibido).

---

## Gerenciamento de IDs

A API implementa um sistema avançado de gerenciamento de IDs para manter os registros de blog em ordem sequencial:

### Recursos de Reorganização de IDs

- **Reinicialização e Reordenação**: Função `reorganizeIds` para redefinir e reordenar os IDs dos posts de blog
- **Ajuste Automático de Sequência**: Atualização da sequência de IDs no PostgreSQL durante a inicialização
- **Ordenação por ID**: Retorno dos blogs ordenados por ID na rota GET principal
- **Rota de Administração**: Endpoint específico para reorganização manual de IDs
- **Reorganização Após Exclusão**: Reorganização automática dos IDs após a exclusão de um blog
- **Tratamento de Erros**: Sistema robusto de tratamento de erros e registro de logs

### Funcionamento

1. **Durante a inicialização**: O sistema ajusta a sequência do PostgreSQL para corresponder ao ID máximo existente
2. **Após deleção**: Quando um blog é excluído, todos os IDs são reorganizados automaticamente
3. **Manutenção**: Uma rota administrativa permite acionar a reorganização manualmente quando necessário

Esta funcionalidade garante que os IDs permaneçam sequenciais e sem lacunas, facilitando a navegação e a referência aos registros do blog.

---

## Endpoints

### **GET /**

**Descrição:** Retorna todos os blogs cadastrados, ordenados por ID.

**Requisição:**

- **Método:** `GET`
- **URL:** `/`
- **Autenticação:** Não necessária

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
- **Autenticação:** Não necessária

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
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer sua_chave_secreta_aqui`

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

**Resposta de Erro (401):**

```json
{
  "message": "Unauthorized. Missing or invalid token."
}
```

---

### **PUT /:id**

**Descrição:** Atualiza um blog existente a partir do ID informado.

**Requisição:**

- **Método:** `PUT`
- **URL:** `/:id`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer sua_chave_secreta_aqui`

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

**Resposta de Erro (401):**

```json
{
  "message": "Unauthorized. Missing or invalid token."
}
```

---

### **DELETE /:id**

**Descrição:** Deleta um blog a partir do ID informado e reorganiza automaticamente os IDs.

**Requisição:**

- **Método:** `DELETE`
- **URL:** `/:id`
- **Headers:**
  - `Authorization: Bearer sua_chave_secreta_aqui`

**Resposta de Sucesso (200):**

```json
{
  "message": "Blog deleted successfully"
}
```

**Resposta de Erro (404):**

```json
{
  "message": "Blog not Found"
}
```

**Resposta de Erro (401):**

```json
{
  "message": "Unauthorized. Missing or invalid token."
}
```

---

### **POST /admin/reorganize-ids**

**Descrição:** Reorganiza manualmente os IDs de todos os blogs no banco de dados.

**Requisição:**

- **Método:** `POST`
- **URL:** `/admin/reorganize-ids`
- **Headers:**
  - `Authorization: Bearer sua_chave_secreta_aqui`

**Resposta de Sucesso (200):**

```json
{
  "message": "IDs reorganizados com sucesso"
}
```

**Resposta de Erro (500):**

```json
{
  "error": "Mensagem de erro específica"
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
Authorization: Bearer sua_chave_secreta_aqui

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
Authorization: Bearer sua_chave_secreta_aqui

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

### **Exemplo de reorganização manual de IDs (POST)**

**Requisição:**

```http
POST /admin/reorganize-ids HTTP/1.1
Host: localhost:3000
Authorization: Bearer sua_chave_secreta_aqui
```

**Resposta:**

```json
{
  "message": "IDs reorganizados com sucesso"
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

Ao iniciar, o console exibirá mensagens informando se o PostgreSQL foi conectado com sucesso, se a sequência de IDs foi ajustada corretamente e que o servidor está rodando.