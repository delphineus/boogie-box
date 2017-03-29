[![Stories in Ready](https://badge.waffle.io/delphineus/boogie-box.png?label=ready&title=Ready)](https://waffle.io/delphineus/boogie-box)
# Boogie-Box

> Everyone and anyone who loves tasty jams, and sharing those scrumptous beats with friends.

## Team

  - __Product Owner__: Seán Michael Ellison-Chen
  - __Scrum Master__: Alex David Moores
  - __Development Team Members AKA Dream-Makers__: Mohammad Farooqi, Faiz Mohammed

## Table of Contents

1. [Usage](#Usage)
1. [Requirements](#requirements)
1. [Development](#development)
    1. [Installing Dependencies](#installing-dependencies)
    1. [Tasks](#tasks)
1. [Team](#team)
1. [Contributing](#contributing)

## Usage

> 1.) npm install
> 2.) bower install
> 3.) grunt (not literally, but the task runner I mean)

## Requirements

- node
- npm
- bower
- grunt
- sqlite3
- babel

## Development

### Installing Dependencies

From within the root directory:

```sh
// create's config.js and populate file with port and api_key
echo "module.exports = {port: <port_no_here>, YOUTUBE_API_KEY: <YOUR_KEY_HERE>};" >> ./server/config.js
// socketAddr used in client/src/js/index.js
echo "window.socketAddr = '<APP URL i.e., http://localhost:8080>';" >> ./client/socketAddr.js
sudo npm install -g bower
npm install
bower install
grunt (again, not literally. Not like the verb or anything. You know what I mean? I mean the taskrunner. It's a pretty cool thing that lets us run multiple tasks in one go. Wouldn't it be silly if we were literally grunting though? I mean like, can you even imagine? That'd be pretty funny, right? Good stuff. My uncle had a very distinctive grunt. You could hear it from a mile away. Well, not like a literal mile. That's a little far for a grunt to be heard. But you could definitely hear it from across a room.)
```

### Roadmap

View the project roadmap [here](https://waffle.io/remote-control-pigeon/boogie-box)


## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.
