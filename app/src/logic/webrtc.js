import io from "socket.io-client"
import { UUID } from "../lib/uuid.js"
import { SIGNAL_SERVER_URL } from "../config"
import { assert } from "../lib/assert"
import { Emitter, messages } from "../lib/emitter"
import { state, setUser } from "../state"
import { WebRTCPeer } from "./webrtc-peer"

const log = require("debug")("app:webrtc")

// Handles multiple connections, one to each peer
export class WebRTC extends Emitter {
  peerConnections = {}
  peerSettings = {}

  static isSupported() {
    return WebRTCPeer.isSupported()
  }

  static async checkStatus() {
    let socket = io(SIGNAL_SERVER_URL, {
      extraHeaders: {
        "Bypass-Tunnel-Reminder": "KononowiczKrzysztof"
      }
      // transports: ['websocket'],
    })

    return new Promise((resolve) => {
      let id = UUID()
      let result = socket.emit("status", { ping: id }, (result) => {
        log("status", result)
        result.ok = result.pong === id
        resolve(result)
      })
    })
  }

  constructor({
    wrtc, // wrtc is used for unit testing via node.js
    room = null,
    user = {},
    peerSettings = {},
  } = {}) {
    super()
    assert(room, "room cannot be empty")

    this.room = room
    this.peerSettings = peerSettings
    this.user = user

    log("webrtc reaches out to", SIGNAL_SERVER_URL)

    // https://socket.io/docs/client-api/
    this.io = io(SIGNAL_SERVER_URL, {
      extraHeaders: {
        "Bypass-Tunnel-Reminder": "KononowiczKrzysztof"
      }
      // transports: ['websocket'],
    })
    assert(this.io, `should not fail to reach out to ${SIGNAL_SERVER_URL}`)

    this.io.on("connect", () => {
      log("connect", this.io.id)
      this.emit("io", {
        online: true,
      })
      this.emit("connect")
      this.io.emit("join", { room, user: this.user })
    })

    this.io.on("disconnect", () => {
      log("disconnect")
      this.emit("io", {
        online: false,
      })
      this.emit("disconnect")
    })

    this.io.on("remove", ({ id }) => {
      let peer = this.peerConnections[id]
      if (peer) {
        peer.close()
        delete this.peerConnections[id]
        this.updateStatus()
        this.emit("disconnected", { peer })
      }
    })

    // Receive all other currently available peers
    this.io.on("joined", ({ room, peers, users, offer, vapidPublicKey }) => {
      const local = this.io.id

      state.vapidPublicKey = vapidPublicKey
      state.offer = offer

      console.log(state)

      log("me", local, room, "peers", peers)

      // We will try to establish a separate connection to all of them
      // If the new participant (us) initiates the connections, the others do
      // not need to get updates about new peers
      this.io.on("signal", ({ from, to, signal, users, initiator }) => {
        // log('received signal', from, to === local, initiator)
        // If we are not already connected, do it now
        let peer = this.peerConnections[from]
        if (!peer) {
          peer = this.handlePeer({
            remote: from,
            local,
            user: users[from],
            initiator: false,
            wrtc,
          })
        }

        peer.user = users[from]
        peer.signal(signal)
        this.updateStatus()
      })

      for (let i = 0; i < peers.length; i++) {
        const remote = peers[i]
        this.handlePeer({
          remote,
          local,
          user: users[remote],
          initiator: true,
          wrtc,
        })
      }

      this.updateStatus()

      this.io.on("userUpdate", (user) => {
        if (user.name == state.user.name) {
          setUser(user)
        }

        for (const [id, peerConnected] of Object.entries(this.peerConnections)) {
          if (peerConnected.user.name == user.name) {
            this.peerConnections[id].user = user;
          } 
        }
        
        this.updateStatus()
      })

      this.io.on("newOffer", (offer) => {
        if (offer.roomId == this.room) {
          state.offer = offer
        }
      })

      this.io.on("updateOffer", (offer) => {
        if (offer.roomId == this.room) {
          state.offer = offer
          messages.emit("priceBounce")
        }
      })

      this.io.on("endOffer", (offer) => {
        if (offer.roomId == this.room) {
          state.offer = {}
        }
      })

      this.io.on("privateRequest", (user) => {
        messages.emit("privateRequest", user)
      })

      messages.on("transferReputation", ({sid1, sid2, value}) => {        
        this.io.emit("transferReputation", { sid1, sid2, value })
      })

      messages.on("addOffer", ({roomId, title, type, description, photo, price, duration, author}) => {
        this.io.emit("addOffer", {roomId, title, type, description, photo, price, duration, author})
      })

      messages.on("bidOffer", ({roomId}) => {
        this.io.emit("bidOffer", {roomId})
      })

      messages.on("askForPrivate", ({sid1, sid2}) => {
        this.io.emit("askForPrivate", {sid1, sid2})
      })
    })
  }

  forEachPeer(fn) {
    Object.values(this.peerConnections).forEach(fn)
  }

  updateStatus() {
    let status = Object.values(this.peerConnections).map((peer) => {
      let { active, initiator, local, remote, error } = peer
      return {
        active,
        initiator,
        local,
        remote,
        error,
        peer,
      }
    })
    this.emit("status", { status })
  }

  getPeer(id) {
    return this.peerConnections[id] || null
  }

  handlePeer({ remote, user, wrtc, local, initiator = false } = {}) {
    let peer = new WebRTCPeer({
      local,
      remote,
      initiator,
      wrtc,
      user,
      room: this.room,
      ...this.peerSettings,
    })

    this.peerConnections[remote] = peer

    // We received the local signal (i.e. network location description) that
    // we will now send via web socket signaling server to the remote peer
    peer.on("signal", (signal) => {
      // log('received peer signal', remote)
      this.io.emit("signal", {
        from: local,
        to: remote,
        signal,
        initiator
      })
    })

    // The full connection is established, from now on we can exchange data
    peer.on("connect", () => {
      this.emit("connected", { peer })
      this.updateStatus()
    })

    // A message from the remote peer
    peer.on("data", (data) => {
      // depr
      let { type, ...msg } = JSON.parse(data)
      this.emit(type, msg)
    })

    peer.on("message", (data) => {
      this.emit("message", data) // Channel compat
    })

    peer.on("stream", (_) => this.updateStatus())
    peer.on("track", (_) => this.updateStatus())

    return peer
  }

  postMessage(data) {
    // Channel compat
    this.forEachPeer((peer) => {
      peer.postMessage(data)
    })
  }

  send(type, msg = {}) {
    // depr
    this.postMessage(JSON.stringify({ ...msg, type }))
  }

  close() {
    this.forEachPeer((peer) => peer.close())
    this.peerConnections = {}
    this.io.close()
  }

  async cleanup() {
    // await super.cleanup()
    this.close()
  }
}
