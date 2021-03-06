const express = require('express')
const app = express()
const http = require('http')
const server = new http.Server(app)
const io = require('socket.io')(server)
const helmet = require('helmet')
const cors = require('cors')
const {
  rooms,
  addSocketToRoom,
  removeSocketFromRoom,
  allSocketsForRoom,
  getUsers,
  addUser,
  removeUser,
  addOffer,
  getOffer,
  getOffers,
  removeOffer,
  getUser,
} = require('./rooms')
const config = require('./config')

const CONFIG = {
  title: config.title,
  host: process.env.HOST || config.host || undefined,
  port: process.env.PORT || config.port || 4444,
  timeout: config.timeout || 30000,
  max: config.max || 50,
  debug: config.debug || false
}

process.title = CONFIG.title

const log = require('debug')('signal:server')

app.use(helmet())
app.use(cors())

// SOCKET.IO

let brokenSockets = {}

function activeSockets(id = null) {
  return Object.keys(io.sockets.connected).filter(sid => sid !== id && !brokenSockets[sid])
}

function brokenSocket(socket) {
  brokenSockets[socket.id] = true
  // log('--- broken sockets', Object.keys(brokenSockets).length, 'connected', activeSockets().length)
  io.emit('remove', { id: socket.id })
}

function socketByID(id) {
  return io.sockets.connected[id]
}

function emitByID(id, name, msg) {
  let socket = socketByID(id)
  if (socket) {
    log('emit', id, name, msg)
    socket.emit(name, msg)
  }
}

function broadcastByID(ids, name, msg) {
  for (let id of ids) {
    emitByID(id, name, msg)
  }
}

io.on('connection', function (socket) {
  const sid = socket.id
  let currentRoom

  // let peers = activeSockets(sid)
  log('connection socket id:', sid)

  for (const msg of ['disconnect', 'disconnecting', 'error']) {
    socket.on(msg, data => {
      log(`* ${msg}:`, data)
      brokenSocket(socket)
      removeSocketFromRoom(sid, currentRoom)
      removeUser(sid)
    })
  }

  socket.on('status', (info , cb) => {
    log('status', info, cb)
    if (cb) cb({
      api: 1,
      pong: info?.ping || 'pong',
      config: CONFIG
    })
  })

  // The peer that joined is responsible for initiating WebRTC connections
  socket.on('join', ({ room, user }) => {
    let peers = allSocketsForRoom(room)

    const full = peers.length >= config.max
    if (full) {
      socket.emit('error', {
        error: `Room ${room} is full`,
        code: 1,
        full,
      })
    } else {
      removeSocketFromRoom(sid, currentRoom)
      addSocketToRoom(sid, room)
      addUser(sid, user)
      let users = getUsers()
      let offer = getOffer(room)
      currentRoom = room
      socket.emit('joined', {
        room,
        peers,
        users,
        offer
      })
    }
  })

  socket.on('transferReputation', ({ sid1, sid2, value }) => {
    let users = getUsers()
    let fromUser = users[sid1]
    let toUser = users[sid2]

    fromUser.reputation = fromUser.reputation - value
    toUser.reputation = toUser.reputation + value

    addUser(sid1, fromUser)
    addUser(sid2, toUser)

    io.emit('userUpdate', fromUser)
    io.emit('userUpdate', toUser)
  })

  socket.on('addOffer', ({roomId, title, type, description, photo, price, duration, qty, availableAmount, sold, author}) => {
    let offer = {
      roomId,
      title,
      type,
      description,
      photo,
      price,
      duration,
      qty,
      availableAmount,
      sold,
      author
    }

    addOffer(roomId, offer)

    io.emit("newOffer", offer)

    setTimeout(function() {
      removeOffer(roomId)
      io.emit("endOffer", offer)
    }, offer.duration * 1000 * 60)
  });


  socket.on('bidOffer', ({roomId}) => {
    let offer = getOffer(roomId)

    if (offer != null) {
      offer.price = offer.price + 5
      addOffer(roomId, offer)
      io.emit("updateOffer", offer)
    }
  });

  socket.on('askForPrivate', ({sid1, sid2}) => {
    let socket = socketByID(sid2)
    let user = getUser(sid1)

    if (socket) {
      socket.emit("privateRequest", user)
    }
  });

  socket.on('privateAccept', ({user}) => {
    for (const [id, userEntry] of Object.entries(getUsers())) {
      if (user.name == userEntry.name) {
        let socket = socketByID(id)
        if (socket) {
          socket.emit("privateRedirect", user)
        }
      }
    }
  });

  socket.on('buyItem', ({roomId}) => {
    let offer = getOffer(roomId)

    if (offer != null) {
      offer.availableAmount = offer.availableAmount - 1
      offer.sold = offer.sold + 1
      addOffer(roomId, offer)
      io.emit("updateOffer", offer)
    }
  })

  // Ask for a connection to another socket via ID
  socket.on('signal', data => {
    log('signal', data.from, data.to)
    if (data.from !== sid) {
      log('*** error, wrong from', data.from)
    }
    if (data.to) {
      const toSocket = socketByID(data.to)
      if (toSocket) {
        let users = getUsers()
        toSocket.emit('signal', {
          ...data,
          users
          // from: socket.id,
        })
      } else {
        log('Cannot find socket for %s', data.to)
      }
    }
  })

})

// EXPRESS.IO

const startDate = new Date()

app.use('/status', (req, res) => {
  let users = getUsers()
  let offers = getOffers()

  let status = {
    api: 1,
    success: true,
    info: {
      timeStarted: Math.round(startDate.getTime()),
      activeConnections: activeSockets().length,
      rooms,
      users,
      offers
    },
  }
  res.json(status)
})

app.use('/', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no, minimal-ui, viewport-fit=cover">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black">
  <meta name="format-detection" content="telephone=no">
  <meta name="msapplication-tap-highlight" content="no">
  <title>Briefing Signal Server</title>
</head>
<body>
  <p><b><a href="https://brie.fi/ng">Briefing</a> Signal Server</b></p>
  <p>Running since ${startDate.toISOString()}</p>  
</body>
</html>`)
})

// app.use('/', express.static('public'))

//

server.listen({
  host: CONFIG.host,
  port: CONFIG.port,
}, info => {
  console.info(`Running on`, server.address())
})
