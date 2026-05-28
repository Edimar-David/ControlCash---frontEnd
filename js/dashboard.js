const userName = localStorage.getItem("userName");
const title = document.getElementById("welcome-title");

title.textContent = `Olá, ${userName}`;