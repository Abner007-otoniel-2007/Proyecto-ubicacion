// receiver.js

let mapReceiver;
let markerReceiver;

// Función de inicialización del mapa
document.addEventListener('DOMContentLoaded', () => {
    // Coordenadas iniciales (ej. centro de San Salvador, El Salvador)
    const initialCoords = [13.6929, -89.2182]; // Leaflet usa [lat, lng]

    mapReceiver = L.map('map_receiver').setView(initialCoords, 12); // 'map_receiver' es el ID del div

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapReceiver);

    // Creamos el marcador sin posición inicial, se actualizará al recibir datos
    markerReceiver = L.marker(initialCoords).addTo(mapReceiver)
        .bindPopup("Ubicación del emisor");

    // Una vez que el mapa esté listo, empieza a escuchar la ubicación
    escucharUbicacionEnTiempoReal();
});


function escucharUbicacionEnTiempoReal() {
    const ubicacionDisplay = document.getElementById("ubicacion_texto");

    db.collection("ubicaciones").doc("ubicacion_actual")
        .onSnapshot((doc) => {
            if (doc.exists) {
                const data = doc.data();
                const lat = data.latitude;
                const lng = data.longitude;
                const timestamp = data.timestamp ? new Date(data.timestamp.toDate()).toLocaleString() : 'Desconocido';

                const newCoords = [lat, lng]; // Leaflet usa [lat, lng]

                // Actualizar marcador en el mapa del receptor
                markerReceiver.setLatLng(newCoords).openPopup();
                mapReceiver.setView(newCoords, 15); // Centrar el mapa y hacer zoom

                ubicacionDisplay.innerHTML = `
                    <p><strong>Ubicación Actualizada:</strong></p>
                    <p>Latitud: ${lat.toFixed(6)}</p>
                    <p>Longitud: ${lng.toFixed(6)}</p>
                    <p>Última actualización: ${timestamp}</p>
                `;
                console.log("Ubicación recibida en tiempo real:", data);
            } else {
                ubicacionDisplay.innerHTML = "<p>Esperando ubicación del emisor...</p>";
                console.log("No se encontró la ubicación actual.");
            }
        }, (error) => {
            console.error("Error al escuchar la ubicación en tiempo real:", error);
            ubicacionDisplay.innerHTML = "<p>Error al cargar la ubicación del emisor.</p>";
        });
}