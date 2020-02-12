parametro = require("./src/configuracoes");

const express = require('express');
const app = express();
const server = require('http').createServer(app);
const cors = require('cors');

var socketApi = require('./socket');
var io = socketApi.io;
io.attach(server);


console.log("Aplicação escutando na porta: "+parametro.config.porta);

io.on('connection', socket => {
            
    console.log('Identificação: '+socket.id);
    socket.on('ticket', function(msg){
        socket.emit('ticket',msg);
        socket.broadcast.emit('ticket',msg);
    });

    io.sockets.emit('ticket',parametro.config.movimento.ultimoTicket);    
});

 app.use(cors());
 app.use(express.json());
 app.use('', require('./src/routes')(io)); 

server.listen(parametro.config.porta); 

module.exports = io ;


