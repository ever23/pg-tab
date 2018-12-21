const assert= require("assert")
const dbtabla = require('dbtabla')
const connect = require('../pg-tab.js')
 describe("Test de la clase dbHelpers",()=>
 {
    const pg= new connect(//"pgsql:host=localhost;port=5432;dbname=test_pg_tab;user=postgres;password:EVER2310;"
    {
        host     : 'localhost',
        password:'EVER2310',
        user     : 'postgres',
        database :'test_pg_tab'
    },false)
   
    it('verificacion de metodos',()=>
    {
        assert.equal(typeof pg.tabla,"function")
        assert.equal(typeof pg.query,"function")
        assert.equal(typeof pg.connect,"function")
        
        assert.equal(typeof pg.__keysInTable,"function")
        assert.equal(typeof pg.end,"function")
    })
    
 })
