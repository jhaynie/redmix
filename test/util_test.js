var should = require('should'),
	util = require('../lib/util');

describe('util', function(){

	describe('eval', function(){
		it('should work', function(){
			var result = util.evalResult('this',{a:1});
			should(result).be.an.object;
			should(result).have.property('a',1);
		});

		it('should handle return', function(){
			var result = util.evalResult('return this',{a:1});
			should(result).be.an.object;
			should(result).have.property('a',1);
		});
	});

	describe('createACSFunctor',function(){
		it('should be able to find acs Files by file', function(){
			var fn = util.createACSFunctor('file','query');
			should(fn).be.a.function;
			should(fn.objectName).be.equal('files');
			should(fn.object).be.an.Object;
		});

		it('should be able to find acs Files by files', function(){
			var fn = util.createACSFunctor('files','query');
			should(fn).be.a.function;
			should(fn.objectName).be.equal('files');
			should(fn.object).be.an.Object;
		});

		it('should be able to find acs Files by name', function(){
			var fn = util.createACSFunctor('Files','query');
			should(fn).be.a.function;
			should(fn.objectName).be.equal('files');
			should(fn.object).be.an.Object;
		});

		it('should be able to find acs by custom object name', function(){
			var fn = util.createACSFunctor('foo','create');
			should(fn).be.a.function;
			should(fn.objectName).be.equal('customObjects');
			should(fn.object).be.an.Object;
			should(fn.custom).be.true;
		});
	});

	describe('parse', function(){
		it('should support without quotes', function(){
			var result = util.parseObjectAsJS('{a:1}');
			should(result).have.property('a',1);
		});
		it('should support with quotes', function(){
			var result = util.parseObjectAsJS('{"a":1}');
			should(result).have.property('a',1);
		});
		it('should support with quotes', function(){
			var result = util.parseObjectAsJS('[1,2]');
			should(result).be.an.array;
			should(result).be.eql([1,2]);
		});
		it('should support key/value', function(){
			var result = util.parseObjectAsJS('a=b');
			should(result).be.an.object;
			should(result).have.property('a','b');
		});
		it('should support key/value multples', function(){
			var result = util.parseObjectAsJS('a=b, c=d');
			should(result).be.an.object;
			should(result).have.property('a','b');
			should(result).have.property('c','d');
		});
		it('should support key/value with value as object', function(){
			var result = util.parseObjectAsJS('a={b:1}');
			should(result).be.an.object;
			should(result).have.property('a');
			should(result.a).be.eql({b:1});
		});
		it('should support key/value with multiple values as object', function(){
			var result = util.parseObjectAsJS('a={b:1,c:2}');
			should(result).be.an.object;
			should(result).have.property('a');
			should(result.a).be.eql({b:1,c:2});
		});
		it('should support key/value with multiple spaces', function(){
			var result = util.parseObjectAsJS('a={ b : 1 , c : 2 }');
			should(result).be.an.object;
			should(result).have.property('a');
			should(result.a).be.eql({b:1,c:2});
		});
		it('should support key/value with multiple spaces', function(){
			var result = util.parseObjectAsJS('a = {   b : 1 , c : 2 }');
			should(result).be.an.object;
			should(result).have.property('a');
			should(result.a).be.eql({b:1,c:2});
		});
		it('should support key/value with multiple spaces and object and array', function(){
			var result = util.parseObjectAsJS('a = {   b : 1 , c : 2 }, b = [1,2]');
			should(result).be.an.object;
			should(result).have.property('a');
			should(result.a).be.eql({b:1,c:2});
			should(result).have.property('b');
			should(result.b).be.eql([1,2]);
		});
		it('should support key/value with multiple spaces and array and object', function(){
			var result = util.parseObjectAsJS('b = [1,2], a = {   b : 1 , c : 2 }');
			should(result).be.an.object;
			should(result).have.property('a');
			should(result.a).be.eql({b:1,c:2});
			should(result).have.property('b');
			should(result.b).be.eql([1,2]);
		});
		it('should support key/value with value as array', function(){
			var result = util.parseObjectAsJS('a=[1,2]');
			should(result).be.an.object;
			should(result).have.property('a');
			should(result.a).be.eql([1,2]);
		});
		it('should support key/value with value as array with multiples', function(){
			var result = util.parseObjectAsJS('a=[1,2],b=[3,4]');
			should(result).be.an.object;
			should(result).have.property('a');
			should(result.a).be.eql([1,2]);
			should(result).have.property('b');
			should(result.b).be.eql([3,4]);
		});
		it('should support key/value with value as array with multiples and spaces', function(){
			var result = util.parseObjectAsJS('a=[1,2],  b=[3,4]');
			should(result).be.an.object;
			should(result).have.property('a');
			should(result.a).be.eql([1,2]);
			should(result).have.property('b');
			should(result.b).be.eql([3,4]);
		});
		it('should support key/value with value as array with multiples and multiple spaces', function(){
			var result = util.parseObjectAsJS('a=[1,2]  ,  b=[3,4] , c = [ 5, 6 ]');
			should(result).be.an.object;
			should(result).have.property('a');
			should(result.a).be.eql([1,2]);
			should(result).have.property('b');
			should(result.b).be.eql([3,4]);
			should(result).have.property('c');
			should(result.c).be.eql([5,6]);
		});
		it('should support key/value with multiple spaces', function(){
			var result = util.parseObjectAsJS('a = [ 1 , 2 ]  ,  b = [ 3 , 4 ] , c = [ 5, 6 ]');
			should(result).be.an.object;
			should(result).have.property('a');
			should(result.a).be.eql([1,2]);
			should(result).have.property('b');
			should(result.b).be.eql([3,4]);
			should(result).have.property('c');
			should(result.c).be.eql([5,6]);
		});
	});

	describe('string', function(){
		it('should support parsing as object', function(){
			var result = util.isStringAnObject('{a:1}');
			should(result).be.true;
		});
		it('should support parsing as array', function(){
			var result = util.isStringAnObject('[1,2]');
			should(result).be.true;
		});
		it('should support parsing as string', function(){
			var result = util.isStringAnObject('1');
			should(result).be.false;
		});
	});

	describe('array', function(){
		it('should support making an array from string', function(){
			var result = util.makeArray('1,2');
			should(result).be.an.array;
			should(result).be.eql(['1','2']);
		});
		it('should support making an array from string with spaces', function(){
			var result = util.makeArray('1, 2,3');
			should(result).be.an.array;
			should(result).be.eql(['1','2','3']);
		});
		it('should support making an array from string as array', function(){
			var result = util.makeArray('[1,2,3]');
			should(result).be.an.array;
			should(result).be.eql([1,2,3]);
		});
		it('should support making an array from string as single string', function(){
			var result = util.makeArray('1');
			should(result).be.an.array;
			should(result).be.eql(['1']);
		});
	});

	describe('parseSelectExpression', function(){
		it('should parse COUNT(*)', function(){
			var result = util.parseSelectExpression('COUNT(*)');
			should(result).be.an.function;
			var count = result.call([]);
			should(count).be.equal(0);
			count = result.call([{a:1}]);
			should(count).be.equal(1);
		});
		it('should parse COUNT(*) as count', function(){
			var result = util.parseSelectExpression('COUNT(*) as count');
			should(result).be.an.function;
			var count = result.call([]);
			should(count).be.equal(0);
			count = result.call([{a:1}]);
			should(count).be.equal(1);
		});
		it('should parse MAX(size)', function(){
			var result = util.parseSelectExpression('MAX(size)');
			should(result).be.an.function;
			var value = result.call([{size:1},{size:2}]);
			should(value).be.equal(2);
		});
		it('should parse MIN(size)', function(){
			var result = util.parseSelectExpression('MIN(size)');
			should(result).be.an.function;
			var value = result.call([{size:1},{size:2}]);
			should(value).be.equal(1);
		});
		it('should parse SUM(size)', function(){
			var result = util.parseSelectExpression('SUM(size)');
			should(result).be.an.function;
			var value = result.call([{size:1},{size:2}]);
			should(value).be.equal(3);
		});
		it('should parse AVG(size)', function(){
			var result = util.parseSelectExpression('AVG(size)');
			should(result).be.an.function;
			var value = result.call([{size:1},{size:2}]);
			should(value).be.equal((1+2)/2);
		});
	});

});