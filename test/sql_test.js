var should = require('should'),
	sql = require('../lib/sql');

describe("sql", function(){

	describe("select", function(){

		it("multiple select tables not supported", function(done){
			sql.parse("SELECT * from Files, Photos", function(err,result){
				should(err).not.be.null;
				should(err.message).be.equal("multiple SELECTs not supported at this time");
				done();
			});
		});

		it("SELECT * from Files", function(done){
			sql.parse("SELECT * from Files", function(err,result){
				if (err) {
					return done(err);
				}
				should(result).be.an.object;
				should(result).have.property('object','Files');
				should(result).have.property('where');
				should(Object.keys(result.where)).have.length(0);
				done();
			});
		});

		it("SELECT name from Files", function(done){
			sql.parse("SELECT name from Files", function(err,result){
				if (err) {
					return done(err);
				}
				should(result).be.an.object;
				should(result).have.property('object','Files');
				should(result).have.property('where');
				should(result).have.property('sel');
				should(result.sel).have.property('all',['name']);
				should(Object.keys(result.where)).have.length(0);
				done();
			});
		});

		it("SELECT name,url from Files", function(done){
			sql.parse("SELECT name,url from Files", function(err,result){
				if (err) {
					return done(err);
				}
				should(result).be.an.object;
				should(result).have.property('object','Files');
				should(result).have.property('where');
				should(result).have.property('sel');
				should(result.sel).have.property('all',['name','url']);
				should(Object.keys(result.where)).have.length(0);
				done();
			});
		});

		it("SELECT name,url from Files where name like '^appc'", function(done){
			sql.parse("SELECT name,url from Files where name like '^appc'", function(err,result){
				if (err) {
					return done(err);
				}
				should(result).be.an.object;
				should(result).have.property('object','Files');
				should(result).have.property('where');
				should(result.where).have.property('name',{$regex:'^appc'});
				should(result).have.property('sel');
				should(result.sel).have.property('all',['name','url']);
				done();
			});
		});

		it("SELECT name,url from Files LIMIT 10", function(done){
			sql.parse("SELECT name,url from Files LIMIT 10", function(err,result){
				if (err) {
					return done(err);
				}
				should(result).be.an.object;
				should(result).have.property('object','Files');
				should(result).have.property('where');
				should(result).have.property('sel');
				should(result).have.property('limit',10);
				should(result.sel).have.property('all',['name','url']);
				should(Object.keys(result.where)).have.length(0);
				done();
			});
		});

		it("SELECT name n,url u from Files where n = 'appc'", function(done){
			sql.parse("SELECT name n,url u from Files where n = 'appc'", function(err,result){
				if (err) {
					return done(err);
				}
				should(result).be.an.object;
				should(result).have.property('object','Files');
				should(result).have.property('where');
				should(result).have.property('sel');
				should(result.sel).have.property('all',['name','url']);
				should(result.where).have.property('name','appc');
				done();
			});
		});

		it("SELECT name n,url u from Files where n = 'appc' ORDER BY url", function(done){
			sql.parse("SELECT name n,url u from Files where n = 'appc' ORDER BY url", function(err,result){
				if (err) {
					return done(err);
				}
				console.log(result);
				should(result).be.an.object;
				should(result).have.property('object','Files');
				should(result).have.property('where');
				should(result).have.property('sel');
				should(result).have.property('order','url');
				should(result.sel).have.property('all',['name','url']);
				should(result.where).have.property('name','appc');
				done();
			});
		});

		it("SELECT name n,url u from Files where n = 'appc' ORDER BY url, name DESC", function(done){
			sql.parse("SELECT name n,url u from Files where n = 'appc' ORDER BY url, name DESC", function(err,result){
				if (err) {
					return done(err);
				}
				console.log(result);
				should(result).be.an.object;
				should(result).have.property('object','Files');
				should(result).have.property('where');
				should(result).have.property('sel');
				should(result).have.property('order','url,-name');
				should(result.sel).have.property('all',['name','url']);
				should(result.where).have.property('name','appc');
				done();
			});
		});

		it("SELECT name n,url u from Files where n = 'appc' ORDER BY url, name asc", function(done){
			sql.parse("SELECT name n,url u from Files where n = 'appc' ORDER BY url, name asc", function(err,result){
				if (err) {
					return done(err);
				}
				console.log(result);
				should(result).be.an.object;
				should(result).have.property('object','Files');
				should(result).have.property('where');
				should(result).have.property('sel');
				should(result).have.property('order','url,name');
				should(result.sel).have.property('all',['name','url']);
				should(result.where).have.property('name','appc');
				done();
			});
		});

		it("SELECT count(*) from Files", function(done){
			sql.parse("SELECT count(*) from Files", function(err,result){
				if (err) {
					return done(err);
				}
				console.log(result);
				should(result).be.an.object;
				should(result).have.property('object','Files');
				done();
			});
		});

		//select count(module_filesize) as size from Files where module_filesize > 0 order by size asc LIMIT 100

	});

});