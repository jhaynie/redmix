var should = require('should'),
	ql = require('../lib/query'),
	parse = ql.parse,
	dequote = ql.dequoteString;

describe('query', function(){

	it('should parse single arg', function(){
		var query = parse(['foo']);
		should(query.where).have.property('foo');
		should(query.where.foo).have.property('$exists',true);
	});

	it('should parse assignment', function(){
		var query = parse(['foo=bar']);
		should(query.where).have.property('foo','bar');
	});

	it('should parse assignment with spaces', function(){
		var query = parse(['foo = bar']);
		should(query.where).have.property('foo','bar');
	});

	it('should parse assignment with eq', function(){
		var query = parse(['foo eq bar']);
		should(query.where).have.property('foo','bar');
	});

	it('should parse assignment with equals', function(){
		var query = parse(['foo equals bar']);
		should(query.where).have.property('foo','bar');
	});

	it('should parse assignment with eq', function(){
		var query = parse(['foo equal bar']);
		should(query.where).have.property('foo','bar');
	});

	it('should parse assignment with eq', function(){
		var query = parse(['foo is bar']);
		should(query.where).have.property('foo','bar');
	});

	it('should parse assignment with not equal', function(){
		var query = parse(['foo not equal bar']);
		should(query.where).have.property('foo',{$ne:'bar'});
	});

	it('should parse assignment with !=', function(){
		var query = parse(['foo not eq bar']);
		should(query.where).have.property('foo',{$ne:'bar'});
	});

	it('should parse assignment with !=', function(){
		var query = parse(['foo not equals bar']);
		should(query.where).have.property('foo',{$ne:'bar'});
	});

	it('should parse assignment with !=', function(){
		var query = parse(['foo != bar']);
		should(query.where).have.property('foo',{$ne:'bar'});
	});

	it('should parse multiple assignments', function(){
		var query = parse(['foo','bar']);
		should(query.where).have.property('foo');
		should(query.where.foo).have.property('$exists',true);
		should(query.where).have.property('bar');
		should(query.where.bar).have.property('$exists',true);
	});

	it('should parse assignment with >', function(){
		var query = parse(['foo > 1']);
		should(query.where).have.property('foo',{$gt:1});
	});

	it('should parse assignment with <', function(){
		var query = parse(['foo < 1']);
		should(query.where).have.property('foo',{$lt:1});
	});

	it('should parse assignment with >=', function(){
		var query = parse(['foo >= 1']);
		should(query.where).have.property('foo',{$gte:1});
	});

	it('should parse assignment with <=', function(){
		var query = parse(['foo <= 1']);
		should(query.where).have.property('foo',{$lte:1});
	});

	it('should parse assignment with like', function(){
		var query = parse(['foo like bar']);
		should(query.where).have.property('foo',{$regex:'^bar'});
	});

	it('should parse assignment with not like', function(){
		var query = parse(['foo not like bar']);
		should(query.where).have.property('foo',{$regex:'^(?!bar)'});
	});

	it('should parse assignment with in', function(){
		var query = parse(['foo in bar']);
		should(query.where).have.property('foo',{$in:['bar']});
	});

	it('should parse assignment with not in', function(){
		var query = parse(['foo not in bar']);
		should(query.where).have.property('foo',{$nin:['bar']});
	});

	it('should parse assignment with contains', function(){
		var query = parse(['foo contains bar']);
		should(query.where).have.property('foo',{$in:['bar']});
	});

	it('should parse assignment with not contains', function(){
		var query = parse(['foo not contains bar']);
		should(query.where).have.property('foo',{$nin:['bar']});
	});

	it('should parse assignment with regex', function(){
		var query = parse(['foo =~ bar']);
		should(query.where).have.property('foo',{$regex:'^bar'});
	});

	it('should parse assignment with regex', function(){
		var query = parse(['foo near 1.1 ,2.02']);
		should(query.where).have.property('foo',{$nearSphere:[1.1,2.02]});
	});

	it('should parse assignment with --limit', function(){
		var query = parse(['foo'],{limit:10});
		should(query.where).have.property('foo',{$exists:true});
		should(query.limit).be.equal(10);
	});

	it('should parse assignment with --skip', function(){
		var query = parse(['foo'],{skip:10});
		should(query.where).have.property('foo',{$exists:true});
		should(query.skip).be.equal(10);
	});

	it('should parse assignment with --order', function(){
		var query = parse(['foo'],{order:'-foo'});
		should(query.where).have.property('foo',{$exists:true});
		should(query.order).be.equal('-foo');
	});

	it('should parse assignment with --sel', function(){
		var query = parse(['foo'],{sel:'foo,bar'});
		should(query.where).have.property('foo',{$exists:true});
		should(query.sel).be.eql({all:['foo','bar']});
	});

	it('should parse assignment with --unsel', function(){
		var query = parse(['foo'],{unsel:'foo,bar'});
		should(query.where).have.property('foo',{$exists:true});
		should(query.unsel).be.eql({all:['foo','bar']});
	});

	it('should parse name = "foo"', function(){
		var query = parse(['name = "foo"']);
		should(query.where).have.property('name','foo');
	});

	it('should quote double quotes', function(){
		var result = dequote('"hello"');
		should(result).be.equal('hello');
	});

	it('should de-quote single quotes', function(){
		var result = dequote("'hello'");
		should(result).be.equal('hello');
	});

	it('should de-quote single quotes with spaces', function(){
		var result = dequote("'hello foo'");
		should(result).be.equal('hello foo');
	});

	it('should not de-quote single quotes with internal quotes', function(){
		var result = dequote("'hello \'my friend\' foo'");
		should(result).be.equal('hello \'my friend\' foo');
	});

	it('should de-quote escaped quotes', function(){
		var result = dequote('name = \"a\"');
		should(result).be.equal('name = "a"');
	});

});