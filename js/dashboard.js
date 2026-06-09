// ── UTILS ────────────────────────────────
const userName = localStorage.getItem("userName");

function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value || 0);
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

function el(id) {
  return document.getElementById(id);
}

// ── WELCOME TITLE ─────────────────────────
(function setWelcome() {
  const title = el("welcome-title");
  if (title) {
    const name = userName ? userName.split(" ")[0] : "Usuário";
    const hour = new Date().getHours();
    const greeting =
      hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";
    title.textContent = `${greeting}, ${name}`;
  }
})();

const MOCK = {
  summary: {
    totalBalance: 12_480.5,
    totalIncome: 8_200.0,
    totalExpense: 5_340.3,
    totalTransactions: 47,
    previousBalance: 10_580.0,
  },
  monthlyData: [
    { month: "Jan", income: 7200, expense: 4800 },
    { month: "Fev", income: 7800, expense: 5200 },
    { month: "Mar", income: 6900, expense: 4600 },
    { month: "Abr", income: 8500, expense: 5900 },
    { month: "Mai", income: 7400, expense: 4200 },
    { month: "Jun", income: 8200, expense: 5340 },
  ],
  categories: [
    { name: "Moradia", amount: 1800, color: "#4F8CFF" },
    { name: "Alimentação", amount: 1200, color: "#22C55E" },
    { name: "Transporte", amount: 680, color: "#F59E0B" },
    { name: "Assinaturas", amount: 420, color: "#A78BFA" },
    { name: "Lazer", amount: 340, color: "#F472B6" },
    { name: "Outros", amount: 900, color: "#71717A" },
  ],
  transactions: [
    {
      name: "Salário",
      category: "Receita",
      date: "2024-06-05",
      amount: 7500,
      type: "income",
      emoji: "💼",
    },
    {
      name: "Aluguel",
      category: "Moradia",
      date: "2024-06-05",
      amount: -1800,
      type: "expense",
      emoji: "🏠",
    },
    {
      name: "Supermercado",
      category: "Alimentação",
      date: "2024-06-07",
      amount: -340,
      type: "expense",
      emoji: "🛒",
    },
    {
      name: "Freelance design",
      category: "Receita",
      date: "2024-06-10",
      amount: 700,
      type: "income",
      emoji: "🎨",
    },
    {
      name: "Spotify",
      category: "Assinaturas",
      date: "2024-06-11",
      amount: -20,
      type: "expense",
      emoji: "🎵",
    },
    {
      name: "Posto de gasolina",
      category: "Transporte",
      date: "2024-06-13",
      amount: -180,
      type: "expense",
      emoji: "⛽",
    },
    {
      name: "Netflix",
      category: "Assinaturas",
      date: "2024-06-14",
      amount: -45,
      type: "expense",
      emoji: "🎬",
    },
  ],
  insights: [
    "Você gastou 18% a mais com alimentação este mês comparado ao mês anterior.",
    "Reduzindo R$ 50 por semana em lazer, você economiza R$ 2.600 por ano.",
    "Seu saldo cresceu 18% em relação ao mês passado. Ótimo trabalho! 🎉",
    "Assinaturas representam 8% dos seus gastos. Considere revisar os planos.",
  ],
  goals: [
    { name: "Viagem", current: 7200, target: 10_000 },
    { name: "Reserva de Emergência", current: 4500, target: 10_000 },
    { name: "Novo Notebook", current: 1800, target: 4_000 },
  ],
};

