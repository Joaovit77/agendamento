const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
process.env.SUPABASE_URL,
process.env.SUPABASE_KEY
);

module.exports = async (req,res)=>{

try{

const body = req.body || {};

const {
nome,
telefone,
data,
hora,
servico
} = body;


if(!nome || !data || !hora){

return res.status(400).json({
erro:"Dados não chegaram na API"
});

}


// padroniza
const dataNormalizada = String(data).trim();

const horaNormalizada = String(hora)
.trim()
.padStart(5,'0');


// verifica conflito
const { data: conflito, error: erroConflito } = await supabase
.from('agendamentos')
.select('*')
.eq('data', dataNormalizada)
.eq('hora', horaNormalizada);


if(erroConflito){

return res.status(500).json({
erro: erroConflito.message
});

}


if(conflito.length > 0){

return res.status(400).json({
erro:'Horário ocupado'
});

}


// INSERT (isso tinha sumido do seu código!)
const { data: inserted, error } = await supabase
.from('agendamentos')
.insert([
{
nome,
telefone,
data: dataNormalizada,
hora: horaNormalizada,
servico
}
])
.select();


if(error){

return res.status(500).json({
erro:error.message
});

}


return res.json({
ok:true,
mensagem:"Salvou",
dados: inserted
});

}catch(err){

return res.status(500).json({
erro: err.message
});

}

};