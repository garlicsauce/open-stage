<template>
  <div
    class="app hstack"
    @dragover="onDragOver"
    @dragend="onDragEnd"
    @dragexit="onDragEnd"
    @dragleave="onDragEnd"
    @drop="onDrop"
  >
    <sea-modal
      xclass="panel -left panel-settings"
      :active="mode === 'settings'"
      :title="l.settings.title"
      @close="mode = ''"
    >
      <app-settings></app-settings>
    </sea-modal>

    <div
      class="-fit vstack"
      :data-mode="state.maximized ? 'maximized' : 'default'"
    >
      <div class="-fit stack videos -relative">
        <app-video
          v-if="videoAllowed && state.stream"
          :stream="state.stream"
          muted
          :mirrored="state.deviceVideo !== 'desktop'"
          title="Local"
          id="self"
        />

        <app-video
          v-for="peer in peers"
          :key="peer.remote"
          :id="peer.remote"
          :localId="peer.local"
          :stream="peer && peer.peer && peer.peer.stream"
          :fingerprint="peer && peer.peer && peer.peer.fingerprint"
          :name="peer && peer.peer && peer.peer.user && peer.peer.user.name"
          :position="peer && peer.peer && peer.peer.user && peer.peer.user.position"
          :reputation="peer && peer.peer && peer.peer.user && peer.peer.user.reputation"
        />

        <div
          class="message-container -error"
          v-if="false"
        >
          <div class="message">
            An error occurred. Please help us fixing it by allowing to send the
            details to us. This option is also available in the settings.
            Thanks!
            <u @click="doAllow(true)">Allow</u> |
            <u @click="doAllow(false)">Deny</u>
          </div>
        </div>

        <div class="message-container error" style="top: 2rem;bottom: auto;" v-if="state.offer.title">
          <div class="message">
            <div class="current-offer">
              <div class="offer-left-column">
                <img class="active" :src="state.offer.photo"/>
              </div>
              <div class="offer-right-column">
                <div class="product-description">
                  <h1>{{state.offer.title}}</h1>
                  <p>{{state.offer.description}}</p>
                </div>
                <div class="product-price">
                  <span id="rcnbidprice">{{state.offer.price}} RCN</span>
                  <a href="#" class="cart-btn" v-if="state.offer.type === 'sell'">Buy</a>
                  <a class="cart-btn" v-else-if="state.offer.type === 'auction'" v-on:click="bidOffer">Bid</a>
                </div>
                <div class="seller-info">
                  <span>Seller: </span><p>{{state.offer.author.name}}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="message-container -error" v-else-if="false">
          <div class="message">
            {{ state.error }}
            <u @click="doReload">Reload page</u>
          </div>
        </div>

        <div class="message-container" v-else-if="state.upgrade">
          <div class="message">
            A new version of this web app has been downloaded.
            <u @click="doReload">Reload page</u>
          </div>
        </div>

        <div
          class="message-container"
          v-else-if="!hasPeers && !state.screenshots && mode !== 'share'"
        >
          <div
            class="message"
            v-html="l.share.message.replace('$symbol$', symbol)"
          ></div>
        </div>
      </div>

      <div class="tools hstack">
        <sea-link
          @action="doTogglePanel('settings')"
          class="tool"
          :class="{ '-active': mode === 'settings' }"
        >
          <!--        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>-->
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="4" y1="21" x2="4" y2="14"></line>
            <line x1="4" y1="10" x2="4" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12" y2="3"></line>
            <line x1="20" y1="21" x2="20" y2="16"></line>
            <line x1="20" y1="12" x2="20" y2="3"></line>
            <line x1="1" y1="14" x2="7" y2="14"></line>
            <line x1="9" y1="8" x2="15" y2="8"></line>
            <line x1="17" y1="16" x2="23" y2="16"></line>
          </svg>
        </sea-link>
        <div class="-fit">
          <sea-link
            class="tool"
            :class="{ '-off': state.muteVideo }"
            @action="doVideo"
          >
            <svg
              v-if="state.muteVideo"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path
                d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10"
              ></path>
              <line x1="1" y1="1" x2="23" y2="23"></line>
            </svg>
            <svg
              v-else
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <polygon points="23 7 16 12 23 17 23 7"></polygon>
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
            </svg>
          </sea-link>
          <sea-link class="tool tool-close" @action="doQuit">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
            <!--          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"></path><line x1="23" y1="1" x2="1" y2="23"></line></svg>-->
          </sea-link>
          <sea-link
            class="tool"
            :class="{ '-off': state.muteAudio }"
            @action="doAudio"
          >
            <svg
              v-if="state.muteAudio"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line x1="1" y1="1" x2="23" y2="23"></line>
              <path
                d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"
              ></path>
              <path
                d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"
              ></path>
              <line x1="12" y1="19" x2="12" y2="23"></line>
              <line x1="8" y1="23" x2="16" y2="23"></line>
            </svg>
            <svg
              v-else
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path
                d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"
              ></path>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
              <line x1="12" y1="19" x2="12" y2="23"></line>
              <line x1="8" y1="23" x2="16" y2="23"></line>
            </svg>
          </sea-link>
        </div>

        <sea-link
          @action="doTogglePanel('trade')"
          :class="{ '-active': mode === 'trade' }"
          class="tool"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            style="height: 24px;"
            viewBox="0 0 100 100"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round">
            <circle cx="50" cy="50" r="45" fill="none" stroke-width="7.5"></circle>
            <line x1="32.5" y1="50" x2="67.5" y2="50" stroke-width="5"></line>
            <line x1="50" y1="32.5" x2="50" y2="67.5" stroke-width="5"></line>
          </svg>
        </sea-link>

        <sea-link
          v-if="supportsFullscreen"
          @action="doToggleFullScreen"
          class="tool"
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
            v-if="!isFullScreen"
          >
            <path
              d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"
            ></path>
          </svg>
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
            v-if="isFullScreen"
          >
            <path
              d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"
            ></path>
          </svg>
        </sea-link>
        <sea-link
          @action="doTogglePanel('share')"
          class="tool"
          :class="{ '-active': mode === 'share' }"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
            <polyline points="16 6 12 2 8 6"></polyline>
            <line x1="12" y1="2" x2="12" y2="15"></line>
          </svg>
        </sea-link>
      </div>
    </div>

    <sea-modal
      xclass="panel -left panel-share"
      :active="mode === 'share'"
      :title="l.share.title"
      @close="mode = ''"
    >
      <app-share></app-share>
    </sea-modal>

    <sea-modal
      xclass="panel -left panel-share"
      :active="mode === 'trade'"
      :title="l.trade.title"
      @close="mode = ''"
    >
      <app-trade></app-trade>
    </sea-modal>

  </div>
