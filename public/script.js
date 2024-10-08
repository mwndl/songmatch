document.addEventListener('DOMContentLoaded', async function () {
    hasRequiredParameters()

    if (getQueryParameter('language')) {
        language = getQueryParameter('language')
        changeLanguage(language);
    } else {
        setLanguageBasedOnBrowser()
    }

    if (getQueryParameter('theme')) {
        theme = getQueryParameter('theme')

        if (theme === 'light') {
            setLightTheme()
        } else {
            setDarkTheme()
        }
    }
    
    applyColorScheme(); // service worker
    applyStoredTheme() // aplicar tema de background
    resetBackImage()
    hideThemeSelectors()
    listenForThemeChanges()

    const flagDiv = document.getElementById('flagDiv');
    const flagMenu = document.getElementById('flagMenu');
    
    flagDiv.addEventListener('click', () => {
        flagMenu.style.display = flagMenu.style.display === 'block' ? 'none' : 'block';
    });

    document.addEventListener('click', (event) => {
        if (!flagDiv.contains(event.target)) {
            flagMenu.style.display = 'none';
        }
    });

    // reload no titulo
    const topTitle = document.getElementById('topTitle');
    topTitle.addEventListener('click', function() {
        removeQueryParameter('query')
        location.reload(); 
    });



    // showSpContainer();

});


function removeQueryParameter(param) {
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.delete(param);
    
    // Replace the current URL without the specified parameter
    const newUrl = `${window.location.origin}${window.location.pathname}?${urlParams.toString()}`;
    history.replaceState(null, '', newUrl);
}

function getQueryParameter(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

function setQueryParameter(param, value) {
    const url = new URL(window.location);
    url.searchParams.set(param, value);
    window.history.replaceState({}, '', url);
}


let selectedLanguage = 'en';

function changeLanguage(language) {
    // Atualiza o valor do idioma selecionado na variável global
    selectedLanguage = language;

    const elementsToTranslate = document.querySelectorAll('[id]');
    // Feche o simulador para evitar elementos dinâmicos não traduzidos
    setElementContent(language);
    setQueryParameter('language', language);
    refreshDate(language)
    refreshMarketsTranslations()

    var selectedFlag = document.getElementById('selectedFlag')

    if (language === 'en') {
        selectedFlag.src = 'https://cdn.jsdelivr.net/gh/jdecked/twemoji@15.1.0/assets/svg/1f1fa-1f1f8.svg'
        selectedFlag.alt = 'EN Flag'
        createLanguageOptions(language)
    } else if (language === 'fr') {
        selectedFlag.src = 'https://cdn.jsdelivr.net/gh/jdecked/twemoji@15.1.0/assets/svg/1f1eb-1f1f7.svg'
        selectedFlag.alt = 'FR Flag'
        createLanguageOptions(language)
    } else if (language === 'de') {
        selectedFlag.src = 'https://cdn.jsdelivr.net/gh/jdecked/twemoji@15.1.0/assets/svg/1f1e9-1f1ea.svg'
        selectedFlag.alt = 'DE Flag'
        createLanguageOptions(language)
    } else if (language === 'it') {
        selectedFlag.src = 'https://cdn.jsdelivr.net/gh/jdecked/twemoji@15.1.0/assets/svg/1f1ee-1f1f9.svg'
        selectedFlag.alt = 'IT Flag'
        createLanguageOptions(language)
    } else if (language === 'pt') {
        selectedFlag.src = 'https://cdn.jsdelivr.net/gh/jdecked/twemoji@15.1.0/assets/svg/1f1e7-1f1f7.svg'
        selectedFlag.alt = 'BR Flag'
        createLanguageOptions(language)
    } else if (language === 'es') {
        selectedFlag.src = 'https://cdn.jsdelivr.net/gh/jdecked/twemoji@15.1.0/assets/svg/1f1ea-1f1f8.svg'
        selectedFlag.alt = 'ES Flag'
        createLanguageOptions(language)
    }


    elementsToTranslate.forEach(element => {
        const key = element.id;
        if (translations[selectedLanguage][key]) {
            if (element.querySelector('span')) {
                // Tratamento especial para elementos com span
                element.firstChild.textContent = translations[selectedLanguage][key];
            } else {
                // Para outros elementos
                element.textContent = translations[selectedLanguage][key];
            }
        }
    });
}

/* SISTEMA PARA REORDENAR FLAGS DE IDIOMAS NO MENU */

    // Arrays com a ordem desejada para cada idioma
    const orderEn = ['fr', 'de', 'it', 'pt', 'es']; 
    const orderFr = ['en', 'de', 'it', 'es', 'pt']; 
    const orderDe = ['en', 'fr', 'it', 'pt', 'es']; 
    const orderIt = ['fr', 'en', 'pt', 'es', 'de']; 
    const orderPt = ['de', 'es', 'fr', 'en', 'it'];
    const orderEs = ['de', 'fr', 'en', 'it', 'pt'];

    // Função auxiliar para retornar a ordem de acordo com o idioma selecionado
    function getOrderForLanguage(language) {
        switch (language) {
            case 'en':
                return orderEn;
            case 'fr':
                return orderFr;
            case 'de':
                return orderDe;
            case 'it':
                return orderIt;
            case 'pt':
                return orderPt;
            case 'es':
                return orderEs;
            default:
                return orderEn; // Padrão para idioma 'en'
        }
    }

    const languages = {
        'en': { flagUrl: 'https://cdn.jsdelivr.net/gh/jdecked/twemoji@15.1.0/assets/svg/1f1fa-1f1f8.svg' },
        'fr': { flagUrl: 'https://cdn.jsdelivr.net/gh/jdecked/twemoji@15.1.0/assets/svg/1f1eb-1f1f7.svg' },
        'de': { flagUrl: 'https://cdn.jsdelivr.net/gh/jdecked/twemoji@15.1.0/assets/svg/1f1e9-1f1ea.svg' },
        'it': { flagUrl: 'https://cdn.jsdelivr.net/gh/jdecked/twemoji@15.1.0/assets/svg/1f1ee-1f1f9.svg' },
        'pt': { flagUrl: 'https://cdn.jsdelivr.net/gh/jdecked/twemoji@15.1.0/assets/svg/1f1e7-1f1f7.svg' },
        'es': { flagUrl: 'https://cdn.jsdelivr.net/gh/jdecked/twemoji@15.1.0/assets/svg/1f1ea-1f1f8.svg' }
    };

    // criar as opções dinamicamente, com base no idioma selecionado
    function createLanguageOptions(selectedLanguage) {
        const flagMenu = document.getElementById('flagMenu');
        flagMenu.innerHTML = '';

        const order = getOrderForLanguage(selectedLanguage);

        order.forEach(code => {
            const language = languages[code];
            if (language) {
                const option = document.createElement('div');
                option.id = `${code}Option`;
                option.className = 'flag-option';
                option.onclick = () => changeLanguage(code);

                const flagImage = document.createElement('img');
                flagImage.id = `${code}FlagMenu`;
                flagImage.className = 'flag';
                flagImage.src = language.flagUrl;
                flagImage.alt = `${language.name} Flag`;
                option.appendChild(flagImage);

                const labelSpan = document.createElement('span');
                labelSpan.id = `${code}Label`;
                labelSpan.className = 'country-name';
                labelSpan.textContent = translations[selectedLanguage][`${code}Label`];
                option.appendChild(labelSpan);

                flagMenu.appendChild(option);
            }
        });
    }

/* ********** */

function refreshDate(selectedLanguage) {
    let trackReleased = document.getElementById('track_release_date');
    if (!trackReleased) { return; }

    let originalDate = trackReleased.getAttribute('data-original-date');
    if (!originalDate) { return; }

    let formattedDate = formatDate(originalDate, selectedLanguage);
    trackReleased.textContent = formattedDate;
}


function setLanguageBasedOnBrowser() {
    const userLanguage = navigator.language || navigator.userLanguage;
    if (userLanguage.startsWith('pt')) {
        changeLanguage('pt');
    } else if (userLanguage.startsWith('es')) {
        changeLanguage('es');
    } else if (userLanguage.startsWith('fr')) {
        changeLanguage('fr');
    } else if (userLanguage.startsWith('de')) {
        changeLanguage('de');
    } else if (userLanguage.startsWith('it')) {
        changeLanguage('it');
    } else {
        changeLanguage('en');
    }
}


function setElementContent(selectedLanguage) {
    document.getElementById('flagDiv').title = translations[selectedLanguage]['flagDivTitle'];
    document.getElementById('search_bar_content').placeholder = translations[selectedLanguage]['searchPlaceholder'];

    const marketsSearchBar = document.getElementById('search_bar_markets')
    if (marketsSearchBar) {
        marketsSearchBar.placeholder = translations[selectedLanguage]['searchPlaceholder'];
    }
}

function copyUrl() {
    // Obtém a URL atual do navegador
    var url = window.location.href;

    // Cria um elemento de input para inserir a URL
    var inputElement = document.createElement('input');
    inputElement.style.position = 'fixed';
    inputElement.style.opacity = 0;
    inputElement.value = url;
    document.body.appendChild(inputElement);

    // Seleciona o texto dentro do input
    inputElement.select();

    // Executa o comando de cópia
    document.execCommand('copy');

    // Remove o elemento de input
    document.body.removeChild(inputElement);

    // Alerta ou mensagem de confirmação opcional
    notification(translations[selectedLanguage]['copySuccessful']);
}

/*  ************************ */

function notification(customMessage) {
    const notification_div = document.getElementById("notification");
    const message = document.getElementById("notification-message");

    message.textContent = customMessage;
    notification_div.style.opacity = 1;
    notification_div.classList.remove("hidden");

    setTimeout(() => {
        notification_div.style.opacity = 0;
        setTimeout(() => {
            notification_div.classList.add("hidden");
            message.textContent = ''
            message.style = ''
        }, 500);
    }, 4000); // Tempo de exibição
};

// Função para formatar a data no formato dd/mm/yyyy
function formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Mês começa em 0
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}


