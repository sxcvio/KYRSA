(function () {
  var amountInput = document.getElementById("aml-amount");
  var assetInput = document.getElementById("aml-asset");
  var sourceInput = document.getElementById("aml-source");
  var activityInput = document.getElementById("aml-activity");
  var jurisdictionInput = document.getElementById("aml-jurisdiction");
  var frequencyInput = document.getElementById("aml-frequency");
  var walletAgeInput = document.getElementById("aml-wallet-age");
  var checkButton = document.getElementById("aml-check-btn");
  var badge = document.getElementById("aml-badge");
  var score = document.getElementById("aml-score");
  var title = document.getElementById("aml-title");
  var text = document.getElementById("aml-text");
  var decision = document.getElementById("aml-decision");
  var action = document.getElementById("aml-action");
  var factorList = document.getElementById("aml-factor-list");
  var stageList = document.getElementById("aml-stage-list");

  if (
    !amountInput || !assetInput || !sourceInput || !activityInput ||
    !jurisdictionInput || !frequencyInput || !walletAgeInput ||
    !checkButton || !badge || !score || !title || !text ||
    !decision || !action || !factorList || !stageList
  ) {
    return;
  }

  function renderFactors(items) {
    factorList.innerHTML = "";
    items.forEach(function (item) {
      var li = document.createElement("li");
      li.textContent = item;
      factorList.appendChild(li);
    });
  }

  function renderStages(items) {
    stageList.innerHTML = "";
    items.forEach(function (item) {
      var li = document.createElement("li");
      li.textContent = item;
      stageList.appendChild(li);
    });
  }

  function applyResult(config) {
    badge.className = "aml-badge " + config.badgeClass;
    badge.textContent = config.badgeText;
    score.textContent = config.score + " / 100";
    title.textContent = config.title;
    text.textContent = config.text;
    decision.textContent = config.decision;
    action.textContent = config.action;
    renderFactors(config.factors);
    renderStages(config.stages);
  }

  function calculateAmlStatus() {
    var amount = parseFloat(amountInput.value) || 0;
    var asset = assetInput.value;
    var source = sourceInput.value;
    var activity = activityInput.value;
    var jurisdiction = jurisdictionInput.value;
    var frequency = frequencyInput.value;
    var walletAge = walletAgeInput.value;

    var total = 0;
    var factors = [];

    if (amount >= 25000) {
      total += 28;
      factors.push("Крупный объём заявки: +28 баллов");
    } else if (amount >= 10000) {
      total += 18;
      factors.push("Повышенный объём заявки: +18 баллов");
    } else if (amount >= 3000) {
      total += 8;
      factors.push("Средний объём заявки: +8 баллов");
    } else {
      factors.push("Размер заявки укладывается в базовый профиль: +0 баллов");
    }

    if (asset === "BTC") {
      total += 10;
      factors.push("Актив BTC требует более строгого мониторинга: +10 баллов");
    } else if (asset === "ETH") {
      total += 7;
      factors.push("Актив ETH со средним уровнем мониторинга: +7 баллов");
    } else if (asset === "LTC") {
      total += 5;
      factors.push("Актив LTC требует стандартной проверки: +5 баллов");
    } else {
      factors.push("USDT относится к базовому операционному профилю: +0 баллов");
    }

    if (source === "exchange") {
      total += 6;
      factors.push("Биржевой вывод требует верификации цепочки поступления: +6 баллов");
    } else if (source === "mixed") {
      total += 16;
      factors.push("Смешанная история поступлений: +16 баллов");
    } else if (source === "unknown") {
      total += 28;
      factors.push("Источник средств не идентифицирован: +28 баллов");
    } else {
      factors.push("Подтвержденный кошелек без негативных признаков: +0 баллов");
    }

    if (activity === "medium") {
      total += 10;
      factors.push("Обнаружена нетипичная активность: +10 баллов");
    } else if (activity === "high") {
      total += 22;
      factors.push("Высокорискованный паттерн активности: +22 балла");
    } else {
      factors.push("Поведение соответствует обычному профилю: +0 баллов");
    }

    if (jurisdiction === "watch") {
      total += 14;
      factors.push("Контрагент из юрисдикции повышенного наблюдения: +14 баллов");
    } else if (jurisdiction === "restricted") {
      total += 26;
      factors.push("Контрагент из ограниченной юрисдикции: +26 баллов");
    } else {
      factors.push("Юрисдикция не вызывает дополнительных вопросов: +0 баллов");
    }

    if (frequency === "regular") {
      total += 8;
      factors.push("Наблюдается повторяемость похожих операций: +8 баллов");
    } else if (frequency === "burst") {
      total += 18;
      factors.push("Серия однотипных транзакций за короткое время: +18 баллов");
    } else {
      factors.push("Нет признаков подозрительной частоты переводов: +0 баллов");
    }

    if (walletAge === "mid") {
      total += 8;
      factors.push("Кошелёк средней давности требует дополнительной осторожности: +8 баллов");
    } else if (walletAge === "new") {
      total += 18;
      factors.push("Новый кошелёк без устойчивой истории: +18 баллов");
    } else {
      factors.push("Кошелёк с устойчивой историей: +0 баллов");
    }

    if (total <= 24) {
      applyResult({
        badgeClass: "aml-badge-low",
        badgeText: "Низкий риск",
        score: total,
        title: "Заявка проходит автоматическую AML-проверку",
        text: "Совокупный профиль операции выглядит допустимым. Заявка может быть допущена к обмену без дополнительного запроса документов.",
        decision: "Автоодобрение",
        action: "Передать в стандартную обработку",
        factors: factors,
        stages: [
          "Источник средств проверен без критичных меток",
          "Поведенческий профиль не показывает аномалий",
          "Заявка допускается к исполнению без ручной модерации"
        ]
      });
      return;
    }

    if (total <= 54) {
      applyResult({
        badgeClass: "aml-badge-medium",
        badgeText: "Средний риск",
        score: total,
        title: "Требуется дополнительная верификация",
        text: "Обнаружены факторы, которые не блокируют заявку автоматически, но требуют уточнения источника средств и ручного подтверждения оператором.",
        decision: "Ручная верификация",
        action: "Запросить уточнение происхождения средств",
        factors: factors,
        stages: [
          "Первичный скоринг выявил факторы наблюдения",
          "Нужна проверка истории адреса и структуры поступлений",
          "Исполнение возможно после подтверждения оператором"
        ]
      });
      return;
    }

    applyResult({
      badgeClass: "aml-badge-high",
      badgeText: "Высокий риск",
      score: total > 100 ? 100 : total,
      title: "Заявка должна быть остановлена до завершения AML-проверки",
      text: "Комбинация факторов указывает на высокий риск. Автоматическое исполнение запрещено до ручного комплаенс-разбора и дополнительной верификации клиента.",
      decision: "Блок до комплаенс-проверки",
      action: "Заморозить исполнение и передать в AML-review",
      factors: factors,
      stages: [
        "Скоринг превысил порог автоматического исполнения",
        "Необходим расширенный анализ цепочки средств и профиля клиента",
        "Выплата и обмен приостанавливаются до решения комплаенс-специалиста"
      ]
    });
  }

  checkButton.addEventListener("click", calculateAmlStatus);
})();
