var should = require('should'),
	path = require('path'),
	factory = require('../lib/factory'),
	create = factory.create,
	query = factory.query,
	sql = factory.sql;
	

describe('factory', function(){

	describe('create', function(){

		describe('files', function(){
			it('should create', function(done) {
				create('files','name=Jeff,user=1,file=./package.json',null,function(err,executor,object){
					if (err) { return done(err); }
					should(executor).be.a.Function;
					should(object).be.an.Object;
					should(executor.objectName).be.equal('files');
					should(object).have.property('name','Jeff');
					should(object).have.property('user','1');
					should(object).have.property('file',path.resolve(process.cwd(),'./package.json'));
					done();
				});
			});
			it('should raise exception if missing required field', function(done) {
				create('files','foobar=1',null,function(err,executor,object){
					should(err).be.an.object;
					should(err.message).equal("required attribute 'name' missing. 'name' is File name");
					done();
				});
			});
			it('should not raise exception if using a custom object', function(done) {
				create('files','name=Jeff,file=./package.json,foobar=1',null,function(err,executor,object){
					if (err) { return done(err); }
					should(executor).be.a.Function;
					should(object).be.an.Object;
					should(executor.objectName).be.equal('files');
					should(object).have.property('custom_fields');
					should(object.custom_fields).have.property('foobar','1');
					done();
				});
			});
		});

		describe('keyvalues', function(){
			it('should create', function(done) {
				create('keyvalues','name=Jeff,value=Haynie',null,function(err,executor,object){
					if (err) { return done(err); }
					should(executor).be.a.Function;
					should(object).be.an.Object;
					should(executor.objectName).be.equal('keyValues');
					should(object).have.property('name','Jeff');
					should(object).have.property('value','Haynie');
					done();
				});
			});
			it('should raise exception if missing required field', function(done) {
				create('keyvalues','foobar=1',null,function(err,executor,object){
					should(err).be.an.object;
					should(err.message).equal("required attribute 'name' missing. 'name' is Name (or key) for this key-value pair");
					done();
				});
			});
			it('should raise exception if using a custom object', function(done) {
				create('keyvalues','name=Jeff,value=Haynie,foobar=1',null,function(err,executor,object){
					should(err).be.an.object;
					should(err.message).equal("keyValues doesn't support custom fields");
					done();
				});
			});
		});

		describe('acls', function(){
			it('should create', function(done) {
				create('ACLs','name=Jeff',null,function(err,executor,object){
					if (err) { return done(err); }
					should(executor).be.a.Function;
					should(object).be.an.Object;
					should(executor.objectName).be.equal('acls');
					should(object).have.property('name','Jeff');
					done();
				});
			});
		});

	});

	describe('query', function(){

		describe('files', function(){
			it('should find files', function(done) {
				query('files','a',null,function(err,executor,query){
					if (err) { return done(err); }
					should(executor).be.a.Function;
					should(query).be.an.Object;
					should(executor.objectName).be.equal('files');
					done();
				});
			});
			it('should find Files', function(done) {
				query('Files','a',null,function(err,executor,query){
					if (err) { return done(err); }
					should(executor).be.a.Function;
					should(query).be.an.Object;
					should(executor.objectName).be.equal('files');
					done();
				});
			});
			it('should find File', function(done) {
				query('File','a',null,function(err,executor,query){
					if (err) { return done(err); }
					should(executor).be.a.Function;
					should(query).be.an.Object;
					should(executor.objectName).be.equal('files');
					done();
				});
			});
		});

		describe('custom object', function(){
			it('should be created if not found', function(done) {
				query('foobar','a',null,function(err,executor,query){
					if (err) { return done(err); }
					should(executor).be.a.Function;
					should(query).be.an.Object;
					should(executor.objectName).be.equal('customObjects');
					should(executor.custom).be.true;
					done();
				});
			});
		});

		describe('sql', function(){
			it('should be created if not found', function(done) {
				sql('select name from files',null,function(err,executor,query){
					if (err) { return done(err); }
					should(executor).be.a.Function;
					should(query).be.an.Object;
					should(executor.objectName).be.equal('files');
					should(executor.custom).be.false;
					done();
				});
			});
		});

	});


});