function hasRequiredParameters() {
    const requiredParams = [
        'query', 
    ];

    const urlParams = new URLSearchParams(window.location.search);
    for (let param of requiredParams) {
        if (!urlParams.has(param)) {
            return false;
        }
    }

    content = getQueryParameter('query')
    source = getQueryParameter('source')

    if (content !== null) {
        handleSearch(content)
    }

    return true;
}

function copyContent(id) {
    var element = document.getElementById(id);
    var content = element.textContent.trim(); // Obtém o conteúdo da div, removendo espaços em branco

    if (content !== "-") {
        // Copia o conteúdo para a área de transferência
        navigator.clipboard.writeText(content)
            .then(() => {
                notification(translations[selectedLanguage]['copySuccess']);
            })
            .catch(err => {
                notification(translations[selectedLanguage]['copyFailed']);
                console.error('Erro ao copiar: ', err);
            });
    }
}

document.getElementById('search_examples').addEventListener('click', function() {
    document.getElementById('search_bar_content').focus();
});


let publicToken = '8KuA9GwNbaJYvTD8U6h64beb6d6dd56c'


document.getElementById('search_bar_content').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        searchButton()
    }
});

function searchButton() {
    const content = document.getElementById('search_bar_content').value.trim();
    handleSearch(content)
}


function handleSearch(content) {

    if (content === '') { return }

    showLoader();

    source = getQueryParameter('source')
    autoRedirect = getQueryParameter('auto_redirect')

    content = content.trim().replace(/\s+/g, ' ');

    // Verificar se é um ID do Apple
    const appleMusicIdRegex = /^(?:https:\/\/)?music\.apple\.com(?:\/[a-z]{2})?\/album\/(?:[a-zA-Z0-9-%]+\/)?\d+\?i=(\d+)(?:&[\w-]+=[\w-]+)*$/;

    if (appleMusicIdRegex.test(content)) {
        document.getElementById('search_bar_content').value = '';
        const appleId = content.match(appleMusicIdRegex)[1]; // Captura o ID da Apple
        searchAppleId(appleId);
        setQueryParameter('query', appleId);
        setQueryParameter('source', 'apple');
        return;
    }

    // Verificar se é um link geral da Apple Music
    const appleMusicDomainRegex = /^(?:https:\/\/)?music\.apple\.com(?:\/[a-z]{2})?(?:\/(?:album|playlist|track|artist|video)\/([a-zA-Z0-9]+))?(?:\?[\w-]+=[\w-]+)*$/;

    if (appleMusicDomainRegex.test(content)) {
        document.getElementById('search_bar_content').value = '';
        notification('')
        return;
    }


    // Verificar se é um ID do Spotify
    const spotifyIdRegex = /^(?:https:\/\/open\.spotify\.com\/(?:intl-[a-z]{2}\/)?track\/)?([a-zA-Z0-9]{22})(?:\?[^\/]+)?$/;

    if (spotifyIdRegex.test(content)) {
        document.getElementById('search_bar_content').value = '';
        const spotifyId = content.match(spotifyIdRegex)[1]; // Captura o ID do Spotify
        searchSpotifyId(spotifyId)
        setQueryParameter('query', spotifyId);
        setQueryParameter('source', 'spotify');
        return;
    }

    // Verificar se é um link geral do Spotify
    const spotifyGeneralIdRegex = /^(?:https:\/\/open\.spotify\.com\/(?:intl-[a-z]{2}\/)?(?:track|album|playlist|artist|show|episode)\/([a-zA-Z0-9]{22}))(?:\?[^\/]+)?$/;

    if (spotifyGeneralIdRegex.test(content)) {
        document.getElementById('search_bar_content').value = '';
        notification('')
        return;
    }


    // Verificar se é um ISRC
    const isrcRegex = /^[A-Z]{2}[A-Z0-9]{3}\d{7}$/;

    if (isrcRegex.test(content)) {
        document.getElementById('search_bar_content').value = '';
        if (source === 'apple') {
            searchByIsrcApple(content)
            setQueryParameter('query', content);
            setQueryParameter('source', 'apple');
        } else {
            searchByIsrc(content)
            setQueryParameter('query', content);
            setQueryParameter('source', 'spotify');
        }
        return;
    }

    if (content.startsWith('mxm:')) {
        content = content.substring(4); // Remove 'mxm:' do início

        document.getElementById('search_bar_content').value = '';
        content = content.trim().replace(/\s+/g, ' ');
        setQueryParameter('query', content);
        setQueryParameter('source', 'musixmatch');

        searchByAbstrack(content);
        return;
    }

    if (content.startsWith('apple:')) {
        content = content.substring(6); // remove 'apple:' do início

        document.getElementById('search_bar_content').value = '';
        content = content.trim().replace(/\s+/g, ' ');
        setQueryParameter('query', content);
        setQueryParameter('source', 'apple');

        notification('apple');
        hideLoader();
        searchAppleId(content);
        return;
    }

    // Regex para abstrack ou Apple ID
    const numberRegex = /^\d{2,12}$/;

    if (numberRegex.test(content)) {
        document.getElementById('search_bar_content').value = '';
        if (source === 'apple') {
            searchAppleId(content)
            setQueryParameter('query', content);
            setQueryParameter('source', 'apple');
        } else if (source === 'musixmatch' || source === 'mxm') {
            searchByAbstrack(content, autoRedirect)
            setQueryParameter('query', content);
            setQueryParameter('source', 'mxm');
        }
        return;
    }

    if (source === 'apple') {
        searchByTextApple(content);
        setQueryParameter('query', content);
        setQueryParameter('source', 'apple');
    } else if (source === 'spotify') {
        searchByTextSpotify(content);
        setQueryParameter('query', content);
        setQueryParameter('source', 'spotify');
    } else if (source === 'musixmatch' || source === 'mxm') {
        searchByTextMusixmatch(content);
        setQueryParameter('query', content);
        setQueryParameter('source', 'musixmatch');
    } else {
        // padrão
        searchByTextSpotify(content);
        setQueryParameter('query', content);
        setQueryParameter('source', 'spotify');
    }

}




function searchSpotifyId(id) {
    document.getElementById('search_bar_content').value = '';
    console.log('Pesquisar Spotify ID:', id);

    if (checkLocalhostDomain()) {
        window.serverPath = 'http://localhost:3001'; 
    } else {
        window.serverPath = 'https://datamatch-backend.onrender.com';
    }

    // URL da API com o ID dinâmico
    const url = `${window.serverPath}/songmatch/id?content=${id}&token=${publicToken}&mxm_data=1`;

    // Fazendo a requisição para a API
    fetch(url)
        .then(response => {
            if (!response.ok) {
                // Verifica o status da resposta e lança um erro personalizado
                if (response.status === 429) {
                    throw new Error('Erro 429: Muitas requisições. Tente novamente mais tarde.');
                }
                if (response.status === 404) {
                    throw new Error('Erro 404: Não encontrado.');
                }
                if (response.status === 401) {
                    throw new Error('Erro 401: Não autorizado.');
                }
                if (response.status === 400) {
                    throw new Error('Erro 400: Requisição inválida.');
                }
                if (response.status === 500) {
                    throw new Error('Erro 500: Erro interno do servidor.');
                }
                throw new Error('Erro desconhecido ao fazer a requisição.');
            }
            return response.json(); // Converte a resposta em JSON se estiver tudo ok
        })
        .then(data => {

            spotifyData = data.message.body.spotify;
            musixmatchData = data.message.body.musixmatch;

            setSpotifyData(spotifyData, musixmatchData)
        })
        .catch(error => {
            console.error('Erro ao fazer a requisição:', error);
            hideLoader()

            // Notificação de erro específica para cada código de status
            let errorMessage;
            console.log("Error message: " + error.message)
            switch (error.message) {
                case 'Erro 429: Muitas requisições. Tente novamente mais tarde.':
                    errorMessage = translations[selectedLanguage]['error429'];
                    break;
                case 'Erro 404: Não encontrado.':
                    errorMessage = translations[selectedLanguage]['error404'];
                    break;
                case 'Erro 401: Não autorizado.':
                    errorMessage = translations[selectedLanguage]['error401'];
                    break;
                case 'Erro 400: Requisição inválida.':
                    errorMessage = translations[selectedLanguage]['error400'];
                    break;
                case 'Erro 500: Erro interno do servidor.':
                    errorMessage = translations[selectedLanguage]['error500'];
                    break;
                default:
                    errorMessage = translations[selectedLanguage]['somethingWentWrong1'];
                    break;
            }

            // Exibir notificação de erro
            notification(errorMessage);
        });
}

