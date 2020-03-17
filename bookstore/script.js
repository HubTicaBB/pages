var APIKey, localStorage;

window.onload = initialize();
document.getElementById('request-api-key-button').addEventListener('click', fetchAPI);
document.getElementById('add-button').addEventListener('click', addBook);

function initialize() {
    fetchAPI();
    localStorage = window.localStorage;
    localStorage.clear();
    document.getElementById('add-form').style.display = 'none';
}

function fetchAPI() {
    fetch('https://www.forverkliga.se/JavaScript/api/crud.php?requestKey')
    .then((response) => {
        if (response.status !== 200) {
            // TODO: alla AJAX-anrop som misslyckas upprepas tills de går igenom (men maximalt 10 gånger)
            console.log('Fetching failed: status code: ' + response.status);
            return;
        }
        else {
            return response.json();
        }
    })
    .then((data) => {
        APIKey = data.key;    
        document.getElementById('current-api-key').textContent = APIKey;     
        localStorage.setItem('item' + localStorage.length, APIKey);
    })
}

function addBook() {
    toggleAddBookForm();
}

function toggleAddBookForm() {
    var addBookForm = document.getElementById('add-form');
    addBookForm.style.display = (addBookForm.style.display === 'none') ? 'block' : 'none';
}

