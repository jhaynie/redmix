# Redmix [![Build Status](https://travis-ci.org/jhaynie/redmix.svg)](https://travis-ci.org/jhaynie/redmix) [![npm version](https://badge.fury.io/js/redmix.png)](http://badge.fury.io/js/redmix)

A fun and friendly Appcelerator Cloud MBaaS command line.


## Installation

```bash
$ [sudo] npm install redmix -g
```

## Usage

### Get all the available commands and options:

```bash
$ redmix help

🍷  Redmix  « A fun and friendly Appcelerator Cloud MBaaS command line » v0.0.1
Copyright (c) 2015 by Jeff Haynie.  All Rights Reserved.


  Usage: redmix cmd [options]


  Commands:

    create [options]                  create a data object
    connect <appid> [options]         connect to a cloud app
    query <object> <query> [options]  query objects
    sql <query> [options]             query objects using SQL
    disconnect [options]              disconect from a cloud app
    help [cmd]                        display help for [cmd]

  Options:

    -h, --help     output usage information
    -V, --version  output the version number
    --no-banner    Suppress the banner
    --no-colors    turn of colors in output
```


### Connect to ACS

```bash
$ redmix connect 
? API Key: 098s09df8a90s8df09a8s9f8d0a98sdf908asdf
? Username/Email: myusername
? Password: ********************************
Application connected.  You can now make requests for this app.
```

### Query an Object

Query files which have a name starting with appc and return the oldest one:

```bash
$ redmix query Files "name like appc" --order created_at --limit 1
```

Query files with a more complex example:

```bash
$ redmix query Files "name!=foo" "module_version not in 0.1.0" "module_version_sortable > 100" --order=-module_version_sortable --sel module_version,name,module_version_sortable --limit 2 --eval "this.map(function(e){return e.custom_fields.module_version;})"
```

In the above example, we would see something like:

```
[
  "1.0.23",
  "1.0.18"
]
```

### Query using SQL

Limited support for basic SQL is supported.  Currently, only for SELECT statements.

```bash
$ redmix sql "select name, url from Files where name like 'appc' order by url DESC LIMIT 1"
```

You can delete:

```bash
$ redmix sql "delete from foo where name = 'hello'"
```

You can do limited sql expressions:

```bash
$ redmix sql "select count(*) from foo"
```

You can do some advanced things like group by and order by:

```bash
$ redmix sql "select module_name, sum(module_filesize) as size from Files where module_filesize > 0 group by module_name order by size desc LIMIT 1000"
```

### Create an Object

Create a File object from the package.json and add a custom field (filetype):

```bash
$ redmix create Files "name=package.json,file=./package.json,filetype=json"
```

### Disconnect

Disconnect from ACS:

```bash
$ redmix disconnect
```

### Output Formats

Redmix supports outputting in several different formats by specifying the `--output` options.

- `text` - default output, colorized (if enabled) text
- `json` - JSON
- `csv` - Comma separated
- `tsv` - Tab separated
- `columns` - Columns

For example, an advanced query with column output:

```bash
$ redmix sql "select module_name, sum(module_filesize) as size from Files where module_filesize > 0 group by module_name order by size desc LIMIT 1000" -o columns --no-banner
SIZE      MODULE_NAME
51053123  appcelerator
542404    appc.salesforce
94613     appc.dashboard
25852     appc.mongo
10413     appc.mysql
9693      appc.stripe
9634      appc.mssql
9515      appc.swagger
7781      com.model
7456      appc.composite
6589      appc.azure
6090      appc.acs
```


## Using as an API

You can use Redmix as a node library as well.

For example, to execute a query you can do something like this:

```javascript
var redmix = require('redmix');
redmix.sql('select * from foo', {}, function(err,executor,query){
  if (err) {
    console.log('failed:',err);
  }
  else {
    executor(query);
  }
});
```


## TODO:

- Update
- Download Photo
- SQL update, describe, create


## License

Licensed under the Apache Public License, version 2. Copyright (c) 2015 by Jeff Haynie.  All Rights Reserved.
