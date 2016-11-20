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

			//participants
			r.participant = function () {
				return $resource(absUrl("participants/:id"), [], {
					//edit:{method:'PUT',isArray:false}
					save: { method: 'POST' }
				});
			};

			r.healthCards = function () {
				return $resource(absUrl("card/:id"), [], {
					get: { method: 'GET', isArray: true, headers: { 'Content-Type': 'application/json' } }
				});
			};

			r.user = function () {
				return $resource(absUrl("answer/:id"), [], {
					save: { method: 'POST'}
				});
			};

			return r;

		});
})();
