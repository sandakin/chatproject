(function () {
    'use strict';

    angular
        .module('app.game')
        .controller('ChatPageController', ChatPageController);

    /* @ngInject */
    function ChatPageController($scope, $cookies, $mdDialog, $timeout, $state, CommonService, ToastService, api, AUCTIONEER_INTRODUCTION_MESSAGES, AUCTION_USER_DATA, API_BROADCAST_CONSTANTS) {
        var vm = this;

        //auctioneer's chat bubble message
        vm.auctioneerChatBubbleMsg = "";
        //chat bubble special effect class
        vm.auctioneerChatBubbleEffectClass = "";
        //hide auctioneer's chat bubble
        vm.auctioneerChatBubbleHide = true;
        //available health cards array
        vm.availableHealthCards = [];//AUCTIONEER_INTRODUCTION_MESSAGES.AUCTIONED_HEALTH_CARDS;
        //currently selected health card
        vm.currentlySelectedHealthCard = null;
        //initial user money
        vm.initialUserValue = 100;
        //remaining user value
        vm.remainingUserValue = 0;
        //current logged user
        vm.currentLoggedUser = AUCTION_USER_DATA.CURRENT_USER;

        //store my cart, purchase cards object
        vm.purchasedCardsObject = null;
        //user shopping cart
        vm.userShoppingCart = [];
        //store user selected purchased class
        vm.selectedPurchasedCard = null;

        //check is shopping cart is open or not
        vm.isOpenShoppingCart = false;

        //store all health cards open for bidding
        var allHealthCards = [];

        //health cart config center
        var cardCenter = 0;
        //health card config cart count
        var cardCount = 0;

        //fired when open this page
        vm.init = function ($event) {

            //show nick name dialog only, if user has valid login cookies
            if (!CommonService.isAuthCookiesMissing())
                createDialog($event);

            vm.auctioneerChatBubbleEffectClass = "bigEntrance";
            vm.auctioneerChatBubbleMsg = AUCTIONEER_INTRODUCTION_MESSAGES.WELCOME_TO_AUTION + " '" + AUCTION_USER_DATA.CURRENT_USER.user_name + "'"

            vm.remainingUserValue = vm.initialUserValue;

            //request all health cards from the server
            CommonService.healthCards.getAllCards();
        }

        //initialize health cards styles
        function initHealthCards() {

            //update all health card array with initial health card
            CommonService.healthCards.userPurchasedHealthCards.addCard(CommonService.healthCards.getInitialHealthCard());

            //get user shopping cart
            vm.userShoppingCart = CommonService.healthCards.userPurchasedHealthCards.getCards();

            //initialize health cards styles (need to +1 the length of cart item, because already card is added from the design)
            cardCenter = (angular.isDefined(vm.userShoppingCart) && vm.userShoppingCart != null && angular.isArray(vm.userShoppingCart) && (vm.userShoppingCart.length) % 2 === 1) ? (vm.userShoppingCart.length + 1 / 2) : (vm.userShoppingCart.length) / 2;
            cardCount = (angular.isDefined(vm.userShoppingCart) && vm.userShoppingCart != null && angular.isArray(vm.userShoppingCart)) ? vm.userShoppingCart.length : 0;

            console.log('@@@@@@@@@@@@@@@@@@@@@@@@@@@@ ', vm.userShoppingCart, cardCenter, cardCount);

            $timeout(function () {
                vm.purchasedCardsObject = $('#sb-container').swatchbook({
                    // index of initial centered item
                    center: cardCenter,
                    // number of degrees that is between each item
                    angleInc: 15,
                    neighbor: -10,
                    // if it should be closed by default
                    initclosed: true,
                    // index of the element that when clicked, triggers the open/close function
                    // by default there is no such element
                    closeIdx: (cardCount === 1 || cardCount === 0) ? cardCount : (cardCount - 1)
                });
            }, 50);
        }

        //redirect to the splash page
        vm.goBack = function () {
            $state.go('triangular.admin-default-no-scroll.game-splash');
        }

        //open dialog box to a user to enter his nick name, use whie he play the game
        function createDialog($event) {
            var confirm = $mdDialog.prompt()
                .title('Nick Name')
                .textContent('Choose a nick name before you proceed')
                .placeholder('enter nick name')
                .ariaLabel('nick name')
                .clickOutsideToClose(false)
                .escapeToClose(false)
                .targetEvent($event)
                .ok('OK')

            $mdDialog.show(confirm).then(function (result) {

                if (result && result != null && result != '') {
                    //save nick name in cookies
                    $cookies.put('nickName', result);

                    $timeout(function () {
                        vm.auctioneerChatBubbleMsg = AUCTIONEER_INTRODUCTION_MESSAGES.WELCOME_TO_AUTION + " '" + $scope.getUserNickName() + "'"
                        vm.auctioneerChatBubbleHide = false;
                    }, 20);

                    $timeout(function () {
                        vm.auctioneerChatBubbleHide = true;

                        //set random bidding card
                        vm.currentlySelectedHealthCard = $scope.getRandomBiddingCard();
                    }, 3000);
                } else {
                    createDialog($event);
                    ToastService.showToast('Please tell us who you are, before proceed');
                }
            });
        }

        //this broadcast listener get all health cards from server
        $scope.$on(API_BROADCAST_CONSTANTS.API_GET_ALL_CARDS, function (event, allHealthCards) {
            vm.availableHealthCards = allHealthCards;

            //initialize all health cards
            initHealthCards();
        });

        //get current user's nick name
        $scope.getUserNickName = function () {
            return $cookies.get('nickName');
        }

        //select random health card for bidding
        $scope.getRandomBiddingCard = function () {

            if (!vm.availableHealthCards || vm.availableHealthCards == null || !Array.isArray(vm.availableHealthCards) || vm.availableHealthCards.length === 0)
                return null;
            else
                return vm.availableHealthCards[Math.floor(Math.random() * vm.availableHealthCards.length)];
        }

        //fires when user click on the shopping cart icon
        $scope.openOrCloseShoppingCart = function () {
            vm.isOpenShoppingCart = !vm.isOpenShoppingCart;

            if (!vm.isOpenShoppingCart && angular.isDefined(vm.purchasedCardsObject) && vm.purchasedCardsObject != null)
                vm.purchasedCardsObject._openclose();
        }
    }
})();