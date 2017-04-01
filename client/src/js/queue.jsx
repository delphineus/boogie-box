//Component for adding new URLs
class Add extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: ''
    };
  }


  // Pulls input info from the add box in the queue, and pushes
  // a url to the serverside for DB tracking if the url is valid
  urlSubmit(event) {
    event.preventDefault();
    var inputVal = this.refs.addUrlField.value;
    if (this.validYoutubeUrl(inputVal)) {
      this.refs.addUrlField.style = 'outline: initial';
      this.setState({
        error: ''
      });
      apiHelper.postVideo(inputVal, function() {
        this.props.updateQueue();
      }.bind(this));
      this.refs.addUrlField.value = '';
    } else {
      this.refs.addUrlField.style = 'outline: 1px solid red';
      this.setState({
        error: 'Please input a valid Youtube URL'
      });
    }
  }

  // Dead simple youtube url validator. Back end uses more sophisticated
  // API based validation, but this prunes most nonsense input
  // off the bat.
  validYoutubeUrl(url) {
    var necessaryString0 = 'youtube.com';
    var necessaryString1 = '?v=';
    return url.indexOf(necessaryString0) !== -1 && url.indexOf(necessaryString1) !== -1;
  }

  render() {
    return (
      <div>
        <span id='qAddText'>Video URL</span>
        <form onSubmit={this.urlSubmit.bind(this)}>
          <label id='vidSubmit'>
            <input className="form-control" id="focusedInput" type="text" ref="addUrlField"/>
          </label>
          <input className='btn btn-sm btn-primary' type="submit" value="Submit"/>
        </form>
        {this.state.error}
      </div>
    )
  }
};


// React Component for rendering each element in the song queue
class QueueElement extends React.Component {
  constructor(props) {
    super(props);

    // These are mostly unused, but helpful for testing
    // some functionalities if you so choose
    this.state = {
      downVoted: false,
      upVoted: false,
      downStyle: {},
      upStyle: {}
    };
  }


  // Gets called on either an upvote or downvote, interacts
  // with the server side to post that vote.
  vote(type) {
    if(!(this.props.votedOn[this.props.video.id])) {
      // tell session to save choice with id
      apiHelper.postVote(
        {
          id: this.props.video.id,
          type: type
        }, function(err) {
          if (err) {
            console.error('Error posting like:', err);
          } else {
            console.log('vote posted to session');
          }
        });

      if (type === 'up') {
        apiHelper.vote({upVote: true}, this.props.video);
      } else if (type === 'down') {
        apiHelper.vote({downVote: true}, this.props.video);
      }
      this.props.votedOn[this.props.video.id] = type;
    }
  }

  componentDidMount() {
    var self = this;
    apiHelper.getVotes(function(err, votes) {
      console.log('this is', this);
      if (err) {
        console.error('Error getting votes:', err);
      } else {
        _.each(votes, function(vote) {
          self.props.votedOn[vote.id] = vote.type;
        });
      }
    });
  }

  render() {
    return (
      <div id='qEntry' className='container'>
        <div id='vidInQ' className='col-sm-10'>
          <div id='vidTitle'>
            <a href={this.props.video.videourl} target="_blank">{this.props.video.title}</a>
          </div>
        </div>

        <div id='dwnVoteCol' className='col-sm-1'>
          <div id='dwnVote'>
            <button className='btn btn-md btn-default' onClick={function() {this.vote('down')}.bind(this)} style={(this.props.votedOn[this.props.video.id] === 'down') ? {border: '2px solid red'} : {}}><span className='glyphicon glyphicon-circle-arrow-down'> {this.props.video.downVote}</span></button>
          </div>
        </div>
        <div id='upVoteCol' className='col-sm-1'>
          <div id='upVote'>
            <button className='btn btn-md btn-default' onClick={function() {this.vote('up')}.bind(this)} style={(this.props.votedOn[this.props.video.id] === 'up') ? {border: '2px solid green'} : {}}><span className='glyphicon glyphicon-circle-arrow-up'> {this.props.video.upVote}</span></button>
          </div>
        </div>
      </div>
    )
  }
};


class Queue extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      videoList: [],
      votedOn: {},
      hasVideos: false
    };

    this.updateQueue();

    // This is what updates the queue every time you or another user
    // causes any sort of change on the queue. This includes
    // votes, additions, and subtractions.
    this.props.socket.on('queueChange', function(){
      this.updateQueue();
    }.bind(this));
  }


  // Updates the queue with all video data, such that votes and
  // songs are all consistently up to date for every user in the
  // boogie box

  // Note: this also sorts the output by vote score (i.e. up - down)
  updateQueue() {
    var hadVideos = this.state.hasVideos;
    var getVideosCallback = function(err, data) {
      if (err) {
        console.log('Error on retrieving videos', err);
      } else {
        var hasVideos = data.length > 0;

        data.sort(function(a, b) {
          var bScore = b.upVote - b.downVote;
          var aScore = a.upVote - a.downVote;

          return bScore - aScore;
        });

        this.setState({
          videoList: data,
          hasVideos: hasVideos
        });

        if (!hadVideos && this.state.hasVideos) {
          this.props.startVideo();
        }
      }
    };
    apiHelper.getVideos(getVideosCallback.bind(this));
  }


  // This method is responsible for advancing the queue whenever
  // the current song is done playing. It removes the top song
  // from the queue and returns it so the player can start
  // playing that.
  advanceQueue() {
    if (this.state.hasVideos) {
      var newVid = this.state.videoList[0];

      apiHelper.removeVideo(newVid, function() {
        apiHelper.getVideos(function(err, data) {
          var hasVideos = data.length > 0;
          this.setState({
            videoList: data,
            hasVideos: hasVideos
          });
        }.bind(this));
      }.bind(this));

      return newVid;
    }

    return null;
  }

  render() {
    var queueElements = [];
    var votedOn = this.state.votedOn;
    _.each(this.state.videoList, function(video) {
      queueElements.push(<QueueElement video={video} votedOn={votedOn} key={video.id}/>);
    });

    return (
      <div id='qPanel' className='panel panel-default'>
        <div id='qPanelHead' className='panel-heading'>
          <Add updateQueue={this.updateQueue.bind(this)}/>
        </div>
        <div id='qPanelBody' className='panel-body'>
          <div id='qTextBody'>{ queueElements }</div>
        </div>
      </div>
    );
  }
};

window.Add = Add;
window.Queue = Queue;