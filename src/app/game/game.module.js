(function () {
    'use strict';

    angular
        .module('app.game', ['mdPickers'])
        .constant('AUCTIONEER_INTRODUCTION_MESSAGES', {
            "WELCOME_TO_AUTION": 'Welcome to the auction',
            "AUCTION_INTRO_MSGS": [
                { msg: 'You are allowed to bid on the helth cards as you wish......' },
                { msg: 'You are allowed to bid on the helth cards as you wish......' },
                { msg: 'You are allowed to bid on the helth cards as you wish......' },
                { msg: 'You are allowed to bid on the helth cards as you wish......' },
            ],
            "FIRST_ROUND_INTRO_1": {
                info: 'We are about to start the first round of this auction. Please place a bid on any card you want.'
            },
            "AUCTIONED_HEALTH_CARDS": [
                { name: '1', value: 'Card 1', id: 1, bid_value: 0.5 },
                { name: '2', value: 'Card 2', id: 2, bid_value: 0.5 },
                { name: '3', value: 'Card 3', id: 3, bid_value: 0.5 },
                { name: '4', value: 'Card 4', id: 4, bid_value: 0.5 },
                { name: '5', value: 'Card 5', id: 5, bid_value: 0.5 },
                { name: '6', value: 'Card 6', id: 6, bid_value: 0.5 },
                { name: '7', value: 'Card 7', id: 7, bid_value: 0.5 },
                { name: '8', value: 'Card 8', id: 8, bid_value: 0.5 },
                { name: '9', value: 'Card 9', id: 9, bid_value: 0.5 }
            ]
        })
        .constant('AUCTION_USER_DATA', {
            "CURRENT_USER": {
                user_id: 1,
                user_name: 'current user',
                user_address: 'address 1',
                user_remaining_money: 20.5
            }
        })
        .constant('API_BROADCAST_CONSTANTS', {
            'API_GET_ALL_CARDS': 'API_GET_ALL_CARDS'
        });
})();