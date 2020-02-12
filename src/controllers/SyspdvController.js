var   Firebird = require('node-firebird');
const { Pool, Client } = require('pg');
var   fs = require('fs');

var socketApi = require('../../socket');
var io = socketApi.io;

path = require("../configuracoes").path;

//==========================================================

function teste(){

    return JSON.parse( fs.readFileSync(path, function(err, data) {  
       if (err) throw err;
   })  );

}

function salvarConfig(data){
    fs.writeFile(path, data , (erro) => {
    
        if(erro) {
            throw erro; 
        }

    }); 
}

function reiniciarContagem(){
    let config = teste() ;

    //Verifica se é um novo dia e ZERA a sequencia
    let dateFormat = require('dateformat');
    let now = new Date();           
    let hoje = dateFormat(now,"dd-mm-yyyy");

    config.movimento.ultimoTicket = 0 ;
    config.movimento.data = hoje ;

    let data = JSON.stringify(config,null,2);
    salvarConfig(data);
        
    console.log("Sistema zerou os tickets"); 
}

function necessarioReiniciarContagem(){
    let config = teste() ;

    //Verifica se é um novo dia e ZERA a sequencia
    let dateFormat = require('dateformat');
    let now = new Date();           
    let hoje = dateFormat(now,"dd-mm-yyyy");

    if(hoje != config.movimento.data){
        return true 
    } else {
        return false 
    }
}

function proximoTicket(){  

    let config = teste();
    config.movimento.ultimoTicket = config.movimento.ultimoTicket+1 ; 

    let dateFormat = require('dateformat');
    let now = new Date();
        
    config.movimento.data = dateFormat(now,"dd-mm-yyyy");

    let data = JSON.stringify(config,null,2);
    salvarConfig(data);
    console.log("Novo ticket solicitado:"+config.movimento.ultimoTicket);
        
    return config.movimento.ultimoTicket ;
}

module.exports = {

    async renew(req,res){
        console.log('Reiniciando tickets');
        //necessarioReiniciarContagem();
        reiniciarContagem();
        io.sockets.emit('ticket', '0');
        res.send("Ticket Zerado!");
    },
    
    async comunicacao(req,res){
        console.log("Conexão estabelecida"); 

        let resposta ={
            dados:{
                CfgCaracterBipaFicha :	""
            },
            status:{
                codigo:200,
                mensagem:null,
                quantidade:1,
                tipo:"OK",
                
            }
        }

        return res.json(resposta); 
    },

    async novoTicket(req,res){

        console.log("Solicitacao via botoeira");

        if (necessarioReiniciarContagem() == true) {
            reiniciarContagem();
        }
        
        const novoTicket = proximoTicket() ;

        io.sockets.emit('ticket', novoTicket);

        let resposta = {
            dados:{
                codigo:novoTicket,
                codigoBarra:""+novoTicket,
            },
            status:{
                codigo:200,
                mensagem:null,
                quantidade:1,
                tipo:"OK",
            }
        }
        
        return res.json(resposta) ;
    },

    // http://localhost:7070/v1/consumos/podesair?codigo=76
    async index(req,res){    

        //Firebird
        // let ticket_id = parseInt(req.query.codigo);
        // ticket_id = "0".repeat(10 - String(ticket_id).length) + ticket_id;

        // const options = {
        //     host: '127.0.0.1',
        //     port: 3050,
        //     database: 'C:/SysPDV/Syspdv_srv.FDB',
        //     user: 'SYSDBA',
        //     password: 'masterkey',
        //     lowercase_keys: false, // set to true to lowercase keys
        //     role: null,            // default
        //     pageSize: 4096         // default when creating database
        // }       

        // Firebird.attach(options, function(err, db) {
        
        //     if (err)
        //         throw err;
       
        //     // db = DATABASE
        //     db.query('select * from consumo where ficcod=? and cso_status=?',[ticket_id,'A'], function(err, result) {
        //        let dados = [];
        //         if(result == "" || result == null ){
        //             dados = {
        //                         dados: true ,
        //                         status:{
        //                             codigo:200,
        //                             tipo:"OK"
        //                         }
        //                     };  
        //         }else{
        //             dados = {
        //                         dados: false ,
        //                         status:{
        //                             codigo:400,
        //                             mensagem:"Ficha "+ticket_id+" não está liberada. Favor passar no caixa.",
        //                             tipo:"XRestError"
        //                         }
        //                     };
        //         }

        //         console.log("Ticket "+ticket_id+" teve acesso "+ (dados.dados==true ? "liberado" : "bloqueado") );
        //         return res.json(dados);         

        //         // IMPORTANT: close the connection
        //         db.detach();
        //     });
        
        // });

        // Postgres

        let ticket_id = parseInt(req.query.codigo);
        ticket_id = "0".repeat(10 - String(ticket_id).length) + ticket_id;

        const client = new Client({
            user: 'postgres',
            host: '127.0.0.1',
            database: 'easyAssist',
            password: '572600',
            port: 5432,
          });
          client.connect();
          
          let dados=[];

          client.query('SELECT * FROM public.prevenda WHERE status=0 and idcartaoconsumo=$1',[ticket_id], (err, resp) => {
            
            if (resp.rowCount === 0 ){
                dados = {
                    dados: true ,
                    status:{
                        codigo:200,
                        tipo:"OK"
                    }
                };  
            }else{
                dados = {
                    dados: false ,
                    status:{
                        codigo:400,
                        mensagem:"Ficha "+ticket_id+" não está liberada. Favor passar no caixa.",
                        tipo:"XRestError"
                    }
                };
            }
            
             //console.log(err, res);
          console.log("Ticket "+ticket_id+" teve acesso "+ (dados.dados==true ? "liberado" : "bloqueado") );
          return res.json(dados); 
            client.end();
          });

         
        
    },
}