</template>

<style>
  .current-offer {
    margin: 0 auto;
    padding: 15px;
    display: flex;
  }

  .offer-left-column {
    width: 60%;
    position: relative;
  }

  .offer-right-column {
    width: 40%;
    margin-top: 30px;
    margin-right: 10px;
  }

  .offer-left-column img {
    width: 70%;
    position: relative;
    left: 0;
    top: 0;
    opacity: 0;
    transition: all 0.3s ease;
  }

  .offer-left-column img.active {
    opacity: 1;
  }

  /* Product Description */
  .product-description {
    border-bottom: 1px solid #E1E8EE;
    margin-bottom: 20px;
  }
  .product-description span {
    font-size: 12px;
    color: #358ED7;
    letter-spacing: 1px;
    text-transform: uppercase;
    text-decoration: none;
  }
  .product-description h1 {
    font-weight: 300;
    font-size: 52px;
    color: #43484D;
    letter-spacing: -2px;
  }
  .product-description p {
    font-size: 16px;
    font-weight: 300;
    color: #86939E;
    line-height: 24px;
  }

  /* Product Price */
  .product-price {
    display: flex;
    align-items: center;
  }

  .product-price span {
    font-size: 26px;
    font-weight: 300;
    color: #43474D;
    margin-right: 20px;
  }

  .cart-btn {
    display: inline-block;
    background-color: #7DC855;
    border-radius: 6px;
    font-size: 16px;
    color: #FFFFFF;
    text-decoration: none;
    padding: 12px 30px;
    transition: all .5s;
  }
  .cart-btn:hover {
    background-color: #64af3d;
  }

  .seller-info p {
    font-size: 14px;
    color: #112242;
    letter-spacing: 1px;
    text-transform: uppercase;
    text-decoration: none;
    display: inline;
  }

  .seller-info span {
    font-size: 12px;
    color: #358ED7;
    letter-spacing: 1px;
    text-transform: uppercase;
    text-decoration: none;
    display: inline;
  }
