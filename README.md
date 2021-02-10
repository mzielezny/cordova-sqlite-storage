#Notes 
Below plugin is try to create electron version of cordova sql plugin - it's early stage - so don't except miracles.

# Cross-platform SQLite storage plugin for Cordova/PhoneGap - cordova-sqlite-storage plugin version

Native SQLite component with API based on HTML5/[Web SQL (DRAFT) API](http://www.w3.org/TR/webdatabase/) for the following platforms:
- Android
- iOS
- macOS ("osx" platform)
- Windows 10 (UWP) DESKTOP and MOBILE (see below for major limitations)
- Electron in WIP 


#How to start with electron ?

irst you have to add to below entry to config.xml - it is containing path to file which contain electron starting settings

```xml
<platform name="electron">
    <preference name="ElectronSettingsFilePath" value="resources/electron/settings.json" />
</platform>
	
```

in that settings file you have to configure node integration support 

```javascript
{
    "browserWindow": {
        "height": 600,
        "webPreferences":{
            "devTools": true,
            "nodeIntegration": true
        },
        "width": 1024
    }
}
	
```

next you have to install sqlite3 for node 

```bash
npm install sqlite3
npm install electron-rebuild 

```

before you start using you have to rebuild plugin for your electron version

```bash
node_modules/.bin/electron-rebuild -f -w sqlite3
```


after each plugin modification (yes you cane modificate plugin  by yourself in main plugin location) 
you have to remove platform and add again (as below) 

```bash
cordova platform remove electron 
cordova platform remove electron@1.1.1 # or any modern version 
```

Please remember that if yout want to run node plugin you have to use npm.
 
To import any node module you have to use "global.require" - main require is overriden by cordova

IMPORTANT 

If plugin is not working check if electron-rebuild is in devDependencies (yes in dev - it will generate issue in console but ignore it)

"electron-rebuild": "^1.11.0", <--

##Simple example 


```typescript
private sqlsend(): void {
    var db = window.sqlitePlugin.openDatabase({
      name: 'my.db',
      location: 'default'
    });

    db.executeSql('SELECT count(*) AS mycount FROM DemoTable', [], (rs) => {
      console.log('Record count (expected to be 2): ' + rs.rows.item(0).mycount);
    }, (error) => {
      console.log('SELECT SQL statement ERROR: ' + error.message);
    });
  }

  private sqlcreate(): void {
    var db = window.sqlitePlugin.openDatabase({
      name: 'my.db',
      location: 'default'
    });

    db.sqlBatch([
      'CREATE TABLE IF NOT EXISTS DemoTable (name, score)',
      [ 'INSERT INTO DemoTable VALUES (?,?)', ['Alice', 101] ],
      [ 'INSERT INTO DemoTable VALUES (?,?)', ['Betty', 202] ],
    ], () => {
      console.log('Populated database OK');
    }, (error) => {
      console.log('SQL batch ERROR: ' + error.message);
    });
```

##Why it is work in progress ?

In this example I only resolved how to start sqlite node plugin in electron and made simple query. 
There are also some stuff in original plugin as

```typescript
var rowsAffected = db.totalChanges() - oldTotalChanges;
var result = { rows: rows, rowsAffected: rowsAffected };
if (rowsAffected > 0) {
	var lastInsertRowid = db.lastInsertRowid();
	if (lastInsertRowid !== 0) result.insertId = lastInsertRowid;
	}
```

which was addressed by me only for insert and update occur - I haven't explore if it need more work. 

**LICENSE:** MIT, with Apache 2.0 option for Android and Windows platforms (see [LICENSE.md](./LICENSE.md) for details, including third-party components used by this plugin)

## WARNINGS

- **Multiple SQLite corruption problem** - see section below & [`xpbrew/cordova-sqlite-storage#626`](https://github.com/xpbrew/cordova-sqlite-storage/issues/626)
- **Breaking changes coming soon** - see section nearby & see [`xpbrew/cordova-sqlite-storage#922`](https://github.com/xpbrew/cordova-sqlite-storage/issues/922)



