**Command Server Project**

# Enhance your server to be able to handle the following commands from clients. In all cases you should log the result to server.log.
- /w - Sends a whisper to another connected client. For example: ‘/w Guest3 Hi’ Should send a message to Guest3 only.
- Your server should send an informative error message if the command fails for any reason (incorrect number of inputs, invalid username, trying to whisper themselves etc.)
- If there is no error then a private message containing the whisper sender’s name as well as the whispered message should be sent to the indicated user

# /username - Updates the username of the client that sent the command. For example, if Guest2 sends ‘/username john’ then Guest2’s username should be updated to ‘john’
- Your server should send an informative error message if the command fails for any reason (incorrect number of inputs, username already in use, the new username is the same as the old username, etc)
- If there is no error then a message should be broadcast to all users informing them of the name change. You should also send a specialized message to the user that updated their username informing them that the name change was successful.

# /kick - Kicks another connected client, as long as the supplied admin password is correct. (You can just store an adminPassword variable in memory on your server for now.) For example ‘/kick Guest3 supersecretpw’ should kick Guest3 from the chat
- Your server should send an informative error message if the command fails for any reason (incorrect number of inputs, incorrect admin password, trying to kick themselves, invalid username to kick, etc)
- If there is no error then a private message should be sent to the kicked user informing them that they have been kicked from the chat. They should then be removed from the server. A message should be broadcast to all other users informing them that the kicked user left the chat.

# /clientlist - sends a list of all connected client names.