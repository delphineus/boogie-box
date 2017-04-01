// all callbacks in this file are expected to be in this form:
// cb(err, val) where err is any error recieved, and val
// is the value upon which to operate. If no error, call as
// cb(null, val)

// In any case, if a callback is not given, the default is just to
// log the response and error to the console:

var defaultCallback = function(err, val) {
  if (err) {
    console.log('error:', err);
  } else {
    console.log('response:', val);
  }
}

// Retrieves videos from DB via server connection
//  cb: Takes a callback that gets run on the array
//      returned by the server
var getVideos = function(cb) {

  if (!cb) {
    var cb = defaultCallback;
  }

  $.ajax({
    method: 'GET',
    url: '/api/url',
    success: function(data) {
      cb(null, data);
    },

    error: function(err) {
      cb(err);
    }
  });
}


// Adds video to DB via server connection
//  url: takes the URL of the new video
//  cb: Takes a callback that gets run on
//      the server's response
var postVideo = function(url, cb) {

  if (!cb) {
    var cb = defaultCallback;
  }

  var video = {
    videourl: url,
    origin: 'youtube',
    // title: getVideoTitle(url),
    upVote: 0,
    downVote: 0
  }


  $.ajax({
    method: 'POST',
    url: '/api/url',
    data: video,
    success: function(response) {
      console.log('response on postVideo', JSON.stringify(response));
      cb(null, response);
    },
    error: function(err) {
      console.log('error on postVideo', err);
      cb(err);
    }
  });
};


// Removes a video from the queue via server connection
// video: takes a video object (in the format the server
//        originally sent it in)
// cb: takes a callback that gets run on the server's
//     response
var removeVideo = function(video, cb) {

  if (!cb) {
    var cb = defaultCallback;
  }

  $.ajax({
    method: 'DELETE',
    url: '/api/url/' + video.id,
    success: function(response) {
      console.log('response on removeVideo', JSON.stringify(response));
      cb(null, response);
    },
    error: function(err) {
      console.log('error on removeVideo', err);
      cb(err);
    }
  });
};


// Used for voting on queue elements
// vote: takes an object to define the
//       vote to be made. Options:
//       {upVote: true}
//       {downVote: true}
// video: the video object on which
//        the vote is being cast
// cb: optional callback that gets run
//     on the server's respopnse to the
//     vote call
var vote = function(vote, video, cb) {
  if (!cb) {
    var cb = defaultCallback;
  }

  $.ajax({
    method: 'PUT',
    url: '/api/url/' + video.id,
    data: vote,
    success: function(response) {
      console.log('response on removeVideo', JSON.stringify(response));
      cb(null, response);
    },
    error: function(err) {
      console.log('error on removeVideo', err);
      cb(err);
    }
  });
};

// Creating chat requests
var getChat = function(cb = defaultCallback) {
  $.ajax({
    method: 'GET',
    url: '/api/chat',
    success: function(data) {
      cb(null, data);
    },
    error: function(err) {
      cb(err);
    }
  });
};

var postChat = function(message, cb = defaultCallback) {

  $.ajax({
    method: 'POST',
    url: '/api/chat',
    data: message,
    success: function(response) {
      console.log('response on postChat', JSON.stringify(response));
      return cb(null, response);
    },
    error: function(err) {
      console.log('error on postChat', err);
      cb(err);
    }
  });
};

var getUserFromSession = function(cb = defaultCallback) {
  $.ajax({
    method: 'GET',
    url: '/api/user',
    success: function(name) {
      cb(null, name);
    },
    error: function(err) {
      cb(err);
    }
  });
};

// Creating user request
var postUserToSession = function(user, cb = defaultCallback) {

  var user = { name: user };

  $.ajax({
    method: 'POST',
    url: '/api/user',
    data: user,
    success: function(response) {
      cb(null, response);
    },
    error: function(err) {
      console.error('error on posting user:', err);
      cb(err);
    }
  });
};


// Get votes from session if any
var getVotes = function(cb = defaultCallback) {
  $.ajax({
    method: 'GET',
    url: '/api/votes',
    success: function(votes) {
      cb(null, votes);
    },
    error: function(err) {
      console.error('error on getting votes:', err);
      cb(err);
    }
  });
};

// Post vote to session
var postVote = function(vote, cb = defaultCallback) {
  $.ajax({
    method: 'POST',
    url: '/api/votes',
    data: vote,
    success: function(response) {
      cb(null, response);
    },
    error: function(err) {
      console.error('error on posting vote:', err);
      cb(err);
    }
  });
};

// Exports all the api helpers. use apiHelper.<method> to invoke any
// function in this file.
window.apiHelper = {
  getVideos: getVideos,
  postVideo: postVideo,
  removeVideo: removeVideo,
  vote: vote,
  getChat: getChat,
  postChat: postChat,
  getUserFromSession: getUserFromSession,
  postUserToSession: postUserToSession,
  getVotes: getVotes,
  postVote: postVote
};