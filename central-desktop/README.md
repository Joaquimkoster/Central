# Central Desktop

Aplicativo desktop da Central com React 19, Vite 8 e Tauri 2. Inclui painel inicial, navegação lateral e operações de listagem, criação e exclusão de notas por API. Os demais módulos ainda estão em desenvolvimento.

## Executar

```bash
npm ci
npm run dev
```

Para abrir a janela nativa, instale Rust, Cargo e as dependências de sistema do Tauri e execute `npx tauri dev`. A porta `5173` deve estar disponível.

## Comandos

| Comando | Finalidade |
| --- | --- |
| `npm run lint` | Verificar o código com ESLint |
| `npm run build` | Gerar o frontend em `dist/` |
| `npm run preview` | Visualizar o frontend compilado |
| `npx tauri build` | Compilar e empacotar o aplicativo desktop |

A tela de notas depende de um servidor externo, configurado em `src/pages/Notes.jsx`. Consulte o [README principal](../README.md) para instalação, requisitos e contrato da API compartilhada com o mobile.
