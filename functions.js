var lastDate;
var dates = [];
var data;
var token;
var rowPosition = 0;
//Requisicao 
function getInfo() {
    document.getElementById("loader").style.display = "block";
    token = document.getElementById('token').value;
    var input = document.getElementById('token');
    input.value = "";
    stoppedTyping(input);
    axios.post('https://msging.net/commands', {
        id: "4a3d0851-6a7f-4e69-8a43-f8598145866e",
        method: "get",
        uri: "/threads?$take=100"
    }, {
        headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
        }
    }).then(function (response) {
        data = response.data.resource.items; //armazena apenas as threads
        data = data.sort(function (a, b) { //ordena por data
            return new Date(b.lastMessage.date) - new Date(a.lastMessage.date);
        });
        separateThreads(data); //Chama a funcao para criar a tabela
    })
        //Retorna uma mensagem de erro caso a requisicao esteja errada
        .catch(function (error) {
            if (error.response) {
                document.getElementById("loader").style.display = "none";
                alert("Token inserido é inválido!");
            } else if (error.request) {
                console.log(error.request);
            } else {
                console.log('Error', error.message);
            }
        });
}

//Analisa cada thread separadamente e cruza as informacoes para receber os dados do contato
function separateThreads(data) {
    for (var i = 0; i < data.length; i++) {
        lastDate = new Date(data[i].lastMessage.date);
        createDate(lastDate);
        getUserInfoToCreateTable(data[i].identity, i);
    }
}

//chama a Extensao Contacts para pegar dados do Contato e criar uma tabela
function getUserInfoToCreateTable(user, i) {
    axios.post('https://msging.net/commands', {
        id: (Date.now().toString(36) + Math.random().toString(36).substr(2, 5)).toUpperCase(),
        method: "get",
        uri: "/contacts/" + user
    }, {
        headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
        }
    }).then(function (response) {
        if (response.data.status == "failure") {
        } else {
            let user = response.data.resource;
            createTable(user, i);
        }
    });
}

//Cria a tabela, remove o "loading" e faz os componentes aparecerem na tela
function createTable(user, i) {
    var tr, td;
    var tbody = document.getElementById("data");
    tr = tbody.insertRow(-1);
    td = tr.insertCell(tr.cells.length);
    if (user) {
        if (user.photoUri) {
            td.innerHTML = "<img src=" + user.photoUri + ">";
        } else {
            td.innerHTML = "<img src='https://portal.blip.ai/fonts/UserNone.svg?7d8dc449af6584f485785babbad366d0'></img>";
        }

        td = tr.insertCell(tr.cells.length);
        if (typeof (user.name) != "undefined") {
            td.innerHTML = "<strong>" + user.name + "</strong>";
        }
        if (user.source == "0mn.io") {
            td = tr.insertCell(tr.cells.length);
            td.innerHTML = "BLiP Chat";
        } else {
            td = tr.insertCell(tr.cells.length);
            td.innerHTML = user.source;
        }
        td = tr.insertCell(tr.cells.length);
        td.innerHTML = user.identity;

        td = tr.insertCell(tr.cells.length);
        td.innerHTML = dates[i];

        td = tr.insertCell(tr.cells.length);
        td.innerHTML = "<button class='bp-btn bp-btn--bot bp-btn--small' id=" + data[i].identity + " onClick='openHistory(this)'>Ver</button>";

        td = tr.insertCell(tr.cells.length);
        td.innerHTML = "<label class='bp-input--check--wrapper mb4'>" +
            "<input class='bp-input' type='checkbox' onchange='enableExport()' name='checkbox-group' value=" + data[i].identity + ">" +
            "<div class='bp-input--checkbox'>&check;</div>" +
            "</label>";

    }
    document.getElementById("loader").style.display = "none";
    document.getElementById("page-content").style.display = "block";
    document.getElementById('bp-table').style.display = "table";
    document.getElementById('b-exportar').style.display = "initial";
    document.getElementById('b-exportar').disabled = true;
    document.getElementsByClassName('form-date')[0].style.display = "block";
}

function openHistory(item) {
    console.log(item.id);
}



//seleciona todos os checkboxes ao clicar no principal
function toggle(source) {
    checkboxes = document.getElementsByName('checkbox-group');
    for (var i = 0, n = checkboxes.length; i < n; i++) {
        checkboxes[i].checked = source.checked;
    }
    enableExport();
}

//formata a data para o padrao brasileiro
function createDate(lastDate) {
    var dd = lastDate.getDate();
    var mm = lastDate.getMonth() + 1; //January is 0!

    var yyyy = lastDate.getFullYear();
    if (dd < 10) {
        dd = '0' + dd;
    }
    if (mm < 10) {
        mm = '0' + mm;
    }
    var formatedDate = dd + '/' + mm + '/' + yyyy;
    dates.push(formatedDate);
    return dates;
}

//habilita ou desabilita o botao de visualizar caso haja ou nao um token no input
function stoppedTyping(input) {
    if (input.value.length > 0) {
        document.getElementById('b-visualizar').disabled = false;
    } else {
        document.getElementById('b-visualizar').disabled = true;
    }
}

