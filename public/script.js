const form = document.getElementById('formulario');

form.addEventListener('submit', async function(e){ 
    e.preventDefault();

    const dados = {
        nome: document.getElementById('nome').value,
        telefone: document.getElementById('telefone').value,
        data: document.getElementById('data').value,
        servico: document.getElementById('servico').value
    };

    const reposta = await fetch('api/agendar', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(dados)
    });

    const resultado = await reposta.json();
    console.log(resultado);

    alert(JSON.stringify(resultado));
    

});