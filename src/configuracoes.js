const CAMINHO =  "E://_Projetos WEB//madisSyspdv//IntegracaoCatraca//config.json";
let file = require(CAMINHO);

module.exports  = {
    path:CAMINHO,
    config : file  

}