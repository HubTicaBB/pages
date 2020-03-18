var APIKey, localStorage, APIUrl;

window.onload = initialize();


function initialize() {
    APIUrl = 'https://www.forverkliga.se/JavaScript/api/crud.php';
    fetchAPI();
    localStorage = window.localStorage;
    localStorage.clear();
    document.getElementById('form').style.display = 'none';
    document.getElementById('request-api-key-button').addEventListener('click', fetchAPI);
    document.getElementById('add-button').addEventListener('click', toggleForm);
    document.getElementById('submit-book-button').addEventListener('click', addBook);    
    document.getElementById('close').addEventListener('click', function() {closeForm(this.parentNode.parentNode)});
}

function fetchAPI() {
    fetch(APIUrl + '?requestKey')
    .then((response) => {
        if (response.status !== 200) {
            // TODO: alla AJAX-anrop som misslyckas upprepas tills de går igenom (men maximalt 10 gånger)
            console.log('Fetching failed: status code: ' + response.status);
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

function toggleForm() {
    var form = document.getElementById('form');
    form.style.display = (form.style.display === 'none') ? 'block' : 'none';
    if (form.style.display === 'block') {
        document.getElementById('heading').innerHTML = "Add Book Details";
        document.getElementById('input-title').addEventListener('input', function() {validateInput(this)});
        document.getElementById('input-author').addEventListener('input', function() {validateInput(this)}); 
    }
}

function validateInput(inputField) {
    inputField.style.outlineColor = (inputField.value.length > 0) ? 'green' : 'red';
}

let counter = 1;
function addBook() {    
    let statusLabel =  document.getElementById('add-status');
    statusLabel.textContent = 'Submitting request...';  
    statusLabel.style.background = 'grey';

    fetch(APIUrl + '?key=' + APIKey + '&op=insert&title=' + document.getElementById('input-title').value + '&author=' + document.getElementById('input-author').value)
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

function updateStatus(data) {
    let statusLabel = document.getElementById('add-status');
    statusLabel.textContent = 'Status:\t' + data.status;
    if (data.status === 'success') {
        statusLabel.style.background = '#97c98b';
        updateBookView(data);
    } 
    else  if (data.status === 'error') {
        statusLabel.textContent += ' - ' + data.message;
        statusLabel.style.background = 'pink';
    } 
}

function updateBookView(data) {
    var bookView = document.getElementById('book-list');
    bookView.innerHTML += '<tr id="' + data.id + '"><td class="id">' + data.id + '</td><td class="author">' + document.getElementById('input-author').value + '</td><td class="title">' + document.getElementById('input-title').value + '</td><td class="actions"><i class="fa fa-edit fa-2x" onclick="editBook(' + data.id + ')"></i><i class="fa fa-trash fa-2x" onclick="deleteBook(' + data.id + ')"></i></td></tr>';
}

function closeForm(form) {
    document.getElementById(form.id).style.display = 'none';
}

function deleteBook(id) {
    fetch(APIUrl + '?key=' + APIKey + '&op=delete&id=' + id)
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
    toggleForm();
    document.getElementById('heading').innerHTML = "Modify Book Details";
}