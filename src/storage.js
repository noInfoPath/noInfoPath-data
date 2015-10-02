//storage.js
/**
	### @class MockStorage
*/
(function(){
	"use strict";

	function MockStorage(){
		var _store = {},_len=0;

		Object.defineProperties(this,{
	      "length": {
	        "get": function(){
	          var l=0;
	          for(var x in _store){l++;}
	          return l;
	        }
	      }
	    });

		this.key = function (i){
			var l=0;
			for(var x in _store){
			  if(i==l) return x;
			}
		};

		this.setItem = function (k,v){
			_store[k] = v;
		};

		this.getItem = function (k){
			return _store[k];
		};

		this.removeItem = function (k){
			delete _store[k];
		};

		this.clear = function (){
			_store = {};
		};
	}

	/**
		### @class NoStorage
	*/
	function NoStorage(storetype){
		var _store;


		if(typeof window[storetype]=== "object")
		{
			_store = window[storetype];
		}else{

			_store = new MockStorage();
		}


		Object.defineProperties(this,{
	      "length": {
	        "get": function(){
	          return _store.length;
	        }
	      }
	    });

		this.key = function (i){
			return _store.key(i);
		};

		this.setItem = function (k,v){
			if(v){
				_store.setItem(k,angular.toJson(v));
			}else{
				_store.setItem(k,undefined);
			}

		};

		this.getItem = function (k){
			var x = _store.getItem(k);

			if(x === "undefined"){
				return undefined;
			}else{
				return angular.fromJson(x);
			}

		};

		this.removeItem = function (k){
			_store.removeItem(k);
		};

		this.clear = function (){
			_store.clear();
		};
	}

	angular.module("noinfopath.data")
		.factory("noSessionStorage",[function(){
			return new NoStorage("sessionStorage");
		}])

		.factory("noLocalStorage",[function(){
			return new NoStorage("localStorage");
		}])
		;
})(angular);
