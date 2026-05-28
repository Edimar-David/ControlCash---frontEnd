// script.js

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

const showRegister = document.getElementById("showRegister");
const showLogin = document.getElementById("showLogin");

/* TROCAR FORM */

showRegister.addEventListener("click", (e) => {
  e.preventDefault();

  loginForm.classList.remove("active");
  registerForm.classList.add("active");
});

showLogin.addEventListener("click", (e) => {
  e.preventDefault();

  registerForm.classList.remove("active");
  loginForm.classList.add("active");
});

/* LOADING */

function setLoading(button, state) {

  if(state) {
    button.classList.add("loading");
    button.disabled = true;
  } else {
    button.classList.remove("loading");
    button.disabled = false;
  }

}

/* LOGIN */

loginForm.addEventListener("submit", async (e) => {

  e.preventDefault();

  const button = document.getElementById("loginBtn");
  const error = document.getElementById("loginError");

  error.textContent = "";

  setLoading(button, true);

  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  try {

    const response = await fetch("http://localhost:8080/auth/login", {
      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        email,
        password
      })
    });

    const data = await response.json();

    if(!response.ok) {
      throw new Error("Erro no login");
    }

    localStorage.setItem(
      "controlcash_token",
      data.token
    );

    window.location.href = "/dashboard.html";

  } catch(err) {

    error.textContent =
      "Email ou senha inválidos.";

  } finally {

    setLoading(button, false);

  }

});

/* REGISTER */

registerForm.addEventListener("submit", async (e) => {

  e.preventDefault();

  const button = document.getElementById("registerBtn");
  const error = document.getElementById("registerError");

  error.textContent = "";

  setLoading(button, true);

  const name = document.getElementById("registerName").value;
  const email = document.getElementById("registerEmail").value;
  const password = document.getElementById("registerPassword").value;

  try {

    const response = await fetch("http://localhost:8080/auth/register", {
      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        name,
        email,
        password
      })
    });

    const data = await response.json();

    if(!response.ok) {
      throw new Error("Erro ao cadastrar");
    }

    localStorage.setItem(
      "controlcash_token",
      data.token
    );

    window.location.href = "/dashboard.html";

  } catch(err) {

    error.textContent =
      "Não foi possível criar sua conta.";

  } finally {

    setLoading(button, false);

  }

});