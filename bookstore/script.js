var APIKey;
var localStorage = window.localStorage;
localStorage.clear();

document.getElementById('request-api-key-button').addEventListener('click', fetchAPI);

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
        document.getElementById('api-key').textContent = APIKey;     
        localStorage.setItem('item' + localStorage.length, APIKey);
    })
}
