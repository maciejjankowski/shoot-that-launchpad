var socket = io();

var p2p = new P2P(socket);

p2p.on('ready', function(){
  p2p.usePeerConnection = true;
  //p2p.usePeerConnection = false;
})

function send(type, msg){
  // if (!canSend){return}
  // socket.emit(type, msg);
  p2p.emit(type, msg);
}

p2p.on('midi', (msg)=>{

})


	if (!('ondeviceorientation' in window)) {
		// unsupported
	} else {
		window.addEventListener('deviceorientation', function(event) {
      send('deviceorientation',{
				beta : event.beta, 
        gamma : event.gamma,
        alpha : event.alpha,
        absolute: event.absolute,
        timestamp : Date.now()
			});
		});
	}
	if (!('ondevicemotion' in window)) {
		// unsupported
	} else {
		window.addEventListener('devicemotion', function(event) {
      return;
			send('devicemotion', {
				aX : event.acceleration.x,
				aY : event.acceleration.y,
				aZ : event.acceleration.z,
				aGX : event.accelerationIncludingGravity.x,
				aGY : event.accelerationIncludingGravity.y,
				aGZ : event.accelerationIncludingGravity.z,
				rB : event.rotationRate.beta,
				rG : event.rotationRate.gamma,
				rA : event.rotationRate.alpha,
				interval : event.interval,
        timestamp : Date.now()
      });
		});
	}
