import {
    startRegistration,
    startAuthentication,
} from "@simplewebauthn/browser";

export function iniciarLogin() {
    const emailInput = document.getElementById("auth-email");
    const passwordInput = document.getElementById("auth-password");
    const mensajeEl = document.getElementById("mensajeLogin");

    document
        .getElementById("btn-register")
        .addEventListener("click", async () => {
            const email = emailInput.value;
            const password = passwordInput.value;

            console.log("Email: " + email);
            console.log("Password: " + password);

            if (!email || !password)
                return alert("Ingresa correo y contraseña para registrarte.");

            try {
                mensajeEl.textContent = "Creando cuenta...";

                const resChallenge = await fetch(
                    "/api/login/register-challenge",
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ email, password }),
                    },
                );

                console.log("ResChallenge: " + resChallenge);

                if (!resChallenge.ok) {
                    const error = await resChallenge.json();
                    throw new Error(error.error);
                }

                const options = await resChallenge.json();
                mensajeEl.textContent =
                    "Cuenta creada. Por favor, registra tu huella...";

                const biometricResponse = await startRegistration(options);
                mensajeEl.textContent = "Verificando huella en el servidor...";

                const resVerify = await fetch("/api/login/register-verify", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email,
                        response: biometricResponse,
                    }),
                });

                console.log("ResVerify: " + resVerify);

                if (resVerify.ok) {
                    mensajeEl.textContent =
                        "¡Registro completo! Tu cuenta y huella están listas.";
                } else {
                    const data = await resVerify.json();
                    throw new Error(data.error || "Error al verificar la huella en el servidor");
                }
            } catch (error) {
                if (
                    error.name === "NotAllowedError" ||
                    error.name === "DOMException"
                ) {
                    mensajeEl.textContent =
                        "Cuenta creada, pero se canceló el registro de la huella. Puedes iniciar sesión con contraseña.";
                } else {
                    mensajeEl.textContent = `Error: ${error.message}`;
                }
            }
        });

    document
        .getElementById("btn-login-pass")
        .addEventListener("click", async () => {
            const email = emailInput.value;
            const password = passwordInput.value;

            if (!email || !password)
                return alert("Ingresa correo y contraseña.");

            try {
                mensajeEl.textContent = "Iniciando sesión...";

                const response = await fetch("/api/login/login-password", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ email, password }),
                });

                if (response.ok) {
                    mensajeEl.textContent = "¡Sesión iniciada con contraseña!";
                    await checarSesion();
                } else {
                    const data = await response.json();
                    throw new Error(data.error);
                }
            } catch (error) {
                mensajeEl.textContent = `Error: ${error.message}`;
            }
        });

    document
        .getElementById("btn-login-huella")
        .addEventListener("click", async () => {
            const email = emailInput.value;

            if (!email)
                return alert("Ingresa tu correo para buscar tu huella.");

            try {
                mensajeEl.textContent = "Buscando credenciales...";

                const resChallenge = await fetch("/api/login/login-challenge", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email }),
                });

                if (!resChallenge.ok) {
                    const data = await resChallenge.json();
                    throw new Error(data.error);
                }

                const options = await resChallenge.json();
                mensajeEl.textContent = "Por favor, usa tu huella...";

                const biometricResponse = await startAuthentication(options);
                mensajeEl.textContent = "Verificando firma...";

                const resVerify = await fetch("/api/login/login-verify", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({
                        email,
                        response: biometricResponse,
                    }),
                });

                if (resVerify.ok) {
                    mensajeEl.textContent = "¡Sesión iniciada con tu huella!";
                    await checarSesion();
                } else {
                    const data = await resVerify.json();
                    throw new Error(data.error);
                }
            } catch (error) {
                if (
                    error.name === "NotAllowedError" ||
                    error.name === "DOMException"
                ) {
                    mensajeEl.textContent =
                        "Cancelaste la autenticación biométrica.";
                } else {
                    mensajeEl.textContent = `Error: ${error.message}`;
                }
            }
        });
}

export async function checarSesion() {
    const loginWrapper = document.getElementById("loginWrapper");

    try {
        const response = await fetch("/api/login/verificar-logeado", {
            method: "GET",
            credentials: "include",
        });

        if (response.ok) {
            loginWrapper.style.display = "none";
        } else {
            loginWrapper.style.display = "flex";
        }

        return response.ok;
    } catch (error) {
        console.error("Error al verificar la sesión:", error);
        return false;
    }
}
