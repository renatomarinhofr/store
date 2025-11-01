# Store Manager

Aplicação Vue 3 que simula o gerenciamento de produtos para usuários administradores e tenants. O projeto aplica MVVM, Camada de serviços dedicada, TanStack Query para dados reativos, PrimeVue como biblioteca UI e json-server como backend fake.

## Arquitetura e tecnologias

- **Vue 3 + Vite** para o frontend SPA.
- **MVVM modular**: módulos `auth` e `products` com pastas `models`, `viewmodels` e `views`.
- **Pinia** (`src/core/stores`) centraliza autenticação e hidratação em `localStorage`.
- **TanStack Query** (`src/core/providers`) gerencia cache e sincronização de dados.
- **Serviços Axios** (`src/core/services`) consomem a API fake com prefixo dinâmico por role e geram JWT fake.
- **Tema PrimeVue customizado** (`src/themes/storePreset.ts`) com preset Aura adaptado ao visual claro.
- **JSON Server** (`server/server.js`) expõe endpoints `/login`, `/admin/products`, `/tenant/products`.
- **Playwright** para testes end-to-end focados no fluxo de login.

Estrutura principal:

```
src/
  core/               # infraestrutura (stores, services, utils, providers)
  modules/
    auth/             # telas, viewmodels e modelos de autenticação
    products/
      components/     # cabeçalho, tabela, prateleira e formulário reutilizáveis
      views/          # telas compostas a partir dos componentes
  assets/styles/      # estilos globais (tema claro)
  themes/             # preset do PrimeVue
  router/             # rotas protegidas por guarda
```

## Pré-requisitos

- Node.js 20.19 ou 22.12+
- npm 10+
- Navegador Chromium (para os testes e2e).

## Instalação

```sh
npm install
```

## Servidor fake (json-server)

Inicie o backend local em `http://127.0.0.1:3333`:

```sh
npm run server
```

Endpoints principais:

- `POST /login` (retorna token e role)
- `GET /admin/products`
- `GET /tenant/products`
- CRUD completo em `/admin/products/:id` ou `/tenant/products/:id`

## Desenvolvimento

```sh
# inicia Vite em http://127.0.0.1:5173
npm run dev
```

Variáveis de ambiente relevantes:

- `VITE_API_URL` (opcional) altera a URL base da API; padrão `http://127.0.0.1:3333`.

## Builds e checagens

```sh
# type-check (vue-tsc) + build de produção
npm run build

# apenas type-check
npm run type-check

# lint (ESLint + Oxlint)
npm run lint

# formatar código
npm run format
```

## Testes end-to-end (Playwright)

Os testes cobrem:

- Validação de formulário de login, erros de credenciais, persistência de tokens e toggle de senha.
- Fluxo completo da página de produtos para _admin_: CRUD via tabela, alteração de status, drag-and-drop na prateleira, context menu e exclusão.
- Restrições de _tenant_: sem exclusão/toggle/drag, mas com criação e edição garantidas.

Para viabilizar o fluxo admin sem dependência do modal de confirmação (PrimeVue `ConfirmDialog`), a view lê a flag `store.e2e.autoConfirmDelete` do `localStorage`. Os testes Playwright definem essa flag em `seedAuthenticatedUser`, fazendo com que exclusões sejam aceitas automaticamente apenas durante os testes.

Passos recomendados:

```sh
# instalar navegadores necessários (executar uma vez)
npx playwright install chromium

# garantir dependências
npm install

# iniciar json-server em outro terminal
npm run server

# executar suite Chromium (login + produtos)
npm run test:e2e

# apenas a suite de produtos
npx playwright test e2e/products.spec.ts --project=chromium
```

Em ambientes sem permissão para abrir portas (ex.: CI restrito), suba o dev server manualmente em outro host/porta permitido e ajuste a `baseURL` via variáveis (ex.: `PLAYWRIGHT_BASE_URL=http://... npm run test:e2e`).

## Convenções MVVM

- **Models**: contratos de dados, sem lógica.
- **ViewModels**: estado reativo e chamadas de serviço/TanStack Query.
- **Views**: componentes PrimeVue conectados ao viewmodel via Composition API.

### Componentização das views de produtos

- `ProductsHeader.vue`: exibe título, usuário logado e ações globais (novo produto/logout).
- `ProductsTable.vue`: tabela PrimeVue isolada que emite eventos de edição, exclusão e alteração de status.
- `ProductsShelf.vue`: prateleira drag-and-drop com estados ativo/inativo e layout ajustado para mobile.
- `ProductFormDialog.vue`: formulário reutilizável com `v-model` do estado do diálogo e dados do produto.

## Autenticação e tokens

- `POST /login` retorna o token do provider e a role.
- `auth.service.ts` cria JWT fake assinado localmente e armazena ambos os tokens.
- `auth.store.ts` persiste usuário em `localStorage` (`store.auth.user`) e injeta prefixo (`/admin` ou `/tenant`) nas requisições Axios por meio do interceptor em `httpClient.ts`.
- `router/index.ts` protege rotas privadas e redireciona usuários logados para `/produtos`.

## Estilo e Acessibilidade

- Fonte padrão [Inter].
- Tema claro com tokens customizados para botões, inputs e superfícies.
- Componentes PrimeVue configurados para inserir labels flutuantes e feedback textual.
