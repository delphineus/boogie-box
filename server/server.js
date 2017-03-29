var app = require('./app');
var config = require('./config');   //contains port & YOUTUBE_API_KEY
var socket = require('socket.io');

//setting port on server side
var port = config.port;

//starting server
var server = app.listen(port, function () {
  console.log('We got the boogie on port', port);
});

//starting socket on server instance
var io = socket(server);

//gets called everytime for all routes except GET /api/url by invoking the "next()";
app.use(function (req, res, next) {
  if (req.method !== 'GET') {
    //broadcast to all users that there is a change in queue
    io.emit('queueChange', {change: true});
  }
});

var masterTime = 0;
var masterClient = [];  //holds all the clients connected sequencially

//each connected user's settings
io.on('connection', function (socket) {
  //if there is no admin
  if (!masterClient.length) {
    //set the connected user as admin
    socket.emit('setAdminFlag', {admin: true});
  }

  //all users get pushed in the masterClient array (in order as they join)
  masterClient.push(socket.id);
  console.log(masterClient.length); //shows in console # of users connected

  //when admin raises/calls setTime from frontend
  socket.on('setTime', function (data) {
    masterTime = data.time;   //set masterTime

    //broadcast admin's player time to all users except the one who raised setTime (meaning the admin)
    socket.broadcast.emit('recTime', {time: masterTime});
  });

  //when a user disconnects
  socket.on('disconnect', function () {
    //if user is an admin
    if (masterClient[0] === socket.id) {
      masterClient.shift();   //remove admin from masterClient array

      //if there are other users in the masterClient (there are connected users)
      if (masterClient.length) {
        //set the new admin
        socket.broadcast.to(masterClient[0]).emit('setAdminFlag', {admin: true});
      }
    } else {
      //if user is not admin, simply remove user from masterClient array
      masterClient.splice(masterClient.indexOf(socket.id), 1);
    }
  });

  //when a new message is entered in a chat
  socket.on('new message', function (data) {
    // we tell the client to execute 'new message'
    socket.broadcast.emit('new message', data);
  });
});



