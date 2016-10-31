(function () {
	'use strict';

	angular
		.module('app')
		.factory("api", function ($resource, $cookies, ServiceFactory) {

			var r = [];

			function authHeaders() {
				//return {};// {'msp':'fake_header'}
				return { 'Authorization': 'Basic ' + $cookies.get('basic') }
			}

			function absUrl(url) {
				//return "http://139.59.30.168:8090/api/survey/"+ url;
				return ServiceFactory.getBaseUrl() + "survey/" + url;
			}

			function adminUrl(url) {
				//return "http://139.59.30.168:8090/api/survey/"+ url;
				return ServiceFactory.getBaseUrl() + "administrator/" + url;
			}

			//card
			r.card = function () {
				return $resource(absUrl("card/:id"), [], {
					get: { method: 'GET' },
					query: { method: 'GET', isArray: true },
					getStates: { url: absUrl('cardstates'), method: 'GET', isArray: true }
				});
			};

			r.default_card = function () {
				return $resource(absUrl("default_card/:id"), [], {
					get: { method: 'GET' },
					query: { method: 'GET', isArray: true },
					getStates: { url: absUrl('cardstates'), method: 'GET', isArray: true }
				});
			};

			//Admin card
			r.admin_card = function (token) {
				return $resource(adminUrl("card/:id"), [], {
					get: { method: 'GET', headers: { 'Authorization': 'Basic ' + token } },
					save: { method: 'POST', headers: { 'Authorization': 'Basic ' + token } },
					remove: { method: 'DELETE', headers: { 'Authorization': 'Basic ' + token } },
					query: { method: 'GET', isArray: true, headers: { 'Authorization': 'Basic ' + token } },
					edit: { method: 'PUT', isArray: false, headers: { 'Authorization': 'Basic ' + token } },
					getStates: { url: adminUrl('cardstates'), method: 'GET', isArray: true, headers: { 'Authorization': 'Basic ' + token } },
					setdefault: { url: adminUrl('card/:id/set_default?card=:id'), method: 'GET', headers: { 'Authorization': 'Basic ' + token } },
				});
			};

			//card states
			r.cardState = function () {
				return $resource(absUrl("states/:id"), [], {
					get: { method: 'GET' },
					query: { method: 'GET', isArray: true },
					getStates: { url: absUrl('helth_card/:id/states'), method: 'GET', isArray: true }
				});
			};

			//Admin card states
			r.admin_cardState = function (token) {
				return $resource(adminUrl("states/:id"), [], {
					get: { method: 'GET', headers: { 'Authorization': 'Basic ' + token } },
					save: { method: 'POST', headers: { 'Authorization': 'Basic ' + token } },
					remove: { method: 'DELETE', headers: { 'Authorization': 'Basic ' + token } },
					query: { method: 'GET', isArray: true, headers: { 'Authorization': 'Basic ' + token } },
					edit: { method: 'PUT', isArray: false, headers: { 'Authorization': 'Basic ' + token } },
					getStates: { url: absUrl('helth_card/:id/states'), method: 'GET', isArray: true, headers: { 'Authorization': 'Basic ' + token } }
				});
			};

			//participants
			r.participant = function () {
				return $resource(absUrl("participants/:id"), [], {
					//edit:{method:'PUT',isArray:false}
					save: { method: 'POST' }
				});
			};

			r.admin_participant = function (token) {
				return $resource(adminUrl("participants/:id"), [], {
					get: { method: 'GET', headers: { 'Authorization': 'Basic ' + token } },
					save: { method: 'POST', headers: { 'Authorization': 'Basic ' + token } },
					remove: { method: 'DELETE', headers: { 'Authorization': 'Basic ' + token } },
					query: { method: 'GET', isArray: true, headers: { 'Authorization': 'Basic ' + token } },
					edit: { method: 'PUT', isArray: false, headers: { 'Authorization': 'Basic ' + token } }
				});
			};

			//timeboard
			r.participant_answer = function () {
				return $resource(absUrl("participant_answers/:id"), [], {
					save: { method: 'POST' }
				});
			};

			r.admin_participant_answer = function (token) {
				return $resource(adminUrl("participant_answers/:id"), [], {
					get: { method: 'GET', headers: { 'Authorization': 'Basic ' + token } },
					save: { method: 'POST', headers: { 'Authorization': 'Basic ' + token } },
					remove: { method: 'DELETE', headers: { 'Authorization': 'Basic ' + token } },
					query: { method: 'GET', isArray: true, headers: { 'Authorization': 'Basic ' + token } },
					edit: { method: 'PUT', isArray: false, headers: { 'Authorization': 'Basic ' + token } }
				});
			};

			r.settings = function (token) {
				return $resource(adminUrl("settings/:id"), [], {
					get: { method: 'GET', headers: { 'Authorization': 'Basic ' + token } },
					remove: { method: 'DELETE', headers: { 'Authorization': 'Basic ' + token } },
					query: { method: 'GET', isArray: true, headers: { 'Authorization': 'Basic ' + token } },
					edit: { method: 'PUT', isArray: false, headers: { 'Authorization': 'Basic ' + token } }
				});
			};

			r.healthCards = function () {
				return $resource(absUrl("card/:id"), [], {
					get: { method: 'GET', isArray: true, headers: { 'Content-Type': 'application/json' } }
				});
			};

			return r;

		});
})();
