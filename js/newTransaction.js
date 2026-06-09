const API_URL = "http://localhost:8080";

const inputValue = document.getElementById("value");

// máscara de dinheiro (pt-BR visual)
inputValue.addEventListener("input", (e) => {
  let value = e.target.value;

  value = value.replace(/\D/g, "");

  value = (value / 100).toFixed(2);

  value = value.replace(".", ",");

  e.target.value = value;
});

// flatpickr no formato que o BACKEND aceita
flatpickr("#date", {
  dateFormat: "Y-m-d",
});

// pega token
function getToken() {
  return localStorage.getItem("token");
}

// converte "12,34" → 12.34
function parseMoney(value) {
  return Number(value.replace(",", "."));
}

document.getElementById("transactionForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const token = getToken();

  if (!token) {
    alert("Você precisa estar logado.");
    return;
  }

  const data = {
    type: document.getElementById("type").value,
    date: document.getElementById("date").value,
    category: document.getElementById("category").value,
    amount: parseMoney(document.getElementById("value").value),
    description: document.getElementById("description").value,
  };

  if (!data.type || !data.date || !data.category || !data.amount) {
    alert("Preencha todos os campos obrigatórios.");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/transaction`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Erro ao salvar transação");
    }

    window.location.href='../transactions.html'

    document.getElementById("transactionForm").reset();
    inputValue.value = "";
  } catch (err) {
    console.error(err);
    alert("Erro: " + err.message);
  }
});