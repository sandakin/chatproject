(function () {
    'use strict';

    angular
        .module('app.game')
        .controller('GameSplashController', GameSplashController);

    /* @ngInject */
    function GameSplashController($scope, $timeout, $state, CommonService) {
        var vm = this;
        vm.enterBiddingRoom = function () {
            $state.go('triangular.admin-default-no-scroll.registration');
        };

        $('.flip').mouseover(function () {
            $(this).find('.card').addClass('flipped').mouseleave(function () {
                $(this).removeClass('flipped');
            });
            return false;
        });
    }
})();