# FitTracker

App de acompanhamento de dieta e treino para Guilherme e Ana.

## Stack
- Node.js + Express
- SQLite (better-sqlite3)
- HTML/CSS/JS puro (SPA)

## Senhas iniciais
| Usuário | Senha |
|---------|-------|
| Guilherme | `guilherme123` |
| Ana | `ana123` |

> Troque as senhas na aba **Configurações** após o primeiro login.

---

## Desenvolvimento local

```bash
cp .env.example .env
# Edite .env com seu JWT_SECRET
npm install
npm run dev
```

Acesse `http://localhost:3000`.

---

## Deploy no EasyPanel (via GitHub)

### 1. Criar o app

1. Acesse seu EasyPanel → **Criar serviço** → **App**
2. Conecte ao repositório GitHub privado
3. Tipo de build: **Dockerfile**

### 2. Variáveis de ambiente

No painel do serviço, aba **Environment**:

| Variável | Valor |
|----------|-------|
| `PORT` | `3000` |
| `JWT_SECRET` | *(string longa e aleatória — gere com `openssl rand -hex 32`)* |
| `DB_PATH` | `/data/fit.sqlite` |
| `NODE_ENV` | `production` |

### 3. Volumes persistentes

Na aba **Volumes** do serviço, crie dois mounts:

| Volume name | Mount path |
|-------------|------------|
| `fit-data` | `/data` |
| `fit-uploads` | `/app/uploads` |

> **Importante:** sem esses volumes, o banco e as fotos são apagados a cada deploy.

### 4. Porta

- Porta interna: `3000`
- O EasyPanel faz o proxy reverso automaticamente via domínio configurado.

### 5. Deploy

Clique em **Deploy** ou faça push no branch conectado — o EasyPanel vai buildar e subir automaticamente.

---

## Estrutura do projeto

```
├── server.js          # Entry point Express
├── db/init.js         # Schema SQLite + seed de usuários
├── middleware/auth.js # Verificação JWT
├── routes/
│   ├── auth.js        # Login / logout / /me
│   ├── diet.js        # Dieta + peso
│   ├── workouts.js    # Treinos + exercícios
│   ├── photos.js      # Upload / galeria / delete
│   └── users.js       # Configurações + senha
├── public/
│   ├── login.html
│   ├── app.html       # SPA principal
│   ├── css/style.css
│   └── js/            # Módulos de cada aba
└── uploads/           # Fotos (volume persistente)
```
