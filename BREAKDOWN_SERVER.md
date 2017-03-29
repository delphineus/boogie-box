This file contains a summary of each file on the server side and the contents of the file (description)

----

####./server/app.js
  - This file contains middleware setup and api routes

####./server/config.js
  - This file is not there, you will have to add it yourself
  - example contents:
    - `module.exports = {
        port: 8080, //OR ANY OTHER PORT YOU WISH
        YOUTUBE_API_KEY: '<YOUR_KEY>'
      };`
    - note that this file is on the .gitignore
    - link to create an API key is https://console.developers.google.com/apis/dashboard

####./server/db.js
  - file contains db initialization and schema(s)

####./server/server.js
  - this file contains the server startup and socket.io stuff/communication

#### ./db
  - This folder is required while deploying. When the app runs sqlite db should be created automatically.
  the path is defined in db.js. sqlite db is added in .gitignore so it doesn't get checked in.
  - .gitkeep (in ./db) allows you to push to github an empty folder