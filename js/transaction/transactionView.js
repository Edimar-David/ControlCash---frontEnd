export function transactionCard(
  description,
  type,
  svg,
  typeFormat,
  category,
  date,
  amount,
) {
  const div = document.createElement("div");
  div.classList.add("transaction-card");

  div.innerHTML = `
        <div class="tx-row top">
          <span class="tx-name">${description}</span>
          <span class="tx-type ${type.toLowerCase()}">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="12px">
            <${svg} />
          </svg>
          ${typeFormat}</span>
        </div>
      <div class="tx-row bottom">
        <span class="tx-category">${category}</span>
        <span class="tx-date">${date}</span>
      </div>

      <div class="tx-value">
        ${amount.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        })}
      </div>
    `;

  return div;
}
