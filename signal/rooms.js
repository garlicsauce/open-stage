const log = require('debug')('signal:rooms')

let rooms = {}
let users = {}

function addProperty(obj, key, value, info = true) {
  if (key == null) return false
  let values = obj[key]
  if (values == null) {
    values = {}
    obj[key] = values
  }
  const created = values[value] == null
  values[value] = info
  return created
}

function removeProperty(obj, key, value) {
  let removed = false
  if (key != null) {
    let values = obj[key]
    if (values != null) {
      removed = values[value] != null
      delete values[value]
    }
  }
  return removed
}

function addSocketToRoom(sid, room) {
  log('addSocketToRoom', sid, room)
  return addProperty(rooms, room, sid)
}

function removeSocketFromRoom(sid, room) {
  log('removeSocketFromRoom', sid, room)
  return removeProperty(rooms, room, sid)
}

function allSocketsForRoom(room) {
  const sockets = Object.keys(rooms[room] || {})
  log('allSocketsForRoom', room, sockets)
  return sockets
}

function getUser(sid) {
  return users[sid]
}

function addUser(sid, user) {
  users[sid] = user

  return true
}

function getUsers() {
  return users
}

function removeUser(sid) {
  delete users[sid]
}

module.exports = {
  rooms,
  addSocketToRoom,
  removeSocketFromRoom,
  allSocketsForRoom,
  getUser,
  addUser,
  getUsers,
  removeUser
}
