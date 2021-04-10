<template>
  <div class="-scroll">
    <div class="page1">

      <div class="logo">
        <a @click.prevent="doEnterRoom" id="link">
          Open<span style="color: #112242">Stage</span>
        </a>
      </div>

      <template v-if="!authorised">
        <div class="login-container">
          <div class="login-box">

            <div class="container">
              <form class="form-inline" id="loginForm">
                <div class="form-group row">
                  <label class="credentials-label col-sm-2 col-form-label" for="username">User ID </label>
                  <div class="col-sm-4">
                    <input class="login-input form-control-plaintext" type="text" name="username" v-model="username"/>
                  </div>
                </div>

                <div class="form-group row">
                  <label class="credentials-label col-sm-2 col-form-label" for="password">Password </label>
                  <div class="col-sm-10">
                    <input class="login-input" type="password" name="password" v-model="password"/>
                  </div>
                </div>

                <div class="form-group row" style="padding-top: 6px">
                  <button class="login-button" type="submit" v-on:click="login($event)">Submit</button>
                </div>
              </form>
            </div>

          </div>
        </div>
      </template>

      <template v-else>
        <button class="login-button" type="submit" v-on:click="logout($event)">Logout</button>
        <app-rooms></app-rooms>
      </template>

    </div>
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
  }

  .login-container {
    width: 100%;
    height: 100%;
    padding: 0;
    box-sizing: border-box;
    text-align: center;
  }

  .login-box {
    display: inline-block;
    background-color: white;
    border-top: 1px solid #d8d8d8;
    box-shadow: 0 6px 10px 0 rgba(0, 0, 0, 0.2);
    width: 45%;
    height: 45%;
    margin: 0 auto;
    margin-top: 20px;
  }

  .credentials-label {
    font-size: 14px;
    text-align: right;
    color: #999
  }

  .login-button {
    background: none;
    color: #999;
    border: 1px solid #cccccc;
    border-radius: 4px;
    box-sizing: border-box;
    text-align: center;
    padding: 6px 12px;
  }

  .login-input {
    text-align: center;
    padding: 6px 12px;
    background: #fff;
    color: #555;
    font-size: 14px;
    border: 1px solid #cccccc;
    border-radius: 4px;
  }
</style>

<script>
  import AppRooms from "./app-rooms"

  export default {
    name: "app-welcome",
    components: { AppRooms },
    data() {
      return {
        authorised: localStorage.getItem('user') != null,
        username: '',
        password: ''
      }
    },
    methods: {
      login(e) {
        e.preventDefault()
        if (this.username !== '' && this.password !== '') {
          localStorage.setItem('user', JSON.stringify({'name': this.username, 'password': this.password}))
          this.authorised = true
        }
      },
      logout(e) {
        e.preventDefault()
        localStorage.removeItem('user')
        this.authorised = false
      }
    },
    watch: {
    },
    async mounted() {
    },

    beforeDestroy() {
    },
  }
</script>
