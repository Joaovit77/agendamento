require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
process.env.SUPABASE_URL,
process.env.SUPABASE_KEY
);


module.exports = async (req,res)=>{


if(req.method !== 'POST'){
return res
.status(405)
.send('Método inválido');
}


const {
nome,
telefone,
data,
hora,
servico
} = req.body;



// procura conflito
const { data: conflito } = await supabase
.from('agendamentos')
.select('*')
.eq('data',data)
.eq('hora',hora);



if(conflito.length > 0){

return res.status(400).json({
erro:'Horário ocupado'
});

}



// insere
await supabase
.from('agendamentos')
.insert([
{
nome,
telefone,
data,
hora,
servico
}
]);


res.json({
ok:true,
mensagem:'Agendamento criado'
});

};