</style>

<script>
  import {messages} from "../lib/emitter"
  import {createLinkForRoom, shareLink} from "../lib/share"
  import {setup} from "../state"
  import SeaButton from "../ui/sea-button"
  import SeaLink from "../ui/sea-link"
  import SeaModal from "../ui/sea-modal"
  import AppVideo from "./app-video"
  import {setAllowedBugTracking} from "../bugs"
  import {setBackgroundImage} from "../logic/background"
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

  const log = require("debug")("app:app-sidebar")

  messages.on('priceBounce', function() {
    burst
      .tune({ x: document.getElementById("rcnbidprice").offsetLeft, y: document.getElementById("rcnbidprice").offsetTop })
      .setSpeed(3)
      .replay()
  });

  export default {
    name: "app-main",
    components: {
      AppSettings: () =>
        import(/* webpackChunkName: 'settings' */ "./app-settings"),
      AppShare: () => import(/* webpackChunkName: 'share' */ "./app-share"),
      AppTrade: () => import(/* webpackChunkName: 'trade' */ "./app-trade"),
      SeaLink,
      SeaModal,
      SeaButton,
      AppVideo,
    },
    data() {
      return {
        mode: "",
        settings: false,
        share: false,
        conn: null,
        dragOver: false,
        supportsFullscreen: document.fullscreenEnabled,
        isFullScreen: false,
        fullscreenHandler: null,
        symbol:
          '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg>',
      }
    },
    computed: {
      hasPeers() {
        return Object.keys(this.state.status).length > 0
      },
      peers() {
        return this.state.screenshots ? [2, 3] : this.state.status
      },
      videoAllowed() {
        if (window.webkit != null) {
          return this.mode === ""
        }
        return true
      },
    },
    methods: {
      doShare() {
        shareLink(createLinkForRoom(this.state.room))
      },
      bidOffer() {
        messages.emit("bidOffer", {roomId: this.state.room})
      },
      doVideo() {
        this.state.muteVideo = !this.state.muteVideo
        messages.emit("updateStream")
      },
      doAudio() {
        this.state.muteAudio = !this.state.muteAudio
        messages.emit("updateStream")
      },
      doQuit() {
        if (confirm("Really quit this session?")) {
          location.assign("/")
        }
      },
      doReload() {
        location.reload()
      },
      doAllow(allow) {
        if (allow) {
          setAllowedBugTracking(allow)
        }
        this.state.requestBugTracking = false
      },
      doToggleFullScreen() {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen()
        } else {
          if (document.exitFullscreen) {
            document.exitFullscreen()
          }
        }
      },
      doTogglePanel(mode = "settings") {
        this.mode = !mode || this.mode === mode ? "" : mode
      },
      onDragOver(ev) {
        ev.preventDefault()
        ev.dataTransfer.dropEffect = "copy"
        this.dragOver = true
      },
      onDragEnd(ev) {
        this.dragOver = false
        ev.preventDefault()
      },
      onDrop(ev) {
        this.dragOver = false
        ev.preventDefault()
        let dataProvider = ev.dataTransfer || ev.clipboardData
        if (dataProvider) {
          const files = dataProvider?.files || []
          if (files.length) {
            let url = URL.createObjectURL(files[0])
            setBackgroundImage(url)
            this.state.backgroundImageURL = url
            this.state.backgroundAuthor = ""
            this.state.backgroundURL = ""

            // If just the background mode changes, don't restart the whole thing
            // if ((value && !prevValue) || (prevValue && !value)) {
            if (this.state.backgroundImageURL !== "image") {
              this.state.backgroundMode = "image"
              messages.emit("switchMedia")
            }
            // }
          }
        }
      },
      didChangeFullscreen(ev) {},
    },
    mounted() {
      setTimeout(async () => {
        this.conn = await setup()
      }, 50)
      if (!this.hasPeers && !window.iPhone) {
        this.mode = "share"
      }
      this.fullscreenHandler = (ev) => {
        this.isFullScreen = !!document.fullscreenElement
      }
      document.addEventListener("fullscreenchange", this.fullscreenHandler)
    },
    beforeDestroy() {
      document.removeEventListener("fullscreenchange", this.fullscreenHandler)
      this.conn?.cleanup()
    }
  }
</script>