function searchAppleId(id) {
    document.getElementById('search_bar_content').value = '';
    console.log('Pesquisar Apple ID:', id);

    if (checkLocalhostDomain()) {
        window.serverPath = 'http://localhost:3001'; 
    } else {
        window.serverPath = 'https://datamatch-backend.onrender.com';
    }

    // URL da API com o ID dinâmico
    const url = `${window.serverPath}/songmatch/apple?content=${id}&token=${publicToken}&mxm_data=1`;

    // Fazendo a requisição para a API
    fetch(url)
        .then(response => {
            if (!response.ok) {
                // Verifica o status da resposta e lança um erro personalizado
                if (response.status === 429) {
                    throw new Error('Erro 429: Muitas requisições. Tente novamente mais tarde.');
                }
                if (response.status === 404) {
                    throw new Error('Erro 404: Não encontrado.');
                }
                if (response.status === 401) {
                    throw new Error('Erro 401: Não autorizado.');
                }
                if (response.status === 400) {
                    throw new Error('Erro 400: Requisição inválida.');
                }
                if (response.status === 500) {
                    throw new Error('Erro 500: Erro interno do servidor.');
                }
                throw new Error('Erro desconhecido ao fazer a requisição.');
            }
            return response.json(); // Converte a resposta em JSON se estiver tudo ok
        })
        .then(data => {

            appleData = data.message.body.apple;
            musixmatchData = data.message.body.musixmatch;

            setAppleData(appleData, musixmatchData)
        })
        .catch(error => {
            console.error('Erro ao fazer a requisição:', error);
            hideLoader()

            // Notificação de erro específica para cada código de status
            let errorMessage;
            console.log("Error message: " + error.message)
            switch (error.message) {
                case 'Erro 429: Muitas requisições. Tente novamente mais tarde.':
                    errorMessage = translations[selectedLanguage]['error429'];
                    break;
                case 'Erro 404: Não encontrado.':
                    errorMessage = translations[selectedLanguage]['error404'];
                    break;
                case 'Erro 401: Não autorizado.':
                    errorMessage = translations[selectedLanguage]['error401'];
                    break;
                case 'Erro 400: Requisição inválida.':
                    errorMessage = translations[selectedLanguage]['error400'];
                    break;
                case 'Erro 500: Erro interno do servidor.':
                    errorMessage = translations[selectedLanguage]['error500'];
                    break;
                default:
                    errorMessage = translations[selectedLanguage]['somethingWentWrong1'];
                    break;
            }

            // Exibir notificação de erro
            notification(errorMessage);
        });
}

function searchByIsrc(isrc) {
    document.getElementById('search_bar_content').value = ''
    console.log('Pesquisar ISRC:', isrc);

    if (checkLocalhostDomain()) {
        window.serverPath = 'http://localhost:3001'; 
    } else {
        window.serverPath = 'https://datamatch-backend.onrender.com';
    }

    // URL da API com o ID dinâmico
    const url = `${window.serverPath}/songmatch/isrc?content=${isrc}&token=${publicToken}&mxm_data=1`;

    // Fazendo a requisição para a API
    fetch(url)
        .then(response => {
            if (!response.ok) {
                // Verifica o status da resposta e lança um erro personalizado
                if (response.status === 429) {
                    throw new Error('Erro 429: Muitas requisições. Tente novamente mais tarde.');
                }
                if (response.status === 404) {
                    throw new Error('Erro 404: Não encontrado.');
                }
                if (response.status === 401) {
                    throw new Error('Erro 401: Não autorizado.');
                }
                if (response.status === 400) {
                    throw new Error('Erro 400: Requisição inválida.');
                }
                if (response.status === 500) {
                    throw new Error('Erro 500: Erro interno do servidor.');
                }
                throw new Error('Erro desconhecido ao fazer a requisição.');
            }
            return response.json(); // Converte a resposta em JSON se estiver tudo ok
        })
        .then(data => {

            spotifyData = data.message.body.spotify;
            musixmatchData = data.message.body.musixmatch;

            setSpotifyData(spotifyData, musixmatchData)

        })
        .catch(error => {
            console.error('Erro ao fazer a requisição:', error);
            hideLoader()

            // Notificação de erro específica para cada código de status
            let errorMessage;
            console.log("Error message: " + error.message)
            switch (error.message) {
                case 'Erro 429: Muitas requisições. Tente novamente mais tarde.':
                    errorMessage = translations[selectedLanguage]['error429'];
                    break;
                case 'Erro 404: Não encontrado.':
                    errorMessage = translations[selectedLanguage]['error404'];
                    break;
                case 'Erro 401: Não autorizado.':
                    errorMessage = translations[selectedLanguage]['error401'];
                    break;
                case 'Erro 400: Requisição inválida.':
                    errorMessage = translations[selectedLanguage]['error400'];
                    break;
                case 'Erro 500: Erro interno do servidor.':
                    errorMessage = translations[selectedLanguage]['error500'];
                    break;
                default:
                    errorMessage = translations[selectedLanguage]['somethingWentWrong1'];
                    break;
            }

            // Exibir notificação de erro
            notification(errorMessage);
        });
}

function searchByIsrcApple(isrc) {
    document.getElementById('search_bar_content').value = ''
    console.log('Pesquisar ISRC:', isrc);

    if (checkLocalhostDomain()) {
        window.serverPath = 'http://localhost:3001'; 
    } else {
        window.serverPath = 'https://datamatch-backend.onrender.com';
    }

    // URL da API com o ID dinâmico
    const url = `${window.serverPath}/songmatch/apple_isrc?content=${isrc}&token=${publicToken}&mxm_data=1`;

    // Fazendo a requisição para a API
    fetch(url)
        .then(response => {
            if (!response.ok) {
                // Verifica o status da resposta e lança um erro personalizado
                if (response.status === 429) {
                    throw new Error('Erro 429: Muitas requisições. Tente novamente mais tarde.');
                }
                if (response.status === 404) {
                    throw new Error('Erro 404: Não encontrado.');
                }
                if (response.status === 401) {
                    throw new Error('Erro 401: Não autorizado.');
                }
                if (response.status === 400) {
                    throw new Error('Erro 400: Requisição inválida.');
                }
                if (response.status === 500) {
                    throw new Error('Erro 500: Erro interno do servidor.');
                }
                throw new Error('Erro desconhecido ao fazer a requisição.');
            }
            return response.json(); // Converte a resposta em JSON se estiver tudo ok
        })
        .then(data => {

            appleData = data.message.body.apple;
            musixmatchData = data.message.body.musixmatch;

            setAppleData(appleData, musixmatchData)

        })
        .catch(error => {
            console.error('Erro ao fazer a requisição:', error);
            hideLoader()

            // Notificação de erro específica para cada código de status
            let errorMessage;
            console.log("Error message: " + error.message)
            switch (error.message) {
                case 'Erro 429: Muitas requisições. Tente novamente mais tarde.':
                    errorMessage = translations[selectedLanguage]['error429'];
                    break;
                case 'Erro 404: Não encontrado.':
                    errorMessage = translations[selectedLanguage]['error404'];
                    break;
                case 'Erro 401: Não autorizado.':
                    errorMessage = translations[selectedLanguage]['error401'];
                    break;
                case 'Erro 400: Requisição inválida.':
                    errorMessage = translations[selectedLanguage]['error400'];
                    break;
                case 'Erro 500: Erro interno do servidor.':
                    errorMessage = translations[selectedLanguage]['error500'];
                    break;
                default:
                    errorMessage = translations[selectedLanguage]['somethingWentWrong1'];
                    break;
            }

            // Exibir notificação de erro
            notification(errorMessage);
        });
}

