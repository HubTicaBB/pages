var APIKey, localStorage, APIUrl;

window.onload = initialize();


function initialize() {
    APIUrl = 'https://www.forverkliga.se/JavaScript/api/crud.php?';
    localStorage = window.localStorage;
    localStorage.clear();
    fetchAPI('requestKey');

    document.getElementById('request-api-key-button').addEventListener('click', fetchAPI);
    document.getElementById('add-button').addEventListener('click', function() { setupForm('input-form'); });
    document.getElementById('submit-book-button').addEventListener('click', addBook);    
    document.getElementById('close').addEventListener('click', function() {closeForm(this.parentNode.parentNode)});
}

let counter = 1;
function fetchAPI(op, key, title, author, id) {    
    fetch(APIUrl + getQuerystring(op, key, title, author, id))
    .then((response) => {  
        return response.json();
    })
    .then((data) => {
        if (data.status !== 'success' && counter <= 10) {
            counter++;
            fetchAPI(op, key, title, author, id);
        }
        else {
            counter = 0;
            updateStatus(op, data);
        }
    })
}

function updateStatus(op, data) {
    let statusLabel = document.getElementById('status');
    statusLabel.textContent = 'Operation ' + op + ': ' + data.status;
    if (data.status === 'success') {
        statusLabel.style.background = '#97c98b';
    } 
    else if (data.status === 'error') {
        statusLabel.textContent += ' - ' + data.message;
        statusLabel.style.background = 'pink';
    } 
}


function fetchAPI2() {
    fetch(APIUrl + 'requestKey')
    .then((response) => {
        if (response.status !== 200) {
            // TODO: alla AJAX-anrop som misslyckas upprepas tills de går igenom (men maximalt 10 gånger)
            return;
        }
        else { return response.json(); }
    })
    .then((data) => {
        APIKey = data.key;    
        document.getElementById('current-api-key').textContent = APIKey;     
        localStorage.setItem('item' + localStorage.length, APIKey);
    })
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

function setupForm(formId) {
    toggleForm(formId);
}

function toggleForm(formId) {
    var form = document.getElementById(formId);
    form.style.display = (form.style.display === 'none') ? 'block' : 'none';
    return form.style.display = (form.style.display === 'none') ? 'block' : 'none';
}

function setupInputForm(form) {
    if (form.style.display === 'block') {
        document.getElementById('heading').innerHTML = "Add Book Details";
        document.getElementById('input-title').addEventListener('input', function() {validateInput(this)});
        document.getElementById('input-author').addEventListener('input', function() {validateInput(this)}); 
    }
}

function validateInput(inputField) {
    inputField.style.outlineColor = (inputField.value.length > 0) ? 'green' : 'red';
}

function addBook() {    
    let statusLabel =  document.getElementById('status');
    statusLabel.textContent = 'Submitting request...';  
    statusLabel.style.background = 'grey';

    fetch(APIUrl + 'key=' + APIKey + '&op=insert&title=' + document.getElementById('input-title').value + '&author=' + document.getElementById('input-author').value)
    .then((response) => {
        return response.json();
    })
    .then((data) => {
        if (data.status !== 'success' && counter <= 10) {
            counter++; 
            addBook();
        }
        else {
            updateStatus(data);
            counter = 0;
        }
    })
}

function updateBookView(data) {
    var bookView = document.getElementById('book-list');
    bookView.innerHTML += '<tr id="' + data.id + '"><td class="id">' + data.id + '</td><td class="author">' + document.getElementById('input-author').value + '</td><td class="title">' + document.getElementById('input-title').value + '</td><td class="actions"><i class="fa fa-edit fa-2x" onclick="editBook(' + data.id + ')"></i><i class="fa fa-trash fa-2x" onclick="deleteBook(' + data.id + ')"></i></td></tr>';
}

function closeForm(form) {
    document.getElementById(form.id).style.display = 'none';
}

function deleteBook(id) {
    s(APIUrl + 'key=' + APIKey + '&op=delete&id=' + id)
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