// ── API FETCH ────────────────────────────
async function apiFetch(path) {
  try {
    const res = await fetch(`http://localhost:8080${path}`, {
      credentials: "include",
    });

    if (res.status === 401) {
      window.location.href = "auth.html";
      return null;
    }

    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// ── SUMMARY CARDS ─────────────────────────
async function loadSummary() {
  const data = (await apiFetch("/transaction/summary")) || MOCK.summary;

  const balance = data.totalBalance ?? 0;
  const income = data.totalIncome ?? 0;
  const expense = data.totalExpense ?? 0;
  const previous = data.previousBalance ?? MOCK.summary.previousBalance;

  const saving = income - expense;
  const savingPct = income > 0 ? Math.round((saving / income) * 100) : 0;

  // Balance variation
  let variation = 0;
  if (previous && previous !== 0) {
    variation = ((balance - previous) / Math.abs(previous)) * 100;
  }

  el("totalBalance").textContent = formatCurrency(balance);
  el("totalBalanceMobile").textContent = formatCurrency(balance);
  el("totalIncome").textContent = formatCurrency(income);
  el("totalExpense").textContent = formatCurrency(expense);
  el("totalSaving").textContent = formatCurrency(saving);

  const varEl = el("balanceVariation");
  if (variation >= 0) {
    varEl.textContent = `↑ ${variation.toFixed(1)}%`;
    varEl.className = "badge badge-up";
  } else {
    varEl.textContent = `↓ ${Math.abs(variation).toFixed(1)}%`;
    varEl.className = "badge badge-down";
  }

  // Saving bar
  const pct = Math.min(savingPct, 100);
  setTimeout(() => {
    el("savingBarFill").style.width = `${pct}%`;
  }, 300);
  el("savingPct").textContent = `${pct}% da renda`;
}

// ── EVOLUTION CHART (Canvas) ──────────────
async function loadEvolutionChart() {
  const data = (await apiFetch("/transaction/monthly")) || MOCK.monthlyData;
  const canvas = el("evolutionChart");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  function draw() {
    const W = canvas.offsetWidth;
    const H = canvas.offsetHeight;
    canvas.width = W;
    canvas.height = H;

    const PAD = { top: 20, right: 20, bottom: 40, left: 52 };
    const chartW = W - PAD.left - PAD.right;
    const chartH = H - PAD.top - PAD.bottom;

    const allValues = data.flatMap((d) => [d.income, d.expense]);
    const maxVal = Math.max(...allValues) * 1.15 || 1;

    const xStep = chartW / (data.length - 1);

    function toX(i) {
      return PAD.left + i * xStep;
    }
    function toY(v) {
      return PAD.top + chartH - (v / maxVal) * chartH;
    }

    // Background grid lines
    const gridLines = 4;
    ctx.strokeStyle = "rgba(255,255,255,0.05)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= gridLines; i++) {
      const y = PAD.top + (i / gridLines) * chartH;
      ctx.beginPath();
      ctx.moveTo(PAD.left, y);
      ctx.lineTo(PAD.left + chartW, y);
      ctx.stroke();

      // Y labels
      const val = maxVal * (1 - i / gridLines);
      ctx.fillStyle = "rgba(161,161,170,0.7)";
      ctx.font = "10px Inter, sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(
        val >= 1000 ? `R$${(val / 1000).toFixed(0)}k` : `R$${val.toFixed(0)}`,
        PAD.left - 8,
        y + 3,
      );
    }

    // Draw area + line helper
    function drawLine(color, values, filled) {
      const points = values.map((v, i) => [toX(i), toY(v)]);

      if (filled) {
        // Gradient fill
        const grad = ctx.createLinearGradient(0, PAD.top, 0, PAD.top + chartH);
        grad.addColorStop(
          0,
          color.replace(")", ", 0.18)").replace("rgb", "rgba"),
        );
        grad.addColorStop(1, color.replace(")", ", 0)").replace("rgb", "rgba"));
        ctx.beginPath();
        ctx.moveTo(points[0][0], toY(0));
        points.forEach(([x, y]) => ctx.lineTo(x, y));
        ctx.lineTo(points[points.length - 1][0], toY(0));
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();
      }

      // Line
      ctx.beginPath();
      ctx.moveTo(points[0][0], points[0][1]);
      for (let i = 1; i < points.length; i++) {
        // Smooth curve
        const cpx = (points[i - 1][0] + points[i][0]) / 2;
        ctx.bezierCurveTo(
          cpx,
          points[i - 1][1],
          cpx,
          points[i][1],
          points[i][0],
          points[i][1],
        );
      }
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.lineJoin = "round";
      ctx.stroke();

      // Dots
      points.forEach(([x, y]) => {
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = "#09090B";
        ctx.lineWidth = 2;
        ctx.stroke();
      });
    }

    const incomeColor = "#22C55E";
    const expenseColor = "#EF4444";

    drawLine(
      incomeColor,
      data.map((d) => d.income),
      true,
    );
    drawLine(
      expenseColor,
      data.map((d) => d.expense),
      true,
    );

    // X labels
    ctx.fillStyle = "rgba(161,161,170,0.8)";
    ctx.font = "10px Inter, sans-serif";
    ctx.textAlign = "center";
    data.forEach((d, i) => {
      ctx.fillText(d.month, toX(i), H - 8);
    });
  }

  draw();

  const ro = new ResizeObserver(draw);
  ro.observe(canvas.parentElement);
}

