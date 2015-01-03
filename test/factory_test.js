var should = require('should'),
	path = require('path'),
	factory = require('../lib/factory');
	

describe('factory', function(){

	describe('create', function(){

		describe('files', function(){
			it('should create', function(done) {
				factory.createCreator('files','name=Jeff,user=1,file=./package.json',null,function(err,executor,object){
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
				factory.createCreator('files','foobar=1',null,function(err,executor,object){
					should(err).be.an.object;
					should(err.message).equal("required attribute 'name' missing. 'name' is File name");
					done();
				});
			});
			it('should not raise exception if using a custom object', function(done) {
				factory.createCreator('files','name=Jeff,file=./package.json,foobar=1',null,function(err,executor,object){
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
				factory.createCreator('keyvalues','name=Jeff,value=Haynie',null,function(err,executor,object){
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
				factory.createCreator('keyvalues','foobar=1',null,function(err,executor,object){
					should(err).be.an.object;
					should(err.message).equal("required attribute 'name' missing. 'name' is Name (or key) for this key-value pair");
					done();
				});
			});
			it('should raise exception if using a custom object', function(done) {
				factory.createCreator('keyvalues','name=Jeff,value=Haynie,foobar=1',null,function(err,executor,object){
					should(err).be.an.object;
					should(err.message).equal("keyValues doesn't support custom fields");
					done();
				});
			});
		});

		describe('acls', function(){
			it('should create', function(done) {
				factory.createCreator('ACLs','name=Jeff',null,function(err,executor,object){
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
				factory.queryCreator('files','a',null,function(err,executor,query){
					if (err) { return done(err); }
					should(executor).be.a.Function;
					should(query).be.an.Object;
					should(executor.objectName).be.equal('files');
					done();
				});
			});
			it('should find Files', function(done) {
				factory.queryCreator('Files','a',null,function(err,executor,query){
					if (err) { return done(err); }
					should(executor).be.a.Function;
					should(query).be.an.Object;
					should(executor.objectName).be.equal('files');
					done();
				});
			});
			it('should find File', function(done) {
				factory.queryCreator('File','a',null,function(err,executor,query){
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
				factory.queryCreator('foobar','a',null,function(err,executor,query){
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
				factory.sqlCreator('select name from files',null,function(err,executor,query){
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