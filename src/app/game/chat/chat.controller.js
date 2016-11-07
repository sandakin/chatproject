(function () {
    'use strict';

    angular
        .module('app.game')
        .controller('ChatPageController', ChatPageController);

    /* @ngInject */
    function ChatPageController($scope, $cookies, $mdDialog, $timeout, $state, $filter, CommonService, ToastService, api, BiddingService, AUCTIONEER_INTRODUCTION_MESSAGES, AUCTION_USER_DATA, API_BROADCAST_CONSTANTS, BIDDING_ROUNDS, USER_BIDDING_ABILITY, AUCTION_BID_ROUND_WIN_STATES) {
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
        //current logged user
        vm.currentLoggedUser = AUCTION_USER_DATA[0];

        //user shopping cart
        vm.userShoppingCart = [];
        //store user selected purchased class
        vm.selectedPurchasedCard = null;

        //check is shopping cart is open or not
        vm.isOpenShoppingCart = false;

        //store all health cards open for bidding
        var allHealthCards = [];

        //------------------------------------------------------bidding rounds----------------------------------------------------------------
        //current main bidding roud
        vm.currentRound = {};
        //current bidding round type
        vm.currentBiddingRoundType = '';
        //all remaining users in the entire bidding
        vm.allRemainingUsers = [];
        //------------------------------------------------------bidding rounds----------------------------------------------------------------

        //fired when open this page
        vm.init = function ($event) {

            //show nick name dialog only, if user has valid login cookies
            if (!CommonService.isAuthCookiesMissing())
                createDialog($event);

            vm.auctioneerChatBubbleEffectClass = "bigEntrance";
            vm.auctioneerChatBubbleMsg = AUCTIONEER_INTRODUCTION_MESSAGES.WELCOME_TO_AUTION + " '" + AUCTION_USER_DATA[0].user_name + "'"

            vm.remainingUserValue = 100.00;
            vm.minimumUserValue = 0;

            //request all health cards from the server
            CommonService.healthCards.getAllCards();

            //hide next round button
            vm.showNextRoundButton = false;
        }

        //initialize health cards styles
        function initHealthCards() {

            //update all health card array with initial health card
            CommonService.healthCards.userPurchasedHealthCards.addCard(CommonService.healthCards.getInitialHealthCard());

            //get user shopping cart
            vm.userShoppingCart = CommonService.healthCards.userPurchasedHealthCards.getCards();

            //set initial user mesasges
            initialUserMessages(true);
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
                    vm.currentLoggedUser.user_name = result;

                    $timeout(function () {
                        vm.auctioneerChatBubbleMsg = AUCTIONEER_INTRODUCTION_MESSAGES.WELCOME_TO_AUTION + " '" + $scope.getUserNickName() + "'"

                        //set all users data
                        CommonService.allUsers.setAllUsers();

                    }, 20);

                    $timeout(function () {
                        vm.auctioneerChatBubbleHide = true;

                        //set random bidding card
                        vm.currentlySelectedHealthCard = $scope.getRandomBiddingCard();

                        //set initial user mesasges
                        initialUserMessages(false);

                        //set start bidding message
                        createCustomChatMessage('Please place a bid value for current health card to start', 'System', 'other');

                        //enable user to enter bidding
                        vm.enableUserBidding = true;

                        //open new bidding round (initial first round)
                        vm.currentRound = BiddingService.bidRounds.openRound(vm.currentlySelectedHealthCard, CommonService.allUsers.getAllRemainingUsers(USER_BIDDING_ABILITY.TERMINATE_FROM_TOURNAMENT));
                        //set current bidding round type
                        vm.currentBiddingRoundType = BIDDING_ROUNDS.BIDDING_ROUND_CLOSED;

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

            //remove auctioneer chat bubble
            vm.auctioneerChatBubbleHide = false;

            //initialize all health cards
            initHealthCards();
        });

        //get current user's nick name
        $scope.getUserNickName = function () {
            return vm.currentLoggedUser.user_name;
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

            //remove current selected item
            vm.selectedPurchasedCard = null;
            vm.isOpenShoppingCart = !vm.isOpenShoppingCart;
        }


        //user bidding variables
        //user chat messages
        vm.allUserChatMessages = [];
        //disable / ebable user bidding fields
        vm.enableUserBidding = false;
        //all bidding users list
        vm.allBiddingUsers = AUCTION_USER_DATA;
        //remaining users in current round
        vm.currentRoundRemainingUsers = [];
        //set a notification on starting bid value
        vm.bidNotificationMsg = '';


        //remaining user value
        vm.remainingUserValue = 0;
        //minimum user value
        vm.minimumUserValue = 0;
        //user placed current bid value
        vm.currentUserBidValue = 0;

        //show or hide proceed to next round button(set this true before, switch to new round or round type)
        vm.showNextRoundButton = false;

        //user bidding functions
        function selectRandomUser() {

            if (!vm.allBiddingUsers || vm.allBiddingUsers == null || !Array.isArray(vm.allBiddingUsers) || vm.allBiddingUsers.length === 0)
                return null;

            return vm.allBiddingUsers[Math.floor(Math.random() * vm.availableHealthCards.length)];
        }

        /**set system generated initial chat messages */
        function initialUserMessages(showInitial) {

            //set free health card details
            if (showInitial) {
                var message1 = '<div>You have recieved 1 health card for free</div>' +
                    '<div><h3>' + CommonService.healthCards.getInitialHealthCard().name + '<h3></div>';
                angular.forEach(CommonService.healthCards.getInitialHealthCard().states, function (state) {
                    message1 = message1 + '<h5 class="preview-lines">' + state + '</h5>';
                })
                createCustomChatMessage(message1, 'System', 'other');

                //set bid notification message
                vm.bidNotificationMsg = "Please Place your Bid";//"Bid Start from - AUD 13.50"
            }


            if (vm.currentlySelectedHealthCard == null)
                return;

            //set current bidding card details
            var message2 = '<div>You can place a bid on this card to continue</div>' +
                '<div><h3>' + vm.currentlySelectedHealthCard.name + '<h3></div>';
            angular.forEach(vm.currentlySelectedHealthCard.states, function (state) {
                message2 = message2 + '<h5 class="preview-lines">' + state + '</h5>';
            })
            createCustomChatMessage(message2, 'System', 'other');
        }

        /**create custom chat message to show to the user */
        function createCustomChatMessage(message, sender, message_type) {

            //set current bidding card details
            var data2 = {
                message: message,
                user: sender,
                time: $filter('date')(new Date(), 'hh:mm a'),
                class: message_type
            }

            vm.allUserChatMessages.push(data2);

            //after adding new message, scroll bar need to be in bottom to view new mesasges.
            var objDiv = $("#chat_messages_container");
            $("#chat_messages_container").scrollTop($("#chat_messages_container")[0].scrollHeight);
        }

        /**user bid value submit function */
        vm.submitBidValue = function ($event) {
            $event.preventDefault();

            //clear all user chat messages before publish new ones
            vm.allUserChatMessages = [];

            //start bidding for system users
            BiddingService.Bidding.StartBidding(vm.currentRound, vm.currentBiddingRoundType, vm.currentlySelectedHealthCard, CommonService.allUsers.getAllUsers());

            var count = 0;
            angular.forEach(CommonService.allUsers.getAllUsers(), function (user) {
                //generate and show bidding messages

                if (user.userBiddingAbility === USER_BIDDING_ABILITY.NOT_TERMINATED) {
                    if (user.user_type === 'SysUser') {

                        //set current bid value to user array
                        var value = user.user_bid_values[vm.currentRound.bidding_round_no - 1].closed_round_value;
                        if (vm.currentBiddingRoundType === BIDDING_ROUNDS.BIDDING_ROUND_OPEN)
                            value = user.user_bid_values[vm.currentRound.bidding_round_no - 1].open_round_value;

                        createCustomChatMessage('<strong>' + user.user_name + '</strong> has been placed his bid (' + value + ' AUD)', user.user_name, 'other');
                    } else {

                        createCustomChatMessage('I placed my bid and it\'s value is ' + vm.currentUserBidValue + ' AUD', user.user_name, 'self');
                        //set bid notification message
                        vm.bidNotificationMsg = "you placed " + vm.currentUserBidValue + " AUD"

                        //set current bid value to user array
                        if (vm.currentBiddingRoundType === BIDDING_ROUNDS.BIDDING_ROUND_CLOSED)
                            user.user_bid_values[count].closed_round_value = vm.currentUserBidValue;
                        if (vm.currentBiddingRoundType === BIDDING_ROUNDS.BIDDING_ROUND_OPEN)
                            user.user_bid_values[count].open_round_value = vm.currentUserBidValue;
                    }
                }

                count++;
            });

            //disable user to enter bidding
            vm.enableUserBidding = false;
            //reset bid value
            vm.currentUserBidValue = 0;


            //show next round button
            vm.showNextRoundButton = true;
        }

        /**proceed to the next bidding round */
        vm.proceedToNextRound = function ($event) {

            //hide next round button
            vm.showNextRoundButton = false;

            //go to next round
            proceedToNextRound($event);

            //enable user to enter bidding
            vm.enableUserBidding = (CommonService.allUsers.getAllUsers()[0].userBiddingAbility === USER_BIDDING_ABILITY.NOT_TERMINATED);

            //chage bidding round type to open
            if (vm.currentBiddingRoundType === BIDDING_ROUNDS.BIDDING_ROUND_CLOSED)
                vm.currentBiddingRoundType = BIDDING_ROUNDS.BIDDING_ROUND_OPEN;

            //if current user is terminated, automate the proces
            if (CommonService.allUsers.getAllUsers()[0].userBiddingAbility != USER_BIDDING_ABILITY.NOT_TERMINATED)
                $timeout(function () {
                    vm.submitBidValue($event);
                }, 2000);
        }

        //start next round
        function proceedToNextRound($event) {

            var min = getLowestAndHighestBidders().min;
            var max = getLowestAndHighestBidders().max;

            //show terminate user indication message
            showTerminateUserMessage(min, max);

            // $timeout(function () {
            if (vm.currentBiddingRoundType === BIDDING_ROUNDS.BIDDING_ROUND_CLOSED && min != null && angular.isDefined(min)) {

                BiddingService.bidRounds.setClosedRoundTerminations(min.user_id);
                BiddingService.bidRounds.setClosedRoundHighestBidder(max.user, vm.currentRound.bidding_round_no);

                //terminate lowest bid user
                CommonService.allUsers.getAllUsers()[min.user_id - 1].userBiddingAbility = USER_BIDDING_ABILITY.TERMINATE_FOR_OPEN_ROUND;

                //set currently available users for the open round
                var available_users = CommonService.allUsers.getAllRemainingUsers(USER_BIDDING_ABILITY.TERMINATE_FOR_OPEN_ROUND);

                //set bid notification message
                vm.bidNotificationMsg = "open bid starts from " + max.closed_value + " AUD"

                // //start bidding for system users
                // BiddingService.Bidding.StartBidding(vm.currentRound, vm.currentBiddingRoundType, vm.currentlySelectedHealthCard, CommonService.allUsers.getAllUsers());
            } else if (vm.currentBiddingRoundType === BIDDING_ROUNDS.BIDDING_ROUND_OPEN && max != null && angular.isDefined(max)) {

                BiddingService.bidRounds.setOpenRoundWinner(max.user, vm.currentRound.bidding_round_no);
                //add card to users cart
                CommonService.allUsers.getAllUsers()[max.user_id - 1].purchased_cards.push(vm.currentlySelectedHealthCard);


                createCustomChatMessage('<div style="color: red; font-weight: bolder;">' + CommonService.allUsers.getAllUsers()[max.user_id].user_name + ' has been purchased the previous health card. Starting new round</div>', 'System', 'other');
                // //enable user to enter bidding
                // vm.enableUserBidding = true;
                //open new bidding round (initial first round)
                vm.currentRound = BiddingService.bidRounds.openRound(vm.currentlySelectedHealthCard, CommonService.allUsers.getAllRemainingUsers(USER_BIDDING_ABILITY.TERMINATE_FROM_TOURNAMENT));
                //set current bidding round type
                vm.currentBiddingRoundType = BIDDING_ROUNDS.BIDDING_ROUND_CLOSED;


                //reset user closed bidding temporary termitation flags
                CommonService.allUsers.resetAllUserList();
                // //restart bidding cycle
                // vm.submitBidValue($event);

            }
            // }, 3000);

        }

        //show terminate user message
        function showTerminateUserMessage(min, max) {

            var user_name = 'You';

            if (vm.currentBiddingRoundType === BIDDING_ROUNDS.BIDDING_ROUND_CLOSED && min != null && angular.isDefined(min)) {
                user_name = (min.user_id != 1) ? min.user__.user_name : 'You';

                createCustomChatMessage('<b><i>' + user_name + '</i></b> has been disqualified to the open bidding round, due to place a low bid value in previous round.', 'System', 'other');
            }

            if (vm.currentBiddingRoundType === BIDDING_ROUNDS.BIDDING_ROUND_OPEN && max != null && angular.isDefined(max)) {
                user_name = (max.user_id != 1) ? max.user_name : 'You';
                createCustomChatMessage('<b><i>' + user_name + '</i></b> has been disqualified from the bidding, due to purchase maximum of 2 Health Cards.', 'System', 'other');
            }

        }

        //get lowest and highest bidders from the users
        function getLowestAndHighestBidders() {

            var min = {};
            var max = {};

            console.log('$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ ', vm.currentRound, '----------------', CommonService.allUsers.getAllUsers());

            //create new array containing user id and bidding values
            var new_arr = [];
            var count = 0;
            angular.forEach(CommonService.allUsers.getAllUsers(), function (user) {

                if (!(user.user_bid_values[vm.currentRound.bidding_round_no - 1].closed_round_value === 0 && user.user_bid_values[vm.currentRound.bidding_round_no - 1].open_round_value === 0))
                    new_arr.push(
                        {
                            user_id: user.user_id,
                            user__: user,
                            closed_value: user.user_bid_values[vm.currentRound.bidding_round_no - 1].closed_round_value,
                            open_value: user.user_bid_values[vm.currentRound.bidding_round_no - 1].open_round_value
                        }
                    )
            })

            if (vm.currentBiddingRoundType === BIDDING_ROUNDS.BIDDING_ROUND_CLOSED) {
                min = new_arr.hasMin('closed_value');
                var max__ = new_arr.hasMax('closed_value');

                var arr__ = angular.copy(new_arr);
                //create new array without max value
                var count = 0;
                var index = 0;
                angular.forEach(arr__, function (elem) {

                    if (elem.user_id === max__.user_id)
                        return index = count;

                    count++;
                });

                //reomve max value
                arr__.splice(index, 1);

                max = arr__.hasSecondMax('closed_value');

                console.log('##################### ', new_arr, max__, index, arr__, max);
            }

            if (vm.currentBiddingRoundType === BIDDING_ROUNDS.BIDDING_ROUND_OPEN) {
                min = new_arr.hasMin('open_value');
                max = new_arr.hasMax('open_value');
            }

            return { min: min, max: max };

        }

        //get minimum valued item from the item list
        Array.prototype.hasMin = function (attrib) {
            return this.reduce(function (prev, curr) {
                return parseFloat(prev[attrib]) < parseFloat(curr[attrib]) ? prev : curr;
            });
        };

        //get maximum valued item from the item list
        Array.prototype.hasMax = function (attrib) {
            return this.reduce(function (prev, curr) {
                return parseFloat(prev[attrib]) > parseFloat(curr[attrib]) ? prev : curr;
            });
        }
        //get second max valued item from the item list
        Array.prototype.hasSecondMax = function (attrib) {
            return this.reduce(function (prev, curr) {
                return parseFloat(prev[attrib]) > parseFloat(curr[attrib]) ? prev : curr;
            });
        }

    }
})();