// ── DONUT CHART (SVG) ─────────────────────
async function loadDistribution() {
  const categories =
    (await apiFetch("/transaction/categories")) || MOCK.categories;

  const total = categories.reduce((s, c) => s + c.amount, 0);
  if (el("donutTotal")) el("donutTotal").textContent = formatCurrency(total);

  const svg = el("donutChart");
  const R = 80; // viewBox radius
  const r = 28; // inner radius (hole)
  const cx = 80;
  const cy = 80;
  const strokeW = R - r;
  const trackR = (R + r) / 2;
  const circumference = 2 * Math.PI * trackR;

  let offset = 0;
  const paths = [];

  categories.forEach((cat) => {
    const pct = total > 0 ? cat.amount / total : 0;
    const dash = pct * circumference;
    const gap = circumference - dash;

    const path = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle",
    );
    path.setAttribute("cx", cx);
    path.setAttribute("cy", cy);
    path.setAttribute("r", trackR);
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", cat.color);
    path.setAttribute("stroke-width", strokeW);
    path.setAttribute("stroke-dasharray", `${dash} ${gap}`);
    path.setAttribute("stroke-dashoffset", `${-offset}`);
    path.setAttribute("stroke-linecap", "butt");
    path.style.transition = "stroke-dasharray 1s cubic-bezier(0.4,0,0.2,1)";
    svg.appendChild(path);
    paths.push(path);

    offset += dash;
    cat._pct = Math.round(pct * 100);
  });

  // Category list
  const list = el("catList");
  if (!list) return;
  list.innerHTML = "";

  categories.forEach((cat) => {
    const li = document.createElement("li");
    li.className = "cat-item";
    li.innerHTML = `
      <div class="cat-item-top">
        <span class="cat-name">
          <span class="cat-dot" style="background:${cat.color}"></span>
          ${cat.name}
        </span>
        <span class="cat-pct">${cat._pct}%</span>
      </div>
      <div class="cat-bar">
        <div class="cat-bar-fill" style="width:0%; background:${cat.color}"></div>
      </div>
    `;
    list.appendChild(li);
  });

  // Animate bars
  setTimeout(() => {
    list.querySelectorAll(".cat-bar-fill").forEach((bar, i) => {
      bar.style.width = `${categories[i]._pct}%`;
    });
  }, 400);
}

