# Central Mobile

Aplicativo mobile da Central com Expo SDK 57, React Native 0.86, React 19, Expo Router e TypeScript. Inclui tela inicial e operações de listagem, criação e exclusão de notas por API, com abas nativas Início e Notas. Os demais módulos estão em desenvolvimento; a navegação web ainda contém elementos do template Expo.

## Executar

```bash
npm ci
npm start
```

| Comando | Finalidade |
| --- | --- |
| `npm run android` | Iniciar o Expo e abrir no Android |
| `npm run ios` | Iniciar o Expo e abrir no simulador iOS (macOS) |
| `npm run web` | Executar no navegador |
| `npx tsc --noEmit` | Verificar tipos |
| `npx expo export --platform web` | Exportar a versão web para `dist/` |

O script `npm run lint` está disponível, mas a configuração ESLint ainda precisa ser adicionada. O script `reset-project` é um utilitário do template que move o código inicial; não é necessário para executar a Central.

As rotas ficam em `src/app/`. A API de notas é configurada pela constante `API_URL` em `src/app/notes.tsx`. O backend precisa estar acessível no dispositivo utilizado e não está incluído neste projeto. Não há armazenamento offline ou atualização em tempo real.

Consulte o [README principal](../README.md) para requisitos e contrato da API compartilhada com o desktop.
