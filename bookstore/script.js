var APIKey;

document.getElementById('request-api-key-button').addEventListener('click', fetchAPI());

function fetchAPI () {
    fetch('https://www.forverkliga.se/JavaScript/api/crud.php?requestKey')
        .then((response) => {
            return response.json();
        })
        .then((data) => {
            APIKey = data.key;            
        })
}
