//storage.js
//noinfopath-storage@0.0.3

(function(){
	function mockStorage(){
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

	function noStorage(storetype){
		var _store;


		if(typeof window[storetype]=== "object")
		{
			_store = window[storetype];
		}else{

			_store = new mockStorage();
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
			_store.setItem(k,angular.toJson(v));
		};

		this.getItem = function (k){
			return angular.fromJson(_store.getItem(k));
		};

		this.removeItem = function (k){
			delete _store.removeItem(k);
		};

		this.clear = function (){
			_store.clear();
		};
	}

	angular.module("noinfopath.storage",['ngLodash'])
		.factory("noSessionStorage",[function(){
			return new noStorage("sessionStorage");
		}])

		.factory("noLocalStorage",[function(){			
			return new noStorage("localStorage");
		}])
		;
})(angular);