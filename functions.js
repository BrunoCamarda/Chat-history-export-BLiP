
//Request 
function getInfo() {
    let token = document.getElementById('token').value;
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
        populate(data); //Chama a funcao para criar a tabela
    });
}


function stoppedTyping(input) {
    if (input.value.length > 0) {
        document.getElementById('b-visualizar').disabled = false;
    } else {
        document.getElementById('b-visualizar').disabled = true;
    }
}

function createTable(response) {
    let data = response.data.resource.items; //armazena apenas as threads
    console.log(data);
    var table = document.getElementById('example-table');
    let threads = Object.keys(data[0]);
    generateTableHead(table, threads);
    generateTable(table, data);
}

function generateTableHead(table, threads) {
    if (!table.tHead) {
        let thead = table.createTHead();
        let row = thead.insertRow();
    }
    for (let key of data) {
        let th = document.createElement("th");
        let text = document.createTextNode(key);
        th.appendChild(text);
        row.appendChild(th);
    }
}

function generateTable(table, data) {
    for (let element of data) {
        let row = table.insertRow();
        for (key in element) {
            let cell = row.insertCell();
            let text = document.createTextNode(element[key]);
            cell.appendChild(text);
        }
    }
}


function populate(data) {
    var tr, td;
    var tbody = document.getElementById("data");

    // loop through data source
    for (var i = 0; i < data.length; i++) {
        tr = tbody.insertRow(tbody.rows.length);
        td = tr.insertCell(tr.cells.length);
        td.setAttribute("align", "center");
        td.innerHTML = data[i].identity;
        td = tr.insertCell(tr.cells.length);
        td.innerHTML = data[i].lastMessage.content;
        td = tr.insertCell(tr.cells.length);
        td.innerHTML = data[i].lastMessage.date;
        td = tr.insertCell(tr.cells.length);
        td.innerHTML = data[i].lastMessage.type;
        td = tr.insertCell(tr.cells.length);
        td.innerHTML = data[i].Gender;

    }

}
