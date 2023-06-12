const net = require('net');
const fs = require('fs');
const chatPort = 5050;
// flag a+ to create a new file if doesn't exist or update if does exist....
const file = fs.createWriteStream('./chat.log', { flags: 'a+' });
const chatUser = new Map();
let onLineUser = 1;

//displays msg and write it to file 'chat.log'
function msgFromServer(message) {
  console.log(message);
  file.write(message + '\n');
}
//broadcast msg from sender to all chatroom users
function broadcast(sender, message) {
  chatUser.forEach((client) => {
    if (client !== sender) {
      client.write(`${sender.id}: ${message}\n`);
    }
  });
  msgFromServer(`${sender.id}: ${message}`);
}
//this changes user's nickname
// function changeNickname(user, updatedNickname) {
//   const currentNickname = user.id;
//   if (updatedNickname === currentNickname) {
//     user.write('This is your current nickname!\n');
//     return;
//   }
//   chatUser.delete(currentNickname);
//   chatUser.set(updatedNickname, user);
//   user.id = updatedNickname;
//   msgFromServer(`${currentNickname} is now ${updatedNickname}`);
//   chatUser.forEach((client) => {
//     client.write(`${currentNickname} is now ${updatedNickname}\n`);
//   });
// }
function changeNickname(user, updatedNickname) {
  const currentNickname = user.id;
  if (updatedNickname === currentNickname) {
    user.write('This is your current nickname!\n');
    return;
  }
  if (chatUser.has(updatedNickname)) {
    user.write('This nickname is already taken!\n');
    return;
  }
  chatUser.delete(currentNickname);
  chatUser.set(updatedNickname, user);
  user.id = updatedNickname;
  msgFromServer(`${currentNickname} is now ${updatedNickname}`);
  chatUser.forEach((client) => {
    client.write(`${currentNickname} is now ${updatedNickname}\n`);
  });
}
//handles commands from users
function handleCommand(user, output) {
  const self = user.id;
  const parts = output.split(' ');
  const command = parts[0].toLowerCase();

  switch (command) {
    case '/userlist':
      user.write(Array.from(chatUser.keys()).join(', ') + '\n');
      break;
    case '/username':
      const newNickname = parts[1]?.trim();
      if (newNickname) {
        changeNickname(user, newNickname);
      } else {
        user.write('Wrong command. Try: /username [newNickname]\n');
      }
      break;
    case '/w':
      const targetUser = parts[1]?.trim();
      const message = parts.slice(2).join(' ');
      if (!targetUser || !message) {
        user.write('Wrong command. Try: /w [username] [message]\n');
        break;
      }
      if (targetUser === self) {
        user.write('You should whisper to others\n');
        break;
      }
      if (!chatUser.has(targetUser)) {
        user.write(`Invalid user: '${targetUser}' not connected\n`);
        break;
      }
      const target = chatUser.get(targetUser);
      target.write(`${self} (whispered): ${message}\n`);
      msgFromServer(`${self} whispered to ${targetUser}: ${message}`);
      break;
    case '/kick':
      const adminPassword = 'abc123#';
      const targetUsername = parts[1]?.trim();
      const password = parts[2]?.trim();
      if (!targetUsername || !password) {
        user.write('Wrong command. Try: /kick [username] [password]\n');
        break;
      }
      // if (!targetUsername || !password) {
      // this works?
      //   user.write('Wrong command. Try: /kick [username] [password]\n');
      // }
      if (targetUsername === self) {
        user.write('You cannot kick yourself\n');
        break;
      }
      if (!chatUser.has(targetUsername)) {
        user.write(`Invalid user: '${targetUsername}' not connected\n`);
        break;
      }
      if (password !== adminPassword) {
        user.write('Unable to kick user, wrong password\n');
        break;
      }
      const targetUserSocket = chatUser.get(targetUsername);
      targetUserSocket.write('You have been kicked out\n');
      targetUserSocket.end();
      chatUser.delete(targetUsername);
      break;
    default:
      broadcast(user, output);
      break;
  }
}

const server = net.createServer((user) => {
  user.setEncoding('utf8');
  // managing user comm when join.....
  // user.id = `Client${onLineUser++}`;
  // chatUser.set(user.id, user);
  // msgFromServer('New user in the chatroom');
  // user.write(`Welcome to the chatroom ${user.id}!\n`);
  user.id = `Client${onLineUser++}`;
  chatUser.set(user.id, user);
  msgFromServer('New user in the chatroom');
  user.write(`Welcome to the chatroom ${user.id}!\n`);

  chatUser.forEach((client) => {
    if (client !== user) {
      client.write(`${user.id} has joined\n`);
    }
  });

  user.on('data', (output) => {
    handleCommand(user, output.trim());
  });

  user.on('end', () => {
    msgFromServer(`${user.id} has left`);
    chatUser.delete(user.id);
    chatUser.forEach((client) => {
      client.write(`${user.id} has left\n`);
    });
    console.log(`${user.id} just logged out`);
  });

  user.on('error', (err) => {
    console.error('Something went wrong:', err.message);
  });
});

server.listen(chatPort, () => {
  console.log(`Listening on port: ${chatPort}`);
});
