<template>
  <div class="logo" style="overflow-x: auto; overflow-y: auto">
    <table>
      <tr>
        <td>Investing</td>
        <td>
          <a @click.prevent="doEnterRoom($event, 'investing')"
             href="/room/investing"
             class="button start-button"
             id="button">join</a>
        </td>
      </tr>
      <tr>
        <td>Raiffeisen bank products</td>
        <td>
          <a @click.prevent="doEnterRoom($event, 'bank-products')"
             href="/room/bank-products"
             class="button start-button"
             id="button">join</a>
        </td>
      </tr>
      <tr>
        <td>Room 3</td>
        <td>
          <a @click.prevent="doEnterRoom($event, 'room3')"
             href="/room/room3"
             class="button start-button"
             id="button">join</a>
        </td>
      </tr>
    </table>
  </div>
</template>

<style lang="scss">
  .page1 {
    text-align: center;
    flex-shrink: 0;
    height: 100%;
    display: flex;
    flex-direction: column;
    line-height: 1.5;

  /*.text {*/
  /*  max-width: 40rem;*/
  /*  margin-left: auto;*/
  /*  margin-right: auto;*/
  /*  text-align: left;*/
  /*  padding: 1rem;*/
  /*  margin-top: 4rem;*/
  /*}*/

  a {
    color: inherit;
    text-decoration: inherit;
  }

  .logo {
    flex-direction: column;
    justify-content: center;
    display: inline-flex;
    align-items: center;
    font-variant-ligatures: common-ligatures;
    padding: 1rem;
    padding-top: 1rem;
    font-size: 3rem;
  }

  .button {
    border: none;
    background: #112242;
    color: white;
    font-weight: 400;
    font-size: 2rem;
    border-radius: 0.25rem;
    padding: 1rem 1.5rem;
    text-decoration: none;

  &:hover {
     background: #cbcbcb;
   }

  &:active {
     background: #0088c0;
   }
  }

  @media only screen and (max-width: 799px) {
    .logo {
      font-size: 8vw;
    }

    .button {
      font-size: 4vw;
    }
  }
  }

  table {
    border-collapse: collapse;
    margin: 0;
    padding: 0;
    width: 100%;
    table-layout: fixed;
  }

  table tr {
    padding: .35em;
  }

  table th,
  table td {
    padding: .625em;
    text-align: center;
  }

  table th {
    font-size: .85em;
    letter-spacing: .1em;
    text-transform: uppercase;
  }

  @media screen and (max-width: 600px) {
    table {
      border: 0;
    }

    table caption {
      font-size: 1.3em;
    }

    table thead {
      border: none;
      clip: rect(0 0 0 0);
      height: 1px;
      margin: -1px;
      overflow: hidden;
      padding: 0;
      position: absolute;
      width: 1px;
    }

    table tr {
      border-bottom: 3px solid #ddd;
      display: block;
      margin-bottom: .625em;
    }

    table td {
      display: block;
      font-size: .8em;
      text-align: right;
    }

    table td::before {
      /*
      * aria-label has no advantage, it won't be read inside a table
      content: attr(aria-label);
      */
      content: attr(data-label);
      float: left;
      font-weight: bold;
      text-transform: uppercase;
    }

    table td:last-child {
      border-bottom: 0;
    }
  }
</style>

<script>
  import {trackSilentException} from "../bugs"

  export default {
    name: "app-rooms",
    data() {
      return {
        url: "",
        initialWidth: -1,
        currentChar: 0,
        observer: null,
      }
    },
    methods: {
      doEnterRoom(event, roomName) {
        this.state.room = roomName || ""
        try {
          window.history.pushState(
            null, // { room },
            null, // room,
            event.target.href
          )
        } catch (err) {
          trackSilentException(err)
        }
      },
    },
    watch: {
    },
    async mounted() {
    },

    beforeDestroy() {
      this.observer?.disconnect()
    },
  }
</script>
