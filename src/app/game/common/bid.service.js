(function() {
    'use strict';

    angular
        .module('triangular')
        .service('BiddingService', ['$rootScope', '$timeout', '$window', '$location', 'ToastService', '$cookies', '$state', 'api', 'CommonService', 'AUCTION_USER_DATA', function($rootScope, $timeout, $window, $location, ToastService, $cookies, $state, api, CommonService, AUCTION_USER_DATA) {

            //store all functions that returns from this service
            var all_functions = {};

            //store current bidding round for future usage
            var currentBiddingRound = null;

            //one bidding round has to be contains following details
            var bidRoundTemp = {
                bidding_round_no: 1,
                card: {},
                bid_values: [
                    //user bid values object template
                    // { user_id: 1, value: 50.00 }
                ],
                winner: {},
                is_current: true,
                users_available_for_next_round: []
            };
            //user bidding values template
            var userBidValues = {
                round: 1,
                card: {},
                bid_value: 0,
                //this explain that user participated to this round or not (not - exceed maximum purchased cards)
                is_participated: true,
                is_win: false
            };

            //store and return all bidding round details
            var allBiddingRounds = [];

            //check this round is currently exists in user bidded round history
            function isRoundExists(round, user) {

                return angular.forEach(user.user_bid_values, function(bid_value) {
                    if (bid_value.round === round.bidding_round_no)
                        return true;
                })
            }

            all_functions = {
                Bidding: {
                    //start bidding for systematic users
                    StartBidding: function(round, current_card, real_user_value) {

                        //get all users
                        var all_users = CommonService.allUsers.getAllUsers();
                        //get bidding percentage
                        var bid_percentage = parseInt(current_card.default_bid);

                        angular.forEach(all_users, function(user) {

                            //check current user is valid or not for this round
                            var is_user_valid = user.purchased_cards.length < 2;

                            if (user.user_type === 'SysUser') {

                                var bidding_range = user.user_remaining_money * bid_percentage / 100;
                                var bid_value = 0;
                                if (is_user_valid)
                                    bid_value = (Math.floor(Math.random() * bidding_range));

                                //set current round's all users bidding values
                                var round_bid_values = { user_id: user.user_id, value: bid_value };
                                allBiddingRounds[round.bidding_round_no - 1].bid_values.push(round_bid_values);

                                if (user.user_bid_values != null && Array.isArray(user.user_bid_values) && user.user_bid_values.length > 0 && isRoundExists(round, user) && isRoundExists(round, user) != null) {

                                    //create new copy of user bid values template
                                    var bid_value_temp = angular.copy(userBidValues);

                                    //set system users random bid value
                                    bid_value_temp.round = round.bidding_round_no;
                                    bid_value_temp.card = current_card;
                                    bid_value_temp.bid_value = bid_value;
                                    bid_value_temp.is_participated = is_user_valid;
                                    bid_value_temp.is_win = false;

                                    user.user_bid_values.push(bid_value_temp);
                                }
                            }
                            //update bidding details of real user
                            else {

                                //create new copy of user bid values template
                                var bid_value_temp = angular.copy(userBidValues);

                                //set current round's all users bidding values
                                var round_bid_values = { user_id: user.user_id, value: (is_user_valid) ? real_user_value : 0 };
                                allBiddingRounds[round.bidding_round_no - 1].bid_values.push(round_bid_values);

                                bid_value_temp.round = round.bidding_round_no;
                                bid_value_temp.card = current_card;
                                bid_value_temp.bid_value = (is_user_valid) ? real_user_value : 0;
                                bid_value_temp.is_participated = is_user_valid;
                                bid_value_temp.is_win = false;

                                user.user_bid_values.push(bid_value_temp);
                            }

                        });

                    }
                },
                bidRounds: {
                    openRound: function(card, remaining_users) {

                        if (allBiddingRounds === null || !angular.isDefined(allBiddingRounds) || !Array.isArray(allBiddingRounds))
                            allBiddingRounds = [];

                        //reset iscurrent flag for all other rounds
                        angular.forEach(allBiddingRounds, function(round__) {
                            round__.is_current = false;
                        })

                        //create new round object using bid_round template
                        var new_round_obj = angular.copy(bidRoundTemp);
                        //if round is null it means start the first round
                        new_round_obj.bidding_round_no = allBiddingRounds.length + 1;
                        new_round_obj.card = card;
                        new_round_obj.is_current = true;
                        new_round_obj.users_available_for_next_round = remaining_users;

                        currentBiddingRound = new_round_obj;

                        //add new bidding round to the all rounds array
                        allBiddingRounds.push(currentBiddingRound);

                        return currentBiddingRound;
                    },
                    getAllRounds: function() {
                        return allBiddingRounds;
                    },
                    setRoundWinner: function(round_id, user, card) {

                        if (allBiddingRounds === null || !angular.isDefined(allBiddingRounds) || !Array.isArray(allBiddingRounds) || allBiddingRounds.length === 0)
                            return;

                        //set winning user to the current round
                        angular.forEach(allBiddingRounds, function(round__) {
                            if (round__.bidding_round_no === round_id)
                                round__.winner = user;
                        })

                        //update winning user's state as win
                        setUserWinning(user, round_id, card);
                    },
                    getUsersWithTotalCardValues: function() {
                        return calculateUserCardValues();
                    }
                },
                //reset all entered data
                resetAllData: function() {

                    //store all functions that returns from this service
                    all_functions = {};
                    //store current bidding round for future usage
                    currentBiddingRound = null;
                    //store and return all bidding round details
                    allBiddingRounds = [];
                }
            };

            //calculate card average values
            function calculateCardValues() {

                if (allBiddingRounds === null || !angular.isDefined(allBiddingRounds) || !Array.isArray(allBiddingRounds) || allBiddingRounds.length <= 0)
                    return;

                //get copy of current all cards that auctioned within all rounds (without existing ones)
                var all_auctioned_cards = []

                angular.forEach(allBiddingRounds, function(round) {
                    if (all_auctioned_cards.indexOf(round.card) === -1) {
                        all_auctioned_cards.push(round.card);
                    }
                });

                //add new empty objects
                angular.forEach(all_auctioned_cards, function(card) {
                    card['bid_values'] = [];
                    card['average_value'] = 0;
                })

                //get average bidding values for all auctioned cards
                angular.forEach(allBiddingRounds, function(round) {
                    angular.forEach(all_auctioned_cards, function(card) {
                        if (round.card.id === card.id) {
                            if (card.bid_values.length === 0)
                                card.bid_values = round.bid_values;
                            else
                                card.bid_values.push.apply(card.bid_values, round.bid_values);
                        }
                    })
                })

                //calculate average value
                angular.forEach(all_auctioned_cards, function(card) {
                    var total = 0;
                    var count = 0;
                    angular.forEach(card.bid_values, function(value) {
                        total = total + value.value;
                        count++;
                    })

                    card.average_value = total / count;
                })

                console.log('__________________________________________ ', all_auctioned_cards);

                return all_auctioned_cards;
            }

            //calculate users' total card values
            function calculateUserCardValues() {

                var all_auctioned_cards = calculateCardValues();
                var users = CommonService.allUsers.getAllUsers();

                angular.forEach(users, function(user) {
                    angular.forEach(all_auctioned_cards, function(card) {
                        if (user.purchased_cards.length > 0 && user.purchased_cards[0].id === card.id) {
                            user.purchased_card_value = user.purchased_card_value + card.average_value;
                        }
                        if (user.purchased_cards.length === 2 && user.purchased_cards[1].id === card.id) {
                            user.purchased_card_value = user.purchased_card_value + card.average_value;
                        }
                    })
                });

                console.log('---------------------------- ', users);

                return users;
            }

            //udpate winning user's win state
            function setUserWinning(user, round_id, card) {

                angular.forEach(CommonService.allUsers.getAllUsers(), function(user__) {
                    if (user__.user_id === user.user_id) {

                        //add purchased cards to user's cart
                        user__.purchased_cards.push(card);

                        angular.forEach(user__.user_bid_values, function(bid) {
                            if (bid.round === round_id) {
                                bid.is_win = true;

                                //set user remaining value
                                user__.user_remaining_money = user__.user_remaining_money - bid.bid_value;
                            }
                        })
                    }
                })
            }

            //get maximum valued item from the item list
            Array.prototype.hasMax = function(attrib) {
                return this.reduce(function(prev, curr) {
                    return parseFloat(prev[attrib]) > parseFloat(curr[attrib]) ? prev : curr;
                });
            }

            return all_functions;

        }]);

})();