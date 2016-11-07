(function () {
    'use strict';

    angular
        .module('app.game')
        .controller('GameLoadingController', GameLoadingController);

    /* @ngInject */
    function GameLoadingController($scope, $timeout, $state) {
        var vm = this;

        $timeout(function () {
            $state.go('triangular.admin-default-no-scroll.game-splash');
        }, 7000);

        var c = document.getElementById("c");
        var ctx = c.getContext("2d");

        ctx.font = "20px Georgia";
        ctx.fillText("Hello World!", 10, 50);

        ctx.font = "30px Verdana";

        var gradient = ctx.createLinearGradient(0, 0, c.width, 0);
        gradient.addColorStop("0", "magenta");
        gradient.addColorStop("0.5", "blue");
        gradient.addColorStop("1.0", "red");

        ctx.fillStyle = gradient;
        ctx.fillText("Big smile!", 10, 90);

        //making the canvas full screen
        c.height = window.innerHeight;
        c.width = window.innerWidth;

        var charcters = "ABCDEFGHIGKMNOLPQRSWTUVX";
        charcters = charcters.split("");

        var font_size = 18;
        var columns = c.width / font_size;
        var drops = [];
        for (var x = 0; x < columns; x++)
            drops[x] = 1;

        function draw() {
            ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
            ctx.fillRect(0, 0, c.width, c.height);

            ctx.fillStyle = "red";
            ctx.font = font_size + "px arial bold";
            for (var i = 0; i < drops.length; i++) {
                var text = charcters[Math.floor(Math.random() * charcters.length)];
                ctx.fillText(text, i * font_size, drops[i] * font_size);

                if (drops[i] * font_size > c.height && Math.random() > 0.975)
                    drops[i] = 0;

                drops[i]++;
            }
        }

        setInterval(draw, 33);
    }
})();