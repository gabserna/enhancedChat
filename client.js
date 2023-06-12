const net = require('net');
const client = net.createConnection(5050, () => {
  console.log('Connected to chatroom');
});
//client.setEncoding('utf8');

//event handler for incoming data from chat server
client.on('data', (data) => {
    console.log(data.toString('utf8'));
  });
process.stdin.setEncoding('utf8');

//event handler to read users input
process.stdin.on('data', (input) => {
  const userInput = input.trim();

  //check user input is "quit" then exit the app
  if (userInput === 'quit') {
    process.exit();
  } else {
    //broadcast user input to the chat server
    client.write(userInput);
  }
});

//event handler for end of stdin (input stream)
process.stdin.on('end', () => {
  process.exit();
});