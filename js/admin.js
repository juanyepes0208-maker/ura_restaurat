// EXPLICACIÓN: Este evento se dispara cada vez que la página se muestra en pantalla
window.addEventListener('pageshow', function(event) { // It will listen what is happen in the whole tab, the event is pageshow
    // SINTAXIS: event.persisted es verdadero si la página se cargó desde la memoria RAM (BFCache / botón atrás)
    if (event.persisted) { // It evalues if what is inside of this fucntion is false or correct, false if the user clicks to
        // come back, through cache
        // LÓGICA: Si el usuario llegó aquí dando clic al botón "Atrás", 
        // obligamos a la página a recargarse por completo desde el servidor.
        // Al recargarse, Express verá que ya no hay sesión y lo botará al login.
        window.location.reload(); // It forgot what you are showing
        document.querySelector("#user").value = "";
        document.querySelector("#password").value = "";
    }
});

document.querySelector("#image").addEventListener("change", function() {
    // Buscamos o creamos el contenedor de la imagen dinámicamente si no existe en tu HTML
    let previewBox = document.querySelector("#previewBox");
    
    // LÓGICA: Si no pusiste la caja contenedora en el HTML, la creamos con JavaScript puro
    if (!previewBox) {
        previewBox = document.createElement("div");
        previewBox.id = "previewBox";
        previewBox.style.marginTop = "1rem";
        previewBox.style.padding = "0.5rem";
        previewBox.style.border = "2px dashed #2e7d32"; // Verde sutil de éxito
        previewBox.style.backgroundColor = "rgba(46, 125, 50, 0.05)";
        previewBox.innerHTML = `<p style="color: #2e7d32; font-weight: bold; font-size: 0.9rem; margin-bottom: 0.5rem;">✓ ¡Imagen seleccionada!</p><img id="imageFilePreview" style="width: 100%; max-height: 200px; object-fit: contain;" src="" alt="Previsualización">`;
        
        // SINTAXIS: Insertamos la caja verde justo debajo del input de la imagen
        this.parentElement.appendChild(previewBox);
    }

    const previewImg = document.querySelector("#imageFilePreview");

    // LÓGICA: Verificamos que el usuario realmente haya seleccionado un archivo válido
    if (this.files && this.files[0]) {
        // SINTAXIS: FileReader lee archivos binarios del disco duro local sin subir al servidor aún
        const reader = new FileReader();
        
        reader.onload = function(e) {
            // Asignamos la ruta temporal en formato Base64 al atributo src de la imagen
            previewImg.src = e.target.result;
            previewBox.style.display = "block";
        }
        
        // Ejecuta la lectura del archivo seleccionado
        reader.readAsDataURL(this.files[0]);
    }
});


// ==========================================
// 3. ENVÍO DE DATOS Y ARCHIVOS AL SERVIDOR (SUBIR PLATO)
// ==========================================
document.querySelector("#dishForm").addEventListener("submit", async (e) => {
    // Evitamos el comportamiento nativo de HTML que recarga la página por defecto
    e.preventDefault();

    // Capturamos los campos del formulario usando selectores de ID
    const menuName = document.querySelector("#menuName").value.trim();
    const type = document.querySelector("#type").value;
    const dayOfWeek = document.querySelector("#dayOfWeek").value;
    const description = document.querySelector("#description").value.trim();
    
    // Capturamos el archivo binario real de la imagen
    const imageInput = document.querySelector("#image");
    const imageFile = imageInput.files[0];

    // ⚠️ VALIDACIÓN PREVIA EN EL FRONTEND: Asegurarnos de que todos los select estén elegidos
    if (!type || !dayOfWeek) {
        alert("Por favor, selecciona el tipo de comida y el día del plato.");
        return;
    }

    // 🟢 SINTAXIS CRUCIAL: Instanciamos un objeto FormData vacío
    // FormData empaqueta los campos imitando el protocolo que Multer espera recibir en Express
    const formData = new FormData();
    
    // SINTAXIS: objetoFormData.append('clave', valor);
    formData.append("menuName", menuName);
    formData.append("type", type);
    formData.append("dayOfWeek", dayOfWeek);
    formData.append("description", description);
    formData.append("image", imageFile); // Aquí va el archivo binario de la foto

    console.log("🚀 Enviando formulario binario a Express...");

    try {
        // SINTAXIS: Petición HTTP usando fetch
        const response = await fetch("/api/menu/agregar", {
            method: "POST",
            // ⚠️ NOTA TÉCNICA: Al enviar FormData, NUNCA escribas la cabecera 'Content-Type'.
            // El navegador la inyectará de forma automática configurando el 'boundary' del archivo.
            body: formData 
        });

        const data = await response.json();

        // LÓGICA: Si el servidor procesó el guardado en MySQL con éxito (Status 200/201)
        if (response.ok && data.success) {
            alert("🎉 " + data.message);
            
            // SINTAXIS: Limpiamos todo el formulario de inmediato
            document.querySelector("#dishForm").reset();
            
            // Ocultamos la caja de previsualización de la imagen
            const previewBox = document.querySelector("#previewBox");
            if (previewBox) previewBox.style.display = "none";
            
        } else {
            // Mostramos los errores controlados que vengan del Backend
            alert("❌ Error: " + (data.error || "No se pudo subir el plato."));
        }

    } catch (error) {
        console.error("Error en el envío por fetch:", error);
        alert("🔴 Error crítico: No se pudo conectar con el servidor.");
    }
});