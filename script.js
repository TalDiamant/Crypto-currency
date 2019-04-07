$(document).ready(function () {

    const favoriteFive = [];
    const arrCoins = [];
    var intervalClear = setInterval(() => { });

    $("#loading").hide();
    navBar();
    getHomeContent();

    //Start *nav-bar buttons*//

    function navBar() {

        var nav = document.getElementById("navbar_btns");
        var btns = nav.getElementsByClassName("btn");

        for (var i = 0; i < btns.length; i++) {
            btns[i].addEventListener("click", function () {
                var current = document.getElementsByClassName("active");
                current[0].className = current[0].className.replace(" active", "");
                this.className += " active";
            });
        };
    };

    $("#home_button").on("click", () => {
        $('#dinamicDiv').empty();
        getHomeContent();
    });

    $("#about_button").on("click", () => {
        $('#loaderDiv').show();
        $.ajax(
            {
                type: "GET",
                url: "Pages/about.html",
                success: (result) => {
                    $("#dinamicDiv").empty();
                    $("#dinamicDiv").append(result);
                },
                error: (error) => {
                    alert("Please try again")
                },
                complete: function () {
                    $('#loaderDiv').hide();
                }
            }
        );
    });

    $("#reports_button").on("click", () => {

        $('#loaderDiv').show();
        const chartDiv = `<div id="chartDiv"</div>`;
        $('#dinamicDiv').empty().append(chartDiv);

        $.ajax(
            {
                type: "GET",
                url: "Pages/graph.html",
                success: () => {
                    getLiveReportContent();
                },
                error: (error) => {
                    alert("Please try again")
                },
                complete: function () {
                    $('#loaderDiv').hide();
                }
            }
        );
    });

    $('#search-button').on("click", (e) => {

        clearInterval(intervalClear);
        e.preventDefault();

        let searchedCoin = $('#search-input').val().toLowerCase();
        let newArr = arrCoins.map(coin => coin.symbol);

        if (newArr.filter(coin => coin === searchedCoin)[0] === searchedCoin) {
            searchedIndex = newArr.indexOf(searchedCoin);
            $('#dinamicDiv').empty();
            createCoinCard(arrCoins[searchedIndex]);
            $('#search-input').val('');
            updateToggleDom();
            getMoreInfo();
        }

        else {
            alert("coin does not exist");
        }
    });

    //End *nav-bar buttons*//

    //Start *home*//

    function getHomeContent() {

        clearInterval(intervalClear);
        $('#loaderDiv').show();

        $.ajax(
            {
                type: "GET",
                url: 'https://api.coingecko.com/api/v3/coins/list',
                success: function (result) {
                    for (let i = 0; i < 100; i++) {
                        createCoinCard(result[i]);
                        getMoreInfo();
                        arrCoins.push({ id: result[i].id, symbol: result[i].symbol, name: result[i].name });
                    }
                },
                error: function (error) {
                    alert("Please try again");
                },
                complete: function () {
                    $('#loaderDiv').hide();
                    if (favoriteFive.length > 0) {
                        updateToggleDom();
                    }
                }
            }
        );
    };

    function createCoinCard(coin) {
        const coinCard = `
        <div id=${coin.id} class="card">
            <div id=${coin.id} class="card-body">
                <label class="switch">
                    <input class="toggle_child" id="${coin.symbol.toUpperCase()}" data-toggle="${coin.symbol.toUpperCase()}" type="checkbox" name="${coin.name}">
                    <span class="slider round"></span>
                </label>
                <h5 class="card-title">${coin.symbol.toUpperCase()}</h5>
                <h6 class="card-subtitle mb-2 text-muted">${coin.name}</h6>
                <button class="collapser" type="button" data-toggle="collapse" 
                data-id=${coin.id}
                data-target=#crypto_${coin.id}
                aria-expanded="false" aria-controls=crypto_${coin.id}>
                More info</button>
                <div class="collapse" id=crypto_${coin.id}>
                    <div  class="card card-body">
                    </div> 
                </div>
            </div>
        </div>`;
        $('#dinamicDiv').append(coinCard);
    };

    //End *home*//

    //Start *more info*//

    function getMoreInfo() {

        const moreInfoBtn = document.getElementsByClassName("collapser");

        for (let i = 0; i < moreInfoBtn.length; i++) {

            moreInfoBtn[i].addEventListener("click", function () {
            
                if ($(event.target).attr("aria-expanded") == "false") {
                    const idCoin = event.target.dataset.id;
                    let timeNow = Date.now();
                    let backUp = JSON.parse(localStorage.getItem(idCoin));

                    if (backUp != null && (timeNow - backUp.ajaxTime < 120000)) {
                        createMoreInfo(idCoin, backUp.image.small, backUp.market_data.current_price.usd, backUp.market_data.current_price.eur, backUp.market_data.current_price.ils);
                        console.log("details from backup");//For check
                        
                    }

                    else {
                        $('#loaderDiv').show();

                        $.ajax({
                            type: "GET",
                            url: `https://api.coingecko.com/api/v3/coins/${idCoin}`,
                            success: function (result) {
                                createMoreInfo(result.id, result.image.small, result.market_data.current_price.usd, result.market_data.current_price.eur, result.market_data.current_price.ils);
                                console.log("details from ajax");//For check
                            },
                            error: function (error) {
                                alert("Please try again");
                            },
                            complete: function (result) {
                                $('#loaderDiv').hide();
                                result.responseJSON.ajaxTime = Date.now();
                                localStorage.setItem(result.responseJSON.id, JSON.stringify(result.responseJSON));
                            }
                        });
                    };
                };
            });
        };
    };

    function createMoreInfo(coinId, coinImg, inUSD, inEUR, inILS) {
        $(`#crypto_${coinId}`).html(`
        <div class="card" id="collapseShow">
            <div class="card-header">
                <img src=${coinImg}/>
            </div>
            <ul class="list-group list-group-flush">
                <li class="list-group-item">USD: ${inUSD}$</li>
                <li class="list-group-item">EUR: ${inEUR}€</li>
                <li class="list-group-item">ILS: ${inILS}₪</li>
            </ul>
        </div>`);
    };

    //End *more info*//

    // start *toggle-event* //

    $("body").on("change", ".toggle_child", () => {

        const coinSymbol = event.target.id;

        if (event.target.checked == false) { //remove chosen the coin from favorite-list on change
            for (let i = 0; i < favoriteFive.length; i++) {
                if (favoriteFive[i] == coinSymbol) {
                    favoriteFive.splice(i, 1);
                   // alert(favoriteFive); //for check
                };
            };
        }
        
        else {
            if (event.target.checked) { //Add chosen coin from favorite-list on change
                
                if (favoriteFive.length < 5) {
                    favoriteFive.push(coinSymbol);
                    // alert(favoriteFive); //for check
                }

                else {
                    $(event.target).prop('checked', false); //Open modal if favorite-list is over 5 coins
                    $('#myModal').modal('show');

                    let modalHtml = "";
                    for (let i = 0; i < favoriteFive.length; i++) {
                        modalHtml += `<div class="favorite-name"></div>
                                            <div class="toggle-card">
                                                <h1>${favoriteFive[i]}</h1>
                                                <label class="switch">
                                                <input type="checkbox" id=${favoriteFive[i]} checked>
                                                <span class="slider round"></span>
                                                </label>
                                            </div>`};
                    $('.modal-body').html(modalHtml);
                };
            };
        };
    });


    $(".save-changes").on("click", () => {

        $(".modal-body input").each(function () {

            let togglechosen = $(this).is(":checked");

            if (togglechosen == false) {

                let symbolChosen = ($(this).attr("id"));

                for (let i = 0; i < favoriteFive.length; i++) {
                    
                    if (favoriteFive[i] == symbolChosen) {//remove chosen coin from favorites-list in the open modal
                        favoriteFive.splice(i, 1);
                        $(`#${symbolChosen}`).prop('checked', false);
                        // alert(favoriteFive); //for check
                    };
                };
            };
        });
    });

    function updateToggleDom() {//Update and save the toggles state 
        for (let i = 0; i < favoriteFive.length; i++) {
            $(`#${favoriteFive[i]}`).prop('checked', true);
        };
    };

    // End *toggle-event* //

    // Start *live-reports* //

    function getLiveReportContent() {

        if (favoriteFive.length == 0) {
            $("#chartDiv").html(`<div> No coins selected, please select your coins </div>`);
        }

        else {
            let myTitle = '';

            for (let i = 0; i < favoriteFive.length; i++) {
                myTitle += `${favoriteFive[i]}, `;
            }

            $("#chartDiv").html(` <div id="chartContainer" style="width: 100%; height: 500px; "></div>`);
            $('#loaderDiv').show();
            let live1 = [];
            let live2 = [];
            let live3 = [];
            let live4 = [];
            let live5 = [];
            let liveCoinsArr = [];

            function getLiveData() {

                $.ajax({

                    type: "GET",
                    url: `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${favoriteFive[0]},${favoriteFive[1]},${favoriteFive[2]},${favoriteFive[3]},${favoriteFive[4]}&tsyms=USD`,

                    success: function (result) {

                        let dateNow = new Date();
                        let index = 1;
                        liveCoinsArr = [];

                        for (let i in result) {

                            if (index == 1) {
                                live1.push({ x: dateNow, y: result[i].USD });
                                liveCoinsArr.push(i);
                            }
                            if (index == 2) {
                                live2.push({ x: dateNow, y: result[i].USD });
                                liveCoinsArr.push(i);
                            }
                            if (index == 3) {
                                live3.push({ x: dateNow, y: result[i].USD });
                                liveCoinsArr.push(i);
                            }
                            if (index == 4) {
                                live4.push({ x: dateNow, y: result[i].USD });
                                liveCoinsArr.push(i);
                            }
                            if (index == 5) {
                                live5.push({ x: dateNow, y: result[i].USD });
                                liveCoinsArr.push(i);
                            }
                            index++;
                        }
                        createGraph();
                    },
                    error: (error) => {
                        alert("Please try again")
                    },
                    complete: function () {
                        $('#loaderDiv').hide();
                    }
                });
            };

            intervalClear = setInterval(() => { getLiveData() }, 2000);

            function createGraph() {

                var coinChart = new CanvasJS.Chart("chartContainer", {
                    animationEnabled: true,
                    theme: "dark1",
                    title: {
                        text: `${(myTitle.slice(0, -2))} to USD`
                    },
                    exportEnabled: true,
                    animationEnabled: false,
                    axisX: {
                        valueFormatString: "hh:mm:ss",
                        crosshair: {
                            enabled: true,
                            snapToDataPoint: true
                        }
                    },
                    axisY: {
                        title: "Value in USD",
                        suffix: " $",
                        crosshair: {
                            enabled: true
                        }
                    },
                    toolTip: {
                        shared: true
                    },
                    legend: {
                        cursor: "pointer",
                        verticalAlign: "bottom",
                        horizontalAlign: "left",
                        dockInsidePlotArea: true,
                        itemclick: toggleDataSeries
                    },
                    data: [{
                        type: "spline",
                        name: liveCoinsArr[0],
                        showInLegend: true,
                        xValueFormatString: "HH:mm:ss",
                        dataPoints: live1

                    },
                    {
                        type: "spline",
                        name: liveCoinsArr[1],
                        showInLegend: true,
                        xValueFormatString: "HH:mm:ss",
                        dataPoints: live2

                    },
                    {
                        type: "spline",
                        name: liveCoinsArr[2],
                        showInLegend: true,
                        xValueFormatString: "HH:mm:ss",
                        dataPoints: live3

                    },
                    {
                        type: "spline",
                        name: liveCoinsArr[3],
                        showInLegend: true,
                        xValueFormatString: "HH:mm:ss",
                        dataPoints: live4

                    },
                    {
                        type: "spline",
                        name: liveCoinsArr[4],
                        showInLegend: true,
                        xValueFormatString: "HH:mm:ss",
                        dataPoints: live5
                    }]
                });

                coinChart.render();

                function toggleDataSeries(e) {

                    if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
                        e.dataSeries.visible = false;
                    }

                    else {
                        e.dataSeries.visible = true;
                    }
                    e.coinChart.render();
                };
            };
        };
    };

    // End *live-reports* //
});




