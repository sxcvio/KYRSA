(function () {
  var cardsRoot = document.getElementById("rates-cards");
  var tableBody = document.getElementById("rates-table-body");
  var updatedAt = document.getElementById("rates-updated-at");

  if (!cardsRoot || !tableBody || !updatedAt || typeof RATES === "undefined" || typeof COMMISSION === "undefined") {
    return;
  }

  var config = {
    BTC: {
      min: "0.001 BTC",
      max: "0.30 BTC",
      payout: "СБП / фиат",
      status: "Высокий резерв"
    },
    ETH: {
      min: "0.02 ETH",
      max: "15 ETH",
      payout: "СБП / фиат",
      status: "Доступно"
    },
    USDT: {
      min: "100 USDT",
      max: "50 000 USDT",
      payout: "СБП / фиат / токен",
      status: "Основное направление"
    },
    LTC: {
      min: "1 LTC",
      max: "500 LTC",
      payout: "СБП / токен",
      status: "Ограниченный резерв"
    }
  };

  function formatRub(value) {
    return value.toLocaleString("ru-RU", { maximumFractionDigits: 2 }) + " ₽";
  }

  Object.keys(RATES).forEach(function (symbol) {
    var card = document.createElement("div");
    card.className = "card rates-card";
    card.innerHTML =
      "<h3>" + symbol + " → RUB</h3>" +
      "<p>" + config[symbol].status + "</p>" +
      '<div class="mock-field"><span>Курс</span><strong>' + formatRub(RATES[symbol]) + "</strong></div>" +
      '<div class="mock-field"><span>Комиссия</span><strong>' + (COMMISSION[symbol] * 100).toFixed(1) + "%</strong></div>" +
      '<div class="mock-field"><span>Выдача</span><strong>' + config[symbol].payout + "</strong></div>";
    cardsRoot.appendChild(card);

    var row = document.createElement("tr");
    row.innerHTML =
      "<td>" + symbol + " → RUB</td>" +
      "<td>" + formatRub(RATES[symbol]) + "</td>" +
      "<td>" + (COMMISSION[symbol] * 100).toFixed(1) + "%</td>" +
      "<td>" + config[symbol].min + "</td>" +
      "<td>" + config[symbol].max + "</td>" +
      "<td>" + config[symbol].payout + "</td>" +
      "<td>" + config[symbol].status + "</td>";
    tableBody.appendChild(row);
  });

  updatedAt.textContent = "Обновлено: " + new Date().toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
})();
