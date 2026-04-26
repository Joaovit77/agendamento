const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
process.env.SUPABASE_URL,
process.env.SUPABASE_KEY
);

module.exports = async (req,res)=>{

try{

const body = typeof req.body === "string"
? JSON.parse(req.body)
: req.body;

const { nome, telefone, data, hora, servico } = body;


// SOMENTE INSERT
const { error } = await supabase
.from('agendamento')
.insert([
{
nome,
telefone,
data,
hora,
servico
}
]);

if(error){

return res.status(500).json({
erro:error.message
});

}

return res.json({
ok:true,
mensagem:"Salvou"
});

}catch(err){

return res.status(500).json({
erro:err.message
});

}

};