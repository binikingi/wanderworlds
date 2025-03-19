
const WebSocket = require('ws');
const http = require('http');

// Create an HTTP server
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('WebSocket server for WanderWorlds game\n');
});

// Create a WebSocket server instance
const wss = new WebSocket.Server({ server });

// Store connected clients
const clients = new Map();
// Store player data
const players = {};

// Handle WebSocket connections
wss.on('connection', (ws) => {
  console.log('Client connected');
  let clientId = null;

  // Handle messages from clients
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      
      switch (data.type) {
        case 'join':
          // Generate a unique ID for new players if they don't have one
          clientId = data.playerId || generateId();
          
          // Store the connection with the client ID
          clients.set(clientId, ws);
          
          // Add player to the game state
          players[clientId] = data.player || {
            id: clientId,
            position: { x: Math.floor(Math.random() * 1800) + 100, y: Math.floor(Math.random() * 1800) + 100 },
            direction: 'idle',
            isMoving: false,
            avatar: '1',
            name: `Player ${clientId.substring(0, 4)}`,
            color: '#5585FF',
          };
          
          // Send confirmation to the client with their ID
          ws.send(JSON.stringify({
            type: 'joined',
            playerId: clientId,
            player: players[clientId],
            players: players
          }));
          
          // Broadcast new player to all other clients
          broadcastToOthers(clientId, {
            type: 'playerJoined',
            player: players[clientId]
          });
          
          console.log(`Player joined: ${clientId}`);
          break;
          
        case 'updatePlayer':
          if (clientId && data.player) {
            // Update player data
            players[clientId] = data.player;
            
            // Broadcast player update to all other clients
            broadcastToOthers(clientId, {
              type: 'playerUpdated',
              player: players[clientId]
            });
          }
          break;
          
        default:
          console.log(`Unknown message type: ${data.type}`);
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });

  // Handle client disconnection
  ws.on('close', () => {
    if (clientId) {
      console.log(`Client disconnected: ${clientId}`);
      
      // Remove player from the game
      delete players[clientId];
      clients.delete(clientId);
      
      // Broadcast player left to all clients
      broadcastToAll({
        type: 'playerLeft',
        playerId: clientId
      });
    }
  });
  
  // Handle errors
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    if (clientId) {
      clients.delete(clientId);
      delete players[clientId];
    }
  });
});

// Function to broadcast a message to all clients except the sender
function broadcastToOthers(senderId, message) {
  clients.forEach((client, id) => {
    if (id !== senderId && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}

// Function to broadcast a message to all clients
function broadcastToAll(message) {
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}

// Generate a simple unique ID
function generateId() {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 10);
  return `${timestamp}-${randomPart}`;
}

// Start the server on port 8080
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`WebSocket server is running on port ${PORT}`);
});

module.exports = server; // Export for potential testing
