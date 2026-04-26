const form = document.getElementById('formulario');

form.addEventListener('submit', async function(e){

e.preventDefault();

const dados = {
nome: document.getElementById('nome').value,
telefone: document.getElementById('telefone').value,
data: document.getElementById('data').value,
hora: document.getElementById('hora').value,
servico: document.getElementById('servico').value
};

const resposta = await fetch('/api/agendar',{
method:'POST',
headers:{
'Content-Type':'application/json'
},
body: JSON.stringify(dados)
});

const texto = await resposta.text();

console.log("RESPOSTA BRUTA:", texto);

let resultado;

try{
resultado = JSON.parse(texto);
}catch{
alert("Erro do servidor: " + texto);
return;
}

if(resultado.erro){

alert(resultado.erro);

return;

}

alert("Agendamento confirmado com sucesso ✅");

form.reset();

});