// sender.js

let mapSender;
let markerSender;
let watchId; // Para almacenar el ID del watcher de geolocalización

// Función de inicialización del mapa
document.addEventListener('DOMContentLoaded', () => {
    // Coordenadas iniciales (ej. centro de San Salvador, El Salvador)
    const initialCoords = [13.6929, -89.2182]; // Leaflet usa [lat, lng]

    mapSender = L.map('map_sender').setView(initialCoords, 12); // 'map_sender' es el ID del div

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapSender);

    markerSender = L.marker(initialCoords).addTo(mapSender)
        .bindPopup("Tu ubicación")
        .openPopup();
});


function enviarUbicacionEnTiempoReal() {
    const ubicacionTexto = document.getElementById("ubicacion_actual_texto");
    if (navigator.geolocation) {
        ubicacionTexto.innerHTML = "<p>Estado: Compartiendo ubicación...</p>";

        const options = {
            enableHighAccuracy: true,
            timeout: 30000,
            maximumAge: 0,
        };

        watchId = navigator.geolocation.watchPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                const newCoords = [lat, lng]; // Leaflet usa [lat, lng]

                // Actualizar marcador en el mapa del emisor
                markerSender.setLatLng(newCoords);
                mapSender.setView(newCoords, 15); // Centrar y hacer zoom en la nueva ubicación

                ubicacionTexto.innerHTML = `<p>Estado: Compartiendo ubicación.</p>
                                          <p>Latitud: ${lat.toFixed(6)}</p>
                                          <p>Longitud: ${lng.toFixed(6)}</p>`;

                // Guardar la ubicación en Firestore
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
            },
            (error) => {
                console.error("Error al obtener la ubicación:", error);
                ubicacionTexto.innerHTML = `<p>Error: ${error.message}. Por favor, permite el acceso a la ubicación.</p>`;
                alert(`Error al obtener la ubicación: ${error.message}`);
            },
            options
        );
    } else {
        ubicacionTexto.innerHTML = "<p>Tu navegador no soporta la geolocalización.</p>";
        alert("Tu navegador no soporta la geolocalización.");
    }
}

function detenerEnvioUbicacion() {
    if (watchId) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
        document.getElementById("ubicacion_actual_texto").innerHTML = "<p>Estado: Envío de ubicación detenido.</p>";
        console.log("Envío de ubicación detenido.");
        alert("Envío de ubicación detenido.");
    } else {
        alert("No se está compartiendo ninguna ubicación.");
    }
}