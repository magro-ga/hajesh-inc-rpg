require('dotenv').config()

const { Router } = require('express');
const express = require('express');
const routes = express.Router()
const jwt = require('jsonwebtoken')

let contador = 3;
let db = [
    { Id: '1', Nome: "Gustavo Sampaio", Email: "ghsampaio1105@gmail.com", Idade: "20", CPF: "50284865818"},
    { Id: '2', Nome: "Vitória Catani", Email: "vicatani@gmail.com", Idade: "20", CPF: "01234567890"},
    { Id: '3', Nome: "Anderson Sampaio", Email: "and.sampa@globo.com", Idade: "48", CPF: "13563049823"},
    { Id: '4', Nome: "Misael Alves", Email: "misael@globo.com", Idade: "2", CPF: "13563049823"},
    { Id: '5', Nome: "Giovanni Ota", Email: "gigiota@globo.com", Idade: "20", CPF: "13563049823"}
]

routes.post('/login', (req, res) => {
    // Authenticate User

    const username = req.body.username
    const user = { name: username}

    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET)
    res.json({ accessToken: accessToken})
})

routes.get('/users', authenticateToken, (req, res) => {
    var user = verifyUser(req);
    console.log(user)
    if(user.Status){
        res.status(200).json(db);
    }else{
        res.status(403).json({ Message: "The user have no permission"});
    }
})

routes.get('/users/:id', authenticateToken,(req, res) => {
    var user = verifyUser(req);

    if(user.Status){
        db.forEach((users) => {
            if(users.Id === req.params.id){
                res.status(200).json(users)
            }
        })
        res.status(404).send({ Message: "The user doesn´t exist!"})
    }else{
        res.status(403).send({ Message: "The user have no permission"})
    }
})

routes.post('/users', authenticateToken,(req, res) => {
    var user = verifyUser(req);

    if(user.Status){
        const body = req.body;

        if(!body)
            return res.status(400)

        body.Id = contador +=1;

        db.push(body)
        return res.status(200).send(db)
    }else{
        res.status(403).send({ Message: "The user have no permission"})
    }

})

routes.put('/users/', authenticateToken, (req, res) => {
    var user = verifyUser(req);

    if(user.Status){
        var userBody = req.body

        db.forEach((users) => {
            if(users.Id === user.Id){
                users.Nome = userBody.Nome;
                users.Email = userBody.Email;
                users.Idade = userBody.Idade;
                users.CPF = userBody.CPF;
                console.log(users);
                res.status(200).json({Message: "Success, please make the request login again to update with the new name!"});
            }
        })
    }else{
        res.status(403).json({ Message: "The user have no permission"});
    }
})

routes.delete('/users/:id', authenticateToken, (req, res) => {
    var user = verifyUser(req);

    if(user.Status){
        const id = req.params.id;

        let newDB = db.filter(item => {
        if (item.Id != id)
            return item
    })
        db = newDB
        return res.status(200).send(newDB);
    }else{
        res.status(403).send({ Message: "The user have no permission"})
    }
})

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if(token == null) return res.status(401)

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if(err) return res.status(403)
        req.user = user
        next()
    })
}

function verifyUser(req){
    console.log(req.user.name);
    var user = db.filter(db => db.Nome === req.user.name)
    console.log(user)
    if(user.length > 0){
        return {
            Status: true,
            Id: user[0].Id
        }
    }else{
        return {
            status: false,
            id: null
        }
    }
}

module.exports = routes