module.exports = function() {

const express = require('express');
const routes = express.Router();

const SyspdvController = require("./controllers/SyspdvController");



routes.post('/v1/consumos/proximo',SyspdvController.novoTicket);
routes.get('/v1/consumos/proximo',SyspdvController.novoTicket);
routes.get('/v1/consumos/podesair',SyspdvController.index);
routes.get('/v1/configuracoes'    ,SyspdvController.comunicacao);
routes.get('/v1/consumos/reinicia',SyspdvController.renew);

routes.get('/',(req,res)=>{
    res.sendFile(__dirname + '/site/index.html');
});

return routes;

}