function searchByAbstrack(abstrack, autoRedirect) {
    document.getElementById('search_bar_content').value = ''
    console.log('Pesquisar Abstrack:', abstrack);

    if (checkLocalhostDomain()) {
        window.serverPath = 'http://localhost:3001'; 
    } else {
        window.serverPath = 'https://datamatch-backend.onrender.com';
    }

    // URL da API com o ID dinâmico
    const url = `${window.serverPath}/songmatch/abstrack?content=${abstrack}&token=${publicToken}`;

    // Fazendo a requisição para a API
    fetch(url)
        .then(response => {
            if (!response.ok) {
                // Verifica o status da resposta e lança um erro personalizado
                if (response.status === 429) {
                    throw new Error('Erro 429: Muitas requisições. Tente novamente mais tarde.');
                }
                if (response.status === 404) {
                    throw new Error('Erro 404: Não encontrado.');
                }
                if (response.status === 401) {
                    throw new Error('Erro 401: Não autorizado.');
                }
                if (response.status === 400) {
                    throw new Error('Erro 400: Requisição inválida.');
                }
                if (response.status === 500) {
                    throw new Error('Erro 500: Erro interno do servidor.');
                }
                throw new Error('Erro desconhecido ao fazer a requisição.');
            }
            return response.json(); // Converte a resposta em JSON se estiver tudo ok
        })
        .then(data => {

            musixmatchData = data.message.body.musixmatch;

            if (autoRedirect === null) {
                autoRedirect === '0'
            }

            setMusixmatchData(musixmatchData, autoRedirect)
            
        })
        .catch(error => {
            console.error('Erro ao fazer a requisição:', error);
            hideLoader()

            // Notificação de erro específica para cada código de status
            let errorMessage;
            console.log("Error message: " + error.message)
            switch (error.message) {
                case 'Erro 429: Muitas requisições. Tente novamente mais tarde.':
                    errorMessage = translations[selectedLanguage]['error429'];
                    break;
                case 'Erro 404: Não encontrado.':
                    errorMessage = translations[selectedLanguage]['error404'];
                    break;
                case 'Erro 401: Não autorizado.':
                    errorMessage = translations[selectedLanguage]['error401'];
                    break;
                case 'Erro 400: Requisição inválida.':
                    errorMessage = translations[selectedLanguage]['error400'];
                    break;
                case 'Erro 500: Erro interno do servidor.':
                    errorMessage = translations[selectedLanguage]['error500'];
                    break;
                default:
                    errorMessage = translations[selectedLanguage]['somethingWentWrong1'];
                    break;
            }

            // Exibir notificação de erro
            notification(errorMessage);
        });
}

function importShowLoader() {
    loader = document.getElementById('import_loader')
    mxmImportText = document.getElementById('mxmImportButton')

    loader.style.display = 'flex'
    mxmImportText.textContent = ''
}

function importHideLoader() {
    loader = document.getElementById('import_loader')
    mxmImportText = document.getElementById('mxmImportButton')

    loader.style.display = 'none'
    mxmImportText.textContent = translations[selectedLanguage]['mxmImportButton'];
}


function importRelease() {

    importShowLoader()

    let durationInSeconds = (lastDuration / 1000).toFixed(2);
    let encodedTrackName = encodeURIComponent(lastTrackName);
    let encodedAlbumName = encodeURIComponent(lastAlbumName);
    let encodedArtistName = encodeURIComponent(lastArtistName);


    document.getElementById('search_bar_content').value = ''
    console.log('Importar faixa:', encodedTrackName);

    if (!publicToken || !lastTrackId || !durationInSeconds || !encodedTrackName || !encodedArtistName || !encodedAlbumName) {
        return;
    }

    if (checkLocalhostDomain()) {
        window.serverPath = 'http://localhost:3001'; 
    } else {
        window.serverPath = 'https://datamatch-backend.onrender.com';
    }

    if (lastSource === 'spotify') {
        url = `${window.serverPath}/songmatch/sp_import?token=${publicToken}&track_id=${lastTrackId}&duration=${durationInSeconds}&track_name=${encodedTrackName}&artist_name=${encodedArtistName}&album_name=${encodedAlbumName}`;
    } else if (lastSource === 'apple') {
        url = `${window.serverPath}/songmatch/ap_import?token=${publicToken}&track_id=${lastTrackId}&duration=${durationInSeconds}&track_name=${encodedTrackName}&artist_name=${encodedArtistName}&album_name=${encodedAlbumName}`;
    } else {
        return;
    }

    // Fazendo a requisição para a API
    fetch(url)
        .then(response => {
            if (!response.ok) {
                // Verifica o status da resposta e lança um erro personalizado
                if (response.status === 429) {
                    throw new Error('Erro 429: Muitas requisições. Tente novamente mais tarde.');
                }
                if (response.status === 404) {
                    throw new Error('Erro 404: Não encontrado.');
                }
                if (response.status === 401) {
                    throw new Error('Erro 401: Não autorizado.');
                }
                if (response.status === 400) {
                    throw new Error('Erro 400: Requisição inválida.');
                }
                if (response.status === 500) {
                    throw new Error('Erro 500: Erro interno do servidor.');
                }
                throw new Error('Erro desconhecido ao fazer a requisição.');
            }
            return response.json(); // Converte a resposta em JSON se estiver tudo ok
        })
        .then(data => {

            musixmatchData = data.message.body.musixmatch;
            setMusixmatchData(musixmatchData, "0")

        })
        .catch(error => {
            console.error('Erro ao fazer a requisição:', error);
            importHideLoader()

            // Notificação de erro específica para cada código de status
            let errorMessage;
            console.log("Error message: " + error.message)
            switch (error.message) {
                case 'Erro 429: Muitas requisições. Tente novamente mais tarde.':
                    errorMessage = translations[selectedLanguage]['error429'];
                    break;
                case 'Erro 404: Não encontrado.':
                    errorMessage = translations[selectedLanguage]['mxmError404'];
                    break;
                case 'Erro 401: Não autorizado.':
                    errorMessage = translations[selectedLanguage]['error401'];
                    break;
                case 'Erro 400: Requisição inválida.':
                    errorMessage = translations[selectedLanguage]['error400'];
                    break;
                case 'Erro 500: Erro interno do servidor.':
                    errorMessage = translations[selectedLanguage]['error500'];
                    break;
                default:
                    errorMessage = translations[selectedLanguage]['somethingWentWrong1'];
                    break;
            }

            // Exibir notificação de erro
            notification(errorMessage);
        });
}

function searchByTextSpotify(text) {
    document.getElementById('search_bar_content').value = '';
    console.log('Pesquisar por texto:', text);

    if (checkLocalhostDomain()) {
        window.serverPath = 'http://localhost:3001'; 
    } else {
        window.serverPath = 'https://datamatch-backend.onrender.com';
    }

    // URL da API com o ID dinâmico
    const url = `${window.serverPath}/songmatch/search?content=${text}&token=${publicToken}&mxm_data=1`;

    // Fazendo a requisição para a API
    fetch(url)
        .then(response => {
            if (!response.ok) {
                // Verifica o status da resposta e lança um erro personalizado
                if (response.status === 429) {
                    throw new Error('Erro 429: Muitas requisições. Tente novamente mais tarde.');
                }
                if (response.status === 404) {
                    throw new Error('Erro 404: Não encontrado.');
                }
                if (response.status === 401) {
                    throw new Error('Erro 401: Não autorizado.');
                }
                if (response.status === 400) {
                    throw new Error('Erro 400: Requisição inválida.');
                }
                if (response.status === 500) {
                    throw new Error('Erro 500: Erro interno do servidor.');
                }
                throw new Error('Erro desconhecido ao fazer a requisição.');
            }
            return response.json(); // Converte a resposta em JSON se estiver tudo ok
        })
        .then(data => {
            spotifyData = data.message.body.spotify;
            musixmatchData = data.message.body.musixmatch;

            setSpotifyData(spotifyData, musixmatchData)

            document.getElementById('search_icon').style.display = 'block'
            document.getElementById('loader').style.display = 'none'

        })
        .catch(error => {
            console.error('Erro ao fazer a requisição:', error);
            hideLoader()

            // Notificação de erro específica para cada código de status
            let errorMessage;
            console.log("Error message: " + error.message)
            switch (error.message) {
                case 'Erro 429: Muitas requisições. Tente novamente mais tarde.':
                    errorMessage = translations[selectedLanguage]['error429'];
                    break;
                case 'Erro 404: Não encontrado.':
                    errorMessage = translations[selectedLanguage]['error404'];
                    break;
                case 'Erro 401: Não autorizado.':
                    errorMessage = translations[selectedLanguage]['error401'];
                    break;
                case 'Erro 400: Requisição inválida.':
                    errorMessage = translations[selectedLanguage]['error400'];
                    break;
                case 'Erro 500: Erro interno do servidor.':
                    errorMessage = translations[selectedLanguage]['error500'];
                    break;
                default:
                    errorMessage = translations[selectedLanguage]['somethingWentWrong1'];
                    break;
            }

            // Exibir notificação de erro
            notification(errorMessage);
        });
}

let lastSource;
let lastTrackId;
let lastTrackName;
let lastArtistName;
let lastAlbumName;
let lastDuration;
let lastAvailableMarkets;
let hrexAlbumPredColor;


