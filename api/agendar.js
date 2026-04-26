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

console.log("BODY:", body);

const { nome, telefone, data, hora, servico } = body;

// validação básica
if (!nome || !data || !hora) {
return res.status(400).json({
erro: "Dados incompletos"
});
}

// conflito
const { data: conflito, error: erroSelect } = await supabase
.from('agendamentos')
.select('*')
.eq('data', data)
.eq('hora', hora);

if (erroSelect) {
console.log(erroSelect);
return res.status(500).json({ erro: erroSelect.message });
}

if (conflito.length > 0) {
return res.status(400).json({
erro: 'Horário ocupado'
});
}

// insert
const { error: erroInsert } = await supabase
.from('agendamentos')
.insert([
{ nome, telefone, data, hora, servico }
]);

if (erroInsert) {
console.log(erroInsert);
return res.status(500).json({ erro: erroInsert.message });
}

return res.status(200).json({
ok: true,
mensagem: "Agendamento criado"
});

} catch (err) {

console.log("ERRO GERAL:", err);

return res.status(500).json({
erro: "Erro interno",
detalhe: err.message
});

}

};