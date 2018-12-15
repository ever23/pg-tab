const {Client}=require("pg")
const pgTabla=require("./lib/pgtabla")
const {POSTGRESQL_DB,connect}= pgTabla
/**
* mysqlTable
* crea una coneccion a una base de datos mysql
*/
class postgreSqlTable extends connect
{
    /**
    * @param {object} param - configuracion para mysql
    * @param {boolean} connect - indica si conectata al instante
    */
    constructor(params,connect=true)
    {
        super(params,POSTGRESQL_DB)
        this.conection=new Client(params)
        if(connect)
            this.connect()
        this.__escapeChar="\""
        this.__information_schema = "SELECT information_schema.columns.* FROM information_schema.columns WHERE table_name="
        postgreSqlTable.__caheTablas={}
        this.__connectCallback=()=>{}
    }
    /**
    * construlle un objeto dbtabla asociado a el nombre
    * de la tabla del primer parametro
    * @param {string} tabla - nombre de la tabla en la base de datos
    * @param {function} callback - funcion anomina que se ejecutara cuando se verifique la existencia de la tabla
    * @return {dbTabla}
    */
    tabla(tabla,callback)
    {
        if(typeof postgreSqlTable.__caheTablas[tabla]!=="undefined")
        {
            return postgreSqlTable.__caheTablas[tabla]
        }
        return  postgreSqlTable.__caheTablas[tabla] = new pgTabla({
            tabla:tabla,
            conection:this,
            callback:t=>typeof callback==="function"?callback(t):null,
            config:{
                escapeChar:this.__escapeChar,
                reserveIdentifiers:this.__reserveIdentifiers,
                ar_aliased_tables:this.__ar_aliased_tables,
                dbprefix:this.__dbprefix,
                swap_pre:this.__swap_pre,
                escapeString:e=>this.__escapeString(e)
            }
        },typeof callback==="function")

    }
    /**
    * conecta con la base de datos
    * @param {function} callback - funcion que se  ejecutara al conectar
    */
    connect(callback=()=>{})
    {
        //this.__connectCallback=callback
        this.conection.connect(ok=>{
            callback(ok)/*
            if(ok)
            {
                //console.log(ok)
                if(ok.code=="3D000")
                {
                    this.__createDatabase().then(ok=>
                    {

                    }).catch(e=>
                    {
                        //console.log(e)
                        callback(e)
                    })

                }
            }else {
                callback(ok)
            }*/
        })
    }
    /**
    * intenta crear la base de datos
    *
    *
    __createDatabase(callback)
    {
        return new Promise((resolve,reject)=>
        {
            let database =this.conection.database
            this.conection=new Client(this.config)
            this.conection.database=this.conection.connectionParameters.database=''

            this.conection.connect(error=>
            {

                if(error)
                {
                    reject(error)
                }else
                {
                    this.query(`CREATE DATABASE ${database};`).then(d=>
                    {
                        this.query(`use ${database}`)
                            .then(ok2=>
                            {
                                this.conection.database=this.conection.connectionParameters.database=database
                                resolve(null)
                            }).catch(reject)
                    }).catch(reject)
                }

            })
        })

    }*/

    /**
    * envia una consulta a la base de datos
    * @param {string} query - consulta sql
    * @return {Promise}
    */
    query(query)
    {
        return new Promise((resolver,reject)=>
        {
            try
            {
                this.conection.query(query,(error,result)=>
                {
                    if(error)
                    {
                        return reject(error)
                    }
                    resolver(result)
                })
            }catch(e)
            {
                reject(e)
            }

        })
    }
    /**
    * escapa el texto sql
    * @param {string} str - texto
    * @return {string}
    */
    __escapeString(str)
    {
        return this.conection.escapeLiteral(str)
    }
    /**
    * termina la coneccion
    */
    end()
    {
        this.conection.end()
    }
    /**
    * verificara la existencia de la tabla
    * en la base de datos y pasa lo metadatos de la misma calback en
    * el segundo parametro
    * @param {string} table - nombre de la tabla
    * @param {function} callback - funcion a ejecutar cuando se obtengan los metadatos
    */
    __keysInTable(table,callback)
    {
        return new Promise((res,rej)=>
        {
            this.query(`${this.__information_schema}'${table}' and table_catalog='${this.conection.database}'`)
                .then(result1=>{
                    if(!this.inModel(table,callback,result1.rows.length==0))
                    {
                        if(result1.rows.length==0)
                            res("la tabla no existe")
                        this.query(`SELECT information_schema.key_column_usage.* FROM information_schema.key_column_usage WHERE table_name='${table}'`)
                            .then(resul2=>
                            {
                                this.__procesingKeys(table,result1.rows,resul2.rows,res)
                            }).catch(res)
                    }
                }).catch(res)
        })

    }
    /**
    * procesa los metadatos y los pasa a la funcion
    * @param {string} table - nombre de la tabla
    * @param {array} data - metadatos crudos
    * @param {function} callback - funcion a ejecutar cuando se obtengan los metadatos
    *
    */
    __procesingKeys(table,data1,data2,callback)
    {
        let colums=new Array(data1.length)
        for(let item of data1)
        {
            colums[item.ordinal_position-1]={
                name:item.column_name,
                type:item.data_type,
                defaultNull:item.id_nullable == "YE" ? true : false,
                primary:data2.find(d=> d.column_name==item.column_name && d.constraint_name==table+"_pkey")?true:false,//item.COLUMN_KEY == "PRI",
                unique:false,//item.COLUMN_KEY == "UNI",
                defaul:!/nextval\('[\w]+'::regclass\)/i.test(item.column_default)?item.column_default:"",
                autoincrement:/nextval\('[\w]+'::regclass\)/i.test(item.column_default)

            }

        }

        callback({
            tabla:table,
            colums:colums

        })
    }
}

module.exports=postgreSqlTable