async function setSpotifyData(spotifyData, musixmatchData) {
    hideLoader()
    
    try {
        await showSpContainer();
    } catch (error) {
        console.error("Erro ao mostrar o contêiner do Spotify:", error);
        return;
    }

    // funções do player de preview
    const player = document.getElementById('player');
    const audio = document.getElementById('audio');
    const playIcon = document.getElementById('play_icon');
    const pauseIcon = document.getElementById('pause_icon');

    player.addEventListener('click', function() {
        if (audio.paused) {
            audio.play();
            playIcon.style.display = 'none';
            pauseIcon.style.display = 'block';
        } else {
            audio.pause();
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
        }
    });
    audio.addEventListener('ended', function() {
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
    });

    document.getElementById('mxmImportDiv').addEventListener('click', function() {
        importRelease(source, lastDuration, lastTrackId, lastTrackName, lastAlbumName, lastArtistName);
    });

    const trackImage = document.getElementById('track_image')

    const trackName = document.getElementById('track_name')
    const trackArtist = document.getElementById('artist_list')
    const trackAlbum = document.getElementById('album_name')
    const trackDuration = document.getElementById('track_duration')
    const trackDurationSeconds = document.getElementById('track_duration_seconds')
    const trackDurationSeconds2 = document.getElementById('track_duration_seconds_hidden')

    const trackReleased = document.getElementById('track_release_date')
    const trackPosition1 = document.getElementById('track_position_content')
    const trackPosition2 = document.getElementById('album_total_content')
    const trackPopularity = document.getElementById('track_popularity_number')

    const albumType1 = document.getElementById('albumLabel1')
    const albumType2 = document.getElementById('singleLabel')
    const albumType3 = document.getElementById('compilationLabel')
    
    const trackMarkets = document.getElementById('track_markets_total')

    const trackSpId = document.getElementById('track_sp_id')
    const trackIsrc = document.getElementById('track_isrc_code')
    const trackAbstrack = document.getElementById('track_abstrack')

    const trackMxmLyrics = document.getElementById('track_mxm_lyrics')
    const trackMxmArtist = document.getElementById('track_mxm_artist')
    const trackMxmAlbum = document.getElementById('track_mxm_album')

    const trackLyricsStat = document.getElementById('track_lyrics_stat')
    const trackLinesyncStat = document.getElementById('track_linesync_stat')
    const trackWordsyncStat = document.getElementById('track_wordsync_stat')

    const openLyrics = document.getElementById('openLyricsLabel')
    const openStudio = document.getElementById('openStudioLabel')

    const previewPlayer = document.getElementById('player')
    const audioPlayer = document.getElementById('audio');

    const spotifyIcon = document.getElementById("spotify_icon")

    const trackAbstrackDiv = document.getElementById('track_abstrack_div')
    const mxmNotFoundDiv = document.getElementById('mxm_not_found_div')
    const mxmDataContainer = document.getElementById('mxm_data_container')

    const trackId = spotifyData.track_data.track_id;
    const albumImage = spotifyData.album_data.images[0].url;
    const albumImageBack = spotifyData.album_data.images[2].url;

    trackImage.src = albumImage;

    showThemeSelectors()
    setTheme1Image(albumImageBack)

    // aplicar cor predominante como tema da página
    getDominantColorFromImageUrl(albumImageBack, function(hexColor) {

        hrexAlbumPredColor = hexColor;
        if (hexColor) {
            document.querySelector('meta[name="theme-color"]').setAttribute('content', hexColor);
        } else {
            console.log('Não foi possível obter a cor predominante.');
        }
    });

    /* Track name */
        const track = spotifyData.track_data;
        trackName.textContent = ''
        const trackLink = document.createElement('a');
        trackLink.href = `https://open.spotify.com/track/${track.track_id}`;
        spotifyIcon.href = `https://open.spotify.com/track/${track.track_id}`;
        trackLink.textContent = track.track_name;
        trackLink.target = "_blank";

        trackName.appendChild(trackLink);

    /* Artist name */
        const artists = spotifyData.artists_data.artists;
        trackArtist.textContent = ''
        artists.forEach((artist, index) => {
            const artistLink = document.createElement('a');
            artistLink.href = `https://open.spotify.com/artist/${artist.artist_id}`;
            artistLink.textContent = artist.name;
            artistLink.target = "_blank";
        
            trackArtist.appendChild(artistLink);
        
            if (index < artists.length - 1) {
                const separator = document.createTextNode(', ');
                trackArtist.appendChild(separator);
            }
        });

    /* Album name */
        const album = spotifyData.album_data;
        trackAlbum.textContent = ''
        const albumLink = document.createElement('a');
        albumLink.href = `https://open.spotify.com/album/${album.album_id}`;
        albumLink.textContent = album.album_name;
        albumLink.target = "_blank";

        trackAlbum.appendChild(albumLink);

    /* Track duration */
        let durationMs = spotifyData.track_data.duration_ms;
        let minutes = Math.floor(durationMs / 60000);
        let seconds = ((durationMs % 60000) / 1000).toFixed(0);
        let formattedDuration = minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
        trackDuration.textContent = formattedDuration;

        // Track duration seconds
        let durationSeconds = Math.floor(durationMs / 1000);
        trackDurationSeconds.textContent = `(${durationSeconds})`;
        trackDurationSeconds2.textContent = durationSeconds;
    /* *********** */

    lastTrackId = spotifyData.track_data.track_id;
    lastTrackName = spotifyData.track_data.track_name;
    lastArtistName = spotifyData.artists_data.artists[0].name;
    lastAlbumName = spotifyData.album_data.album_name;
    lastDuration = spotifyData.track_data.duration_ms;
    lastSource = 'spotify';


    let releasedDate = spotifyData.album_data.release_date;
    trackReleased.textContent = formatDate(releasedDate, selectedLanguage)
    trackReleased.setAttribute('data-original-date', releasedDate);

    trackPosition1.textContent = spotifyData.track_data.disc_position
    trackPosition2.textContent = spotifyData.album_data.total_tracks

    trackPopularity.textContent = `${spotifyData.track_data.popularity}%`; // popularidade de xx%

    if (spotifyData.album_data.album_type === 'album') {
        albumType1.style.display = 'inline' // album
        albumType2.style.display = 'none' // single
        albumType3.style.display = 'none' // compilation
        
    } else if (spotifyData.album_data.album_type === 'single') {
        albumType1.style.display = 'none'
        albumType2.style.display = 'inline'
        albumType3.style.display = 'none'

    } else if (spotifyData.album_data.album_type === 'compilation') {
        albumType1.style.display = 'none'
        albumType2.style.display = 'none'
        albumType3.style.display = 'inline'

    }
    
    lastAvailableMarkets = spotifyData.track_data.available_markets;
    const numCountries = lastAvailableMarkets.length;
    trackMarkets.textContent = numCountries;

    initializePopup(lastAvailableMarkets)

    trackSpId.textContent = trackId;
    trackIsrc.textContent = spotifyData.track_data.isrc;

    if (spotifyData.track_data.preview_url !== null) {
        previewPlayer.style.display = 'flex'
        playIcon.style.display = 'block'
        pauseIcon.style.display = 'none'
        audioPlayer.src = spotifyData.track_data.preview_url
    } else {
        previewPlayer.style.display = 'none'
        playIcon.style.display = 'block'
        pauseIcon.style.display = 'none'
        audioPlayer.src = '#'
    }

    if (!musixmatchData.track_data) {
        trackAbstrackDiv.style.display = 'none'
        mxmDataContainer.style.display = 'none'
        mxmNotFoundDiv.style.display = 'block'
    } else if (musixmatchData.track_data) {
        trackAbstrackDiv.style.display = 'flex'
        mxmDataContainer.style.display = 'flex'
        mxmNotFoundDiv.style.display = 'none'

        trackAbstrack.textContent = musixmatchData.track_data.commontrack_id;

        trackMxmLyrics.textContent = `mxmt.ch/t/${musixmatchData.track_data.lyrics_id}`;
        trackMxmArtist.textContent = `mxmt.ch/a/${musixmatchData.artist_data.artist_id}`;
        trackMxmAlbum.textContent = `mxmt.ch/r/${musixmatchData.album_data.album_id}`;
    
        trackMxmLyrics.title = musixmatchData.track_data.track_name;
        trackMxmArtist.title = musixmatchData.artist_data.artist_name;
        trackMxmAlbum.title = musixmatchData.album_data.album_name;
    
        if (musixmatchData.track_data.stats.has_lyrics === 1) {
            trackLyricsStat.className = 'status-1 status-blue'
        } else {
            trackLyricsStat.className = 'status-1 status-gray'
        }
        
        if (musixmatchData.track_data.stats.has_line_sync === 1) {
            trackLinesyncStat.className = 'status-1 status-blue'
        } else {
            trackLinesyncStat.className = 'status-1 status-gray'
        }
        
        if (musixmatchData.track_data.stats.has_word_sync === 1) {
            trackWordsyncStat.className = 'status-1 status-blue'
        } else {
            trackWordsyncStat.className = 'status-1 status-gray'
        }
    
        openLyrics.setAttribute('data-link', `http://mxmt.ch/t/${musixmatchData.track_data.lyrics_id}`);
        openStudio.setAttribute('data-link', `https://curators.musixmatch.com/tool?commontrack_id=${musixmatchData.track_data.commontrack_id}&mode=edit`);
    }

}

