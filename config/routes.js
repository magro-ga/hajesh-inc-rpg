require('dotenv').config()

const { Router } = require('express');
const express = require('express');
const routes = express.Router()
const jwt = require('jsonwebtoken')

let contador = 5;
let db = [
    { Id: '1', Nome: "Gustavo Sampaio", Email: "ghsampaio1105@gmail.com", Idade: "20", CPF: "50284865818", Role: 2 },
    { Id: '2', Nome: "Vitória Catani", Email: "vicatani@gmail.com", Idade: "20", CPF: "01234567890", Role: 1 },
    { Id: '3', Nome: "Anderson Sampaio", Email: "and.sampa@globo.com", Idade: "48", CPF: "13563049823", Role: 1 },
    { Id: '4', Nome: "Misael Alves", Email: "misael@globo.com", Idade: "2", CPF: "13563049823", Role: 1 },
    { Id: '5', Nome: "Giovanni Ota", Email: "gigiota@globo.com", Idade: "20", CPF: "13563049823", Role: 2 },
]

let dbRoles = [
    { Id: '1', Role: "Jogador" },
    { Id: '2', Role: "Admin" }
]

let itensCont = 3;
let dbItens = [
    { Id: '1', Nome: "Espada do Rei", Tipo: "Ataque", Efeito: "+15 Ataque", Decrição: "Sangramento" },
    { Id: '2', Nome: "Courança de Defunto", Tipo: "Defesa" , Efeito: "+20 Defesa", Decrição: "Eficaz contra dano físico" },
    { Id: '3', Nome: "Tormenta de Lúden", Tipo: "Mágico" , Efeito: "+30 Poder Mágico", Decrição: "Penetração" }
]

// logar usuário
routes.post('/login', (req, res) => {
    // Authenticate User

    const username = req.body.username
    const user = { name: username}

    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET)
    res.json({ accessToken: accessToken})
})

// listar usuários
routes.get('/users/', authenticateToken, (req, res) => {
    var user = verifyUser(req);
    console.log(user)
    if(user.User.Role == 2){
        res.status(200).json(db);
    }else{ 
        res.status(403).json({ Message: "The user have no permission"});
    }
})

// buscar um usuário
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

// criar usuário
routes.post('/users', authenticateToken,(req, res) => {
    var user = verifyUser(req);

    if(user.Status){
        const body = req.body;

        if(!body)
            return res.status(400)

        body.Id = contador +=1;

        if(user.User.Role == 2){
            body.Role = 2
        }
        else {
            body.Role = 1
        }
        
        db.push(body)
        return res.status(200).send(db)
    }else{
        res.status(403).send({ Message: "The user have no permission"})
    }
})

// atualizar
routes.put('/users/:id', authenticateToken, (req, res) => {
    var user = verifyUser(req);

    if(user.Status){
        var userBody = req.body

        db.forEach((users) => {
            if(users.Id === user.User.Id){
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

// deletar usuário
routes.delete('/users/:id', authenticateToken, (req, res) => {
    var user = verifyUser(req);

    if(user.Status && user.User.Role == 2){
        const id = req.params.id;

        let newDB = db.filter(user => {
        if (user.Id != id)
            return user
    })
        db = newDB
        return res.status(200).send(newDB);
    }else{
        res.status(403).send({ Message: "The user have no permission"})
    }
})

// listar itens
routes.get('/itens/', authenticateToken, (req, res) => {
    var user = verifyUser(req);
    console.log(user)
    if(user.Status){
        res.status(200).json(dbItens);
    }else{ 
        res.status(403).json({ Message: "The user have no permission"});
    }
})

// buscar item
routes.get('/itens/:id', authenticateToken, (req, res) => {
    var user = verifyUser(req);

    if(user.Status){
        dbItens.forEach((item) => {
            if(item.Id === req.params.id){
                res.status(200).json(item)
            }
        })
        res.status(404).send({ Message: "The item doesn´t exist!"})
    }else{
        res.status(403).send({ Message: "The user have no permission to see this item"})
    }
})

// criar item
routes.post('/itens', authenticateToken, (req, res) => {
    var user = verifyUser(req);

    if(user.Status){
        const body = req.body;

        if(!body)
            return res.status(400)

        if(user.User.Role == 2)
            body.Id = itensCont +=1;
            dbItens.push(body)
            return res.status(200).send(dbItens)

    }else{
        res.status(403).send({ Message: "The user have no permission"})
    }
})

// atualizar item
routes.put('/itens/:id', authenticateToken, (req, res) => {
    var user = verifyUser(req);

    if(user.Status && user.User.Role == 2){
        var itensBody = req.body

        dbItens.forEach((item) => {
            if(item.Id === req.params.id){
                item.Nome = itensBody.Nome;
                item.Tipo = itensBody.Tipo;
                item.Efeito = itensBody.Efeito;
                item.Decrição = itensBody.Decrição;
                console.log(item);
                res.status(200).json({Message: "Success, the item is updated!"});
            }
        })
    }else{
        res.status(403).json({ Message: "The user have no permission to update a item!!"});
    }
})

// deletar item
routes.delete('/itens/:id', authenticateToken, (req, res) => {
    var user = verifyUser(req);

    if(user.Status && user.User.Role == 2){
        const id = req.params.id;

        let newDB = dbItens.filter(item => {
        if (item.Id != id)
            return item
    })
        dbItens = newDB
        return res.status(200).send(newDB);
    }else{
        res.status(403).send({ Message: "The user have no permission to delete a item"})
    }
})

// autenticação token
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

// autenticação usuário
function verifyUser(req){
    console.log(req.user.name);
    var user = db.filter(db => db.Nome === req.user.name)
    console.log(user)
    if(user.length > 0){
        return {
            Status: true,
            User: user[0]
        }
    }else{
        return {
            Status: false,
            User: null
        }
    }
}

module.exports = routes