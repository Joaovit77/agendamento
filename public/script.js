const form = document.getElementById('formulario');

form.addEventListener('submit', async function(e){ 
    e.preventDefault();

    const dados = {
        nome: document.getElementById('nome').value,
        telefone: document.getElementById('telefone').value,
        data: document.getElementById('data').value,
        servico: document.getElementById('servico').value
    };

   const resposta = await fetch('/api/agendar', {
  method: 'POST',
  headers: {
    'Content-Type':'application/json'
  },
  body: JSON.stringify(dados)
});

const texto = await resposta.text();

console.log("RESPOSTA BRUTA:", texto);

let resultado;

try {
resultado = JSON.parse(texto);
} catch {
alert("Erro no servidor: " + texto);
return;
}

console.log(resultado);
alert(JSON.stringify(resultado));

    const resultado = await reposta.json();
    console.log(resultado);

    alert(JSON.stringify(resultado));


});