const token = localStorage.getItem("token");

let page = 0;
let size = 4;
let lastPageEmpty = false;

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
      headers: {
        "Authorization": `Bearer ${token}`
      }
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

  data.forEach(tx => {
    const div = document.createElement("div");
    div.classList.add("transaction-card");

    div.innerHTML = `
      <div class="tx-row top">
        <span class="tx-name">${tx.description}</span>
        <span class="tx-type ${tx.type.toLowerCase()}">${tx.type}</span>
      </div>

      <div class="tx-row bottom">
        <span class="tx-category">${tx.category}</span>
        <span class="tx-date">${tx.date}</span>
      </div>

      <div class="tx-value">
        ${tx.amount.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL"
        })}
      </div>
    `;

    container.appendChild(div);
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
  document.querySelector(".pagination button:first-child").disabled = page === 0;
  document.querySelector(".pagination button:last-child").disabled = lastPageEmpty;
}

document.querySelector(".filters button")
  .addEventListener("click", () => loadTransactions(true));

loadTransactions();