//add dep
//react
//react-dom

// import ReactPlayer from 'react-player'

class App extends React.Component {
  constructor(props) {
    super(props);
  }

  setDuration(duration) {
    this.setState({
      duration: duration
    });
  }

  verifySync(playbackTimes) {
    // server time
    // if too different
    // this.refs.player.seekTo(serverTime);
  }

  render() {
    return (
      <div>
        <h1>Hello {this.props.message}</h1>
        <ReactPlayer ref="player" url="https://soundcloud.com/crystal-castles/vanished" playing controls onDuration={this.setDuration.bind(this)}/>
        <button onClick={() => this.refs.player.seekTo(.5)}>Halfway</button>
      </div>
    );
  }
}

window.App = App;