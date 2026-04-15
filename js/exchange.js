(function () {
  var storageKey = "nonoir-orders";
  var maxOrders = 10;
  var collapsedCount = 2;
  var showAllOrders = false;

  var calcAmount = document.getElementById("calc-amount");
  var calcFrom = document.getElementById("calc-from");
  var calcTo = document.getElementById("calc-to");
  var calcRubMode = document.getElementById("calc-rub-mode");
  var calcRubModeGroup = document.getElementById("calc-rub-mode-group");
  var calcResultValue = document.querySelector("#calc-result strong");
  var calcCommLabel = document.getElementById("calc-comm-label");
  var calcRate = document.getElementById("calc-rate");
  var calcDirectionNote = document.getElementById("calc-direction-note");

  var form = document.getElementById("exchange-form");
  var orderAmount = document.getElementById("order-amount");
  var orderFrom = document.getElementById("order-from");
  var orderTo = document.getElementById("order-to");
  var orderPayMethod = document.getElementById("order-pay-method");
  var orderPayMethodGroup = document.getElementById("order-pay-method-group");
  var orderRubMode = document.getElementById("order-rub-mode");
  var orderRubModeGroup = document.getElementById("order-rub-mode-group");
  var orderSbpMethod = document.getElementById("order-sbp-method");
  var orderBank = document.getElementById("order-bank");
  var orderRequisites = document.getElementById("order-requisites");
  var orderCity = document.getElementById("order-city");
  var orderTokenNetwork = document.getElementById("order-token-network");
  var orderTokenWallet = document.getElementById("order-token-wallet");
  var orderContact = document.getElementById("order-contact");
  var orderComment = document.getElementById("order-comment");
  var sbpFields = document.getElementById("sbp-fields");
  var fiatFields = document.getElementById("fiat-fields");
  var tokenFields = document.getElementById("token-fields");
  var exchangeAlert = document.getElementById("exchange-alert");

  var previewDirection = document.getElementById("preview-direction");
  var previewRoute = document.getElementById("preview-route");
  var previewResult = document.getElementById("preview-result");
  var previewCommission = document.getElementById("preview-commission");
  var previewStatus = document.getElementById("preview-status");
  var previewIssuedRequisites = document.getElementById("preview-issued-requisites");

  var ordersEmpty = document.getElementById("orders-empty");
  var ordersList = document.getElementById("orders-list");
  var ordersToggleBtn = document.getElementById("orders-toggle-btn");

  if (!form || !calcAmount || !calcFrom || !calcTo || !ordersList || !ordersToggleBtn) {
    return;
  }

  function getCommissionCode(from, to) {
    return from === "RUB" ? to : from;
  }

  function getCommission(from, to) {
    return COMMISSION[getCommissionCode(from, to)] || 0.008;
  }

  function calculateExchange(amount, from, to) {
    var commission = getCommission(from, to);
    var result = 0;

    if (amount > 0 && from !== to) {
      var inRub = from === "RUB" ? amount : amount * RATES[from];
      var out = to === "RUB" ? inRub : inRub / RATES[to];
      result = out * (1 - commission);
    }

    return {
      amount: amount,
      from: from,
      to: to,
      commission: commission,
      result: result
    };
  }

  function getRateValue(from, to) {
    if (from === to) return 1;
    if (from === "RUB" && to !== "RUB") return 1 / RATES[to];
    if (from !== "RUB" && to === "RUB") return RATES[from];
    return RATES[from] / RATES[to];
  }

  function formatAmount(value, currency) {
    if (!value || value <= 0) {
      return currency === "RUB" ? "0 ₽" : "0 " + currency;
    }

    if (currency === "RUB") {
      return value.toLocaleString("ru-RU", { maximumFractionDigits: 2 }) + " ₽";
    }

    return (value < 0.01 ? value.toFixed(6) : value.toFixed(4)) + " " + currency;
  }

  function formatDate(isoString) {
    return new Date(isoString).toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
  }

  function getExchangeMode(from, to, rubMode) {
    if (from !== "RUB" && to !== "RUB") return "token-token";
    if (to === "RUB" && rubMode === "sbp") return "rub-sbp";
    if (to === "RUB" && rubMode === "fiat") return "rub-fiat";
    return "standard";
  }

  function getModeLabel(mode) {
    if (mode === "token-token") return "Токен → токен, моментальное зачисление";
    if (mode === "rub-sbp") return "Выплата в рублях через СБП";
    if (mode === "rub-fiat") return "Получение наличных в городе";
    return "Стандартный обмен";
  }

  function getPreviewStatus(mode) {
    if (mode === "token-token") return "Моментально";
    if (mode === "rub-sbp") return "Ожидается перевод";
    if (mode === "rub-fiat") return "Ожидает выдачи в городе";
    return "Ожидает подтверждения";
  }

  function getOrderRuntimeStatus(order) {
    var elapsed = Date.now() - new Date(order.createdAt).getTime();

    if (order.mode === "token-token") {
      if (elapsed >= 20000) return { expired: true };
      return {
        expired: false,
        className: "review",
        label: "Принят на обмен, ожидайте зачисление"
      };
    }

    if (order.mode === "rub-sbp") {
      if (elapsed < 10000) {
        return {
          expired: false,
          className: "pending",
          label: "Ожидается перевод"
        };
      }
      if (elapsed < 40000) {
        return {
          expired: false,
          className: "processing",
          label: "Принят и перевод оформлен"
        };
      }
      return { expired: true };
    }

    if (order.mode === "rub-fiat") {
      return {
        expired: false,
        className: "review",
        label: "Выдача доступна в выбранном городе"
      };
    }

    return {
      expired: false,
      className: "pending",
      label: "Ожидает подтверждения"
    };
  }

  function getRouteLabel(from, to, rubMode) {
    if (from === "RUB") {
      if (orderPayMethod.value === "card") {
        return "Оплата сервису на карту";
      }
      if (orderPayMethod.value === "account") {
        return "Оплата сервису на расчетный счет";
      }
      return "Оплата сервису по СБП";
    }

    if (from !== "RUB" && to !== "RUB") {
      return (orderTokenNetwork.value.trim() || "Сеть не указана") + " / " + (orderTokenWallet.value.trim() || "кошелёк получателя");
    }

    if (to === "RUB" && rubMode === "sbp") {
      return orderSbpMethod.options[orderSbpMethod.selectedIndex].text + " / " + orderBank.value;
    }

    if (to === "RUB" && rubMode === "fiat") {
      return orderCity.value ? "Выдача в городе: " + orderCity.value : "Город получения не выбран";
    }

    return "Стандартный маршрут";
  }

  function getIssuedRequisites(from, to, rubMode) {
    if (from !== "RUB") {
      var networks = {
        BTC: "bc1q8nonoir6x5w4p3z7k9u2m1a0exchange",
        ETH: "0xN0NO1R8a7c6b5d4e3f2a1b0c9d8e7f6a5b4c3d2",
        USDT: "TNonoir7Yh3Lp9Qm2Rw6Xa4Bc8De1Fg5Hj",
        LTC: "ltc1qnonoir8w2x4y6z7a9b3c5d1e2f4g6h8j0k"
      };
      return "Адрес для перевода: " + (networks[from] || networks.USDT);
    }

    if (from === "RUB") {
      if (orderPayMethod.value === "card") {
        return "Карта: 2200 7012 4455 8899";
      }
      if (orderPayMethod.value === "account") {
        return "Расчетный счет: 40817 810 0 1234 5678901";
      }
      return "Телефон СБП: +7 999 145-77-21";
    }

    return "Реквизиты будут выданы после подтверждения заявки";
  }

  function showAlert(message, type) {
    exchangeAlert.hidden = false;
    exchangeAlert.className = "exchange-alert " + (type === "error" ? "is-error" : "is-success");
    exchangeAlert.textContent = message;
  }

  function syncConditionalFields() {
    var isRubPayout = orderTo.value === "RUB";
    var rubMode = orderRubMode.value;
    var isTokenToToken = orderFrom.value !== "RUB" && orderTo.value !== "RUB";
    var isRubInput = orderFrom.value === "RUB";

    calcRubModeGroup.hidden = calcTo.value !== "RUB";
    orderPayMethodGroup.hidden = !isRubInput;
    orderRubModeGroup.hidden = !isRubPayout;

    sbpFields.hidden = !isRubPayout || rubMode !== "sbp";
    fiatFields.hidden = !isRubPayout || rubMode !== "fiat";
    tokenFields.hidden = !isTokenToToken;

    orderRequisites.required = isRubPayout && rubMode === "sbp";
    orderCity.required = isRubPayout && rubMode === "fiat";
    orderTokenNetwork.required = isTokenToToken;
    orderTokenWallet.required = isTokenToToken;
  }

  function updateCalculator() {
    var amount = parseFloat(calcAmount.value) || 0;
    var from = calcFrom.value;
    var to = calcTo.value;
    var rubMode = calcRubMode.value;
    var data = calculateExchange(amount, from, to);
    var mode = getExchangeMode(from, to, rubMode);

    calcResultValue.textContent = formatAmount(data.result, to);
    calcCommLabel.textContent = "Комиссия " + (data.commission * 100).toFixed(1) + "% уже включена";
    calcRate.textContent = "1 " + from + " = " + getRateValue(from, to).toFixed(to === "RUB" ? 2 : 6) + " " + to;
    calcDirectionNote.textContent = from === to ? "Выберите разные валюты для заявки" : getModeLabel(mode);
  }

  function syncFormWithCalculator() {
    orderAmount.value = calcAmount.value;
    orderFrom.value = calcFrom.value;
    orderTo.value = calcTo.value;
    orderRubMode.value = calcRubMode.value;
    syncConditionalFields();
    updatePreview();
  }

  function updatePreview() {
    var amount = parseFloat(orderAmount.value) || 0;
    var from = orderFrom.value;
    var to = orderTo.value;
    var rubMode = orderRubMode.value;
    var data = calculateExchange(amount, from, to);
    var mode = getExchangeMode(from, to, rubMode);

    previewDirection.textContent = to === "RUB" ? from + " → RUB (" + (rubMode === "sbp" ? "СБП" : "фиат") + ")" : from + " → " + to;
    previewRoute.textContent = getRouteLabel(from, to, rubMode);
    previewResult.textContent = formatAmount(data.result, to);
    previewCommission.textContent = (data.commission * 100).toFixed(1) + "%";
    previewStatus.textContent = from === to ? "Нужно изменить направление" : getPreviewStatus(mode);
    previewIssuedRequisites.textContent = getIssuedRequisites(from, to, rubMode);
  }

  function readOrders() {
    try {
      var orders = JSON.parse(localStorage.getItem(storageKey) || "[]");
      return Array.isArray(orders) ? orders : [];
    } catch (error) {
      return [];
    }
  }

  function saveOrders(orders) {
    localStorage.setItem(storageKey, JSON.stringify(orders.slice(0, maxOrders)));
  }

  function purgeExpiredOrders(orders) {
    return orders.filter(function (order) {
      return !getOrderRuntimeStatus(order).expired;
    });
  }

  function renderOrders() {
    var orders = purgeExpiredOrders(readOrders());
    saveOrders(orders);
    ordersList.innerHTML = "";

    if (!orders.length) {
      ordersEmpty.style.display = "";
      ordersToggleBtn.hidden = true;
      return;
    }

    ordersEmpty.style.display = "none";

    var visibleOrders = showAllOrders ? orders : orders.slice(0, collapsedCount);
    ordersToggleBtn.hidden = orders.length <= collapsedCount;
    ordersToggleBtn.textContent = showAllOrders ? "Свернуть" : "Увидеть больше";

    visibleOrders.forEach(function (order) {
      var status = getOrderRuntimeStatus(order);
      var route = order.mode === "rub-fiat" ? order.city : order.route;
      var item = document.createElement("article");
      item.className = "order-card";
      item.innerHTML =
        '<div class="order-card-head">' +
          "<strong>" + order.number + "</strong>" +
          '<span class="order-status ' + status.className + '">' + status.label + "</span>" +
        "</div>" +
        '<div class="order-card-body">' +
          '<div class="order-card-row"><span>Направление</span><span>' + order.directionLabel + "</span></div>" +
          '<div class="order-card-row"><span>Отдаёте</span><span>' + formatAmount(order.amount, order.from) + "</span></div>" +
          '<div class="order-card-row"><span>К выплате</span><span>' + formatAmount(order.result, order.to) + "</span></div>" +
          '<div class="order-card-row"><span>Маршрут</span><span>' + route + "</span></div>" +
          '<div class="order-card-row"><span>Реквизиты</span><span>' + order.issuedRequisites + "</span></div>" +
          '<div class="order-card-row"><span>Создана</span><span>' + formatDate(order.createdAt) + "</span></div>" +
        "</div>";
      ordersList.appendChild(item);
    });
  }

  function createOrderNumber() {
    return "NX-" + Date.now().toString().slice(-8);
  }

  function buildOrder() {
    var amount = parseFloat(orderAmount.value) || 0;
    var from = orderFrom.value;
    var to = orderTo.value;
    var rubMode = orderRubMode.value;
    var mode = getExchangeMode(from, to, rubMode);
    var data = calculateExchange(amount, from, to);

    return {
      number: createOrderNumber(),
      amount: amount,
      from: from,
      to: to,
      payMethod: orderPayMethod.value,
      result: data.result,
      commission: data.commission,
      mode: mode,
      rubMode: rubMode,
      bank: orderBank.value,
      sbpMethod: orderSbpMethod.value,
      requisites: orderRequisites.value.trim(),
      city: orderCity.value,
      tokenNetwork: orderTokenNetwork.value.trim(),
      tokenWallet: orderTokenWallet.value.trim(),
      contact: orderContact.value.trim(),
      comment: orderComment.value.trim(),
      createdAt: new Date().toISOString(),
      route: getRouteLabel(from, to, rubMode),
      issuedRequisites: getIssuedRequisites(from, to, rubMode),
      directionLabel: to === "RUB" ? from + " → RUB (" + (rubMode === "sbp" ? "СБП" : "фиат") + ")" : from + " → " + to
    };
  }

  function validateOrder() {
    var amount = parseFloat(orderAmount.value) || 0;
    var from = orderFrom.value;
    var to = orderTo.value;
    var rubMode = orderRubMode.value;
    var activeOrders = purgeExpiredOrders(readOrders());

    if (activeOrders.length >= maxOrders) {
      showAlert("Достигнут лимит в 10 активных заявок. Дождитесь завершения части заявок или обновления истории.", "error");
      return false;
    }

    if (amount <= 0) {
      showAlert("Укажите корректную сумму для обмена.", "error");
      return false;
    }

    if (from === to) {
      showAlert("В заявке должны быть разные валюты отправки и получения.", "error");
      return false;
    }

    if (!orderContact.value.trim()) {
      showAlert("Укажите контакт для связи с менеджером.", "error");
      return false;
    }

    if (to === "RUB" && rubMode === "sbp") {
      if (!orderRequisites.value.trim()) {
        showAlert("Для выплаты через СБП укажите реквизиты получателя.", "error");
        return false;
      }
    }

    if (to === "RUB" && rubMode === "fiat") {
      if (!orderCity.value) {
        showAlert("Выберите город для получения наличных.", "error");
        return false;
      }
    }

    if (from !== "RUB" && to !== "RUB") {
      if (!orderTokenNetwork.value.trim() || !orderTokenWallet.value.trim()) {
        showAlert("Для обмена токен на токен укажите сеть и кошелёк получения.", "error");
        return false;
      }
    }

    return true;
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!validateOrder()) return;

    var orders = purgeExpiredOrders(readOrders());
    var order = buildOrder();

    orders.unshift(order);
    saveOrders(orders);
    renderOrders();

    showAlert(
      "Заявка " + order.number + " создана. Текущий режим: " + getPreviewStatus(order.mode) + ". В истории сохранено " + Math.min(orders.length, maxOrders) + " из " + maxOrders + " заявок.",
      "success"
    );

    form.reset();
    orderFrom.value = "USDT";
    orderTo.value = "RUB";
    orderPayMethod.value = "sbp";
    orderRubMode.value = "sbp";
    orderSbpMethod.value = "sbp";
    orderBank.selectedIndex = 0;
    syncConditionalFields();
    updatePreview();
  }

  calcAmount.addEventListener("input", function () {
    updateCalculator();
    syncFormWithCalculator();
  });
  calcFrom.addEventListener("change", function () {
    updateCalculator();
    syncFormWithCalculator();
  });
  calcTo.addEventListener("change", function () {
    updateCalculator();
    syncFormWithCalculator();
  });
  calcRubMode.addEventListener("change", function () {
    updateCalculator();
    syncFormWithCalculator();
  });

  orderAmount.addEventListener("input", updatePreview);
  orderFrom.addEventListener("change", function () {
    syncConditionalFields();
    updatePreview();
  });
  orderTo.addEventListener("change", function () {
    syncConditionalFields();
    updatePreview();
  });
  orderPayMethod.addEventListener("change", updatePreview);
  orderRubMode.addEventListener("change", function () {
    syncConditionalFields();
    updatePreview();
  });
  orderSbpMethod.addEventListener("change", updatePreview);
  orderBank.addEventListener("change", updatePreview);
  orderCity.addEventListener("change", updatePreview);
  orderTokenNetwork.addEventListener("input", updatePreview);
  orderTokenWallet.addEventListener("input", updatePreview);
  form.addEventListener("submit", handleSubmit);

  ordersToggleBtn.addEventListener("click", function () {
    showAllOrders = !showAllOrders;
    renderOrders();
  });

  syncConditionalFields();
  updateCalculator();
  updatePreview();
  renderOrders();
  window.setInterval(renderOrders, 1000);
})();
