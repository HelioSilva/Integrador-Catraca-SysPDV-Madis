var Service = require('node-windows').Service;

// Create a new service object
 var svc = new Service({
 name:'WebServiceSyspdv',
 description: 'Serviço que gerencia a catraca',
 script: 'E:\\_Projetos WEB\\madisSyspdv\\server.js'
 });

//Listen for the "install" event, which indicates the
//process is available as a service.
svc.on('install',function(){
        svc.start();
});


svc.install();

