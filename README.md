# pg-table

[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![Node.js Version][node-version-image]][node-version-url]

## Tabla de contenidos

- [Install](#install)
- [Introduccion](#introduccion)
- [Uso](#uso)

## install 

pg-table es un  modulo de [Node.js](https://nodejs.org/es/) valido registrado en [npm registry](https://www.npmjs.com/).

Para instalar use [`npm install` command](https://docs.npmjs.com/getting-started/installing-npm-packages-locally):

```sh
$ npm install pg-table
```
## introduccion

pg-table es una interface de alto nivel para generar consultas en postgresql
Escrito en JavaScript


## uso 

Para usar este modulo solo es nesesario conocer un poco el api de pg
los parametros del constructor de postgreSqlTable son los mismos que se usarian 
en el constructor Client de pg, usando el metodo *`tabla(tabla)`* se obtiene
un objeto dbTabla que representa a la tabla con el nombre del parametro en la base de datos.

[Mas documentacion sobre dbTabla..](https://github.com/ever23/dbtabla#dbtabla)

```js
// file ./index.js
const pg=require("pg-table")
let connect= new pg({
    host     : 'tu_host',
    password:'tu_pass',
    user     : 'tu_user',
    database :'tu_db'
})
let test1=connect.tabla("test1")
// insert([1,"un texto","otro texto"]) tabien se acepta un objeto  
test1.insert(1,"un texto","otro texto") 
    .then(ok=>
    {
        console.log(ok)
    }).catch(e=>
    {
        console.log(e)
    })
```
En este caso si la tabla test1 no existe lanzara un error en catch
para resolver esto podemos crear un modelo para 
la tabla test1 y cargarlo esto ara que se verifique la existencia y 
si no existe la tabla sea creada e inicializada automaticamente para esto 
podemos crear un diretorio que contendra los modelos por ejemplo ./model/
y crear los modelos nesesarios para el proyecto 
```js
// file ./model/test1.js 
const model=require("tabla-model")
const test2=new model("test2",[
    {
        name:"id",
        type:"int",
        primary:true,
        autoincrement:true
    },
    {
        name:"row1",
        type:"text"
    },
    {
        name:"row2",
        type:"int",
    },
    {
        name:"row3",
        type:"date",
    }
])
test2.foreingKey({ // se agrega las claves foraneas 
    key:"row2",
    reference:"test4",
    keyReference:"id_key2",
    onUpdate:'CASCADE',
    onDelete:'NO ACTION',
    // match: ' '
})
test2.insert(1,"hola",14,"2018/10/23")// datos de inicializacion 
// el parametro tabla recibira el objeto de la tabla 
// y el segundo el objeto de conexion
// y el resto los parametros pasados en la llamada
test2.method("miMetodo",(tabla,connect,...params)=>
{
    //tu codigo para el metodo del modelo 
    //tabla.select()
    //tabla.insert()
    //tabla.update()
    //tabla.delete()
})
module.exports=test2
```
Luego en para usarlo 
```js
// file ./index.js
const path=require("path")
const pg=require("pg-table")
let connect= new pg({
    host     : 'tu_host',
    password:'tu_pass',
    user     : 'tu_user',
    database :'tu_db'
})

connect.pathModels(path.dirname(__filename)+"/model")

let test2=connect.tabla("test2")
// insert([1,"un texto","otro texto"]) tabien se acepta un objeto  
test2.insert(1,"un texto","otro texto") 
    .then(ok=>
    {
        console.log(ok)
    }).catch(e=>
    {
        console.log(e)
    })
test2.miMetodo("hola")
```

[Mas documentacion sobre tabla-model..](https://github.com/ever23/tabla-model#uso)


## postgreSqlTable#constructor(config)

Constructor de postgreSqlTable

* `config {object}`: configuracion para pg, tambien se puede pasar un objeto obtenido del constructor Client de pg
```js
const pg=require("pg-table")
let connect= new pg({
    host     : 'tu_host',
    password:'tu_pass',
    user     : 'tu_user',
    database :'tu_db'
})
```
```js
const postgreSqlTable=require("pg-table")
const pg=require("pg")
let db = pg.Client({
    host     : 'tu_host',
    password:'tu_pass',
    user     : 'tu_user',
    database :'tu_db'
})
let connect= new postgreSqlTable(db)
```

## postgreSqlTable#tabla(tabla,[callback,[verify]])
Factoriza y retorna un objeto dbTabla que representara a la tabla con el nombre del primer parametro

* `tabla {string}`: Nombre de la tabla en la base de metadatos
* `callback {function} (opcional)`: Funcion que sera ejecutada cuando se verifique la existencia de la tabla, esta funcion recibira un parametro que sera el objeto dbTabla creado y si la tabla no es encontrada el parametro sera *null*
* `verify {boolean} (opcional)`: indica  si la verificacion se realizara al instante o se esperara a la primera consulta

## postgreSqlTable#model(tabla)
Verifica si un modelo existe y lo retorna si no existe retorna *`false`*

* `tabla {string}`: Nombre del modelo

## postgreSqlTable#addModel(model)
Agrega un modelo
* `model {sqlModel|object|string}`: Si es un objeto instanceado de tabla-model se agregara a la lista de modelos, si es un objeto pero no de tabla-model se tomara como los datos para factorizar un modelo deberia tener el formato *`{tabla:String, campos:Array, foreingKey:Array}`* y su es un string deberia ser una clausula sql CREATE TABLE de la cual se factorizara el modelo
```js
//ejemplo 1
const pg=require("pg-table")
const model=require("tabla-model")
let connect= new pg({
    host     : 'tu_host',
    password:'tu_pass',
    user     : 'tu_user',
    database :'tu_db'
})
const test2=new model("test2",{
    campos:[
        {
            name:"id",
            type:"int",
            primary:true,
			autoincrement:true
        },
        {
            name:"row1",
            type:"text"
        },
        {
            name:"row2",
            type:"int",
        },
        {
            name:"row3",
            type:"date",
        }
    ]
})
 connect.addModel(test2)
```
```js
//ejemplo 2
const pg=require("pg-table")
let connect= new pg({
    host     : 'tu_host',
    password:'tu_pass',
    user     : 'tu_user',
    database :'tu_db'
})
connect.addModel({
    tabla:"test2",
    campos:[
        {
            name:"id",
            type:"int",
            primary:true,
			autoincrement:true
        },
        {
            name:"row1",
            type:"text"
        },
        {
            name:"row2",
            type:"int",
        },
        {
            name:"row3",
            type:"date",
        }
    ]
})
```
```js
//ejemplo 3
const pg=require("pg-table")
let connect= new pg({
    host     : 'tu_host',
    password:'tu_pass',
    user     : 'tu_user',
    database :'tu_db'
})
connect.addModel(`CREATE TABLE test2 (
    id serial,
    row1 text,
    row2 int,
    row3 date,
    primary key (id)
)`)
```

## postgreSqlTable#pathModels(path)
Cargar todos los modelos existentes en el directorio path  
* `path {string}`: directorio de modelos


## postgreSqlTable#query(sql,[config])

Ejecuta una consulta sql en la base de datos y retorna una promesa

* `sql {string}`: consulta sql
* `config {object}`: configuracion para la consulta pg


## mysqlTable#end()

Termina la conexion con la base de datos 

[npm-image]: https://img.shields.io/npm/v/pg-table.svg
[npm-url]: https://npmjs.org/package/pg-table
[node-version-image]: https://img.shields.io/node/v/pg-table.svg
[node-version-url]: https://nodejs.org/en/download/
[downloads-image]: https://img.shields.io/npm/dm/pg-table.svg
[downloads-url]: https://npmjs.org/package/pg-table
