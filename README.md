## Como Começar

### Instalação

Para instalar as dependências do projeto, execute o seguinte comando:

```bash
npm install
```

### Configuração do Prisma

1. Execute o seguinte comando para gerar o cliente do Prisma e configurar o Prisma:

```bash
npx prisma generate
```

2. Crie um arquivo `.env` na raiz do projeto e adicione as seguintes variáveis de ambiente:

```env
BOT_TOKEN=seu_token_aqui
NODE_OPTIONS="--no-warnings --no-deprecation"
DATABASE_URL=url_do_mongo_db
```

Certifique-se de substituir `seu_token_aqui` pelo token do seu bot e `url_do_seu_banco_de_dados` pela URL do seu banco de dados.

### Rodando o Projeto

Para iniciar o projeto, execute o seguinte comando:

```bash
npm run dev
```

---