async function setAppleData(appleData, musixmatchData) {
    hideLoader()
    
    try {
        await showApContainer();
    } catch (error) {
        console.error("Erro ao mostrar o contêiner da Apple Music:", error);
        return;
    }

    // funções do player de preview
    const player = document.getElementById('player');
    const audio = document.getElementById('audio');
    const playIcon = document.getElementById('play_icon');
    const pauseIcon = document.getElementById('pause_icon');

    player.addEventListener('click', function() {
        if (audio.paused) {
            audio.play();
            playIcon.style.display = 'none';
            pauseIcon.style.display = 'block';
        } else {
            audio.pause();
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
        }
    });
    audio.addEventListener('ended', function() {
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
    });

    document.getElementById('mxmImportDiv').addEventListener('click', function() {
        importRelease(source, lastDuration, lastTrackId, lastTrackName, lastAlbumName, lastArtistName);
    });

    const pageBody = document.getElementById('body')

    const trackImage = document.getElementById('track_image')

    const trackName = document.getElementById('track_name')
    const trackArtist = document.getElementById('artist_list')
    const trackAlbum = document.getElementById('album_name')
    const trackDuration = document.getElementById('track_duration')
    const trackDurationSeconds2 = document.getElementById('track_duration_seconds_hidden')

    const trackReleased = document.getElementById('track_release_date')
    const genreList = document.getElementById('track_genre_list')

    const trackApId = document.getElementById('track_ap_id')
    const trackIsrc = document.getElementById('track_isrc_code')
    const trackAbstrack = document.getElementById('track_abstrack')
    
    const trackMxmLyrics = document.getElementById('track_mxm_lyrics')
    const trackMxmArtist = document.getElementById('track_mxm_artist')
    const trackMxmAlbum = document.getElementById('track_mxm_album')
    
    const trackLyricsStat = document.getElementById('track_lyrics_stat')
    const trackLinesyncStat = document.getElementById('track_linesync_stat')
    const trackWordsyncStat = document.getElementById('track_wordsync_stat')
    
    const openLyrics = document.getElementById('openLyricsLabel')
    const openStudio = document.getElementById('openStudioLabel')
    
    const previewPlayer = document.getElementById('player')
    const audioPlayer = document.getElementById('audio');
    
    const appleMusicIcon = document.getElementById('apple_icon');
    
    const trackAbstrackDiv = document.getElementById('track_abstrack_div')
    const mxmNotFoundDiv = document.getElementById('mxm_not_found_div')
    const mxmDataContainer = document.getElementById('mxm_data_container')

    const trackId = appleData.track_data.track_id;
    const albumImage = appleData.album_data.album_artwork;

    trackImage.src = albumImage;
    setTheme1Image(albumImage)
    showThemeSelectors()

    // aplicar cor predominante como tema da página
    getDominantColorFromImageUrl(albumImage, function(hexColor) {
        hrexAlbumPredColor = hexColor
        if (hexColor) {
            document.querySelector('meta[name="theme-color"]').setAttribute('content', hexColor);
        } else {
            console.log('Não foi possível obter a cor predominante.');
        }
    });

    /* Track name */
        const track = appleData.track_data;
        const album = appleData.album_data;

        trackName.textContent = ''
        const trackLink = document.createElement('a');
        trackLink.href = `https://music.apple.com/album/${album.album_id}?i=${track.track_id}`;
        appleMusicIcon.href = `https://geo.music.apple.com/album/${album.album_id}?i=${track.track_id}&amp;itsct=music_box_appicon&amp;itscg=30200&amp;app=music&amp;ls=1`;
        trackLink.textContent = track.track_name;
        trackLink.target = "_blank";

        trackName.appendChild(trackLink);

    /* Artist name */
        trackArtist.textContent = '';
        const link = document.createElement('a');

        link.textContent = appleData.artist_data.artist_name;
        link.href = `https://music.apple.com/artist/${appleData.artist_data.artists[0].artist_id}`; // Substitua pelo URL correto

        trackArtist.appendChild(link);

    /* Album name */

        trackAlbum.textContent = ''
        const albumLink = document.createElement('a');
        albumLink.href = `https://music.apple.com/album/${album.album_id}`;
        albumLink.textContent = album.album_name;
        albumLink.target = "_blank";

        trackAlbum.appendChild(albumLink);

    /* Track duration */
        let durationMs = appleData.track_data.duration_ms;
        let minutes = Math.floor(durationMs / 60000);
        let seconds = ((durationMs % 60000) / 1000).toFixed(0);
        let formattedDuration = minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
        trackDuration.textContent = formattedDuration;

        // Track duration seconds
        let durationSeconds = Math.floor(durationMs / 1000);
        trackDurationSeconds2.textContent = durationSeconds;
    /* *********** */

    lastTrackId = appleData.track_data.track_id;
    lastTrackName = appleData.track_data.track_name;
    lastArtistName = appleData.artist_data.artists[0].name;
    lastAlbumName = appleData.album_data.album_name;
    lastDuration = appleData.track_data.duration_ms;
    lastSource = 'apple';


    let releasedDate = appleData.track_data.release_date;
    trackReleased.textContent = formatDate(releasedDate, selectedLanguage)
    trackReleased.setAttribute('data-original-date', releasedDate);

    genreList.textContent = appleData.track_data.genre_names.join(', ');

    trackApId.textContent = trackId;
    trackIsrc.textContent = appleData.track_data.isrc;

    if (appleData.track_data.preview_url !== null) {
        previewPlayer.style.display = 'flex'
        playIcon.style.display = 'block'
        pauseIcon.style.display = 'none'
        audioPlayer.src = appleData.track_data.preview_url
    } else {
        previewPlayer.style.display = 'none'
        playIcon.style.display = 'block'
        pauseIcon.style.display = 'none'
        audioPlayer.src = '#'
    }


    if (!musixmatchData.track_data) {
        trackAbstrackDiv.style.display = 'none'
        mxmDataContainer.style.display = 'none'
        mxmNotFoundDiv.style.display = 'block'
    } else if (musixmatchData.track_data) {
        trackAbstrackDiv.style.display = 'flex'
        mxmDataContainer.style.display = 'flex'
        mxmNotFoundDiv.style.display = 'none'


        trackAbstrack.textContent = musixmatchData.track_data.commontrack_id;

        trackMxmLyrics.textContent = `mxmt.ch/t/${musixmatchData.track_data.lyrics_id}`;
        trackMxmArtist.textContent = `mxmt.ch/a/${musixmatchData.artist_data.artist_id}`;
        trackMxmAlbum.textContent = `mxmt.ch/r/${musixmatchData.album_data.album_id}`;
    
        trackMxmLyrics.title = musixmatchData.track_data.track_name;
        trackMxmArtist.title = musixmatchData.artist_data.artist_name;
        trackMxmAlbum.title = musixmatchData.album_data.album_name;
    
        if (musixmatchData.track_data.stats.has_lyrics === 1) {
            trackLyricsStat.className = 'status-1 status-blue'
        } else {
            trackLyricsStat.className = 'status-1 status-gray'
        }
        
        if (musixmatchData.track_data.stats.has_line_sync === 1) {
            trackLinesyncStat.className = 'status-1 status-blue'
        } else {
            trackLinesyncStat.className = 'status-1 status-gray'
        }
        
        if (musixmatchData.track_data.stats.has_word_sync === 1) {
            trackWordsyncStat.className = 'status-1 status-blue'
        } else {
            trackWordsyncStat.className = 'status-1 status-gray'
        }
    
        openLyrics.setAttribute('data-link', `http://mxmt.ch/t/${musixmatchData.track_data.lyrics_id}`);
        openStudio.setAttribute('data-link', `https://curators.musixmatch.com/tool?commontrack_id=${musixmatchData.track_data.commontrack_id}&mode=edit`);
    }
}


