module.exports = {
  apps: [
    {
      name: "productivity-web",
      script: "npm",
      args: "run start",
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
      script: "npx",
      args: "tsx src/workers/gsheet-sync-worker.ts",
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
