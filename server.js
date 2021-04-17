'use strict';

// import all packages we need
require('dotenv').config();
const PORT = process.env.PORT;
const express = require('express');
const pg = require('pg');
const superagent = require('superagent');
const methodoverride = require('method-override');
// const { query } = require('express');
const app = express();
const client = new pg.Client(process.env.DATABASE_URL);
app.set('view engine', 'ejs');
app.use(express.static('./public/'));
app.use(express.urlencoded({ extended: true }))
app.use(methodoverride('_method'));
//---------------------------------------------------------

app.get('/' ,indexhandle);
app.post('/' ,indextwohandele);
app.get('/test' ,testhandle);
app.post('/test' ,testtwohandle);
app.get('/data' ,datahandle);
app.get('/details/:id' ,detailshandle);
app.delete('/details/:id' ,detailsdelete);
app.put('/details/:id' ,detailsupdate);

//---------------------------------------------------------

function indexhandle(req,res){
    res.render('pages/index' ,{cond:0});
}

function indextwohandele(req,res){
    let digimon = req.body.search;
    let url = `https://digimon-api.vercel.app/api/digimon/name/${digimon}`;
    superagent.get(url).then(x =>{
        res.render('pages/index' ,{data :x.body[0] ,cond:1})
    })
}

function testhandle(req,res){
    let url ='https://digimon-api.vercel.app/api/digimon';
    superagent.get(url).then(x =>{
        res.render('pages/test' ,{toto:x.body})
    })
}

function testtwohandle(req,res){
    let sql = 'INSERT INTO myCollection (name, image, level) VALUES($1, $2, $3) RETURNING *';
    let values = [req.body.name ,req.body.img ,req.body.level];
    client.query(sql,values).then(result =>{
        // console.log(result.rows);
        res.render('pages/index' ,{cond:0})
    })
}

function datahandle(req,res){
    let sql = 'SELECT * FROM myCollection ;';
    client.query(sql).then(result =>{
        res.render('pages/mydata' ,{colection:result.rows})
    })
}
function detailshandle(req,res){
    let sql = 'SELECT * FROM myCollection WHERE id=$1'
    client.query(sql,[req.params.id]).then(data =>{
        console.log(data.rows[0]);
        res.render('pages/details' ,{results:data.rows[0]})
    })

}

function detailsdelete(req,res){
    let id = req.params.id;
    let sql = 'DELETE FROM myCollection WHERE id=$1;';
    client.query(sql,[id]).then(data =>{
        res.redirect('/')
    })
}

function detailsupdate(req,res){
    let id = req.params.id;
    let sql = 'UPDATE myCollection SET name=$1, image=$2, level=$3 WHERE id=$4';
    let values = [req.body.name ,req.body.img ,req.body.level ,id];
    client.query(sql,values).then(data =>{
        res.redirect(`/details/${id}`)
    })
}

//---------------------------------------------------------

// app.use('*', notFoundHandler); // 404 not found url

// app.use(errorHandler);

// function notFoundHandler(request, response) {
//     response.status(404).sendFile('./pages/error', { root: './' })
// }

// function errorHandler(err, request, response, next) {
//     response.status(500).render('pages/error', {err: err});
    
// }

client.connect().then(() => {
    app.listen(PORT, () => console.log(`I'm working at port ${PORT}`))
});