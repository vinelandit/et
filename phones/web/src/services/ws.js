'use strict';
import { useRoute } from 'vue-router'



import { ReconnectingWebSocket } from './reconnectingWS'




const WS = {

  setStore: function(store) {
    this.store = store
  },

  socket: null,
  lastSend: 0,
  url: location.host.indexOf('imp-') > -1 ? 'wss://'+location.host.split(':')[0]+':443' : 'wss://dtws.herokuapp.com',

  connect: function() {


    if(!this.socket || this.socket.readyState>1) {
      
      console.log('WS connecting')
      
      var _this = this
    
      const myUrl = this.url + '/?pid=' + this.store.pid + '&phash=' + this.store.phash

      this.socket = new ReconnectingWebSocket(myUrl)
      

      this.socket.onerror = (event) => {
        console.log('caught websocket error',event)
        _this.store.status = 'Error'
      }

      this.socket.onopen = (event) => {
        console.log('Websocket open for business')
        
        console.log('piss bastard', _this.store)
        _this.store.status = 'Connected'
        _this.wsm({ btn: 0 }); // lift button in case stuck
      }

      this.socket.onclose = (event) => {
        console.log('websocket close',event)

        _this.store.status = 'Reconnecting...'
      }

      this.socket.onmessage = (event) => {
        // console.log(event.data)
        event = JSON.parse(event.data)
        if(event.command == 'SIGTERM_ET_ALL') {
          _this.store.done = true
        }
        
      }
    }
    
  },
  
  send: function(msg) {
    this.socket.send(msg)
  },


  wsm: function(payload) {
    
    payload.pid = this.store.pid
    
    this.socket.send(JSON.stringify(payload))
    this.lastSend = Date.now()
  }

}
export default WS