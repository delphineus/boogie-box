var express = require('express');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var path = require('path');
var VideoData = require('./db').VideoData;
var ChatData = require('./db').ChatData;
var url = require('url');
var request = require('request');
var config = require('./config');   //contains port & YOUTUBE_API_KEY

var app = express();

app.use(express.static(path.join(__dirname, '../client'))); //serve static files
app.use(morgan('dev')); //set logger
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//route to get all urls
app.get('/api/url', function(req, res) {
  VideoData.findAll({}).then(function(urls) {
    console.log(`urls ${JSON.stringify(urls)}`);
    res.send(urls);
  });
});

//adding 1 url to VideoData table
app.post('/api/url', function(req, res, next) {
  var queryData = url.parse(req.body.videourl, true).query;

  //if this is a proper youtube url with the "v" query string (after the watch)
  //i.e https://www.youtube.com/watch?v=8boneOGMa00
  if (queryData && queryData.v) {
    //get the title by making a request to the youtube api
    request('https://www.googleapis.com/youtube/v3/videos?id=' + queryData.v + '&key=' + config.YOUTUBE_API_KEY + '&fields=items(id,snippet(title))&part=snippet', function (err, response, body) {
      if (err) {
        throw err;
      }

      var parseBody = JSON.parse(body);

      //add record to db
      VideoData.create({
        videourl: req.body.videourl,
        origin: req.body.origin,
        title: parseBody.items[0].snippet.title,
        upVote: parseInt(req.body.upVote),
        downVote: parseInt(req.body.downVote)
      }).then(function() {
        console.log(`req body ${JSON.stringify(req.body)}`);
        res.send('done');
        next(); //refer to app.use line 17 server.js
      });
    });
  }
});

//update upvote or downvote by 1 given an id
app.put('/api/url/:id', function (req, res, next) {
  var id = req.params.id;

  if ((req.body).hasOwnProperty('upVote') || (req.body).hasOwnProperty('downVote')) {

    //find record by id first
    VideoData.findAll({
      where: {
        id: id
      }
    }).then(function(url) {
      var newValue;

      //if req.body is upVote
      if ((req.body).hasOwnProperty('upVote')) {
        newValue = url[0].dataValues.upVote + 1;  //increment

        //update new value
        VideoData.update({
          upVote: newValue
        }, {
          where: {
            id: id,
          }
        });

        res.send('updated for id ' + id);
        next(); //refer to app.use line 17 server.js
      } else if ((req.body).hasOwnProperty('downVote')) {
        newValue = url[0].dataValues.downVote + 1; //increment

        //update new value
        VideoData.update({
          downVote: newValue
        }, {
          where: {
            id: id,
          }
        });

        res.send('updated for id ' + id);
        next(); //refer to app.use line 17 server.js
      }
    });
  } else {
    res.send('error');
  }
});

//delete url based on id
app.delete('/api/url/:id', function(req, res, next) {
  VideoData.destroy({ where : {id: req.params.id} }).then(function () {
    console.log('deleted done');
    res.send('deleted successfully');
    next(); //refer to app.use line 17 server.js
  });
});

// get chat messages from db
app.get('/api/chat', function(req, res) {
  ChatData.findAll({}).then(function(messages) {
    console.log(`messages ${JSON.stringify(messages)}`);
    res.send(messages);
  });
});

// post message to db
app.post('/api/chat', function(req, res, next) {

  var message = {
    text: req.body.text,
    user: req.body.user
  }

  //add record to db
  ChatData.create({
    text: message.text,
    user: message.user
  }).then(function() {
    console.log(`req body ${JSON.stringify(req.body)}`);
    res.send('done');
    next(); //refer to app.use line 17 server.js
  });
});

// let's create a session!
var session = require('client-sessions');

app.use(session({
  cookieName: 'session',
  secret: 'secreteCodeHere',
  duration: 30 * 60 * 1000,
  activeDuration: 5 * 60 * 1000,
}));

// Store and retrieve username
app.get('/api/user', function(req, res) {
  req.session.user && res.send(req.session.user) || res.send('No username stored');
});

app.post('/api/user', function(req, res, next) {
  req.session.user = req.body.name;
  res.send(req.session.user + ' stored in session');
});

// Store and retrieve vote data
app.get('/api/votes', function(req, res) {
  req.session.votes && res.send(req.session.votes) || res.send('No votes stored');
});

app.post('/api/votes', function(req, res, next) {
  req.session.votes ? req.session.votes.push(req.body) : req.session.votes = [req.body];
  res.send('New vote stored in session');
});

module.exports = app;