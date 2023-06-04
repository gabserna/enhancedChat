const net = require("net");
const readline = require("readline");
const client = new net.Socket();

client.connect(5050, "localhost", () => {
  console.log("Connected to chat server!!");

  const rl = readline.createInterface({
    input: process.stdin, output: process.stdout,
  });

  rl.on("line", (input) => {
    client.write(input + "\n");
  });

  rl.on("close", () => {
    client.end();
  });
});

client.on("data", (data) => {
  console.log(data.toString());
});

client.on("close", () => {
  console.log("Connection closed.");
});
