<template>
  <div class="logo" style="overflow-x: auto; overflow-y: auto">
    <table>
      <tr>
        <th colspan="2">Financial rooms</th>
      </tr>
      <tr>
        <td id="investing-name">Investing</td>
        <td id="investing-join">
          <a @click.prevent="doEnterRoom($event, 'investing')"
             href="/room/investing"
             class="button start-button"
             id="investing">join [{{this.numberOfPeople.get('investing') | defaultToZero }}]</a>
        </td>
      </tr>
      <tr>
        <td id="stock-name">Stock</td>
        <td id="stock-join">
          <a @click.prevent="doEnterRoom($event, 'stock')"
             href="/room/stock"
             class="button start-button"
             id="stock">join [{{this.numberOfPeople.get('stock') | defaultToZero }}]</a>
        </td>
      </tr>
      <tr>
        <td id="retirement-name">Retirement</td>
        <td id="retirement-join">
          <a @click.prevent="doEnterRoom($event, 'retirement')"
             href="/room/retirement"
             class="button start-button"
             id="retirement">join [{{this.numberOfPeople.get('retirement') | defaultToZero }}]</a>
        </td>
      </tr>
    </table>

    <table>
      <tr>
        <th colspan="2">Luxembourg</th>
      </tr>
      <tr>
        <td id="startups-name">Startups</td>
        <td id="startups-join">
          <a @click.prevent="doEnterRoom($event, 'startups')"
             href="/room/startups"
             class="button start-button"
             id="startups">join [{{this.numberOfPeople.get('startups') | defaultToZero }}]</a>
        </td>
      </tr>
      <tr>
        <td id="local-projects-name">Local projects</td>
        <td id="local-projects-join">
          <a @click.prevent="doEnterRoom($event, 'local-projects')"
             href="/room/local-projects"
             class="button start-button"
             id="local-projects">join [{{this.numberOfPeople.get('local-projects') | defaultToZero }}]</a>
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

  div.avatar {
    /* make a square container */
    width: 45px;
    height: 45px;

    /* round the edges to a circle with border radius 1/2 container size */
    border-radius: 50%;

    /* display in the right part of container */
    float: right;
    display: inline;
  }

  img.avatar {
    object-fit: cover;
    border-radius:50%;
    width: 45px;
    height: 45px;
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
        numberOfPeople: new Map(),
        appStatus: null,
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
      async updateNumberOfPeople() {
        let roomStatus
        let response = await fetch("https://szkolna17.loca.lt/status/")
        if (response.ok) {
          roomStatus = await response.json()
        }

        this.appStatus = roomStatus
        Object.keys(roomStatus.info.rooms).map(key => {
          this.numberOfPeople.set(key, Object.keys(roomStatus.info.rooms[key]).length)

          let numberOfPpl = this.numberOfPeople.get(key)
          let parent = document.getElementById(key + '-name')
          parent.querySelectorAll('div').forEach(n => n.remove())
          parent.querySelectorAll('p').forEach(n => n.remove())
          if (numberOfPpl > 0) {
            let userhashes = Object.keys(this.appStatus.info.rooms[key])
            userhashes.every(userhash => {
              if (userhashes.length > 2 && parent.querySelectorAll('p').length == 0) {
                let others = document.createElement('p')
                others.id = 'others'
                others.innerText = '+' + (userhashes.length - 2)
                others.style = 'display: inline; float: right'

                parent.appendChild(others)
              }

              if (parent.querySelectorAll('div').length < 2) {
                let avatar = this.appStatus.info.users[userhash].avatar

                let avatarDiv = document.createElement('div')
                avatarDiv.id = 'avatar-' + userhash
                avatarDiv.className = 'avatar'

                parent.appendChild(avatarDiv)

                let avatarImg = document.createElement('img')
                avatarImg.id = 'avatar-b64-' + userhash
                avatarImg.className = 'avatar'
                avatarImg.src = avatar

                avatarDiv.appendChild(avatarImg)
                return true
              } else {
                return false
              }
            })
          }
        })

        this.$forceUpdate()
      }
    },
    watch: {
    },
    filters: {
      defaultToZero: function (value) {
        if (!value) {
          return '0'
        }

        return value
      }
    },
    async mounted() {
      await this.updateNumberOfPeople()
    },
    created() {
      this.interval = setInterval(() => this.updateNumberOfPeople(), 5000);
    },

    beforeDestroy() {
      this.observer?.disconnect()
    },
  }
</script>
