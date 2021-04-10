<template>
  <div class="trade-container -scrollable text">
    <form>
      <label for="itemName">Item name</label>
      <input class="input" type="text" id="itemName" v-model="item.name">

      <label for="itemDesc">Description</label>
      <input class="input" type="text" id="itemDesc" v-model="item.description">

      <label for="itemPhoto">Photo</label>
      <input class="input" type="file" id="itemPhoto" @change="uploadPhoto($event)">

      <label for="itemPrice">Price</label>
      <input class="input" type="number" id="itemPrice" v-model="item.price">

      <label for="itemDuration">Offer duration [minutes]</label>
      <input class="input" type="number" id="itemDuration" v-model="item.duration">

      <input class="toggle" type="checkbox" id="toggle" v-model="toggleValue">
      <label class="label" for="toggle">
        <div class="left">
          Sell offer
        </div>

        <div class="switch">
          <span class="slider round"></span>
        </div>

        <div class="right">
          Auction
        </div>
      </label>

      <sea-button class="submit" v-on:click="createOffer">Create offer</sea-button>
    </form>
  </div>
</template>

<style lang="scss">
  .trade-container {
    p {
      margin-bottom: 1rem;
    }

    .input {
      border: 1px solid gray;
      background: white;
      padding: 0.4rem;
      border-radius: 0.25rem;
      width: 100%;
      color: #1e89f6;
      margin-right: 0.5rem;
      margin-bottom: 1rem;
    }

   .label {
     pointer-events: none;
     display: flex;
     align-items: center;
     float: bottom;
   }

   .switch,
   .toggle:checked + .label .left,
   .toggle:not(:checked) + .label .right {
     pointer-events: all;
     cursor: pointer;
   }

   .toggle {
     display: none;
   }

    /* The switch - the box around the slider */
    .switch {
      position: relative;
      display: inline-block;
      width: 60px;
      height: 34px;
    }

    /* Hide default HTML checkbox */
    .switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }

    /* The slider */
    .slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #ccc;
      -webkit-transition: .4s;
      transition: .4s;
    }

    .slider:before {
      position: absolute;
      content: "";
      height: 26px;
      width: 26px;
      left: 4px;
      bottom: 4px;
      background-color: #2196F3;
      -webkit-transition: .4s;
      transition: .4s;
    }

    input:focus + .label .slider {
      box-shadow: 0 0 1px #2196F3;
    }

    input:checked + .label .slider:before {
      -webkit-transform: translateX(26px);
      -ms-transform: translateX(26px);
      transform: translateX(26px);
    }

    /* Rounded sliders */
    .slider.round {
      border-radius: 34px;
    }

    .slider.round:before {
      border-radius: 50%;
    }

    .left, .right {
      margin: 0 .5em;
    }

    .submit {
      float: right;
      margin-top: 2rem;
    }
  }
</style>

<script>
  import {createLinkForRoom} from "../lib/share"
  import SeaButton from "../ui/sea-button"
  import {messages} from "../lib/emitter";

  const log = require("debug")("app:app-trade")

  export default {
    name: "app-trade",
    components: { SeaButton },
    data() {
      return {
        item: {
          name: null,
          description: null,
          price: null,
          type: null,
          duration: null,
          photoB64: null
        },
        toggleState: false,
        url: "",
      }
    },
    methods: {
      createOffer(event) {
        let type = this.toggleValue ? 'auction' : 'sell'
        this.addOffer(event, this.state.room, this.item.name, type, this.item.description, this.item.photoB64, this.item.price, this.item.duration, this.state.user)
      },
      addOffer(event, roomId, title, type, description, photo, price, duration, author) {
        event.preventDefault()
        let info = {roomId, title, type, description, photo, price, duration, author}
        console.log(info)
        messages.emit('addOffer', info)
      },
      uploadPhoto(event) {
        let reader = new FileReader()
        reader.readAsDataURL(event.target.files[0])
        reader.onload = () => {
          this.item.photoB64 = reader.result
        }
        reader.onerror = function (error) {
          console.log("Error during photo encoding: " + error)
        }
      }
    },
    computed: {
      toggleValue: {
        get() {
          return this.toggleState
        },
        set(newVal) {
          this.toggleState = newVal
          console.log(this.toggleState)
        }
      }
    },
    async mounted() {
      this.url = createLinkForRoom(this.state.room)
    },
  }
</script>
