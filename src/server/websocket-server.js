
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
// Store interactive objects
const objects = {};
// Store chat messages
const messages = [];

// Generate interactive objects throughout the world
function generateObjects(count = 20) {
  for (let i = 0; i < count; i++) {
    const id = `object-${generateId()}`;
    const types = ['coin', 'gem', 'star'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    // Values for different object types
    let value = 1;
    if (type === 'gem') value = 5;
    if (type === 'star') value = 10;
    
    objects[id] = {
      id,
      type,
      position: { 
        x: Math.floor(Math.random() * 1800) + 100, 
        y: Math.floor(Math.random() * 1800) + 100 
      },
      value,
      collected: false,
      collectedBy: null
    };
  }
}

// Generate initial objects
generateObjects();

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
            score: 0
          };
          
          // Send confirmation to the client with their ID and game state
          ws.send(JSON.stringify({
            type: 'joined',
            playerId: clientId,
            player: players[clientId],
            players: players,
            objects: objects,
            messages: messages.slice(-20) // Send only the last 20 messages
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
          
        case 'collectObject':
          if (clientId && data.objectId && objects[data.objectId] && !objects[data.objectId].collected) {
            // Mark object as collected
            objects[data.objectId].collected = true;
            objects[data.objectId].collectedBy = clientId;
            
            // Increase player's score
            players[clientId].score += objects[data.objectId].value;
            
            // Broadcast object collected to all clients
            broadcastToAll({
              type: 'objectCollected',
              objectId: data.objectId,
              playerId: clientId,
              playerScore: players[clientId].score
            });
            
            // After 30 seconds, respawn the object
            setTimeout(() => {
              if (objects[data.objectId]) {
                objects[data.objectId].collected = false;
                objects[data.objectId].collectedBy = null;
                objects[data.objectId].position = {
                  x: Math.floor(Math.random() * 1800) + 100,
                  y: Math.floor(Math.random() * 1800) + 100
                };
                
                // Broadcast object respawned
                broadcastToAll({
                  type: 'objectRespawned',
                  object: objects[data.objectId]
                });
              }
            }, 30000); // 30 seconds
          }
          break;
          
        case 'chatMessage':
          if (clientId && data.message && data.message.trim()) {
            const newMessage = {
              id: generateId(),
              playerId: clientId,
              playerName: players[clientId].name,
              message: data.message.substring(0, 100), // Limit message length
              timestamp: Date.now()
            };
            
            // Add message to history
            messages.push(newMessage);
            
            // Limit message history to last 100 messages
            if (messages.length > 100) {
              messages.shift();
            }
            
            // Broadcast message to all clients
            broadcastToAll({
              type: 'newChatMessage',
              message: newMessage
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
