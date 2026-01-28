import concurrently from 'concurrently';

concurrently([
  {
    name: 'server',
    command: 'pnpm run dev',
    cwd: 'packages/server',
    prefixColor: 'green',
  },
  {
    name: 'client',
    command: 'pnpm run dev',
    cwd: 'packages/client',
    prefixColor: 'yellow',
  },
]);
