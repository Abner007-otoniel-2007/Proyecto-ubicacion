let mapSender;
let markerSender;
let envioIntervalId = null; // ID del intervalo para poder detenerlo

// Función de inicialización del mapa
document.addEventListener('DOMContentLoaded', () => {
    const initialCoords = [13.6929, -89.2182]; // Coordenadas iniciales (San Salvador)

    mapSender = L.map('map_sender').setView(initialCoords, 12); // Crea el mapa

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(mapSender);

    markerSender = L.marker(initialCoords).addTo(mapSender)
        .bindPopup("Tu ubicación")
        .openPopup();
});

function enviarUbicacionEnTiempoReal() {
    const ubicacionTexto = document.getElementById("ubicacion_actual_texto");

    if (!navigator.geolocation) {
        ubicacionTexto.innerHTML = "<p>Tu navegador no soporta la geolocalización.</p>";
        alert("Tu navegador no soporta la geolocalización.");
        return;
    }

    ubicacionTexto.innerHTML = "<p>Estado: Compartiendo ubicación...</p>";

    const options = {
        enableHighAccuracy: true,
        timeout: 30000,
        maximumAge: 0,
    };

    // Primero obtenemos y mostramos la ubicación actual una vez
    navigator.geolocation.getCurrentPosition((position) => {
        actualizarUbicacion(position, ubicacionTexto);
    }, (error) => {
        mostrarError(error, ubicacionTexto);
    }, options);

    // Luego comenzamos a enviar la ubicación cada 10 segundos
    envioIntervalId = setInterval(() => {
        navigator.geolocation.getCurrentPosition((position) => {
            actualizarUbicacion(position, ubicacionTexto);
        }, (error) => {
            mostrarError(error, ubicacionTexto);
        }, options);
    }, 10000); // Cada 10 segundos
}

function actualizarUbicacion(position, ubicacionTexto) {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    const newCoords = [lat, lng];

    // Actualiza el marcador y centra el mapa
    markerSender.setLatLng(newCoords);
    mapSender.setView(newCoords, 15);

    ubicacionTexto.innerHTML = `<p>Estado: Compartiendo ubicación.</p>
                                <p>Latitud: ${lat.toFixed(6)}</p>
                                <p>Longitud: ${lng.toFixed(6)}</p>`;

    // Enviar a Firestore
    db.collection("ubicaciones").doc("ubicacion_actual").set({
        latitude: lat,
        longitude: lng,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
        console.log("Ubicación enviada a Firestore.");
    })
    .catch((error) => {
        console.error("Error al enviar la ubicación a Firestore:", error);
    });
}

function mostrarError(error, ubicacionTexto) {
    console.error("Error al obtener la ubicación:", error);
    ubicacionTexto.innerHTML = `<p>Error: ${error.message}. Por favor, permite el acceso a la ubicación.</p>`;
    alert(`Error al obtener la ubicación: ${error.message}`);
}

function detenerEnvioUbicacion() {
    if (envioIntervalId !== null) {
        clearInterval(envioIntervalId);
        envioIntervalId = null;
        document.getElementById("ubicacion_actual_texto").innerHTML = "<p>Estado: Envío de ubicación detenido.</p>";
        console.log("Envío de ubicación detenido.");
        alert("Envío de ubicación detenido.");
    } else {
        alert("No se está compartiendo ninguna ubicación.");
    }
}