async function setMusixmatchData(musixmatchData, autoRedirect) {

    hideLoader()

    if (autoRedirect === '1') {
        lyricsId = musixmatchData.track_data.lyrics_id;

        const url = `http://mxmt.ch/t/${lyricsId}`;
        window.open(url, '_blank');

    } else if (autoRedirect === '2') {
        lyricsId = musixmatchData.track_data.lyrics_id;
    
        const url = `http://mxmt.ch/t/${lyricsId}`;
        window.location.href = url;

    } else if (autoRedirect === '0') {

        const trackAbstrack = document.getElementById('track_abstrack')
    
        const trackMxmLyrics = document.getElementById('track_mxm_lyrics')
        const trackMxmArtist = document.getElementById('track_mxm_artist')
        const trackMxmAlbum = document.getElementById('track_mxm_album')
        
        const trackLyricsStat = document.getElementById('track_lyrics_stat')
        const trackLinesyncStat = document.getElementById('track_linesync_stat')
        const trackWordsyncStat = document.getElementById('track_wordsync_stat')
        
        const openLyrics = document.getElementById('openLyricsLabel')
        const openStudio = document.getElementById('openStudioLabel')
        
        const trackAbstrackDiv = document.getElementById('track_abstrack_div')
        const mxmNotFoundDiv = document.getElementById('mxm_not_found_div')
        const mxmDataContainer = document.getElementById('mxm_data_container')
    
    
        trackAbstrackDiv.style.display = 'flex'
        mxmDataContainer.style.display = 'flex'
        mxmNotFoundDiv.style.display = 'none'
    
    
        trackAbstrack.textContent = musixmatchData.track_data.commontrack_id;
    
        trackMxmLyrics.textContent = `mxmt.ch/t/${musixmatchData.track_data.lyrics_id}`;
        trackMxmArtist.textContent = `mxmt.ch/a/${musixmatchData.artist_data.artist_id}`;
        trackMxmAlbum.textContent = `mxmt.ch/r/${musixmatchData.album_data.album_id}`;
    
        trackMxmLyrics.title = musixmatchData.track_data.track_name;
        trackMxmArtist.title = musixmatchData.artist_data.artist_name;
        trackMxmAlbum.title = musixmatchData.album_data.album_name;
    
        if (musixmatchData.track_data.stats.has_lyrics === 1) {
            trackLyricsStat.className = 'status-1 status-blue'
        } else {
            trackLyricsStat.className = 'status-1 status-gray'
        }
        
        if (musixmatchData.track_data.stats.has_line_sync === 1) {
            trackLinesyncStat.className = 'status-1 status-blue'
        } else {
            trackLinesyncStat.className = 'status-1 status-gray'
        }
        
        if (musixmatchData.track_data.stats.has_word_sync === 1) {
            trackWordsyncStat.className = 'status-1 status-blue'
        } else {
            trackWordsyncStat.className = 'status-1 status-gray'
        }
    
        openLyrics.setAttribute('data-link', `http://mxmt.ch/t/${musixmatchData.track_data.lyrics_id}`);
        openStudio.setAttribute('data-link', `https://curators.musixmatch.com/tool?commontrack_id=${musixmatchData.track_data.commontrack_id}&mode=edit`);

    }

}




function formatDate(dateString, language) {
    if (!dateString) {
      return 'undefined'; // Tratamento para data indefinida ou vazia
    }
  
    // Verificar se a data está no formato yyyy-mm-dd
    const dateParts = dateString.split('-');
    if (dateParts.length !== 3) {
      return 'Invalid Date Format'; // Tratamento para formato inválido
    }
  
    const [year, month, day] = dateParts.map(Number);
  
    // Criar um objeto de data
    const date = new Date(year, month - 1, day);
  
    // Mapear idiomas para códigos de localidade
    const locales = {
      'fr': 'fr-FR',
      'de': 'de-DE',
      'it': 'it-IT',
      'pt': 'pt-PT',
      'es': 'es-ES',
      'br': 'pt-BR'
    };
  
    const locale = locales[language] || 'en-US'; // Padrão para 'en-US' se o idioma não for encontrado
  
    // Formatar a data de acordo com o idioma selecionado
    return new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long', day: 'numeric' }).format(date);
  }




function openLyrics() {
    const link = document.getElementById('openLyricsLabel').getAttribute('data-link');
    window.open(link, '_blank');
}

function openStudio() {
    const link = document.getElementById('openStudioLabel').getAttribute('data-link');
    window.open(link, '_blank');
}

function showLoader() {
    document.getElementById('search_icon').style.display = 'none'
    document.getElementById('loader').style.display = 'block'
}

function hideLoader() {
    document.getElementById('search_icon').style.display = 'block'
    document.getElementById('loader').style.display = 'none'
}

function checkLocalhostDomain() {
    const hostname = window.location.hostname;
  
    // Verifica se é 127.0.0.1 ou começa com 192.
    if (hostname.startsWith('127.') || hostname.startsWith('192.')) {
      return true;
    }
  
  // Verifica se é um domínio .com
  if (hostname.endsWith('.com')) {
    return false;
  }
  
    // Se não atender nenhum dos critérios acima, retorna false
    return false;
}



async function showSpContainer() {
    document.getElementById('search_examples').style.display = 'none';
    const resultsContainer = document.getElementById('results_container');
    resultsContainer.innerHTML = '';

    try {
        const response = await fetch('./containers/spotify.html');
        const data = await response.text();

        resultsContainer.innerHTML = data;
        resultsContainer.style.display = 'block';
        changeLanguage(selectedLanguage) // recarregar strings traduzidas
    } catch (error) {
        console.error('Erro ao carregar o arquivo spotify.html:', error);
    }
}

async function showApContainer() {
    document.getElementById('search_examples').style.display = 'none';
    const resultsContainer = document.getElementById('results_container');
    resultsContainer.innerHTML = '';

    try {
        const response = await fetch('./containers/apple.html');
        const data = await response.text();

        resultsContainer.innerHTML = data;
        resultsContainer.style.display = 'block';
        changeLanguage(selectedLanguage) // recarregar strings traduzidas
    } catch (error) {
        console.error('Erro ao carregar o arquivo apple.html:', error);
    }
}

async function showMxmContainer() {
    document.getElementById('search_examples').style.display = 'none';
    const resultsContainer = document.getElementById('results_container');
    resultsContainer.innerHTML = '';

    try {
        const response = await fetch('./containers/mxm.html');
        const data = await response.text();

        resultsContainer.innerHTML = data;
        resultsContainer.style.display = 'block';
        changeLanguage(selectedLanguage) // recarregar strings traduzidas
    } catch (error) {
        console.error('Erro ao carregar o arquivo mxm.html:', error);
    }
}

function hideContainers() {
    document.getElementById('search_examples').style.display = 'block';
    const resultsContainer = document.getElementById('results_container');
    resultsContainer.innerHTML = '';
}


function openPopup() {
    document.getElementById('popup').style.display = 'block';
    document.getElementById('overlay').style.display = 'block';
}

function closePopup() {
    document.getElementById('popup').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
}

const providedMarkets = [
    // Lista de todos os países
    "AR", "AU", "AT", "BE", "BO", "BR", "BG", "CA", "CL", "CO", "CR", "CY", "CZ", "DK", 
    "DO", "DE", "EC", "EE", "SV", "FI", "FR", "GR", "GT", "HN", "HK", "HU", "IS", "IE", 
    "IT", "LV", "LT", "LU", "MY", "MT", "MX", "NL", "NZ", "NI", "NO", "PA", "PY", "PE", 
    "PH", "PL", "PT", "SG", "SK", "ES", "SE", "CH", "TW", "TR", "UY", "US", "GB", "AD", 
    "LI", "MC", "ID", "JP", "TH", "VN", "RO", "IL", "ZA", "SA", "AE", "BH", "QA", "OM", 
    "KW", "EG", "MA", "DZ", "TN", "LB", "JO", "PS", "IN", "BY", "KZ", "MD", "UA", "AL", 
    "BA", "HR", "ME", "MK", "RS", "SI", "KR", "BD", "PK", "LK", "GH", "KE", "NG", "TZ", 
    "UG", "AG", "AM", "BS", "BB", "BZ", "BT", "BW", "BF", "CV", "CW", "DM", "FJ", "GM", 
    "GE", "GD", "GW", "GY", "HT", "JM", "KI", "LS", "LR", "MW", "MV", "ML", "MH", "FM", 
    "NA", "NR", "NE", "PW", "PG", "PR", "WS", "SM", "ST", "SN", "SC", "SL", "SB", "KN", 
    "LC", "VC", "SR", "TL", "TO", "TT", "TV", "VU", "AZ", "BN", "BI", "KH", "CM", "TD", 
    "KM", "GQ", "SZ", "GA", "GN", "KG", "LA", "MO", "MR", "MN", "NP", "RW", "TG", "UZ", 
    "ZW", "BJ", "MG", "MU", "MZ", "AO", "CI", "DJ", "ZM", "CD", "CG", "IQ", "LY", "TJ", 
    "VE", "ET", "XK"
];

function filterCountries() {
    const search = document.getElementById('search_bar_markets').value.toLowerCase();
    const countryList = document.getElementById('country-list');
    
    if (!lastAvailableMarkets.length) {
        console.warn('No available markets to filter.');
        return;
    }
    
    countryList.innerHTML = ''; // Limpa a lista existente
    
    const filteredCountries = providedMarkets.map(code => {
        const name = getCountryName(code);
        return {
            code,
            name,
            available: lastAvailableMarkets.includes(code)
        };
    }).filter(country => country.name.toLowerCase().includes(search));

    // Ordena os países filtrados, colocando os disponíveis primeiro e os indisponíveis por último
    filteredCountries.sort((a, b) => {
        if (a.available && !b.available) return -1;
        if (!a.available && b.available) return 1;
        return a.name.localeCompare(b.name);
    });

    filteredCountries.forEach(country => {
        const li = document.createElement('li');
        li.textContent = country.name;
        li.setAttribute('data-lang', country.code); // Define o atributo data-lang com o código do país
        
        // Adiciona uma classe para indicar que a faixa está indisponível
        if (!country.available) {
            li.classList.add('unavailable');
        }
        
        countryList.appendChild(li);
    });
}

function getCountryName(code) {
    const market = markets.markets.find(m => m.code === code);
    return market ? market.translations[selectedLanguage] || market.translations['en'] : code;
}

