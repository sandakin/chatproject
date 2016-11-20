(function () {
    'use strict';

    angular
        .module('app.game')
        .controller('ChatPageController', ChatPageController);

    /* @ngInject */
    function ChatPageController($location, $scope, $cookies, $mdDialog, $timeout, $state, $filter, CommonService, ToastService, api, BiddingService, AUCTIONEER_INTRODUCTION_MESSAGES, API_BROADCAST_CONSTANTS, BIDDING_ROUND_MAX_LIMIT) {
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
        vm.currentLoggedUser = {};

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

        //+++++++++++++++ user money data +++++++++++++++++++++
        //remaining user value
        vm.remainingUserValue = 0;
        //minimum user value
        vm.minimumUserValue = 0;
        //+++++++++++++++ user money data +++++++++++++++++++++

        //user bidding variables
        //user chat messages
        vm.allUserChatMessages = [];
        //disable / ebable user bidding fields
        vm.enableUserBidding = false;
        //all bidding users list
        vm.allBiddingUsers = CommonService.allUsers.getAllUsers();
        //set a notification on starting bid value
        vm.bidNotificationMsg = '';

        //show or hide continue button(set this true before, switch to the very start)
        vm.showNextRoundButton = false;

        //show or hide system user bidding progress bar
        vm.showChatProgressBar = false;
        //show or hide card winning congrats view
        vm.showCardWinningView = false;

        //current user bid value binded to the text fields
        vm.currentUserBidValue = 0;

        //user winning fireworks message
        vm.userWinningMessage = '';

        //winner of this bidding session
        vm.winnerOfBiddingSession = {};
        //------------------------------------------------------bidding rounds----------------------------------------------------------------

        //fired when open this page
        vm.init = function ($event) {

            //show nick name dialog only, if user has valid login cookies
            if (!CommonService.isAuthCookiesMissing())
                createDialog($event);

            vm.auctioneerChatBubbleEffectClass = "bigEntrance";
            vm.auctioneerChatBubbleMsg = AUCTIONEER_INTRODUCTION_MESSAGES.WELCOME_TO_AUTION + " '" + vm.currentLoggedUser.user_name + "'"

            //request all health cards from the server
            CommonService.healthCards.getAllCards();

            //hide continue button
            vm.showNextRoundButton = false;

            console.log('################################ ', vm.userShoppingCart);
        }

        //initialize health cards styles
        function initHealthCards() {

            //update all health card array with initial health card
            // CommonService.healthCards.userPurchasedHealthCards.addCard(CommonService.healthCards.getInitialHealthCard());

            // //get user shopping cart
            vm.userShoppingCart = CommonService.healthCards.userPurchasedHealthCards.getCards();

            //set initial user mesasges
            initialUserMessages(true);
        }

        //redirect to the splash page
        vm.goBack = function () {
            startNewSession();
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

                    //set all users data
                    CommonService.allUsers.setAllUsers();
                    //get currently logged user data
                    vm.currentLoggedUser = CommonService.allUsers.getAllUsers()[0];

                    vm.currentLoggedUser.user_name = result;

                    // $timeout(function () {
                    vm.auctioneerChatBubbleMsg = AUCTIONEER_INTRODUCTION_MESSAGES.WELCOME_TO_AUTION + " '" + vm.currentLoggedUser.user_name + "'"

                    // }, 20);

                    $timeout(function () {
                        vm.auctioneerChatBubbleHide = true;

                        //set initial user mesasges
                        initialUserMessages(false);

                        //set start bidding message
                        createCustomChatMessage('Please place a bid value for current health card to start', 'System', 'other');

                        //start a new bidding round and select a random health card for bidding
                        openNewBiddingRound();

                    }, 200);
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

        //fired when user confirms his bid value. And also system users' systamatic bidding starts at here
        $scope.submitUserBiddingValue = function ($event) {
            //by this page refresh prevented.
            // $event.preventDefault();

            //first check this user is valid for this round (if he/she purchased the maximum cards, this user cant submit any value)
            if (vm.currentLoggedUser.purchased_cards.length >= 2) {
                createCustomChatMessage('<b><i>You are already purchased the maximum amount of Health Cards. You can not participate to this session anymore.</i></b>', 'System', 'other');
                return;
            }

            //TODO: can be reaplaced this whole block with 'startSystematicBidding()' but need to check
            //show progress view
            vm.showChatProgressBar = true;

            //disable user to enter bidding
            vm.enableUserBidding = false;
            //start systamatic users bidding
            BiddingService.Bidding.StartBidding(vm.currentRound, vm.currentlySelectedHealthCard, vm.currentUserBidValue);

            //hide progress view
            $timeout(function () {
                vm.showChatProgressBar = false;

                //show winner of this round
                announceWinnerOfCurrentRound();
            }, 1000);
        }

        //open a completely new session
        $scope.proceedToNextRound = function ($event) {
            saveUserData();
        }

        //save user data after compitition
        function saveUserData() {

            var real_user = CommonService.allUsers.getAllUsers()[0];

            var user = new (api.user())();
            user.participant = CommonService.allUsers.getRealUserData().id;
            user.card1 = (real_user.purchased_cards.length > 0) ? real_user.purchased_cards[0].id : 0;
            user.card2 = (real_user.purchased_cards.length >= 2) ? real_user.purchased_cards[1].id : 0;
            user.money = real_user.user_remaining_money;
            user.winner = (real_user.user_id === vm.winnerOfBiddingSession.user_id);
            user.winner_date = $filter('date')(new Date(), 'yyyy-MM-dd');
            user.paid_date = $filter('date')(new Date(), 'yyyy-MM-dd');

            user.$save().then(function (data) {

                console.log('nmj save data >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> ', data);
                startNewSession();

            }, function () {

                startNewSession();
                ToastService.showToast('Data not saved. Please contact administrator.');
            })
        }

        //start brand new bidding session from the beginning
        function startNewSession() {
            $location.path('/game/loading');

            //reset all previous round details
            resetPrviousRoundDetails();
        }


        //start a new bidding round and select a random health card for bidding
        function openNewBiddingRound() {

            //reset user added value
            vm.currentUserBidValue = 0;

            console.log('++++++++++++++++++++++++++++++++++++++++ ', BiddingService.bidRounds.getAllRounds())

            //if it's going to exceed the maximum bidding rounds, stop the bidding
            if (BiddingService.bidRounds.getAllRounds().length >= BIDDING_ROUND_MAX_LIMIT.LIMIT) {
                vm.winnerOfBiddingSession = BiddingService.bidRounds.getUsersWithTotalCardValues().hasMax('purchased_card_value');
                vm.userWinningMessage = vm.winnerOfBiddingSession.user_name + ' HAS BEEN WON THE BIDDING SESSION.';
                vm.showCardWinningView = true;

                //show continue button
                vm.showNextRoundButton = true;

                return;
            }

            //set random bidding card
            vm.currentlySelectedHealthCard = $scope.getRandomBiddingCard();

            //open new bidding round (initial first round)
            vm.currentRound = BiddingService.bidRounds.openRound(vm.currentlySelectedHealthCard, CommonService.allUsers.getAllRemainingUsers());

            //show user the current round details
            vm.bidNotificationMsg = "Current round is : " + vm.currentRound.bidding_round_no;//"Bid Start from - AUD 13.50"

            //set user remaining value
            vm.remainingUserValue = CommonService.allUsers.getAllUsers()[0].user_remaining_money;

            //enable user to enter bidding
            vm.enableUserBidding = CommonService.allUsers.getAllUsers()[0].purchased_cards.length < 2;


            //if real user is invalid for next rounds, automate the bidding process
            if (CommonService.allUsers.getAllUsers()[0].purchased_cards.length >= 2) {

                $timeout(function () {
                    startSystematicBidding();
                }, 2000);
            }
        }


        //systematic bidding after real user purchased maximum cards
        function startSystematicBidding() {

            //show progress view
            vm.showChatProgressBar = true;

            //disable user to enter bidding
            vm.enableUserBidding = false;
            //start systamatic users bidding
            BiddingService.Bidding.StartBidding(vm.currentRound, vm.currentlySelectedHealthCard, vm.currentUserBidValue);

            //hide progress view
            $timeout(function () {
                vm.showChatProgressBar = false;

                //show winner of this round
                announceWinnerOfCurrentRound();
            }, 3000);
        }


        //calculate and show the winner of the current bidding round
        function announceWinnerOfCurrentRound() {

            if (vm.currentRound === null || !angular.isDefined(vm.currentRound) || vm.currentRound.bid_values === null || !angular.isDefined(vm.currentRound.bid_values))
                return;

            //get winner's bid object
            var bid_obj = vm.currentRound.bid_values.hasMax('value');

            //get winner's user object
            var winner = {};
            angular.forEach(CommonService.allUsers.getAllUsers(), function (user) {
                if (user.user_id === bid_obj.user_id)
                    winner = user;
            });

            //set current round winner
            BiddingService.bidRounds.setRoundWinner(vm.currentRound.bidding_round_no, winner, vm.currentlySelectedHealthCard);

            //if user is the winner, show card winner view
            if (winner.user_id === 1) {
                vm.userWinningMessage = 'YOU WON THIS HEALTH CARD';
                vm.showCardWinningView = true;

                //set current users remaining value
                vm.remainingUserValue = CommonService.allUsers.getAllUsers()[0].user_remaining_money;

                createCustomChatMessage('<b><i>You </i></b> won this card and you spent ' + bid_obj.value + 'AUD on this card.', 'System', 'other');

                //add this card to my shopping cart
                CommonService.healthCards.userPurchasedHealthCards.addCard(vm.currentlySelectedHealthCard);
                vm.userShoppingCart = CommonService.healthCards.userPurchasedHealthCards.getCards();

                //hide card winning view
                $timeout(function () {
                    vm.showCardWinningView = false;
                }, 3000);
            }
            //show user who is the winner
            else {
                createCustomChatMessage('<b><i>' + winner.user_name + '</i></b> has been won this card. He spent ' + bid_obj.value + 'AUD on this card.', 'System', 'other');

                //announce starting a new round
                vm.currentlySelectedHealthCard = null;
                vm.auctioneerChatBubbleHide = false;
                vm.auctioneerChatBubbleMsg = winner.user_name + ' has been won this card. He spent ' + bid_obj.value + 'AUD on this card.';

                //hide card winning chat bubble
                $timeout(function () {
                    vm.auctioneerChatBubbleHide = true;
                }, 3000);
            }

            //announce starting a new round
            $timeout(function () {
                vm.currentlySelectedHealthCard = null;
                vm.auctioneerChatBubbleHide = false;
                vm.auctioneerChatBubbleMsg = 'Opening a new round.\nPlease wait.........';
            }, 3000);

            $timeout(function () {
                vm.auctioneerChatBubbleHide = true;
                //start a new bidding round and select a random health card for bidding
                openNewBiddingRound();
            }, 4000);

            console.log('$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ ', CommonService.allUsers.getAllUsers(), BiddingService.bidRounds.getAllRounds());

        }


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



        //reset all previous round details
        function resetPrviousRoundDetails() {

            //reset commonm service data
            CommonService.resetAllData();
            //reset bidding service data
            BiddingService.resetAllData();

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
            vm.currentLoggedUser = {};

            //user shopping cart
            vm.userShoppingCart = [];
            //store user selected purchased class
            vm.selectedPurchasedCard = null;

            //check is shopping cart is open or not
            vm.isOpenShoppingCart = false;

            //store all health cards open for bidding
            allHealthCards = [];

            //------------------------------------------------------bidding rounds----------------------------------------------------------------
            //current main bidding roud
            vm.currentRound = {};

            //+++++++++++++++ user money data +++++++++++++++++++++
            //remaining user value
            vm.remainingUserValue = 0;
            //minimum user value
            vm.minimumUserValue = 0;
            //+++++++++++++++ user money data +++++++++++++++++++++

            //user bidding variables
            //user chat messages
            vm.allUserChatMessages = [];
            //disable / ebable user bidding fields
            vm.enableUserBidding = false;
            //all bidding users list
            vm.allBiddingUsers = [];
            //set a notification on starting bid value
            vm.bidNotificationMsg = '';

            //show or hide continue button(set this true before, switch to the very start)
            vm.showNextRoundButton = false;

            //show or hide system user bidding progress bar
            vm.showChatProgressBar = false;
            //show or hide card winning congrats view
            vm.showCardWinningView = false;

            //current user bid value binded to the text fields
            vm.currentUserBidValue = 0;

            //user winning fireworks message
            vm.userWinningMessage = '';

            //winner of this bidding session
            vm.winnerOfBiddingSession = {};
            //------------------------------------------------------bidding rounds----------------------------------------------------------------
            //remove nick name from cookies
            $cookies.remove('nickName');

            //remove user id from cookies
            $cookies.remove('user');
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


        //congradgulations message data----------------------------------------------
        var ctx = canvas.getContext("2d");
        var w = document.body.clientWidth;
        var h = document.body.clientHeight;
        canvas.width = w;
        canvas.height = h;

        var nodes = [];


        function draw() {
            requestAnimationFrame(draw);

            ctx.globalCompositeOperation = "destination-out";
            ctx.fillStyle = "rgba(0, 0, 0, .08)";
            ctx.fillRect(0, 0, w, h);

            ctx.globalCompositeOperation = "lighter";

            var l = nodes.length, node;
            while (l--) {
                node = nodes[l];
                drawNode(node);
                if (node.dead) {
                    nodes.splice(l, 1);
                }
            }

            if (nodes.length < 10) {
                l = rand(4, 1) | 0;
                while (l--) {
                    nodes.push(makeNode(
                        Math.random() * w | 0,
                        Math.random() * h | 0,
                        40,
                        "hsl(" + (rand(300, 0) | 0) + ", 100%, 50%)",
                        100
                    ));
                }
            }
        }

        function drawNode(node) {

            var l = node.children.length, point;
            while (l--) {
                point = node.children[l];
                ctx.beginPath();
                ctx.fillStyle = point.color;
                ctx.arc(point.x, point.y, 1, 0, PI2);
                ctx.fill();
                ctx.closePath();
                updatePoint(point);
                if (point.dead) {
                    node.children.splice(l, 1);
                    if (node.count > 20) {
                        nodes.push(makeNode(
                            point.x,
                            point.y,
                            node.radius * 10,
                            node.color,
                            (node.count / 10) | 0
                        ))
                    }
                }
            }
            if (!node.children.length) {
                node.dead = true;
            }
        }

        function updatePoint(point) {
            var dx = point.x - point.dx;
            var dy = point.y - point.dy;
            var c = Math.sqrt(dx * dx + dy * dy);
            point.dead = c < 1;
            point.x -= dx * point.velocity;
            point.y -= dy * point.velocity;
        }

        const rad = Math.PI / 180;
        const PI2 = Math.PI * 2;
        var ttt = 0;

        function rand(max, min) {
            min = min || 0;
            return Math.random() * (max - min) + min;
        }

        function makeNode(x, y, radius, color, partCount) {

            radius = radius || 0;
            partCount = partCount || 0;
            var count = partCount;

            var children = [], kof, r;


            while (partCount--) {
                kof = 100 * Math.random() | 0;
                r = radius * Math.random() | 0;
                children.push({
                    x: x,
                    y: y,
                    dx: x + r * Math.cos(ttt * kof * rad),
                    dy: y + r * Math.sin(ttt * kof * rad),
                    color: color,
                    velocity: rand(1, 0.05)
                });
                ttt++
            }

            return {
                radius: radius,
                count: count,
                color: color,
                x: x,
                y: y,
                children: children
            }
        }
        //start fire works
        draw();
        //congradgulations message data----------------------------------------------

    }
})();