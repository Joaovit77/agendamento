require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
process.env.SUPABASE_URL,
process.env.SUPABASE_KEY
);

module.exports = async (req, res) => {

try {

const body = typeof req.body === "string"
? JSON.parse(req.body)
: req.body;

const { nome, telefone, data, hora, servico } = body;

// procura conflito
const { data: conflito } = await supabase
.from('agendamentos')
.select('*')
.eq('data', data)
.eq('hora', hora);

if (conflito.length > 0) {
return res.status(400).json({
erro: 'Horário ocupado'
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

return res.json({
ok: true,
mensagem: 'Agendamento criado'
});

} catch (error) {

return res.status(500).json({
erro: 'Erro no servidor',
detalhe: error.message
});

}

};