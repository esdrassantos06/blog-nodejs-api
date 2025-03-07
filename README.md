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
- [Segurança](#segurança)
- [Endpoints](#endpoints)
  - [GET /](#get-)
  - [GET /:id](#get-id)
  - [POST /](#post-)
  - [PUT /:id](#put-id)
  - [DELETE /:id](#delete-id)
  - [POST /admin/reorganize-ids](#post-adminreorganize-ids)
- [Validação de Dados](#validação-de-dados)
- [Logging](#logging)
- [Exemplos de Requisições e Respostas](#exemplos-de-requisições-e-respostas)
- [Rodando a Aplicação](#rodando-a-aplicação)
- [Tratamento de Erros](#tratamento-de-erros)

---

## Tecnologias Utilizadas

- **Node.js** – Ambiente de execução JavaScript.
- **Express** – Framework web para Node.js.
- **PostgreSQL** – Banco de dados SQL relacional.
- **Sequelize** – ORM (Object-Relational Mapping) para PostgreSQL.
- **dotenv** – Carregamento de variáveis de ambiente.
- **cors** – Middleware para habilitar CORS.
- **helmet** – Middleware para segurança HTTP.
- **express-rate-limit** – Limita requisições por IP.
- **express-validator** – Validação de dados nas requisições.
- **winston** – Sistema de logging para a aplicação.

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
   ALLOWED_ORIGINS=http://localhost:3000,https://seusite.com
   NODE_ENV=development
   ```
   
   Certifique-se de substituir `postgres://username:password@host:port/database` pela sua URL de conexão com o PostgreSQL e `sua_chave_secreta_aqui` por uma chave de API forte e única.

## Variáveis de Ambiente

- `DATABASE_URI`: URL de conexão com o banco de dados PostgreSQL.
- `PORT`: Porta na qual o servidor irá rodar (padrão: 3000).
- `API_KEY`: Chave secreta para autorizar operações de modificação (POST, PUT, DELETE).
- `ALLOWED_ORIGINS`: Lista de origens permitidas para CORS (separadas por vírgula).
- `NODE_ENV`: Ambiente de execução (development, production).

## Modelo de Dados

O modelo de dados utilizado é o **Blog** com os seguintes campos:

```json
{
  "id": "Integer (auto-incremento)", // ID numérico sequencial gerado automaticamente
  "title": "String", // Título do blog. Obrigatório, entre 1 e 200 caracteres.
  "author": "String", // Autor do blog. Obrigatório, entre 1 e 100 caracteres.
  "description": "String", // Descrição ou conteúdo do blog. Máximo de 5000 caracteres.
  "age": "Integer", // Número inteiro entre 0 e 150.
  "createdAt": "Date", // Data de criação do registro (gerado automaticamente)
  "updatedAt": "Date" // Data da última atualização (gerado automaticamente)
}
```

---

## Autenticação

Esta API implementa um sistema de autenticação baseado em token para proteger as operações de modificação de dados:

- Endpoints **GET** são públicos e podem ser acessados por qualquer pessoa sem autenticação (exceto rotas administrativas).
- Endpoints **POST**, **PUT**, **DELETE** e todas as rotas **/admin/** requerem autenticação via token de API.

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

Se a autenticação estiver correta, a API processará sua solicitação. Caso contrário, você receberá um erro 401 (Não Autorizado).

---

## Segurança

A API implementa várias camadas de segurança:

- **Helmet**: Configuração de cabeçalhos HTTP para proteção contra vulnerabilidades comuns
- **Rate Limiting**: Limite de 100 requisições por IP em janelas de 15 minutos
- **Limitação de Tamanho de Payload**: Máximo de 1MB para requisições JSON
- **Verificação de SSL**: Em ambiente de produção, exige conexões SSL válidas
- **CORS Configurável**: Restrição de origens com base na configuração do ambiente
- **Validação de Entradas**: Verificação rigorosa de todos os dados recebidos

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

## Validação de Dados

A API utiliza express-validator para garantir que todos os dados recebidos atendam aos critérios definidos:

- **title**: String obrigatória entre 1 e 200 caracteres
- **author**: String obrigatória entre 1 e 100 caracteres
- **description**: String opcional com máximo de 5000 caracteres
- **age**: Número inteiro opcional entre 0 e 150
- **id**: Validação em parâmetros de rota para garantir que sejam números inteiros

Os erros de validação são retornados com status 400 e incluem detalhes sobre cada campo inválido.

---

## Logging

A API implementa um sistema completo de logging com Winston:

- **Arquivos de Log**: 
  - `error.log`: Apenas mensagens de erro
  - `combined.log`: Todas as mensagens de log
- **Console**: Em ambiente de desenvolvimento, logs também são exibidos no console
- **Níveis de Log**: 
  - INFO: Operações normais, inicialização, criação de recursos
  - ERROR: Falhas do sistema, erros de banco de dados
  - WARN: Tentativas de acesso não autorizadas
  - DEBUG: Logs de consultas SQL (quando ativado)

Os logs incluem timestamps e detalhes contextuais para facilitar a depuração.

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

**Resposta de Erro (500):**

```json
{
  "message": "Erro interno do servidor"
}
```

---

### **GET /:id**

**Descrição:** Retorna um blog específico a partir do ID informado.

**Requisição:**

- **Método:** `GET`
- **URL:** `/:id`
- **Autenticação:** Não necessária
- **Validação:** ID deve ser um número inteiro

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

**Resposta de Erro (400) - Validação:**

```json
{
  "errors": [
    {
      "param": "id",
      "msg": "ID deve ser um número inteiro",
      "location": "params"
    }
  ]
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
- **Validação:** 
  - title: String obrigatória entre 1 e 200 caracteres
  - author: String obrigatória entre 1 e 100 caracteres
  - description: String opcional com máximo de 5000 caracteres
  - age: Número inteiro opcional entre 0 e 150

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

**Resposta de Erro (400) - Validação:**

```json
{
  "errors": [
    {
      "param": "title",
      "msg": "Título deve ter entre 1 e 200 caracteres",
      "location": "body"
    }
  ]
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
- **Validação:**
  - id: Deve ser um número inteiro
  - title: String opcional entre 1 e 200 caracteres
  - author: String opcional entre 1 e 100 caracteres
  - description: String opcional com máximo de 5000 caracteres
  - age: Número inteiro opcional entre 0 e 150

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

**Resposta de Erro (400) - Validação:**

```json
{
  "errors": [
    {
      "param": "age",
      "msg": "Idade deve ser entre 0 e 150",
      "location": "body"
    }
  ]
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
- **Validação:** ID deve ser um número inteiro

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

**Resposta de Erro (400) - Validação:**

```json
{
  "errors": [
    {
      "param": "id",
      "msg": "ID deve ser um número inteiro",
      "location": "params"
    }
  ]
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

**Resposta de Erro (401):**

```json
{
  "message": "Unauthorized. Missing or invalid token."
}
```

**Resposta de Erro (500):**

```json
{
  "message": "Erro interno do servidor"
}
```

---

## Tratamento de Erros

A API implementa tratamento de erros em múltiplos níveis:

- **Middleware de Erros**: Captura exceções não tratadas e retorna mensagens padronizadas
- **Validação de Requisições**: Verifica dados de entrada antes do processamento
- **Tratamento de Exceções**: Try/catch em todas as operações de banco de dados
- **Logging de Erros**: Registro detalhado de todos os erros para depuração
- **Handlers para Processos**: Captura de exceções não tratadas e promessas rejeitadas no nível do processo
- **Retorno apropriado de códigos HTTP**: Uso adequado de status codes (400, 401, 404, 500)

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

A aplicação gera logs em:
- `error.log`: Apenas erros
- `combined.log`: Todos os logs da aplicação