module.exports = {
  apps: [
    {
      name: "productivity-web",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 7210",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 7210,
      },
    },
    {
      name: "productivity-sync-worker",
      script: "node_modules/tsx/dist/cli.mjs",
      args: "src/workers/gsheet-sync-worker.ts",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
