var APIKey, localStorage, APIUrl, standardBody;

localStorage.clear();
localStorage = window.localStorage;
window.onload = initialize();
fetchAPI('requestKey', updateAPIKey);
window.dispatchEvent(new Event('resize'));

function initialize() {    
    standardBody = document.body.innerHTML;
    APIUrl = 'https://www.forverkliga.se/JavaScript/api/crud.php?';    
    
    document.getElementById('request-api-key-button').addEventListener('click', requestNewAPIKey);
    document.getElementById('add-button').addEventListener('click', function() {
        setupForm('add');
    });
    document.querySelectorAll('.input-text').forEach(element => {
        element.addEventListener('input', function() {
            validateInputDynamically(element);
        })
    });    
    document.getElementById('submit-button').addEventListener('click', function() {
        submitBookData(this.classList);
    });    
    document.getElementById('close').addEventListener('click', closeForm);
    window.addEventListener('resize', adjustContent);
}

function requestNewAPIKey() {
    fetchAPI('requestKey', updateAPIKey);
}

let counter = 1;
function fetchAPI(op, callback, key, title, author, id) { 
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
            fetchAPI(op, callback, key, title, author, id);
        }
        else if (data.status === 'success') {
            counter = 0;            
        }
        updateStatus(op, data);
        callback(data);
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
    if (op !== 'select') {
        let statusLabel = document.getElementById('status');
        if (statusLabel) {
            statusLabel.textContent = 'Operation ' + op + ': ' + data.status;
            if (data.status === 'success') {
                statusLabel.style.background = '#97c98b';
            } 
            else {
                statusLabel.textContent += ' - ' + data.message;
                statusLabel.style.background = 'pink';
            } 
        }
    }
}

function updateAPIKey(data) {
    if (data) {
        APIKey = data.key;
        localStorage.setItem('item' + localStorage.length, APIKey);
        fetchAPI('select', updateBookView, data.key);
    }      
    let APIKeyField = document.getElementById('current-api-key');
    if (APIKeyField) {
        let lastStorageIndex = localStorage.length - 1;
        let lastAPIKey = 'item'+lastStorageIndex;
        APIKeyField.textContent = (data) ? APIKey : localStorage.getItem(lastAPIKey); 
    }
}

function validateInputDynamically(inputField) {
    inputField.style.outlineColor = (inputField.value.length > 0) ? 'green' : 'red';
}

function setupForm(action, bookId) {
    var form = document.getElementById('input-form');
    if (!form.classList.contains(action)) {
        form.classList.add(action);
    }
    toggleForm(form);
    updateInstructions(form, bookId);
}

function updateInstructions(form, bookId) {
    var heading = document.getElementById('heading');
    var titleField = document.getElementById('input-title');
    var authorField = document.getElementById('input-author');
    var submitButton = document.getElementById('submit-button');
    if (form.style.display === 'block') {
        if (form.classList.contains('add')) {
            heading.innerHTML = 'Add Book Details';
            titleField.placeholder = 'Book Title';
            authorField.placeholder = 'Author\'s Name';
            submitButton.classList.add('add');
        }
        else if (form.classList.contains('modify')) {
            heading.innerHTML = 'Modify Book Details';
            titleField.placeholder = 'New Book Title';
            authorField.placeholder = 'New Author\'s Name';
            submitButton.classList.add('modify');
            submitButton.classList.add(bookId);
        }
    }
    form.classList.remove('add');
    form.classList.remove('modify');
}

function toggleForm(form) {
    form.style.display = (form.style.display === 'none') ? 'block' : 'none';
}

function submitBookData(buttonClassList) {
    let title = document.getElementById('input-title').value;
    let author = document.getElementById('input-author').value;
    if (title.length > 0 && author.length > 0) {
        if (buttonClassList.contains('add')) {
            buttonClassList.remove('add');
            fetchAPI('insert', getBooks, APIKey, title, author);
        }
        else if (buttonClassList.contains('modify')) {
            buttonClassList.remove('modify');
            if (buttonClassList.length > 1) buttonClassList.remove(buttonClassList[0]);
            let id = buttonClassList;
            fetchAPI('update', getBooks, APIKey, title, author, id);
        }
    }
    else {
        alert('Both "Book Title" and "Author\'s name" are mandatory fields!');
    }
}

function getBooks(data) {
    if ((data && data.status === 'success') || !data) {
        fetchAPI('select', updateBookView, APIKey);
        
        document.getElementById('input-title').value = '';
        document.getElementById('input-author').value = '';        
    }
    closeForm();
}

function updateBookView(booksData) {
    if (booksData.status === 'success') {
        var bookView = document.getElementById('book-list');
        let htmlElement = '';
        booksData.data.forEach(book => {
            htmlElement += '<tr id="' + book.id + '"><td class="id">' + book.id + '</td><td class="author">' + book.author + '</td><td class="title">' + book.title + '</td><td class="actions"><i class="fa fa-edit fa-2x" title="Edit" onclick="setupForm(\'modify\', ' + book.id + ')"></i><i class="fa fa-trash fa-2x" title="Remove" onclick="toBeDeleted(' + book.id + ')"></i></td></tr>';
        });
        if(bookView) {
            bookView.innerHTML = htmlElement;
        }
    }
}

function toBeDeleted(bookId) {
    var bookToDelete = document.getElementById(bookId);
    bookToDelete.classList.add('toBeDeleted');
    alert('The book (id: ' + bookToDelete.id + ') is going to be permanently deleted.');
    fetchAPI('delete', getBooks, APIKey, undefined, undefined, bookId);
}

function closeForm() {
    document.getElementById('input-form').style.display = 'none';
}

function adjustContent() {
    if (window.innerWidth < 1000) {
        document.body.innerHTML = '<p style="color:white; font-size: 8vmin; margin: 10%">In order to be able to use such a great tool, you will need to buy a proper device with a decent screen size.</p><script src="script.js"></script>'
    }
    else {
        document.body.innerHTML = standardBody;
        initialize();
        updateAPIKey();
        getBooks();
    }
}
