var APIKey, localStorage;

window.onload = initialize();


function initialize() {
    fetchAPI();
    localStorage = window.localStorage;
    localStorage.clear();
    document.getElementById('add-form').style.display = 'none';
    document.getElementById('request-api-key-button').addEventListener('click', fetchAPI);
    document.getElementById('add-button').addEventListener('click', toggleAddBookForm);
    document.getElementById('submit-book-button').addEventListener('click', addBook);
}

function fetchAPI() {
    fetch('https://www.forverkliga.se/JavaScript/api/crud.php?requestKey')
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
}

function validateInput(inputField) {
    if (inputField.value.length > 0) { // TODO: Lägga till regex validation (alphanummeric)
        console.log('inputField.textContent.length - ' + inputField.value.length);
        inputField.style.outlineColor = 'green';
    }
    else {
        console.log('inputField.textContent.length - ' + inputField.value.length);
        inputField.style.outlineColor = 'red';
    }
}

function addBook() {
}


