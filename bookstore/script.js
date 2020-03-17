var APIKey, localStorage, APIUrl;

window.onload = initialize();


function initialize() {
    APIUrl = 'https://www.forverkliga.se/JavaScript/api/crud.php';
    fetchAPI();
    localStorage = window.localStorage;
    localStorage.clear();
    document.getElementById('add-form').style.display = 'none';
    document.getElementById('request-api-key-button').addEventListener('click', fetchAPI);
    document.getElementById('add-button').addEventListener('click', toggleAddBookForm);
    document.getElementById('submit-book-button').addEventListener('click', function(e) {addBook();});    
    document.getElementById('close').addEventListener('click', closeForm);
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

function toggleAddBookForm() {
    var addBookForm = document.getElementById('add-form');
    addBookForm.style.display = (addBookForm.style.display === 'none') ? 'block' : 'none';
    if (addBookForm.style.display === 'block') {
        document.getElementById('input-title').addEventListener('input', function() {validateInput(this)});
        document.getElementById('input-author').addEventListener('input', function() {validateInput(this)}); 
    }
}

function validateInput(inputField) {
    inputField.style.outlineColor = (inputField.value.length > 0) ? 'green' : 'red';
}

let counter = 1;
function addBook(e) {    
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
            addBook(e);
        }
        else {
            updateStatus(data, e);
            counter = 0;
        }
    })
}

function updateStatus(data, e) {
    let statusLabel = document.getElementById('add-status');
    statusLabel.textContent = 'Status:\t' + data.status;
    if (data.status === 'success') {
        statusLabel.style.background = '#97c98b';
        updateBookView(data, e);
    } 
    else  if (data.status === 'error') {
        statusLabel.textContent += ' - ' + data.message;
        statusLabel.style.background = 'pink';
    } 
}

function updateBookView(data, e) {
    var bookView = document.getElementById('book-list');
    bookView.innerHTML += '<tr><td class="id">' + data.id + '</td><td class="author">' + document.getElementById('input-author').value + '</td><td class="title">' + document.getElementById('input-title').value + '</td><td class="actions"><i class="fa fa-edit fa-2x"></i><i class="fa fa-trash fa-2x"></i></td></tr>';
}

function closeForm() {
    document.getElementById('add-form').style.display = 'none';
}