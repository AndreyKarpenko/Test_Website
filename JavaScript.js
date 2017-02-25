window.onload = function () {
    var view = {
        showContent: function (data, index) {
            $("#image img").attr("src", "http://smktesting.herokuapp.com/static/" + data[index].img);
            $("#image #title").text(data[index].title);
            $("#image #text").text(data[index].text);
        },//функция вывода информации о товаре

        showComents: function (data, index) {
            $('p#review').empty();
            var myItems = [];
            $myList = $('p#review');
            for (var i = 0; i < data.length; i++) {
                myItems.push("<div> Name: " + data[i].created_by.username + " Date: " +
                    data[i].created_at + "<br/>" + "Rate: " +
                    data[i].rate + "<br/>" + "Text: " +
                    data[i].text + "</div>");
            }
            $myList.append(myItems.reverse().join(''));
        },//функция вывода кометариев о товаре

        false_enter: function (message) {
            $("#false_enter").css("display", "block").text(message);
        },//вывод ошибки входа/регистрации

        error: function () {
            $("#error").css("display", "block");
        },//вывод ошибки при посте коментария

        hide: function () {
            $("#error, #false_enter").css("display", "none");
        },//скрывает текст ошибки блока коментариев и логин/пароля

        enter: function () {
            var login = $("#login").val();
            $("#reg").children().css("display", "none");
            $("#hello").text("Hello " + login).css("display", "block");
        },//вывод приветствия при удачном входе/регистрации

        noLogin: function () {
            $("#login, #password").css("border-color", "red");
            setTimeout(mark, 1000);
            function mark() {
                $("#login, #password").css("border-color", "#808080");
            }
        },//не введен логин/пароль

        noComent: function () {
            $("#text_review, #rate_review").css("border-color", "red");
            setTimeout(mark, 1000);
            function mark() {
                $("#text_review, #rate_review").css("border-color", "#808080");
            }
        }
    };//блок view

    var model = {
        index: undefined,
        token: undefined,
        rv_login: /^[a-zA-Zа-яА-Я]{1,}[a-zA-Zа-яА-Я0-9]{2,}/,
        rv_rate: /^[0-5]/,
        rv_password: /\w{8,16}/,
        rv_text: /\w{10,}/,
        content: function (index) {
            this.index = index + 1;
            $.ajax({
                url: 'http://smktesting.herokuapp.com/api/products/',
                type: 'GET',
                success: function (data) {

                    view.showContent(data, index);

                    $.ajax({
                        url: 'http://smktesting.herokuapp.com/api/reviews/' + data[index].id,
                        type: 'GET',
                        success: function (data) {
                            view.showComents(data, index);
                        }
                    })//ajax запрос возвращает коментарии продукта
                }
            });//ajax запрос возвращает информацию о продукте
        },//ajax запрос информации о продукте и коментариях
        register: function () {
            var login = $("#login").val();
            var password = $("#password").val();
            var user = {
                username: login,
                password: password
            };
            if (model.rv_password.test(password) && model.rv_login.test(login)) {//проверка на ввод логин/пароля
                $.ajax({
                    url: "http://smktesting.herokuapp.com/api/register/",
                    type: 'POST',
                    dataType: 'json',
                    data: user,
                    success: function (data) {
                        model.token = data.token;
                        if (data.success == false) {//условие неудачной регистрации
                            view.false_enter(data.message);
                            setTimeout(view.hide, 2000);
                        }
                        if (data.success == true) {//условие удачной регистрации
                            view.enter();
                        }
                    }
                });
            }
            else {
                view.noLogin();
            }
        },//запрос регистрации
        log_in: function () {
            var login = $("#login").val();
            var password = $("#password").val();
            var user = {
                username: login,
                password: password
            };
            if (model.rv_password.test(password) && model.rv_login.test(login)) {//проверка на ввод логин/пароля
                $.ajax({
                    url: "http://smktesting.herokuapp.com/api/login/",
                    type: 'POST',
                    dataType: 'json',
                    data: user,
                    success: function (data) {
                        model.token = data.token;
                        if (data.success == false) {//условие неудачного входа
                            view.false_enter(data.message);
                            setTimeout(view.hide, 2000);
                        }
                        if (data.success == true) {//условие удачного входа
                            view.enter();
                        }
                    }
                });
            }
            else {
                view.noLogin();
            }
        },//запрос входа
        addComent: function () {
            var rate = $("#rate_review").val();
            var text = $("#text_review").val();
            var review = {
                rate: rate,
                text: text
            };
            if (model.token != undefined) {
                if (model.rv_text.test(text) && model.rv_rate.test(rate)) {
                    $.ajax({
                        url: "http://smktesting.herokuapp.com/api/reviews/" + this.index,//запрос на пост коментария
                        type: 'POST',
                        headers: {
                            'Authorization': 'Token ' + this.token
                        },
                        dataType: 'json',
                        data: review,
                        success: function () {
                            $.ajax({
                                url: 'http://smktesting.herokuapp.com/api/reviews/' + model.index,//обновить список коментариев
                                type: 'GET',
                                success: function (data) {
                                    view.showComents(data, model.index);
                                }
                            });
                        }
                    });
                }
                else {
                    view.noComent();
                }
            }
            else {
                view.error();
                setTimeout(view.hide, 2000);
            }
        },//запрос на пост коментария
    };//блок model

    var controller = {
        clk_content: function () {
            $("li").on("click", function (e){
                var index = $(e.target).index();
                model.content(index);
            })
        },//событие по клику на товаре
        clk_register: function () {
            $("#btn_reg").on("click", function (){
               model.register();
            })
        },//событие при регистрации
        clk_log_in: function () {
            $("#btn_log").on("click", function (){
                model.log_in();
            })
        },//собыьте при входе
        clk_send: function () {
            $("#send").on("click", function () {
                model.addComent();
            })
        }//событие при посте отзыва
    };//блок controller

    (function () {
        controller.clk_content();
        controller.clk_register();
        controller.clk_log_in();
        controller.clk_send();
        model.content(0);
    })();//анонимная функция для автоматического запуска функций-обработчиков
}