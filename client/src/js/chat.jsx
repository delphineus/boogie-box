// React component for handling the sending of new chats
class ChatInput extends React.Component {
  constructor(props) {
    super(props);
    console.log(props)
    this.state = {
      prevName: this.props.name,
      name: this.props.name,
      messages: this.props.messages,
      typing: false
    }
    // Messages will render on load
    this.props.updateChat();
    // Handles receiving new messages from the socket
    // Note: Only users who didn't send the message will
    // receive this. The sender's client will track it
    // for them sans socket to cut down on unnecessary
    // socket communications.
    this.props.socket.on('new message', function(data) {
      var newMessage = {
        user: data.user,
        text: data.text,
        id: this.state.messages.length
      };
      this.props.updateChat();
    }.bind(this));
  }
  // Handles all info when the user submits a chat.
  // This includes changing of names, storing your own
  // messages, etc.
  chatSubmit(event) {
    event.preventDefault();
    var messageText = this.refs.messageInput.value;
    var prevName = this.state.prevName;
    this.refs.messageInput.value = '';
    this.setState({
      prevName: this.refs.nameInput.value
    });
    if(prevName !== this.state.name) {
      var announceNameChange = {
        user: prevName,
        text: 'I changed my name to \'' + this.state.name + '\''
      };
      this.props.socket.emit('new message', announceNameChange);
      announceNameChange.id=this.state.messages.length;
      this.state.messages.push(announceNameChange);
      apiHelper.postUserToSession(this.state.name);
    }
    var newMessage = {
      user: this.state.name,
      text: messageText
    };
    this.props.socket.emit('new message', newMessage);
    newMessage.id=this.state.messages.length;

    apiHelper.postChat(newMessage);
    this.state.messages.push(newMessage);
    this.setState({ messages: this.state.messages });
    this.props.updateChat();
    this.endTyping();
  }
  //Whenever the the chat input changes, which is to say whenever a user adds or removes a character from the message input, this checks to see if the string is empty or not. If it is, any typing notification is removed. Conversely, if the user is typing, the typing notification is displayed to other users.
  checkInput(event) {
    if (this.refs.messageInput.value) {
        this.chatTyping();
    } else {
      this.endTyping();
    }
  }
  //If user is typing, this sends the username to the typing event listener in the server to display to other users a typing indicator.
  chatTyping(event) {
    var typingNote = {
      user: this.state.name
    }
      this.props.socket.emit('typing', typingNote)
  }
  //Tells server that the user is done typing by packing grabbing the name of the state object and sending it to the 'end typing' event listener in the server.
  endTyping(event) {
    var endTypingNote = {
      user: this.state.name
    }
    this.props.socket.emit('end typing', endTypingNote)
  }
  // This just keeps track of what nickname the user
  // has chosen to use
  changeName() {
    this.setState({
      name: this.refs.nameInput.value
    });
  }
  componentDidMount() {
    var setName = function(err, name) {
      if (err) {
        console.error(err);
      } else {
        this.setState({
          prevName: name,
          name: name
        });
      }
    }.bind(this);
    apiHelper.getUserFromSession(setName);
  }
  render() {
    return (
      <form id='allChatInputs' onSubmit={this.chatSubmit.bind(this)}>
        <input id='userIdBox' type='text' ref='nameInput' value={this.state.name} onChange={this.changeName.bind(this)}></input>
        <input id='chatInputBox' type='text' ref='messageInput' onChange={this.checkInput.bind(this)}></input>
        <button id='chatSubmitBtn' className='btn btn-sm btn-default' type='submit'>Send</button>
      </form>
    );
  }
};
class ChatMessage extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div className='chatMessage'>
        <span className='chatMessageUser' className='label label-primary'>{this.props.message.user}:</span>
        <span className='chatMessageText'> {this.props.message.text} </span>
      </div>
    );
  }
};
class Chat extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      messages: [],
      anonName: this.genAnonName(),
      userActive: false,
      typingUsers: {}
    }
    this.props.socket.on('typing', function(data) {
      this.state.typingUsers[data.user] = !this.state.typingUsers[data.user] ? this.state.typingUsers[data.user] : this.state.typingUsers[data.user]++;
      this.setState({
        userActive: true,
        typingUsers: this.state.typingUsers
      })
    }.bind(this))
    this.props.socket.on('end typing', function(data) {
      for (var key in this.state.typingUsers) {
        if (key === data.user) {
          delete this.state.typingUsers[key];
        }
      }
      this.setState({
        typingUsers: this.state.typingUsers
      }, function() {
        if (!Object.keys(this.state.typingUsers).length) {
          this.setState({
            userActive: false
          })
        }
      })
    }.bind(this));
  }
  // This just generates a random name of the form
  // Anonxxx where xxx is a random, three digit number
  genAnonName() {
    var num = Math.floor(Math.random() * 1000);
    var numStr = '000' + num;
    numStr = numStr.substring(numStr.length - 3);
    var name = 'Anon' + numStr;
    return name;
  }
  // Just for utility in updating the chat correctly
  // with the most up to date information
  updateChat() {
    var getChatCallback = function(err, data) {
      if (err) {
        console.log('Error on retrieving chat', err);
      } else {
        this.setState({
          messages: data
        });
      }
    };
    apiHelper.getChat(getChatCallback.bind(this));
  }
  // to scroll to the bottom of the chat
  scrollToBottom() {
    var node = ReactDOM.findDOMNode(this.messagesEnd);
    node.scrollIntoView({block: "end", behavior: "smooth"});
  }
  componentDidMount() {
    // this.scrollToBottom();
  }
  // when the chat updates, scroll to the bottom to display the most recent chat
  componentDidUpdate() {
    // this.scrollToBottom();
  }
  render() {
    console.log(this.state.typingUsers)
    var thoseTyping = (Object.keys(this.state.typingUsers).join(', ').trim().replace(/^,/, ''))
    var typingIndicator = `${thoseTyping} . . .`;
    var chats = [];
    _.each(this.state.messages, function(message) {
      chats.push(<ChatMessage message={message} key={message.id}/>);
    })
    return (
      <div className="chatBox">
        <div id='chatPanel' className='panel panel-info'>
          <div id='chatTitle' className='panel-heading'>Boogie-Chat</div>
          <div id='chatPanBody' className='panel-body'>
            <div id='textBody'>{chats}
              <div id='typing-indicator' className={(this.state.userActive ? 'typing-indicator show' : 'hidden')}>
                <i className="fa fa-comments" aria-hidden="true"></i>
                {typingIndicator}</div>
              <div id='isTyping' className='typing-notification'>
              </div>
            </div>
          </div>
          <div id='chatPanFtr' className='panel-footer'>
            <ChatInput messages={this.state.messages} name={this.state.anonName} updateChat={this.updateChat.bind(this)} socket={this.props.socket}/>
          </div>
        </div>
      </div>
    )
  }
};
window.Chat = Chat;