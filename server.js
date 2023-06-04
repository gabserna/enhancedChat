const net = require("net");
const fs = require("fs");
const PORT = 5050;
const adminPassword = "Admin123#"; // admin passwrod
let clients = [];

const server = net.createServer((socket) => {
  const clientId = clients.length + 1;
  const client = { socket, username: null };
  clients.push(client);

  socket.write(`Welcome to the chat server User${clientId}!!!!\n`);
  broadcastMessage(clientId, `User${clientId} joined the chat\n`);
  logMessage(`User${clientId} has connected.\n`);

  socket.on("data", (data) => {
    const payload = data.toString().trim();

    if (payload.startsWith("/")) {
      processCommand(clientId, payload);
    } else {
      const message = `User${clientId}: ${payload}\n`;
      console.log(message);
      fs.appendFileSync("chat.log", message);

      broadcastMessage(clientId, message);
    }
  });

  socket.on("end", () => {
    const message = `User${clientId} just disconnected.\n`;
    console.log(message);
    fs.appendFileSync("chat.log", message);

    clients = clients.filter((c) => c.socket !== socket);
    broadcastMessage(clientId, `User${clientId} has left chat.\n`);
  });
});

server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

function processCommand(clientId, command) {
  const parts = command.split(" ");
  const commandName = parts[0].toLowerCase();

  switch (commandName) {
    case "/w":
      processWhisperCommand(clientId, parts);
      break;
    case "/username":
      processUsernameCommand(clientId, parts);
      break;
    case "/kick":
      processKickCommand(clientId, parts);
      break;
    case "/clientlist":
      showClientList(clientId);
      break;
    default:
      clients[clientId - 1].socket.write("Invalid command.\n");
      break;
  }
}

function processWhisperCommand(senderId, parts) {
  if (parts.length >= 3) {
    const recipient = parts[1];
    const message = parts.slice(2).join(" ");
    whisperTxt(senderId, recipient, message);
  } else {
    clients[senderId - 1].socket.write("Invalid whisper command.\n");
  }
}

function processUsernameCommand(clientId, parts) {
  if (parts.length === 2) {
    const newUsername = parts[1];
    updateUsername(clientId, newUsername);
  } else {
    clients[clientId - 1].socket.write("Invalid username command.\n");
  }
}

function processKickCommand(adminId, parts) {
  if (parts.length >= 3) {
    const targetUsername = parts[1];
    const adminPass = parts[2];
    kickUser(adminId, targetUsername, adminPass);
  } else {
    clients[adminId - 1].socket.write("Invalid kick command.\n");
  }
}

function broadcastMessage(senderId, message) {
  clients.forEach((client) => {
    if (client.socket !== clients[senderId - 1].socket) {
      client.socket.write(message);
    }
  });
}

function logMessage(message) {
  console.log(message);
  fs.appendFileSync("chat.log", message);
}

// Resto de las funciones (whisperTxt
// kickUser y broadcastMessage)

// Send a private message to a specific user
function whisperTxt(senderId, recipient, message) {
  const recipientClient = clients.find(
    (client) => client.username === recipient
  );

  if (!recipientClient) {
    const errorMessage = `User '${recipient}' not found.\n`;
    clients[senderId - 1].socket.write(errorMessage);
    return;
  }

  if (senderId === recipientClient.clientId) {
    const errorMessage = "You can't whisper to yourself.\n";
    clients[senderId - 1].socket.write(errorMessage);
    return;
  }

  const senderName = `User${senderId}`;
  const whisperTxt = `${senderName} whispers: ${message}\n`;
  recipientClient.socket.write(whisperTxt);
}

// Update the username of a client
function updateUsername(clientId, newUsername) {
  const client = clients[clientId - 1];

  if (client.username === newUsername) {
    const errorMessage =
      "The new username is the same as the current username.\n";
    client.socket.write(errorMessage);
    return;
  }

  if (clients.find((c) => c.username === newUsername)) {
    const errorMessage = `The username '${newUsername}' is already in use.\n`;
    client.socket.write(errorMessage);
    return;
  }

  const previousUsername = client.username;
  client.username = newUsername;

  const successMessage = `Your username has been updated to '${newUsername}'.\n`;
  client.socket.write(successMessage);

  const broadcastMessage = `User${clientId} has changed their username to '${newUsername}'.\n`;
  broadcastMessage(senderId, broadcastMessage);

  logMessage(broadcastMessage);
}

//kick user from the chat usin /k
function kickUser(adminId, targetUsername, adminPass) {
  const adminClient = clients[adminId - 1];

  if (adminPass !== adminPassword) {
    const errorMessage = "Incorrect admin password.\n";
    adminClient.socket.write(errorMessage);
    return;
  }

  const targetClient = clients.find(
    (client) => client.username === targetUsername
  );

  if (!targetClient) {
    const errorMessage = `User '${targetUsername}' not found.\n`;
    adminClient.socket.write(errorMessage);
    return;
  }

  if (adminClient === targetClient) {
    const errorMessage = "You can't kick yourself.\n";
    adminClient.socket.write(errorMessage);
    return;
  }

  const kickMessage = `You have been kicked from the chat by the admin.\n`;
  targetClient.socket.write(kickMessage);

  clients = clients.filter((client) => client !== targetClient);

  const broadcastMessage = `User${targetClient.clientId} has been kicked from the chat by the admin.\n`;
  broadcastMessage(adminId, broadcastMessage);

  logMessage(broadcastMessage);
}

// Send a list of connected client names to the requesting user
function showClientList(clientId) {
  const client = clients[clientId - 1];
  const clientList = clients
    .map((client) => client.username || `User${client.clientId}`)
    .join(", ");

  client.socket.write(`Connected clients: ${clientList}\n`);
}