const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
process.env.SUPABASE_URL,
process.env.SUPABASE_KEY
);

module.exports = async (req, res) => {

try {

console.log("🔥 API FOI CHAMADA");

const body = typeof req.body === "string"
? JSON.parse(req.body)
: req.body;

console.log("📦 BODY RECEBIDO:", body);

const { nome, telefone, data, hora, servico } = body;

// TESTE 1 - Supabase connection
console.log("🔎 Consultando conflito...");

const { data: conflito, error: erroSelect } = await supabase
.from('agendamentos')
.select('*')
.eq('data', data)
.eq('hora', hora);

if (erroSelect) {
console.log("❌ ERRO SELECT:", erroSelect);

return res.status(500).json({
erro: "Erro no SELECT",
detalhe: erroSelect.message
});
}

console.log("✔ conflito:", conflito);

// TESTE 2 - INSERT
console.log("💾 Inserindo...");

const { error: erroInsert } = await supabase
.from('agendamentos')
.insert([
{ nome, telefone, data, hora, servico }
]);

if (erroInsert) {
console.log("❌ ERRO INSERT:", erroInsert);

return res.status(500).json({
erro: "Erro no INSERT",
detalhe: erroInsert.message
});
}

console.log("✔ SALVO COM SUCESSO");

return res.json({
ok: true,
mensagem: "Agendamento criado"
});

} catch (err) {

console.log("💥 ERRO GERAL:", err);

return res.status(500).json({
erro: "Erro interno",
detalhe: err.message
});

}

};