let map;
let path = []; 
let markers = [];

function initMap() {

    map = L.map('map').setView([54.5260, -2.5479], 6);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
    }).addTo(map);
}

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

function showPosition(position) {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    const time = new Date().toLocaleTimeString();

    $.get(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`, function(data) {
        const address = data.display_name;
        addToTable(time, address, lat, lng);
        markOnMap(time, address, lat, lng);
    });
}

function showError(error) {
    switch (error.code) {
        case error.PERMISSION_DENIED:
            alert("User denied the request for Geolocation.");
            break;
        case error.POSITION_UNAVAILABLE:
            alert("Location information is unavailable.");
            break;
        case error.TIMEOUT:
            alert("The request to get user location timed out.");
            break;
        case error.UNKNOWN_ERROR:
            alert("An unknown error occurred.");
            break;
    }
}

function addToTable(time, address, lat, lng) {
    const table = document.getElementById('data-table').getElementsByTagName('tbody')[0];
    const newRow = table.insertRow();
    newRow.insertCell(0).innerText = time;
    newRow.insertCell(1).innerText = address;
    newRow.insertCell(2).innerText = lat;
    newRow.insertCell(3).innerText = lng;
}

function markOnMap(time, address, lat, lng) {
    const position = [lat, lng];
    path.push(position); 

    const marker = L.marker(position).addTo(map)
        .bindPopup(`${time}: ${address}`).openPopup();
    markers.push(marker);

    if (path.length > 1) {
        L.polyline(path, { color: '#FF0000' }).addTo(map); 
    }

    map.setView(position, 13); 
}

function uploadData() {
    const table = document.getElementById('data-table').getElementsByTagName('tbody')[0];
    const dataToUpload = [];

    for (let row of table.rows) {
        const time = row.cells[0].innerText;
        const address = row.cells[1].innerText;
        const lat = parseFloat(row.cells[2].innerText);
        const lng = parseFloat(row.cells[3].innerText);

        dataToUpload.push({
            time: time,
            address: address,
            latitude: lat,
            longitude: lng
        });
    }

    console.log('Data to upload:', JSON.stringify(dataToUpload)); 

    fetch('http://localhost/gps/tracker/upload.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToUpload),
    })
    .then(response => {
        console.log('Response status:', response.status);
        if (!response.ok) {
            return response.json().then(errorData => {
                console.log('Error data:', errorData);
                throw new Error('Network response was not ok: ' + JSON.stringify(errorData));
            });
        }
        return response.json();
    })
    .then(data => {
        console.log('Upload successful:', data);
        alert('Data uploaded successfully!');
    })
    .catch((error) => {
        console.error('Upload error:', error);
        alert('There was a problem with the upload: ' + error.message);
    });
}

window.onload = initMap;
