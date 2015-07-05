//noinfopath-mock.js

var noInfoPath = {};

//Polyfill that I did not want to make public just yet.
noInfoPath.setPrototypeOf = Object.setPrototypeOf || function(obj, proto) {
	obj.__proto__ = proto;
	return obj;
};
