(function () {
    'use strict';

    angular
        .module('game-module')
        .controller('ChatPageController', ChatPageController);

    /* @ngInject */
    function ChatPageController($scope, $timeout, $state, AUCTIONEER_INTRODUCTION_MESSAGES, AUCTION_USER_DATA) {
        var vm = this;

        //auctioneer's chat bubble message
        vm.auctioneerChatBubbleMsg = "";
        //chat bubble special effect class
        vm.auctioneerChatBubbleEffectClass = "";
        //hide auctioneer's chat bubble
        vm.auctioneerChatBubbleHide = false;
        //available health cards array
        vm.availableHealthCards = AUCTIONEER_INTRODUCTION_MESSAGES.AUCTIONED_HEALTH_CARDS;
        //currently selected health card
        vm.currentlySelectedHealthCard = null;
        //initial user money
        vm.initialUserValue = 100;
        //remaining user value
        vm.remainingUserValue = 0;
        //current logged user
        vm.currentLoggedUser = AUCTION_USER_DATA.CURRENT_USER;

        //fired when open this page
        vm.init = function () {
            vm.auctioneerChatBubbleEffectClass = "chat-bubble-bounce";
            vm.auctioneerChatBubbleMsg = AUCTIONEER_INTRODUCTION_MESSAGES.WELCOME_TO_AUTION + " '" + AUCTION_USER_DATA.CURRENT_USER.user_name + "'"

            $timeout(function () {
                vm.auctioneerChatBubbleHide = true;
            }, 2000);

            vm.remainingUserValue = vm.initialUserValue;
        }

        //fires when click on a health card
        vm.healthCardOnClick = function (selected_health_card) {
            vm.currentlySelectedHealthCard = selected_health_card;
        }
        
        vm.goBack = function() {
            $state.go('triangular.admin-default-no-scroll.game-splash');
        }
    }
})();