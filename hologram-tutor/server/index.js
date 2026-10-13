import { loadConfig, loadDotEnv } from './config.js';
import { createProvider } from './ai/index.js';
import { createApp } from './app.js';

loadDotEnv();
const config = loadConfig();
const provider = createProvider(config);
const app = createApp({ provider, publicDir: config.publicDir, nodeModulesDir: config.nodeModulesDir });

const server = app.listen(config.port, config.host, () => {
  const url = `http://${config.host === '127.0.0.1' ? 'localhost' : config.host}:${config.port}`;
  console.log(`Hologram Tutor running at ${url}`);
  console.log(`AI provider: ${provider.name} (${provider.model})`);
  const status = provider.status();
  if (!status.ready) console.warn(`⚠  ${status.reason}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${config.port} is already in use. Set PORT in .env to use another port.`);
    process.exit(1);
  }
  throw err;
});