// ── TRANSACTIONS ─────────────────────────
async function loadTransactions() {
  const raw = await apiFetch("/transaction?page=0&size=7");
  //const items = raw?.content || MOCK.transactions;

  const items = Array.isArray(raw)
    ? raw.map((tx) => ({
        id: tx.id,
        name: tx.description,
        category: tx.category,
        date: tx.date,
        amount: tx.amount,
        type: tx.type,
      }))
    : MOCK.transactions;

  const list = el("txList");
  if (!list) return;
  list.innerHTML = "";

  items.slice(0, 7).forEach((tx) => {
    const svgExpense = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="#EF4444" width = "15px" height = "15px">
        <path fill-rule="evenodd" d="M1.22 5.222a.75.75 0 0 1 1.06 0L7 9.942l3.768-3.769a.75.75 0 0 1 1.113.058 20.908 20.908 0 0 1 3.813 7.254l1.574-2.727a.75.75 0 0 1 1.3.75l-2.475 4.286a.75.75 0 0 1-1.025.275l-4.287-2.475a.75.75 0 0 1 .75-1.3l2.71 1.565a19.422 19.422 0 0 0-3.013-6.024L7.53 11.533a.75.75 0 0 1-1.06 0l-5.25-5.25a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
      </svg>
    `;

    const svgIncome = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill=" #22C55E" width = "15px" height = "15px">
        <path fill-rule="evenodd" d="M12.577 4.878a.75.75 0 0 1 .919-.53l4.78 1.281a.75.75 0 0 1 .531.919l-1.281 4.78a.75.75 0 0 1-1.449-.387l.81-3.022a19.407 19.407 0 0 0-5.594 5.203.75.75 0 0 1-1.139.093L7 10.06l-4.72 4.72a.75.75 0 0 1-1.06-1.061l5.25-5.25a.75.75 0 0 1 1.06 0l3.074 3.073a20.923 20.923 0 0 1 5.545-4.931l-3.042-.815a.75.75 0 0 1-.53-.919Z" clip-rule="evenodd" />
      </svg>

    `;
    const isIncome = tx.type === "INCOME";
    const amount = Math.abs(tx.amount ?? 0);
    const emoji = isIncome ? svgIncome : svgExpense;

    const li = document.createElement("li");
    li.className = "tx-item";
    li.innerHTML = `
      <span class="tx-icon">${emoji}</span>
      <div class="tx-info">
        <div class="tx-name">${tx.description ?? tx.name ?? "Transação"}</div>
        <div class="tx-meta">${tx.category ?? "Geral"} · ${formatDate(tx.date ?? tx.createdAt)}</div>
      </div>
      <span class="tx-amount ${isIncome ? "income" : "expense"}">
        ${isIncome ? "+" : "-"}${formatCurrency(amount)}
      </span>
    `;
    list.appendChild(li);
  });
}

// ── AI INSIGHTS ──────────────────────────
function loadInsights() {
  const list = el("aiList");
  if (!list) return;
  list.innerHTML = "";

  MOCK.insights.forEach((text) => {
    const li = document.createElement("li");
    li.className = "ai-item";
    li.innerHTML = `<span class="ai-bullet">✦</span><span>${text}</span>`;
    list.appendChild(li);
  });
}

// ── GOALS ────────────────────────────────
function loadGoals() {
  const list = el("goalsList");
  if (!list) return;
  list.innerHTML = "";

  MOCK.goals.forEach((goal) => {
    const pct = Math.min(Math.round((goal.current / goal.target) * 100), 100);
    const li = document.createElement("li");
    li.className = "goal-item";
    li.innerHTML = `
      <div class="goal-top">
        <span class="goal-name">${goal.name}</span>
        <span class="goal-pct">${pct}%</span>
      </div>
      <div class="goal-bar-wrap">
        <div class="goal-bar-fill" style="width:0%"></div>
      </div>
      <div class="goal-values">
        <span>${formatCurrency(goal.current)}</span>
        <span>${formatCurrency(goal.target)}</span>
      </div>
    `;
    list.appendChild(li);
  });

  // Animate bars
  setTimeout(() => {
    list.querySelectorAll(".goal-bar-fill").forEach((bar, i) => {
      const g = MOCK.goals[i];
      const pct = Math.min(Math.round((g.current / g.target) * 100), 100);
      bar.style.width = `${pct}%`;
    });
  }, 500);
}

// ── INIT ──────────────────────────────────
async function init() {
  // Load in parallel where possible
  await Promise.all([
    loadSummary(),
    loadEvolutionChart(),
    loadDistribution(),
    loadTransactions(),
  ]);

  // These are pure mock/local, instant
  loadInsights();
  loadGoals();
}

init();
