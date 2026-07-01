# 🌿 Pousada Manager

Sistema de gestão para pequenas pousadas — quartos, hóspedes, itens e consumo.

## Stack

- **React 18** + **TypeScript** + **Vite**
- **Firebase** (Auth + Realtime Database)
- **Tailwind CSS** (mobile-first)
- **Recharts** (gráficos)
- **Lucide React** (ícones)

---

## ⚡ Instalação rápida

```bash
# 1. Entre na pasta do projeto
cd pousada-app

# 2. Instale as dependências
npm install

# 3. Rode em modo desenvolvimento
npm run dev
```

Acesse: **http://localhost:5173**

---

## 🔐 Primeiro acesso

| Campo   | Valor            |
|---------|------------------|
| Usuário | `userMaster`     |
| Senha   | `@userMaster2026`|

> **Importante:** Na primeira vez que você fizer login com `userMaster`, o sistema tentará autenticar via Firebase Authentication. Você precisa criar este usuário no Firebase Console antes:
>
> 1. Acesse [Firebase Console](https://console.firebase.google.com)
> 2. Vá em **Authentication → Users → Add user**
> 3. Email: `master@pousada.app`
> 4. Senha: `@userMaster2026`

---

## 🗄️ Firebase — Configuração do banco

### Regras do Realtime Database

No Firebase Console → Realtime Database → Rules, cole:

```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null"
  }
}
```

### Estrutura de dados

```
pousada/
├── quartos/
│   └── {id}/  { nome, status, itensMobilia[], itensConsumo[], posicoes{}, hospedeId, createdAt }
├── hospedes/
│   └── {id}/  { nome, cpf, email, uid, contato, detalhes, checkin, checkout, status, alocacao, createdAt }
├── itens/
│   └── {id}/  { nome, tipo, icone, quartoId, createdAt }
├── consumo/
│   └── {id}/  { nome, qtdAtual, icone, quartoId, createdAt }
├── usuarios/
│   └── {uid}/ { nome, cpf, contato, email, nivel, loginUsername }
└── pagamentos/
    └── {id}/  { hospedeId, hospedeNome, valor, data, descricao, createdAt }
```

---

## 👥 Níveis de acesso

| Nível    | Permissões                                              |
|----------|---------------------------------------------------------|
| `master` | Tudo — visualização em dashboard + todas as ações       |
| `adm`    | Cadastrar/editar quartos, itens, hóspedes, colaboradores|
| `simples`| Editar itens de consumo + status de hóspedes            |

---

## 📱 Mobile

O sistema é **mobile-first**. Funciona em:
- Smartphones (iOS e Android)
- Tablets
- Desktop

A sidebar se transforma em um drawer no mobile, acessível pelo botão de menu.

---

## 🏗️ Estrutura de pastas

```
src/
├── components/
│   ├── auth/           LoginPage, ProtectedRoute
│   ├── dashboard/      DashboardPage
│   ├── quartos/        QuartosPage, QuartoDetalhe
│   ├── hospedes/       HospedesPage
│   ├── itens/          ItensPage
│   ├── consumo/        ConsumoPage
│   ├── colaboradores/  ColaboradoresPage
│   └── layout/         AppLayout
├── contexts/           AuthContext
├── services/           firebase.ts
├── types/              index.ts
└── utils/
```

---

## 🚀 Deploy (Firebase Hosting)

```bash
# Instale o Firebase CLI
npm install -g firebase-tools

# Faça login
firebase login

# Inicialize (escolha Hosting)
firebase init

# Build do projeto
npm run build

# Deploy
firebase deploy
```

---

## 📋 Próximas fases

- [ ] Registro de pagamentos manuais
- [ ] Relatório de rentabilidade por quarto
- [ ] Notificações de checkout próximo
- [ ] Export PDF de relatórios
- [ ] PWA (modo offline)
