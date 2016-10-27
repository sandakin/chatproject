(function () {
    'use strict';

    angular
        .module('game-module')
        .controller('GameSplashController', GameSplashController);

    /* @ngInject */
    function GameSplashController($scope, $timeout, $state) {
        var vm = this;

        vm.enterBiddingRoom = function() {
            $state.go('triangular.admin-default-no-scroll.game-chat');
        };
    }
})();