function initializePopup(lastAvailableMarkets) {
    const countryList = document.getElementById('country-list');
    countryList.innerHTML = ''; // Limpa a lista existente

    // Ordena os códigos de países pelo nome correspondente, disponíveis primeiro
    providedMarkets.sort((a, b) => {
        const nameA = getCountryName(a).toLowerCase();
        const nameB = getCountryName(b).toLowerCase();
        const availableA = lastAvailableMarkets.includes(a);
        const availableB = lastAvailableMarkets.includes(b);

        if (availableA && !availableB) return -1;
        if (!availableA && availableB) return 1;
        return nameA.localeCompare(nameB);
    });

    // Adiciona os países ordenados à lista
    providedMarkets.forEach(code => {
        const li = document.createElement('li');
        li.textContent = getCountryName(code);
        li.setAttribute('data-lang', code); // Define o atributo data-lang com o código do país

        // Adiciona uma classe para indicar que a faixa está indisponível
        if (!lastAvailableMarkets.includes(code)) {
            li.classList.add('unavailable');
        }
        
        countryList.appendChild(li);
    });
}

function refreshMarketsTranslations() {
    const countryList = document.getElementById('country-list');
    
    // Verifica se countryList existe e se há itens na lista
    if (!countryList || countryList.children.length === 0) {
        return null;
    }
    
    const items = Array.from(countryList.querySelectorAll('li'));

    // Atualiza o texto dos itens com base na tradução atual
    items.forEach(item => {
        const code = item.getAttribute('data-lang');
        item.textContent = getCountryName(code);
    });

    // Reordena a lista com base na nova tradução, colocando os disponíveis primeiro
    items.sort((a, b) => {
        const nameA = a.textContent.toLowerCase();
        const nameB = b.textContent.toLowerCase();
        const availableA = lastAvailableMarkets.includes(a.getAttribute('data-lang'));
        const availableB = lastAvailableMarkets.includes(b.getAttribute('data-lang'));

        if (availableA && !availableB) return -1;
        if (!availableA && availableB) return 1;
        return nameA.localeCompare(nameB);
    });

    // Re-adiciona os itens na lista de forma ordenada
    countryList.innerHTML = '';
    items.forEach(item => {
        countryList.appendChild(item);
    });
}

document.getElementById('theme2toggle').addEventListener('click', setTheme2);
document.getElementById('theme1toggle').addEventListener('click', setTheme1);
document.getElementById('theme0toggle').addEventListener('click', setTheme0);

function setTheme0() {
    document.getElementById('theme2toggle').className = 'theme-selector image'
    document.getElementById('theme1toggle').className = 'theme-selector dark'
    document.getElementById('theme0toggle').className = 'theme-selector light selected'
    document.getElementById('background-image').style.display = 'none'
    localStorage.setItem('theme', '0');
    setLightTheme() 
}

function setTheme1() {
    document.getElementById('theme2toggle').className = 'theme-selector image'
    document.getElementById('theme1toggle').className = 'theme-selector dark selected'
    document.getElementById('theme0toggle').className = 'theme-selector light'
    document.getElementById('background-image').style.display = 'none'
    localStorage.setItem('theme', '1');
    setDarkTheme()
}

function setTheme2() {
    document.getElementById('theme2toggle').className = 'theme-selector image selected'
    document.getElementById('theme1toggle').className = 'theme-selector dark'
    document.getElementById('theme0toggle').className = 'theme-selector light'
    document.getElementById('background-image').style.display = 'flex'
    localStorage.setItem('theme', '2');
    setDarkTheme(hrexAlbumPredColor)
}

function applyStoredTheme() {
    const theme = localStorage.getItem('theme');

    if (theme === '2') {
        setTheme2();
    } else if (theme === '1') {
        setTheme1();
    } else if (theme === '0') {
        setTheme0();
    } else {
        setInitialTheme()
    }
}

function setTheme1Image(imageUrl) {
    document.getElementById('backimage_intern').style = `background-image: url('${imageUrl}');`
    document.getElementById('toggle_image').style = `background: url('${imageUrl}') no-repeat center/cover;`
}

function resetBackImage() {
    document.getElementById('backimage_intern').style = ''
    document.getElementById('toggle_image').style = ''
}

function showThemeSelectors() {
    document.getElementById("theme-selectors").style.display = 'flex'
}

function hideThemeSelectors() {
    document.getElementById("theme-selectors").style.display = 'none'
    resetBackImage()
}



function toggleTheme() {
    const body = document.body;
    const currentTheme = body.getAttribute('data-theme');

    if (currentTheme === 'dark') {
        setLightTheme()
    } else {
        setDarkTheme()
    }
}

function setLightTheme() {
    body.setAttribute('data-theme', 'light');
    document.querySelector('meta[name="theme-color"]').setAttribute('content', '#fafafa');
}

function setDarkTheme(customColor) {
    if (customColor) {
        body.setAttribute('data-theme', 'dark');
        document.querySelector('meta[name="theme-color"]').setAttribute('content', customColor);
    } else {
        body.setAttribute('data-theme', 'dark');
        document.querySelector('meta[name="theme-color"]').setAttribute('content', '#181818');
    }
}

function setInitialTheme() {
    const userPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = localStorage.getItem('theme');

    if (theme) {
        if (theme === '0') {
            setTheme0()
        } else if (theme === '1') {
            setTheme1()
        } else if (theme === '2') {
            setTheme2()
        }
    } else {
        if (userPrefersDark) {
            setDarkTheme()
            setTheme2();
        } else {
            setLightTheme()
        }
    }
}

function listenForThemeChanges() {
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    // Adiciona um ouvinte para mudanças nas preferências do navegador
    darkModeMediaQuery.addEventListener('change', (event) => {
        const body = document.body;
        if (event.matches) {
            setTheme1()
            setDarkTheme()
        } else {
            setTheme0()
            setLightTheme()
        }
    });
}

function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
}

function getDominantColorFromImageUrl(imageUrl, callback) {
    const image = new Image();
    image.crossOrigin = "Anonymous"; // Isso é necessário se a imagem estiver hospedada em um domínio diferente
    image.src = imageUrl;

    image.onload = function() {
        // Cria um elemento canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Define as dimensões do canvas com base na imagem
        canvas.width = image.width;
        canvas.height = image.height;

        // Desenha a imagem no canvas
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

        // Obtém os dados dos pixels da imagem
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        let r = 0, g = 0, b = 0;
        const pixelCount = data.length / 4;

        // Percorre cada pixel
        for (let i = 0; i < data.length; i += 4) {
            r += data[i];       // Valor do Red
            g += data[i + 1];   // Valor do Green
            b += data[i + 2];   // Valor do Blue
        }

        // Calcula a média das cores
        r = Math.floor(r / pixelCount);
        g = Math.floor(g / pixelCount);
        b = Math.floor(b / pixelCount);

        // Converte a cor para o formato HEX
        const hexColor = rgbToHex(r, g, b);

        // Retorna a cor em formato HEX através do callback
        callback(hexColor);
    };

    image.onerror = function() {
        console.error('Erro ao carregar a imagem.');
        callback(null);
    };
}










  


/* DISABLE PINCH AND ZOOM */

document.addEventListener('gesturestart', function (e) {
    e.preventDefault();
});

document.addEventListener('gesturechange', function (e) {
    e.preventDefault();
});

document.addEventListener('gestureend', function (e) {
    e.preventDefault();
});

/* SERVICE WORKER */

// Detectar o esquema de cores do usuário e aplicar a cor de fundo correspondente
function applyColorScheme() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        // O usuário prefere tema escuro
        document.documentElement.style.setProperty('--background-color', '#181818');
        document.documentElement.style.setProperty('--theme_color', '#181818');
    } else {
        // O usuário prefere tema claro
        document.documentElement.style.setProperty('--background-color', '#fafafa');
        document.documentElement.style.setProperty('--theme_color', '#181818');
    }
}

// Ouvir por mudanças na preferência de esquema de cores
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyColorScheme);

function registerServiceWorker() {
    navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
            console.log('Service Worker registrado com sucesso:', registration);

            // Verificar se existe um Service Worker esperando para ser ativado
            if (registration.waiting) {
                updateServiceWorker(registration);
                return;
            }

            // Verificar se existe um Service Worker instalando
            if (registration.installing) {
                trackInstalling(registration.installing);
                return;
            }

            // Ouvir mudanças no estado do Service Worker
            registration.addEventListener('updatefound', () => {
                trackInstalling(registration.installing);
            });
        }).catch(error => {
            console.log('Falha ao registrar o Service Worker:', error);
        });
}

function trackInstalling(worker) {
    worker.addEventListener('statechange', () => {
        if (worker.state === 'installed') {
            updateServiceWorker(worker);
        }
    });
}

function updateServiceWorker(worker) {
    worker.postMessage({ type: 'SKIP_WAITING' });
}

navigator.serviceWorker.addEventListener('controllerchange', () => {
    window.location.reload();
});

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        registerServiceWorker();
    });
}
