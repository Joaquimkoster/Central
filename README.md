# Central

Central é um projeto de organização pessoal com aplicativos **desktop e mobile**, com interface em português. Reúne o acesso a notas e a módulos planejados para tarefas, rotina, estudos e objetivos.

## Estado atual

- **Desktop:** painel inicial, navegação lateral e tela de notas com listagem, criação e exclusão.
- **Mobile:** tela inicial com os módulos e tela de notas com listagem, criação, exclusão e indicador de carregamento. A navegação nativa possui abas Início e Notas.
- As duas versões consomem a mesma API de notas. Os dados são carregados ao abrir a tela; não há sincronização em tempo real ou armazenamento offline implementados.
- Os demais módulos ainda são interfaces iniciais ou opções sem funcionalidade. A versão web do mobile mantém parte da navegação do template Expo.

## Estrutura

```text
Central/
├── README.md
├── central-desktop/          # React, Vite e Tauri
│   ├── src/                  # Interface, componentes e páginas
│   ├── public/               # Arquivos estáticos
│   └── src-tauri/            # Código Rust e configuração desktop
└── central-mobile/           # React Native, Expo e TypeScript
    ├── src/app/              # Rotas do Expo Router
    ├── src/components/       # Componentes da interface
    ├── assets/               # Imagens e ícones
    └── app.json              # Configuração Expo
```

Cada aplicativo tem seu próprio `package.json` e `package-lock.json`; instale as dependências separadamente.

## Tecnologias e requisitos

| Aplicativo | Tecnologias |
| --- | --- |
| Desktop | React 19, Vite 8, Tauri 2 e Rust |
| Mobile | Expo SDK 57, React Native 0.86, React 19, Expo Router e TypeScript |

Use Node.js 24 LTS e npm. Para executar ou empacotar o desktop com Tauri, também são necessários Rust, Cargo e as dependências de sistema do Tauri para seu sistema operacional. Para o mobile nativo, utilize um dispositivo ou emulador com ambiente compatível com o SDK Expo instalado; o simulador iOS requer macOS e Xcode.

## Instalação

```bash
git clone https://github.com/Joaquimkoster/Central.git
cd Central
```

### Desktop

```bash
cd central-desktop
npm ci
npm run dev
```

Abra o endereço exibido pelo Vite. Para executar a janela nativa, use `npx tauri dev` no mesmo diretório. O Tauri inicia o Vite automaticamente e espera a porta `5173` disponível.

### Mobile

Em outro terminal, a partir da raiz do repositório:

```bash
cd central-mobile
npm ci
npm start
```

Use as opções exibidas pelo Expo para abrir o aplicativo no ambiente disponível.

| Comando em `central-mobile/` | Finalidade |
| --- | --- |
| `npm run android` | Iniciar o Expo e abrir no Android |
| `npm run ios` | Iniciar o Expo e abrir no simulador iOS |
| `npm run web` | Iniciar a versão web |
| `npx tsc --noEmit` | Verificar os tipos TypeScript |

## API de notas

O backend **não está incluído nesta pasta do projeto**. Os dois clientes estão configurados para `http://100.71.224.93:8080/api/notes`, que precisa estar acessível a partir do computador ou dispositivo utilizado.

Para utilizar outro servidor, altere o endereço em:

- `central-desktop/src/pages/Notes.jsx` (chamadas de listagem, criação e exclusão).
- `central-mobile/src/app/notes.tsx` (constante `API_URL`).

Contrato esperado pelos clientes:

| Método | Rota | Comportamento esperado |
| --- | --- | --- |
| `GET` | `/api/notes` | Retornar uma lista de notas com `id`, `title` e `content` |
| `POST` | `/api/notes` | Receber JSON com `title` e `content` e retornar a nota criada |
| `DELETE` | `/api/notes/:id` | Excluir a nota e retornar uma resposta de sucesso |

No mobile, `id` é tipado como número. O servidor deve permitir o acesso das origens usadas pelos clientes web. Sem o backend acessível, as telas abrem, mas as operações de notas não funcionam.

## Verificações e builds

Execute dentro de `central-desktop/`:

```bash
npm run lint
npm run build
npx tauri build
```

`npm run build` gera o frontend em `dist/`; `npm run preview` permite visualizá-lo. `npx tauri build` também compila o frontend e gera os pacotes nativos em `src-tauri/target/release/bundle/`, conforme a plataforma.

No mobile, `npx tsc --noEmit` verifica os tipos e `npx expo export --platform web` exporta a versão web para `dist/`. O script `npm run lint` está disponível, mas a configuração do ESLint ainda não foi adicionada. Não há configuração EAS de distribuição incluída.

O repositório versiona código-fonte, configurações, recursos e arquivos de lock. Dependências instaladas, caches, credenciais locais e artefatos de build são ignorados.
