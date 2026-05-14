const btnGerar = document.getElementById('btnGerar');
const btnGerarPreferencial = document.getElementById('btnGerarPreferencial');
const btnReset = document.getElementById('btnReset');
const btnChamar = document.getElementById('btnChamar');
const senhaDisplay = document.getElementById('Senha');
const senhaPreferencialDisplay = document.getElementById('SenhaPreferencial');
const guicheSelect = document.getElementById('guiche');
const recentList = document.getElementById('recentList');
const historyList = document.getElementById('historyList');
const dataElement = document.getElementById('data');
const horaElement = document.getElementById('hora');

let senhaAtual = '';
let senhaPreferencialAtual = '';
let guicheAtual = 1;
let contadorSenha = 0;
let contadorPreferencial = 0;
const senhas = {};
const recentSenhas = [];

senhas[1] = '---';
senhas[2] = '---';
senhas[3] = '---';

function atualizarDataHora() {
    const agora = new Date();

    const dia = String(agora.getDate()).padStart(2, '0');
    const mes = String(agora.getMonth() + 1).padStart(2, '0');
    const ano = agora.getFullYear();

    const horas = String(agora.getHours()).padStart(2, '0');
    const minutos = String(agora.getMinutes()).padStart(2, '0');
    const segundos = String(agora.getSeconds()).padStart(2, '0');

    dataElement.textContent = `Data: ${dia}/${mes}/${ano}`;
    horaElement.textContent = `Hora: ${horas}:${minutos}:${segundos}`;
}

atualizarDataHora();
setInterval(atualizarDataHora, 1000);

function gerarSenha() {
    contadorSenha += 1;
    return String(contadorSenha).padStart(3, '0');
}

function gerarSenhaPreferencial() {
    contadorPreferencial += 1;
    return `P${String(contadorPreferencial).padStart(3, '0')}`;
}

function atualizarExibicao() {
    guicheAtual = guicheSelect.value;
    senhaDisplay.textContent = senhas[guicheAtual] || '---';

    senhaDisplay.style.animation = 'none';
    setTimeout(() => {
        senhaDisplay.style.animation = 'fadeIn 0.3s ease-in';
    }, 10);
}

function atualizarPreferencial() {
    senhaPreferencialDisplay.textContent = senhaPreferencialAtual || '---';
}

function adicionarRecent(escolha) {
    recentSenhas.unshift(escolha);
    if (recentSenhas.length > 8) recentSenhas.pop();
    renderRecent();
}

function renderRecent() {
    recentList.innerHTML = '';
    recentSenhas.forEach((item) => {
        const li = document.createElement('li');
        li.className = item.tipo === 'preferencial' ? 'preferencial' : 'normal';
        li.innerHTML = `<span class="type">${item.tipo === 'preferencial' ? 'PREF' : 'NORMAL'}</span>${item.senha} - Guichê ${item.guiche}`;
        recentList.appendChild(li);
    });
}

function adicionarHistorico(mensagem, tipo) {
    const item = document.createElement('li');
    item.className = tipo === 'preferencial' ? 'preferencial' : 'normal';
    item.innerHTML = `<span class="type">${tipo === 'preferencial' ? 'PREF' : 'NORMAL'}</span>${mensagem}`;
    historyList.prepend(item);

    const maxItems = 10;
    while (historyList.children.length > maxItems) {
        historyList.removeChild(historyList.lastChild);
    }
}

function resetFilas() {
    contadorSenha = 0;
    contadorPreferencial = 0;
    senhaAtual = '';
    senhaPreferencialAtual = '';
    senhas[1] = '---';
    senhas[2] = '---';
    senhas[3] = '---';
    recentSenhas.length = 0;
    historyList.innerHTML = '';
    recentList.innerHTML = '';
    senhaDisplay.textContent = '---';
    senhaPreferencialDisplay.textContent = '---';
    console.log('Filas zeradas.');
}

btnGerar.addEventListener('click', () => {
    const novaSenha = gerarSenha();
    senhas[guicheAtual] = novaSenha;
    senhaAtual = novaSenha;

    senhaDisplay.style.opacity = '0.5';
    senhaDisplay.textContent = '...';

    setTimeout(() => {
        senhaDisplay.textContent = novaSenha;
        senhaDisplay.style.opacity = '1';
    }, 300);

    adicionarRecent({ senha: novaSenha, tipo: 'normal', guiche: guicheAtual });
});

btnGerarPreferencial.addEventListener('click', () => {
    const novaSenhaPreferencial = gerarSenhaPreferencial();
    senhas[guicheAtual] = novaSenhaPreferencial;
    senhaPreferencialAtual = novaSenhaPreferencial;
    senhaAtual = novaSenhaPreferencial;

    senhaPreferencialDisplay.style.opacity = '0.5';
    senhaPreferencialDisplay.textContent = '...';

    setTimeout(() => {
        atualizarPreferencial();
        senhaPreferencialDisplay.style.opacity = '1';
    }, 300);

    adicionarRecent({ senha: novaSenhaPreferencial, tipo: 'preferencial', guiche: guicheAtual });
});

btnReset.addEventListener('click', () => {
    resetFilas();
});

btnChamar.addEventListener('click', async () => {
    const senhaAtualGuiche = senhas[guicheAtual];

    const mensagem = senhaAtualGuiche && senhaAtualGuiche !== '---'
        ? `Senha ${senhaAtualGuiche}, dirigir-se ao guichê ${guicheAtual}.`
        : `Ainda não há senha gerada para o guichê ${guicheAtual}.`;

    await falarTexto(mensagem);

    if (senhaAtualGuiche && senhaAtualGuiche !== '---') {
        const horario = new Date();
        const hora = String(horario.getHours()).padStart(2, '0');
        const minuto = String(horario.getMinutes()).padStart(2, '0');
        const tipo = senhaAtualGuiche.startsWith('P') ? 'preferencial' : 'normal';

        adicionarHistorico(
            `${hora}:${minuto} - Guichê ${guicheAtual} - Senha ${senhaAtualGuiche}`,
            tipo
        );
    }
});

guicheSelect.addEventListener('change', () => {
    atualizarExibicao();
});


function tocarBeep() {
    return new Promise((resolve) => {
        const audio = new Audio("sons/universfield-new-notification-036-485897.mp3");

        audio.volume = 1;

        audio.onended = () => resolve();
        audio.onerror = () => resolve();

        audio.play().catch(() => resolve());
    });
}

async function falarTexto(texto) {
    if (!window.speechSynthesis) return;

    window.speechSynthesis.cancel();

    await tocarBeep();

    const utterance = new SpeechSynthesisUtterance(texto);
    utterance.lang = 'pt-BR';
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 90;

    window.speechSynthesis.speak(utterance);
}

const style = document.createElement('style');
style.textContent = `
@keyframes fadeIn {
    from { opacity: 0.5; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
}`;
document.head.appendChild(style);

atualizarExibicao();
atualizarPreferencial();