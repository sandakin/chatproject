(function() {
    'use strict';

    angular
        .module('game-module')
        .controller('GameLoadingController', GameLoadingController);

    /* @ngInject */
    function GameLoadingController($scope, $timeout, $state) {
        var vm = this;

        $timeout(function () {
            $state.go('triangular.admin-default-no-scroll.game-splash');
        }, 5000);
    }
})();