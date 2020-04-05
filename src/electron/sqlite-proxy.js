
  if (global.require === undefined) {
    console.error(
      "Electron Node.js integration is disabled, you can not use cordova-file-plugin without it\n" +
        "Check docs how to enable Node.js integration: https://cordova.apache.org/docs/en/latest/guide/platforms/electron/#quick-start"
    );
    return;
  }

  console.log("In electron version of cordova plugin");

var sqlite3 = global.require('sqlite3').verbose();

var dbmap = {};

var nextTick = window.setImmediate || function(fun) {
    window.setTimeout(fun, 0);
};



module.exports = {
	echoStringValue: function(win, fail, args) {
	    var options = args[0];
		win(options.value);
	},
	open: function(win, fail, args) {
	    var options = args[0];
	    var res;

		function openImmediate(dbname) {
			if (!!dbmap[dbname]) {
				// NO LONGER EXPECTED due to BUG 666 workaround solution:
				fail("INTERNAL ERROR: database already open for dbname: " + dbname);
			}


			console.log("open db name: " + dbname);

			var db = new sqlite3.Database(dbname);
			dbmap[dbname] = db;
			db.query = function (sql, params) {
			  var that = this;
			  return new Promise(function (resolve, reject) {
				that.all(sql, params, function (error, rows) {
				  if (error)
					reject(error);
				  else
					resolve({ rows: rows });
				});
			  });
			};
			
			nextTick(function() {
				win();
			});
		
		}

		try {
		    //res = SQLitePluginRT.SQLitePlugin.openAsync(options.name);
			var dbname = options.name;

			openImmediate(dbname);
		} catch(ex) {
			//fail(ex);
			nextTick(function() {
				fail(ex);
			});
		}
		//handle(res, win, fail);
	},
	close: function(win, fail, args) {
	    var options = args[0];
	    var res;
		try {
			var dbname = options.path;

			nextTick(function() {
				var rc = 0;
				var db = dbmap[dbname];

				if (!db) {
					fail("CLOSE ERROR: cannot find db object for dbname: " + dbname);
				} else if ((rc = db.close()) !== 0) {
					fail("CLOSE ERROR CODE: " + rc);
				} else {
					delete dbmap[dbname];
					win();
				}
			});
		} catch (ex) {
			fail(ex);
		}
	},
	
	
	
	backgroundExecuteSqlBatch: async function(win, fail, args) {
		
	    var options = args[0];
	    var dbname = options.dbargs.dbname;
		var executes = options.executes;
		var db = dbmap[dbname];
		var results = [];
		var i, count=executes.length;

		//console.log("executes: " + JSON.stringify(executes));
		//console.log("execute sql count: " + count);
					//console.log("execute sql: " + e.sql + " params: " + JSON.stringify(e.params));
		for (i=0; i<count; ++i) {
			var e = executes[i];
			try {
			const result = await db.query(e.sql, e.params);
			
			console.log( "For query " + e.sql + " result: " + result); 
			console.log(result); 
			
			results.push({
					type: "success",
					result: result
			});
				
			} catch(ex) {
				console.log("sql exception error: " + ex.message);
				results.push({
					type: "error",
					result: { message: ex.message, code: 0 }
				});
			}
			
			/*
				var oldTotalChanges = db.totalChanges();
				var rows = db.all(e.sql, e.params);
				//console.log("got rows: " + JSON.stringify(rows));
				var rowsAffected = db.totalChanges() - oldTotalChanges;
				var result = { rows: rows, rowsAffected: rowsAffected };
				if (rowsAffected > 0) {
					var lastInsertRowid = db.lastInsertRowid();
					if (lastInsertRowid !== 0) result.insertId = lastInsertRowid;
				}
				results.push({
					type: "success",
					result: result
				});
			} catch(ex) {
				console.log("sql exception error: " + ex.message);
				results.push({
					type: "error",
					result: { message: ex.message, code: 0 }
				});
			}*/ 
		}
		//console.log("return results: " + JSON.stringify(results));
		nextTick(function() {
			//console.log("return results: " + JSON.stringify(results));
			win(results);
		});
	},
	"delete": function(win, fail, args) {
	    var options = args[0];
	    var res;
		try {
		    //res = SQLitePluginRT.SQLitePlugin.deleteAsync(JSON.stringify(options));
			var dbname = options.path;

			WinJS.Application.local.exists(dbname).then(function(isExisting) {
				if (!isExisting) {
					// XXX FUTURE TBD consistent for all platforms:
					fail("file does not exist");
					return;
				}

				if (!!dbmap[dbname]) {
					dbmap[dbname].close_v2();

					delete dbmap[dbname];
				}

				//console.log('test db name: ' + dbname);
				Windows.Storage.ApplicationData.current.localFolder.getFileAsync(dbname)
					.then(function (dbfile) {
						//console.log('get db file to delete ok');
						return dbfile.deleteAsync(Windows.Storage.StorageDeleteOption.permanentDelete);
					}, function (e) {
						console.log('get file failure: ' + JSON.stringify(e));
						// XXX FUTURE TBD consistent for all platforms:
						fail(e);
					}).then(function () {
						//console.log('delete ok');
						win();
					}, function (e) {
						console.log('delete failure: ' + JSON.stringify(e));
						// XXX FUTURE TBD consistent for all platforms:
						fail(e);
					});

			});

		} catch(ex) {
			fail(ex);
		}
		//handle(res, win, fail);
	}
};
require("cordova/exec/proxy").add("SQLitePlugin", module.exports);
