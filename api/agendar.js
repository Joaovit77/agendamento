const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
process.env.SUPABASE_URL,
process.env.SUPABASE_KEY
);

module.exports = async (req,res)=>{

try{

console.log("FUNÇÃO INICIOU");

console.log("req.body:", req.body);

const body = req.body || {};

const {
nome,
telefone,
data: dataNormalizada,
hora: horaNormalizada,
servico
} = body;

const dataNormalizada = new Date(data).toISOString().split('T')[0];
const horaNormalizada = hora.padStart(5, '0');


if(!nome || !data || !hora){

return res.status(400).json({
erro:"Dados não chegaram na API"
});

}

const { data: inserted, error } = await supabase
.from('agendamentos')
.insert([
{
nome,
telefone,
data,
hora,
servico
}
])
.select();

if(error){

console.log("ERRO SUPABASE:", error);

return res.status(500).json({
erro:error.message
});

}

console.log("INSERIDO:", inserted);

return res.json({
ok:true,
mensagem:"Salvou",
dados: inserted
});

}catch(err){

console.log("ERRO GERAL:", err);

return res.status(500).json({
erro: err.message
});

}

};