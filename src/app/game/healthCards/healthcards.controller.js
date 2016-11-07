(function () {
    'use strict';

    angular
        .module('app.game')
        .controller('HealthCardController', HealthCardController);

    /* @ngInject */
    function HealthCardController($scope, $cookies, $mdDialog, $timeout, $state, $filter, CommonService, ToastService, api, API_BROADCAST_CONSTANTS) {
        var vm = this;

        vm.availableHealthCards = [];

        //request all health cards from the server
        CommonService.healthCards.getAllCards();

        //this broadcast listener get all health cards from server
        $scope.$on(API_BROADCAST_CONSTANTS.API_GET_ALL_CARDS, function (event, allHealthCards) {
            vm.availableHealthCards = allHealthCards;
            console.log(vm.availableHealthCards);
        });

        vm.openChat = function () {
            $state.go('triangular.admin-default-no-scroll.game-chat');
        }

    }

})();