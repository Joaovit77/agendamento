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

if (!data || !hora) {
return res.status(400).json({
erro: "Data ou hora ausentes"
});
}

const dataNormalizada = String(data).trim();

// se vier "8:00", vira "08:00"
const horaNormalizada = String(hora)
.trim()
.padStart(5,'0');


if(!nome || !data || !hora){

return res.status(400).json({
erro:"Dados não chegaram na API"
});

}

const { data: conflito, error: erroConflito } = await supabase
.from('agendamentos')
.select('*')
.eq('data', dataNormalizada)
.eq('hora', horaNormalizada);

if (erroConflito) {
return res.status(500).json({
erro: erroConflito.message
});
}

if (conflito.length > 0) {
return res.status(400).json({
erro:'Horário ocupado'
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