document.querySelector("form").addEventListener("submit", async (e) => { // We avoid that the information be sent 
    // without refreshing the page
    e.preventDefault(); // It avoid the website refresh

const user = document.querySelector("#user").value.trim(); // I will get the value of that input and trim deletes accidental
// spaces
const password = document.querySelector("#password").value

const errorDiv = document.querySelector("#errorDiv")
errorDiv.textContent = ""

try {
    const response = await fetch("/api/login", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({user, password})
    })

    const data = await response.json()

    if (response.ok && data.success) {
        // Dentro de tu login, cuando match sea true:

        alert(data.message)
        window.location.href = "/html/admin.html"
    }else{
        errorDiv.textContent = data.error || "Usuario o contraseña incorrectos"
    }
}catch (error) {
    errorDiv.textContent = "Error al conectar en el servidor"
}
})