var APIKey, localStorage, APIUrl;

window.onload = initialize();


function initialize() {
    APIUrl = 'https://www.forverkliga.se/JavaScript/api/crud.php?';
    localStorage = window.localStorage;
    localStorage.clear();

    fetchAPI('requestKey');

    document.getElementById('request-api-key-button').addEventListener('click', function() {
        fetchAPI('requestKey'); 
    });

    document.getElementById('add-button').addEventListener('click', function() {
        setupForm('input-form', 'add');
    });

    document.querySelectorAll('.input-text').forEach(element => {
        element.addEventListener('input', function() {
            validateInput(element);
        })
    });

    document.getElementById('submit-button').addEventListener('click', addBook);    

    document.getElementById('close').addEventListener('click', function() {closeForm(this.parentNode.parentNode)});


}

let counter = 1;
function fetchAPI(op, key, title, author, id) { 
    fetch(APIUrl + getQuerystring(op, key, title, author, id))
    .then((response) => {  
        if (response.status === 200) {
            return response.json();
        }
        else {
            throw new Error('Bad response');
        }
    })
    .then((data) => {
        if (data.status !== 'success' && counter <= 10) {
            counter++;
            fetchAPI(op, key, title, author, id);
        }
        else if (data.status === 'success') {
            counter = 0;            
        }
        updateStatus(op, data);   
        updateAPIKey(op, data);
        updateBookView(op, data);
    });  
}

function getQuerystring(op, key, title, author, id) {
    let queryString = '';
    switch(op) {
        case 'requestKey':
            return queryString += op;            
        case 'insert':
            return queryString += 'op=' + op + '&key=' + key + '&title=' + title + '&author=' + author;
        case 'select':
            return queryString += 'op=' + op + '&key=' + key;
        case 'update':
            return queryString += 'op=' + op + '&key=' + key + '&title=' + title + '&author=' + author + '&id=' + id;
        case 'delete':
            return queryString += 'op=' + op + '&key=' + key + '&id=' + id;
        default:
            return;
    }
}

function updateStatus(op, data) {
    let statusLabel = document.getElementById('status');
    statusLabel.textContent = 'Operation ' + op + ': ' + data.status;
    if (data.status === 'success') {
        statusLabel.style.background = '#97c98b';
    } 
    else {
        statusLabel.textContent += ' - ' + data.message;
        statusLabel.style.background = 'pink';
    } 
}

function updateAPIKey(op, data) {
    if (op === 'requestKey') {
        APIKey = data.key;
    }
    localStorage.setItem('item' + localStorage.length, APIKey);  
    document.getElementById('current-api-key').textContent = APIKey;  
}

function validateInput(inputField) {
    inputField.style.outlineColor = (inputField.value.length > 0) ? 'green' : 'red';
}

function setupForm(formId, action) {
    var form = document.getElementById(formId);
    if (!form.classList.contains(action)) {
        form.classList.add(action);
    }
    toggleForm(form);
    addHeading(form);
}

function addHeading(form) {
    var heading = document.getElementById('heading');
    if (form.style.display === 'block') {
        if (form.classList.contains('add')) {
            heading.innerHTML = 'Add Book Details';
        }
        else if (form.classList.contains('modify')) {
            heading.innerHTML = 'Modify Book Details';
        }
    }
}

function toggleForm(form) {
    form.style.display = (form.style.display === 'none') ? 'block' : 'none';
}

function addBook() {  
    let title = document.getElementById('input-title');
    let author = document.getElementById('input-author');
    if (title.value.length > 0 && author.value.length > 0) {
        fetchAPI('insert', APIKey, title, author);
    }
}

function updateBookView(op, data) {
    if (op === 'insert' && data.status == 'success') {
        var bookView = document.getElementById('book-list');
        bookView.innerHTML += '<tr id="' + data.id + '"><td class="id">' + data.id + '</td><td class="author">' + document.getElementById('input-author').value + '</td><td class="title">' + document.getElementById('input-title').value + '</td><td class="actions"><i class="fa fa-edit fa-2x" onclick="editBook(' + data.id + ')"></i><i class="fa fa-trash fa-2x" onclick="deleteBook(' + data.id + ')"></i></td></tr>';
    }
}

function closeForm(form) {
    document.getElementById(form.id).style.display = 'none';
}

function deleteBook(id) {
    (APIUrl + 'key=' + APIKey + '&op=delete&id=' + id)
    .then((response) => {
        return response.json();
    })
    .then((data) => {
        if (data.status !== 'success' && counter <= 10) {
            counter++; 
            deleteBook(id);
        }
        else {
            element = document.getElementById(id);
            element.parentNode.removeChild(element);
            counter = 0;

            // TODO: add feedback, statuslabel
        }
    })
}

function editBook(id) {
    toggleForm('input-form');
    document.getElementById('heading').innerHTML = "Modify Book Details";
}