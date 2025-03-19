
// Development server for running both the client and WebSocket server
const { spawn } = require('child_process');
const path = require('path');

// Start the WebSocket server
const wsServer = require('./src/server/websocket-server');

// Start the Vite dev server for the client
const viteProcess = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true
});

// Log when the Vite process exits
viteProcess.on('exit', (code) => {
  console.log(`Vite dev server exited with code ${code}`);
  process.exit(code);
});

// Handle termination
process.on('SIGINT', () => {
  console.log('Shutting down servers...');
  viteProcess.kill('SIGINT');
  process.exit(0);
});

console.log('Development servers started:');
console.log('- WebSocket server running on port 8080');
console.log('- Vite dev server should be starting shortly');
