var express = require('express');
var app = express();

app.use(express.static('public'));

var receiverId;

var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});

var controls = {
  'pan' : {'type':'cc', 'value':'22'},
  'filterFrequency' : {'type':'cc', 'value':'23', range: [0, 127, 1]},
  'filterResonance' : {'type':'cc', 'value':'24'},
  'clip1' : {'type':'cc', 'value':'24'},
  'clip2' : {'type':'cc', 'value':'24'},
  'clip3' : {'type':'cc', 'value':'24'},
  'clip4' : {'type':'cc', 'value':'24'},
  'clip5' : {'type':'cc', 'value':'24'},
  'clip6' : {'type':'cc', 'value':'24'},
}

var io = require('socket.io')(listener);
var p2p = require('socket.io-p2p-server').Server;
io.use(p2p);

function checkControlAssigned(control){
  return  (typeof (control.socketId === 'undefined') || 
          control.lastActive + 5000 > Date.now())
}

function assignControl(io, socketId, socket){
  let availableControl = Object.keys(controls).find(checkControlAssigned);
  activateControl(io, socketId, socket, availableControl.type);
}

function activateControl(io, socketId, socket, type){
  io.to(socketId).emit('activate', type);
  socket.emit('activate', type);
}

io.on('connection', function(socket){
  console.log('io connection! :-)', socket.id);
  assignControl(io, socket.id, socket)
  
  socket.on('deviceorientation', function(msg){
    socket.broadcast.emit('o', msg);
    console.log('sending orientation', msg)
  });
  
  socket.on('devicemotion', (msg) => {
    console.log('message: ',  msg);
  })
  
  socket.on('receiver',() => {
    receiverId = socket.id;
    console.log(socket.id)
  })
  
  socket.on('button', (data) => {
    io.emit('button', data);
  })
  
  socket.on('note', function(msg){
    console.log('message: ',  msg, "to", receiverId, Date.now() - parseInt(msg.now));    
    socket.broadcast.emit('midi', msg);
  });
});

app.get("/lunch", (req, res) => {
  res.send("Tutaj sandra wysyła msg");
})