var lastDate;
var dates = [];
//Request 
function getInfo() {
    document.getElementById("loader").style.display = "block";
    let token = document.getElementById('token').value;
    var input = document.getElementById('token');
    input.value = "";
    stoppedTyping(input);
    axios.post('https://msging.net/commands', {
        id: "4a3d0851-6a7f-4e69-8a43-f8598145866e",
        method: "get",
        uri: "/threads"
    }, {
        headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
        }
    }).then(function (response) {
        let data = response.data.resource.items; //armazena apenas as threads
        data = data.sort(function (a, b) { //ordena por data
            return new Date(b.lastMessage.date) - new Date(a.lastMessage.date);
        });
        populate(data, token); //Chama a funcao para criar a tabela
    });
}

function populate(data, token) {
    for (var i = 0; i < data.length; i++) {
        lastDate = new Date(data[i].lastMessage.date);
        console.log(lastDate);
        createDate(lastDate);
        getUserInfo(data[i].identity, token, i);
    }
}

function getUserInfo(user, token, i) {
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

function createTable(user, i) {
    var tr, td;
    var tbody = document.getElementById("data");
    tr = tbody.insertRow(tbody.rows.length);
    td = tr.insertCell(tr.cells.length);
    if (user) {
        if (user.photoUri) {
            td.innerHTML = "<img src=" + user.photoUri + ">";
        } else {
            td.innerHTML = "<img src='https://portal.blip.ai/fonts/UserNone.svg?7d8dc449af6584f485785babbad366d0'></img>";
        }

        td = tr.insertCell(tr.cells.length);
        if (typeof(user.name) != "undefined") {
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
        td.innerHTML = "<label class='bp-input--check--wrapper mb4'>" +
            "<input class='bp-input' type='checkbox' name='checkbox-group' value='2'>" +
            "<div class='bp-input--checkbox'>&check;</div>" +
            "</label>";
    }
    document.getElementById("loader").style.display = "none";
    document.getElementById("page-content").style.display = "block";
    document.getElementById('bp-table').style.display = "table";
    document.getElementById('b-exportar').style.display = "initial";
    document.getElementsByClassName('form-date')[0].style.display = "block";
}


function toggle(source) { //seleciona todos os checkboxes ao clicar no principal
    checkboxes = document.getElementsByName('checkbox-group');
    for (var i = 0, n = checkboxes.length; i < n; i++) {
        checkboxes[i].checked = source.checked;
    }
}

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

function stoppedTyping(input) {
    if (input.value.length > 0) {
        document.getElementById('b-visualizar').disabled = false;
    } else {
        document.getElementById('b-visualizar').disabled = true;
    }
}
