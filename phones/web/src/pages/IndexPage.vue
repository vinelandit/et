<template>
  <div class="outer">

    <div class="beginOuter" :style="{ 'display': impStore.streamActive ? 'none' : 'block' }">
      <div class="beginInner">
        <div class="beginInner1" :style="{ 'display': started ? 'none' : 'block' }">
          <button class="begin" @click="allowAccess()">BEGIN</button>
          <p>Please allow access to motion sensor if asked.</p>
        </div>
        <div class="beginInner2" :style="{ 'display': started ? 'block' : 'none' }">
          <p>Awaiting sensor stream...</p>
        </div>
      </div>
    </div>
    <div class="recalib">&nbsp;</div>

    <div class="signal" :style="{opacity: Math.abs(Math.sin(impStore.streamPhase))}"></div>
   
      <div class="button">
      </div>
  

    <div class="status" @click="exit()">{{ impStore.status }}</div>

  </div>
</template>

<script>
import { useImpStore } from '../stores/imp-store.js'

import WS from '../services/ws'
import { useQuasar } from 'quasar'
import { useRouter, useRoute } from 'vue-router'
import { ref, watch, defineComponent } from 'vue'


import sensorData from '../services/getSensorData'


export default defineComponent({
  name: 'IndexPage',
  mounted() {
    // console.log(WS)

  },
  setup() {

   
    const impStore = useImpStore()
    
    const started = ref(false);


    WS.setStore(impStore)
    const r = useRouter()
    const rq = useRoute().query
    const $q = useQuasar()

    const exit = function() {
      
      $q.cookies.set('already_played', 1)
      WS.socket.close()
      r.replace('/thanks')
      
    }

    // watch for exit call
    watch(() => impStore.isDone, function() {
      exit()
    })



    const allowAccess = function() {
        started.value = 1;
        requestSensorData();
    }



    const confirmReplay  = function() {
      $q.dialog({
        title: 'Confirm',
        message: 'Would you like to join again? Please check that nobody is currently playing in this spot!',
        cancel: true,
        persistent: true
      }).onOk(() => {
        // console.log('>>>> OK')
        $q.cookies.remove('already_played')
        WS.connect()

      }).onCancel(() => {
        // console.log('>>>> Cancel')
        
        r.replace('/thanks')
      }).onDismiss(() => {
        // console.log('I am triggered on both OK and Cancel')
      })
    }

    document.addEventListener('touchstart', function(e) {
      if(e.target.classList.contains('button') && impStore.streamActive) {
      
        btnState(1)
      } else if (e.target.classList.contains('recalib') && impStore.streamActive) {
      
        recalibState(1)
      }
    })
    
    document.addEventListener('touchend', function(e) {
      btnState(0)
      recalibState(0)
    })
    
    


    console.log(rq)
    if(Object.keys(rq).length == 0 || !rq.pid || !rq.phash || 5 + rq.pid * 7611 != rq.phash) {
      location.href = "error.html"
      return false
    } else {

      impStore.pid = rq.pid
      impStore.phash = rq.phash
    }

    if($q.cookies.has('already_played')) {
      confirmReplay()
    } else {
      WS.connect()
    }

    sensorData.init(WS);


    const requestSensorData = function() {
      sensorData.captureMotion($q.platform.is.mobile)
    }

    const btnState = function(val) {
      impStore.btn = val;
      console.log('sending button', impStore.btn);
      WS.wsm({ btn: impStore.btn });
      
    }
    const recalibState = function(val) {
      impStore.recalib = val;
      console.log('sending recalib', impStore.recalib);
      WS.wsm({ recalib: impStore.recalib });
      
    }
    
    const rObj = { recalibState, allowAccess, started, impStore, confirmReplay, exit, r, requestSensorData, btnState }
    return rObj
  }
})




</script>

<style lang="scss">
  body {
    user-select: none;
    background-color:black;
  }
  .signal {
    position: fixed;
    top:0;
    left:0;
    right:0;
    height: 4px;
    background-color:red;
  }
  .outer {
    position: fixed;
    left:0;
    right:0;
    top:0;
    bottom:0;
    background-color:black;
  }
  .status, .signal, .button {
    user-select: none;
  }


  .beginOuter {
    position: fixed;
    left:0;
    right:0;
    top:0;
    bottom:0;
    z-index:10000;
    background-color:#ffeeff;
  }

  .beginInner {

    position: relative;
    top: 50%;
    transform: translateY(-50%);
    text-align:center

  }

  .recalib {
    position:absolute;
    width:50px;
    height:50px;
    background-color:yellow;
    border-radius:50%;
    right:-25px;
    top:-25px;
  }

  .button {

    position: relative;
    top: 50%;
    transform: translateY(-50%);
    width:90%;
    height:0;
    padding-bottom:90%;
    background-color:purple;

    border-radius: 50%;
    margin: 0 auto;
  }
  .status {

    position:absolute;
    bottom:0;
    width:100%;
    color:white;
    font-size:20px;
    display:block;
    padding-bottom: 20px;
    text-align: center;
  }
  .start {
    position:absolute;
    top:0;
    width:100%;
    color:white;
    font-size:30px;
    display:block;
    padding-top: 30px;
    text-align: center;

  }
</style>
