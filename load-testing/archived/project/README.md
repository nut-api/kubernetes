# k6 example with EasyGraphQL

This is an example using [k6](https://docs.k6.io/docs/running-k6) and [EasyGraphQL](https://github.com/EasyGraphQL).

## k6
You should have installed [k6](https://docs.k6.io/docs/installation)

## How to run
You can run it yourselves after cloning the repo.

```shell
$ npm install
$ npm run now
```

Then in a separate window
```
$ npm run easygraphql-load-tester
```
## Run with Makefile
You can run test and convert result from json to csv file
```
$ make run
```

Or only convert result from json to csv file after test
```
$ make json2csv