//habilita e desabilita o botão de exportar caso haja pelo menos um checkbox selecionado
function enableExport() {
    var checkboxes = document.getElementsByName('checkbox-group');
    var checkedOne = Array.prototype.slice.call(checkboxes).some(x => x.checked);
    if (checkedOne) {
        document.getElementById('b-exportar').disabled = false;
    } else {
        document.getElementById('b-exportar').disabled = true;
        document.getElementsByName('checkbox-all')[0].checked = false;
    }
}

function exportCsv() {
    var checked = getElementsSelecteds();
    const rowsThreads = [
        ["ID do usuário", "Canal"]
    ];
    const rowsHistory = [
        ["Id do usuário", "Id da mensagem", "Direção", "Data", "Tipo", "Conteúdo"]
    ];

    checked.forEach(function (userId, index) {
        //arquivo de threads
        rowsThreads[index + 1] = [];
        rowsThreads[index + 1].push(userId); //id do usuario
        rowsThreads[index + 1].push(getUserSource(userId)); //canal do usuario

        //arquivo de historico
        getUserMessages(userId).then(function (response) {
            rowsHistory[rowPosition + 1] = [];
            rowsHistory[rowPosition + 1].push(userId);
            response.data.resource.items.forEach(function (message) {
                rowsHistory[rowPosition + 1].push(message.id);
                rowsHistory[rowPosition + 1].push(message.direction);
                rowsHistory[rowPosition + 1].push(message.date);
                rowsHistory[rowPosition + 1].push(message.type);
                rowsHistory[rowPosition + 1].push(message.content);
                rowPosition++;
                rowsHistory[rowPosition + 1] = [];
            });
        });
    });

    let csvThreads = "data:text/csv;charset=utf-8,";
    let csvHistory = "data:text/csv;charset=utf-8,";

    rowsThreads.forEach(function (rowArray) {
        var rowThread = rowArray.join(",");
        csvThreads += rowThread + "\r\n";
    });

    rowsHistory.forEach(function (rowArray) {
        var rowThread = rowArray.join(",");
        csvThreads += rowThread + "\r\n";
    });

    var encodedUriThreads = encodeURI(csvThreads);
    var encodedUriHistory = encodeURI(csvHistory);
    var linkThreads = document.createElement("a");
    var linkHistory = document.createElement("a");
    linkThreads.setAttribute("href", encodedUriThreads);
    linkThreads.setAttribute("download", "threads-" + data[0].ownerIdentity + ".csv");
    linkHistory.setAttribute("href", encodedUriHistory);
    linkHistory.setAttribute("download", "chat-history.csv");
    document.body.appendChild(linkThreads, linkHistory);

    linkThreads.click(); // Isso ira gerar o donwload do arquivo com o nome "{idBot}.csv".
    linkHistory.click();
}

//Pega as linhas da tabela que foram selecionadas
function getElementsSelecteds() {
    var checkedValue = [];
    var checkedElements = document.getElementsByName('checkbox-group');
    for (var i = 0; checkedElements[i]; ++i) {
        if (checkedElements[i].checked) {
            checkedValue[i] = checkedElements[i].value;
        }
    }
    return checkedValue;
}

function getUserInfo(userId) {
    return axios.post('https://msging.net/commands', {
        id: (Date.now().toString(36) + Math.random().toString(36).substr(2, 5)).toUpperCase(),
        method: "get",
        uri: "/contacts/" + userId
    }, {
        headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
        }
    });
}

function create_zip() {
    var zip = new JSZip();
    zip.add("hello1.txt", "Hello First World\n");
    zip.add("hello2.txt", "Hello Second World\n");
    content = zip.generate();
    location.href = "data:application/zip;base64," + content;
}

function getUserSource(userId) {
    var source = userId.split("@");
    var channel = source[1].split(".");
    var userChannel = channel[0].charAt(0).toUpperCase() +
        channel[0].slice(1);
    if (userChannel == "0mn") {
        return "BLiP Chat";
    } else {
        return userChannel;
    }
}


function filter() {
    // Declare variables
    var initialDate, finalDate, table, tr, td, i, txtValue;
    initialDate = document.getElementById("initial").value;
    finalDate = document.getElementById("final").value;
    initialDate = new Date(initialDate).getTime();
    finalDate = new Date(finalDate).getTime();
    table = document.getElementById("bp-table");
    tr = table.getElementsByTagName("tr");

    // Loop through all table rows, and hide those who don't match the search query
    for (i = 0; i < tr.length; i++) {
        td = tr[i].getElementsByTagName("td")[4];
        if (td) {
            txtValue = td.textContent || td.innerText;
            console.log(txtValue);
            txtValue = new Date(txtValue).getTime();
            console.log(txtValue);
            if ((txtValue >= initialDate) && (txtValue <= finalDate)) {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }
        }
    }
}

function getUserMessages(userId) {
    return axios.post('https://msging.net/commands', {
        id: (Date.now().toString(36) + Math.random().toString(36).substr(2, 5)).toUpperCase(),
        method: "get",
        uri: "/threads/" + userId
    }, {
        headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
        }
    });
}