import { transactionCard } from "./transaction/transactionView.js";

const token = localStorage.getItem("token");

let page = 0;
let size = 4;
let lastPageEmpty = false;

document.getElementById("nextBtn").addEventListener("click", nextPage);

document.getElementById("prevBtn").addEventListener("click", prevPage);

document.getElementById("searchBtn").addEventListener("click", () => {
  loadTransactions();
});

async function loadTransactions(resetPage = false) {
  if (resetPage) page = 0;

  const startDate = document.getElementById("startDate").value;
  const endDate = document.getElementById("endDate").value;
  const type = document.getElementById("type").value;

  const params = new URLSearchParams();

  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);
  if (type) params.append("type", type);

  params.append("page", page);
  params.append("size", size);

  const url = `http://localhost:8080/transaction?${params.toString()}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Erro HTTP:", response.status, text);
      return;
    }

    const data = await response.json();

    renderTransactions(data);

    document.getElementById("pageInfo").textContent = `Página ${page + 1}`;

    lastPageEmpty = data.length < size;

    updateButtons();
  } catch (error) {
    console.error("Erro ao buscar transações:", error);
  }
}

function renderTransactions(data) {
  const container = document.getElementById("transactions");
  container.innerHTML = "";

  if (!data || data.length === 0) {
    container.innerHTML = "<p>Nenhuma transação encontrada.</p>";
    return;
  }

  data.forEach((tx) => {
    const [ano, mes, dia] = tx.date.split("-");
    const dateFormat = `${dia}/${mes}/${ano}`;

    if (tx.type === "INCOME") {
      const svg =
        'path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941"';
      const card = transactionCard(
        tx.description,
        tx.type,
        svg,
        "RECEITA",
        tx.category,
        dateFormat,
        tx.amount,
      );

      container.appendChild(card);
    } else {
      const svg =
        'path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6 9 12.75l4.286-4.286a11.948 11.948 0 0 1 4.306 6.43l.776 2.898m0 0 3.182-5.511m-3.182 5.51-5.511-3.181" ';

      const card = transactionCard(
        tx.description,
        tx.type,
        svg,
        "RECEITA",
        tx.category,
        dateFormat,
        tx.amount,
      );

      container.appendChild(card);
    }
  });
}

function nextPage() {
  if (lastPageEmpty) return;
  page++;
  loadTransactions();
}

function prevPage() {
  if (page > 0) {
    page--;
    loadTransactions();
  }
}

function updateButtons() {
  document.querySelector(".pagination button:first-child").disabled =
    page === 0;
  document.querySelector(".pagination button:last-child").disabled =
    lastPageEmpty;
}

document
  .querySelector(".filters button")
  .addEventListener("click", () => loadTransactions(true));

loadTransactions();
