/* MINI:
Hex Decimal Colour Brightness
 0Ch 12 Off Off
 0Dh 13 Red Low
 0Fh 15 Red Full
 1Dh 29 Amber Low
 3Fh 63 Amber Full
 3Eh 62 Yellow Full
 1Ch 28 Green Low
 3Ch 60 Green Full
Values for flashing LEDs are:
Hex Decimal Colour Brightness
 0Bh 11 Red Full
 3Bh 59 Amber Full
 3Ah 58 Yellow Full
 38h 56 Green Full 
*/

const PRO_RED = 72
const PRO_BLUE = 78

var midiOut = { send : () => {} }
let PRO = 0;

function _initMidi(){
  let beat = 0;

	if (typeof navigator.requestMIDIAccess !== 'undefined') {

	navigator.requestMIDIAccess({ sysex: true })
    .then(function(midiAccess){
		(function startLoggingMIDIInput( midiAccess ) {
      app.midiInputPorts = [];
      app.midiOutputPorts = [];
      
		  midiAccess.inputs.forEach( function(entry) {
        console.log('entry', entry)
        app.midiInputPorts.push(entry);
        entry.onmidimessage = onMIDIMessage;
      });
      
      midiAccess.outputs.forEach((entry) => {
        if (entry.name.indexOf("aunchpad Pro Standalone") > -1) {
          PRO = 1;
          console.log("oh wow, you got PRO!");
        }
        console.log(entry.name);
        app.midiOutputPorts.push(entry);
        entry.open();
      });
      
      clear();
		})(midiAccess);
    

    
		function onMIDIMessage( event ) {
		  var str = "";
		  for (var i=0; i<event.data.length; i++) {
			  str += "0x" + event.data[i].toString(16) + " ";
		  }
      console.log(str)
      // if (event.data[0] == 144 && event.data[2] == 127) spiral.push(event.data[1]);
      
      if (event.data[1] < 0 || (event.data[0] === 0xb6 && event.data[1] === 0x62)){
        console.log("clear board")
        clear();
        lightUp(0x5b, app.currentColor);
      } else if (event.data[1] < 0 || (event.data[0] === 0xb6 && event.data[1] === 0x5b && event.data[2]==0)){
        app.currentColor--;
        lightUp(0x5b, app.currentColor-1 );
        lightUp(0x5c, app.currentColor );
        lightUp(0x5d, app.currentColor+1 );
      }
      else if (event.data[1] < 0 || (event.data[0] === 0xb6 && event.data[1] === 0x5d && event.data[2]==0)){
        app.currentColor++;
        lightUp(0x5b, app.currentColor-1 );
        lightUp(0x5c, app.currentColor );
        lightUp(0x5d, app.currentColor+1 );
      }
      else if (event.data[1] < 0 || (event.data[0] === 0xb6 && event.data[1] === 0x5e && event.data[2]==0)){
        console.log("reset color")
        app.switch, app.currentColor =  app.currentColor, app.switch;
        app.currentColor = 0;
      }
      else if (event.data[0] === 0x90){
        // console.log("lighting up");
        let pad = event.data[1]
        // let oints = getPoints(pad);
        // console.log(oints);
        lightUp(pad, app.currentColor );
        // console.log(getPoints(pad));
      }
      else if (event.data[0] === 0x96){
        // console.log("lighting up");
        let pad = event.data[1]
        // let oints = getPoints(pad);
        // console.log(oints);
        lightUp(pad, app.currentColor );
        // console.log(getPoints(pad));
      }
      else if (event.data[0] === 0xb0 ){
        let colorIndex = event.data[1] - 0x68;
        app.currentColor = COLORS[colorIndex];
      }
		}
    
	}); // then
    
  } else {
    app.error = "no midi"
  }
}
function showColorButtons(){
  COLORS.forEach((color, index) => {
    let port = getLPPort();
    port.send([0xb0, 0x68 + index, color])
  });
}
// spiral for mini
var spiral_m = [ 112, 113, 114, 115, 116, 117, 118, 119, 103, 87, 
                71, 55, 39, 23, 7, 6, 5, 4, 3, 2, 
                1, 0, 16, 32, 48, 64, 80, 96, 97, 98, 99, 100, 
                101, 102, 86, 70, 54, 38, 22, 21, 
                20, 19, 18, 17, 33, 49, 65, 81, 82, 83, 84, 85, 
                69, 53, 37, 36, 35, 34, 50, 66, 67, 68, 52, 51 ]


const rings = [
            [44, 45,
             54, 55],
            [33, 34, 35, 36,
             43,         46,
             53,         56,
             63, 64, 65, 66],
            [22, 23, 24, 25, 26, 27,
             32,                 37,
             42,                 47,
             52,                 57,
             62,                 67,
             72, 73, 74, 75, 76, 77],
            [11, 12, 13, 14, 15, 16, 17, 18,
             21,                         28,
             31,                         38,
             41,                         48,
             51,                         58,
             61,                         68,
             71,                         78,
             81, 82, 83, 84, 85, 86, 87, 88],
            [1,  2,   3,  4,  5,  6,  7,  8,  9,
             10,                                  19,
             20,                                  29,
             30,                                  39,
             40,                                  49,
             50,                                  59,
             60,                                  69,
             70,                                  79,
             80,                                  89,
             91, 92, 93, 94, 95, 96, 97, 98]
    ]
const spiral_mini = [] 

function lightUpRing(ring, color){
  rings[ring].forEach((pad)=>{
    lightUp(pad, color)
  });
}

function getLightUpMsg(position, color){
  if (PRO){
   return [240, 0, 32, 41, 2, 16, 10, position || 10, color || 0, 247]
  } else return [144, position, color]
}

function getClearMsg(){
  return PRO ? [240,0,32,41,2,16,14,0,247] : [176, 0, 0]
}

function getLPPort(){
  let port = app.midiOutputPorts.find((p)=>p.name.indexOf("aunchpad Pro Standalone Port")>-1);
  if (!port) port = getLPMiniPort();
  return port 
}

function getLPMiniPort(){
  return app.midiOutputPorts.find((p)=>p.name.indexOf("aunchpad Mini")>-1);
}
function clear(){
  let port = getLPPort();
  port.send(getClearMsg())
  showColorButtons()
  //initShootingRange();
}

function lightUp(position, color){
  let port = getLPPort();
  let msg = getLightUpMsg(position, color);
  port.send(msg);
}

const BLUE = 32;
const GREEN = 15;
const RED = 7;

function initShootingRange(){
  lightUpRing(0, BLUE);
  lightUpRing(1, GREEN);
  lightUpRing(2, RED);
  lightUpRing(3, RED);
}

function getPoints(pad){
  let points = [100, 25, 0, 0];
  let index = rings.findIndex( (ring) => ring.includes(pad) )
  return points[index];
}


if (location.search === '?host' || localStorage['host'] == 1) {
  _initMidi();
}

