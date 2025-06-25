$(document).ready(function () {
    let allData = [];
    let table = $('#products').DataTable(
        {
            language: {
                url: 'https://cdn.datatables.net/plug-ins/1.13.6/i18n/ru.json'
            }
        }
    );

    // Стартовый слайдер рейтинга
    $("#rating-range").slider({
        range: "min",
        min: 0,
        max: 5,
        step: 0.1,
        value: 0,
        slide: function (event, ui) {
            $("#rating-min").text(ui.value);
        },
        change: filterAndRender
    });

    $("#load").click(function (event) {
        event.preventDefault();
        const query = $('#query').val();
        const url = `/api/products/?query=${encodeURIComponent(query)}`;

        $("#loading-overlay").fadeIn();
        $("body").css("overflow", "hidden");

        fetch(url)
            .then(response => response.json())
            .then(data => {
                allData = data;

                if (allData.length === 0) {
                    $('#filters').hide();
                    table.clear().draw();
                    return;
                }

                const maxPrice = Math.max(...allData.map(p => p["Цена со скидкой"]));
                const minPrice = Math.min(...allData.map(p => p["Цена со скидкой"]));
                const maxFeedbacks = Math.max(...allData.map(p => p["Количество отзывов"]));
                const minFeedbacks = Math.min(...allData.map(p => p["Количество отзывов"]));

                // Слайдер цены
                $("#price-range").slider({
                    range: true,
                    min: minPrice,
                    max: maxPrice,
                    values: [minPrice, maxPrice],
                    slide: function (event, ui) {
                        // при движении слайдера обновляем поля
                        $("#price-input-min").val(ui.values[0]);
                        $("#price-input-max").val(ui.values[1]);
                    },
                    change: filterAndRender
                });

                $("#price-input-min").val(minPrice);
                $("#price-input-max").val(maxPrice);

                $("#price-input-min, #price-input-max").on("change", function () {
                    let minVal = parseInt($("#price-input-min").val());
                    let maxVal = parseInt($("#price-input-max").val());

                    if (minVal > maxVal) [minVal, maxVal] = [maxVal, minVal];

                    $("#price-range").slider("values", [minVal, maxVal]);
                    filterAndRender();
                });


                // Слайдер отзывов
                $("#feedbacks-range").slider({
                    range: true,
                    min: minFeedbacks,
                    max: maxFeedbacks,
                    values: [minFeedbacks, maxFeedbacks],
                    slide: function (event, ui) {
                        $("#feedbacks-min").text(ui.values[0]);
                        $("#feedbacks-max").text(ui.values[1]);
                    },
                    change: filterAndRender
                });
                $("#feedbacks-min").text(minFeedbacks);
                $("#feedbacks-max").text(maxFeedbacks);

                filterAndRender();
                $("#filters").show();
                document.getElementById("charts").style.display = "block";
                $("#loading-overlay").fadeOut();
                $("body").css("overflow", "auto");
            })
            .catch(error => {
                console.error(error);
                alert("Произошла ошибка при загрузке данных");

                $("#loading-overlay").fadeOut();
                $("body").css("overflow", "auto");
            });
    });

    function filterAndRender() {
        const [minPrice, maxPrice] = $("#price-range").slider("values");
        const minRating = $("#rating-range").slider("value");
        const [minFeedbacks, maxFeedbacks] = $("#feedbacks-range").slider("values");

        const filtered = allData.filter(item =>
            item["Цена со скидкой"] >= minPrice &&
            item["Цена со скидкой"] <= maxPrice &&
            item["Рейтинг"] >= minRating &&
            item["Количество отзывов"] >= minFeedbacks &&
            item["Количество отзывов"] <= maxFeedbacks
        );

        table.clear();
        filtered.forEach(item => {
            table.row.add([
                item["Артикул"],
                item["Название товара"],
                item["Цена"],
                item["Цена со скидкой"],
                item["Рейтинг"],
                item["Количество отзывов"]
            ]);
        });
        table.draw();
        createOrUpdateCharts(filtered);
    }

    $("#scrollToCharts").click(function () {
        $('html, body').animate({ scrollTop: $("#charts").offset().top }, 100);
    });
    let priceHistogramChart, discountChart;

    function createOrUpdateCharts(data) {
        // Гистограмма цен
        const prices = data.map(item => item["Цена со скидкой"]);
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        const range = max - min;
        const step = Math.ceil(range / 10);

        const buckets = {};
        for (let i = 0; i < 10; i++) {
            const from = min + i * step;
            const to = from + step - 1;
            buckets[`${from}–${to}`] = 0;
        }

        data.forEach(item => {
            const price = item["Цена со скидкой"];
            const bucketIndex = Math.floor((price - min) / step);
            const key = Object.keys(buckets)[Math.min(bucketIndex, 9)];
            buckets[key]++;
        });

        const labels = Object.keys(buckets);
        const values = Object.values(buckets);

        if (priceHistogramChart) priceHistogramChart.destroy();
        priceHistogramChart = new Chart(document.getElementById("priceHistogram"), {
            type: "bar",
            data: {
                labels: labels,
                datasets: [{
                    label: "Количество товаров",
                    data: values,
                    backgroundColor: "rgba(244, 231, 255, 1)",
                    borderColor: "rgba(146, 37, 230, 1)",
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    datalabels: {
                        anchor: "end",
                        align: "top",
                        color: "#A73AFD",
                        font: {
                            weight: "bold"
                        },
                        formatter: Math.round
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: "Кол-во"
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: "Диапазон цен"
                        }
                    }
                }
            },
            plugins: [ChartDataLabels]
        });


        // График скидка vs рейтинг
        const discountBuckets = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [] };

        data.forEach(item => {
            const rating = Math.round(item["Рейтинг"]);
            const discount = item["Цена"] - item["Цена со скидкой"];
            if (discountBuckets[rating] !== undefined) {
                discountBuckets[rating].push(discount);
            }
        });

        const ratings = Object.keys(discountBuckets).map(Number);
        const averageDiscounts = ratings.map(r => {
            const values = discountBuckets[r];
            if (values.length === 0) return 0;
            const sum = values.reduce((a, b) => a + b, 0);
            return +(sum / values.length).toFixed(2);
        });

        if (discountChart) discountChart.destroy();
        discountChart = new Chart(document.getElementById("discountChart"), {
            type: "line",
            data: {
                labels: ratings,
                datasets: [{
                    label: "Средняя скидка",
                    data: averageDiscounts,
                    fill: false,
                    backgroundColor: "rgba(244, 231, 255, 1)",
                    borderColor: "rgba(146, 37, 230, 1)",
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                layout: {
                    padding: {
                        right: 20,
                        left: 20
                    }
                },
                plugins: {
                    datalabels: {
                        anchor: "end",
                        align: "top",
                        color: "#A73AFD",
                        font: {
                            weight: "bold"
                        },
                        formatter: v => `${v.toFixed(1)} ₽`
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: "Рейтинг товара (целый)"
                        },
                        ticks: {
                            stepSize: 1
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: "Средняя скидка (₽)"
                        }
                    }
                }
            },
            plugins: [ChartDataLabels]
        });
    }
});