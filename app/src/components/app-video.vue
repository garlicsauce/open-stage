<template>
  <div
    class="peer item"
    :class="{ '-maximized': state.maximized === id }"
    @click="handleClick"
  >
    <div
      v-if="state.screenshots"
      :style="`background:url(/faces/${screenshotNumber}.jpg); background-size: cover; background-position: center;`"
      alt=""
      class="video"
      :class="{ '-mirrored': mirrored }"
    />
    <video
      class="video"
      :class="{ '-mirrored': mirrored }"
      ref="video"
      autoplay
      playsinline
      :muted="muted"
      v-else-if="stream"
      :data-fit="state.fill ? 'cover' : 'contain'"
      autoPictureInPicture="true"
    />
    <div v-else class="video video-placeholder -content-placeholder">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="-icon-placeholder"
      >
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
      </svg>
      <label>Waiting for connection</label>
    </div>
    <div
      v-if="fingerprint"
      class="video video-placeholder video-fingerprint -content-placeholder -overlay -info"
      v-show="!state.maximized"
    >
      <label
        title="Verification code"
        class="-short"
        @click.stop.prevent="doToggleShow"
        v-show="!showCode"
        style="background: rgb(0 0 0 / 50%);"
      >
      <i class="fas fa-user-tie"></i> <span style="margin-left: 5px;">{{ name }}</span><span style="margin-left: 5px;"> - {{ position }}</span>      </label>

      <label
        title="Verification code"
        class="-short"
        style="right: auto;bottom: 2.2rem;left: 0.5rem;background: rgba(195, 184, 30, 0.5);"
        @click.stop.prevent="askForPrivate($event, localId, id)"
      >
        <i class="fas fa-hands-helping"></i><span style="margin-left: 5px;">Ask for private advice</span>
      </label>

            <label
        title="Verification code"
        class="-short"
        style="right: auto;left: 0.5rem; background: rgb(195 184 30 / 50%);"
        @click.stop.prevent="transferReputation($event, localId, id, 5)"
      >    
        <i class="far fa-gem"></i> <span style="margin-left: 5px;">{{ reputation }} RTC</span>
      </label>
      <label
        title="Verification code"
        class="-long"
        @click.stop.prevent="doToggleShow"
        v-show="showCode"
      >
        If the person you see here confirms to see the same ID, you are securely
        connected:
        <br />
        <tt>{{ fingerprint }}</tt>
      </label>
    </div>
    <div
      v-if="state.muteVideo && id === 'self'"
      class="video video-placeholder -content-placeholder"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="-icon-placeholder"
      >
        <path
          d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10"
        ></path>
        <line x1="1" y1="1" x2="23" y2="23"></line>
      </svg>
      <label>You turned the video off</label>
    </div>
    <div
      v-if="stream && showPlayButton"
      class="video video-placeholder -content-placeholder -overlay"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="-icon-placeholder"
      >
        <circle cx="12" cy="12" r="10"></circle>
        <polygon points="10 8 16 12 10 16 10 8"></polygon>
      </svg>
      <label>Click to start video</label>
    </div>
  </div>
</template>

<script>
import { trackSilentException } from "../bugs"
import { messages } from "../lib/emitter"
import mojs from '@mojs/core'

const burst = new mojs.Burst({
  left: 0, top: 0,
  radius:   { 0: 100 },
  count:    5,
  children: {
    shape:        'circle',
    radius:       20,
    fill:         [ 'deeppink', 'cyan', 'yellow' ],
    strokeWidth:  5,
    duration:     2000
  }
});

messages.on('privateRequest', function (user) {
  console.log('request from')
  console.log(user)
})


const log = require("debug")("app:app-peer")

window.screenshotNumber = 0

export default {
  name: "app-video",
  props: {
    stream: {
      type: MediaStream | Object,
      default: null,
    },
    active: {
      type: Boolean,
      default: false,
    },
    muted: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
    },
    mirrored: {
      type: Boolean,
      default: false,
    },
    fingerprint: {
      type: String,
    },
    name: {
      type: String,
    },
    reputation: {
      type: Number,
    },
    position: {
      type: String,
    },
    id: {
      type: String,
    },
    localId: {
      type: String,
    }
  },
  data() {
    return {
      screenshotNumber: ++window.screenshotNumber,
      showCode: false,
      showPlayButton: false,
    }
  },
  methods: {
    playVideo(video) {
      let startPlayPromise = video.play()
      log("play", startPlayPromise)
      if (startPlayPromise !== undefined) {
        startPlayPromise
          .then(() => {
            // Start whatever you need to do only after playback
            // has begun.
          })
          .catch((error) => {
            if (error.name === "NotAllowedError") {
              this.showPlayButton = true
            } else {
              trackSilentException(error)
            }
          })
      }
    },
    transferReputation(event, sid1, sid2, value) {
      messages.emit('transferReputation', {sid1, sid2, value})
      const coords = { x: event.pageX, y: event.pageY }
      burst
        .tune({ x: event.pageX, y: event.pageY })
        .setSpeed(3)
        .replay()
    },
    askForPrivate(event, sid1, sid2) {
      messages.emit('askForPrivate', {sid1, sid2})
      const coords = { x: event.pageX, y: event.pageY }
      burst
        .tune({ x: event.pageX, y: event.pageY })
        .setSpeed(3)
        .replay()
    },
    async doConnectStream(stream) {
      log("doConnectStream", this.title, stream)
      if (stream) {
        try {
          await this.$nextTick()

          let video = this.$refs.video
          log("connectStreamToVideoElement", stream, video)
          if (stream) {
            if ("srcObject" in video) {
              video.srcObject = stream
            } else {
              video.src = window.URL.createObjectURL(stream) // for older browsers
            }

            // Keep in mind https://developers.google.com/web/updates/2017/09/autoplay-policy-changes
            // But if the user allows to access camera it should be fine
            // https://developer.mozilla.org/en-US/docs/Web/Media/Autoplay_guide
            video.onloadedmetadata = (e) => this.playVideo(video)
            video.onloadeddata = (e) => this.playVideo(video)
          }
        } catch (err) {
          trackSilentException(err)
        }
      }
    },
    handleClick() {
      if (this.showPlayButton) {
        this.doPlay()
      } else if (this.state.maximized === this.id) {
        this.state.maximized = ""
      } else {
        this.state.maximized = this.id
      }
    },
    doToggleShow(ev) {
      this.showCode = !this.showCode
    },
    async doPlay() {
      try {
        log("force play manually")
        this.$refs?.video?.play()
        this.showPlayButton = false
      } catch (err) {
        trackSilentException(err)
      }
    },
  },
  async mounted() {
    // webrtc.on('stream', async () => {
    //   await this.$nextTick()
    //   await this.doConnectStream(this.stream)
    // })
    if (this.stream) {
      await this.doConnectStream(this.stream)
    }
  },
  watch: {
    stream(value) {
      this.doConnectStream(value)
    },
  },
}
</script>
