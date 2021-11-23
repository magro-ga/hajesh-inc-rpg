require('dotenv').config()

const { Router } = require('express');
const express = require('express');
const routes = express.Router()
const jwt = require('jsonwebtoken')

// declaração de variaveis !NUNCA APAGUE
let contador = 5;
let itensCont = 3;
let roomsCont = 3;
let cardCont = 3;
const blackList = [];

// base de dados usuarios
let db = [
    { Id: '1', Nome: "Gustavo Sampaio", Email: "ghsampaio1105@gmail.com", Idade: "20", CPF: "50284865818", Role: 2 },
    { Id: '2', Nome: "Vitória Catani", Email: "vicatani@gmail.com", Idade: "20", CPF: "01234567890", Role: 1 },
    { Id: '3', Nome: "Anderson Sampaio", Email: "and.sampa@globo.com", Idade: "48", CPF: "13563049823", Role: 1 },
    { Id: '4', Nome: "Misael Alves", Email: "misael@globo.com", Idade: "2", CPF: "13563049823", Role: 1 },
    { Id: '5', Nome: "Giovanni Ota", Email: "gigiota@globo.com", Idade: "20", CPF: "13563049823", Role: 2 },
]

// base de dados do cargos
let dbRoles = [
    { Id: '1', Role: "Jogador" },
    { Id: '2', Role: "Admin" }
]

// base de dados dos itens
let dbItens = [
    { Id: '1', Nome: "Espada do Rei", Tipo: "Ataque", Efeito: "+15 Ataque", Decrição: "Sangramento" },
    { Id: '2', Nome: "Courança de Defunto", Tipo: "Defesa" , Efeito: "+20 Defesa", Decrição: "Eficaz contra dano físico" },
    { Id: '3', Nome: "Tormenta de Lúden", Tipo: "Mágico" , Efeito: "+30 Poder Mágico", Decrição: "Penetração" }
]

// base de dados das salas
let dbRooms = [
    {Id: '1', Nome: "Ilha da macacada", OwnerId: '1', Password: "mamaco123", Amount: '5'},
    {Id: '2', Nome: "Ilha dos piratas", OwnerId: '5', Password: "pirata123", Amount: '7'},
    {Id: '3', Nome: "Ilha dos zumbis", OwnerId: '3', Password: "zumbi123", Amount: '4'}
]

// base de dados dos cards
let dbCards = [
    {Id: '1', IdUser: '1', IdRoom: '1', Name: "Zayon",Tribe: "Ladino", Life: "1000", Atack: "290", Defense: "150", Description: "Maluco doido"},
    {Id: '2', IdUser: '5', IdRoom: '1', Name: "Kratos", Tribe: "Bardo", Life: "850", Atack: "10", Defense: "500", Description: "Cantarola por ai"},
    {Id: '3', IdUser: '3', IdRoom: '1', Name: "Krampus" ,Tribe: "Arqueiro", Life: "300", Atack: "500", Defense: "50", Description: "Sniper americano"}
]

// logar usuário
routes.post('/login', (req, res) => {
    // Authenticate User

    const username = req.body.username
    const user = { name: username}

    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: 6000})
    res.json({ accessToken: accessToken})
})

routes.get('/logout', (req, res) => {
    blackList.push(req.headers['authorization'])
    res.send("Bye!").end();
})

// listar usuários
routes.get('/users/', authenticateToken, (req, res) => {
    var user = verifyUser(req);

    if(user.Status && user.User.Role == 2){
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
    }
)

// atualizar
routes.put('/users/:id', authenticateToken, (req, res) => {
    var user = verifyUser(req);

    if(user.Status){
        var userBody = req.body

        db.forEach((users) => {
            if(users.Id === req.params.id){
                users.Nome = userBody.Nome;
                users.Email = userBody.Email;
                users.Idade = userBody.Idade;
                users.CPF = userBody.CPF;
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

// listar salas
routes.get('/rooms/', authenticateToken, (req, res) => {
    var user = verifyUser(req);
    if(user.Status){
        res.status(200).json(dbRooms);
    }else{ 
        res.status(403).json({ Message: "The user have no permission"});
    }  
})

// listar sala pelo id
routes.get('/rooms/:id', authenticateToken,(req, res) => {
    var user = verifyUser(req);

    if(user.Status){
        dbRooms.forEach((rooms) => {
            if(rooms.Id === req.params.id){
                res.status(200).json(rooms)
            }
        })
        res.status(404).send({ Message: "The room doesn´t exist!"})
    }else{
        res.status(403).send({ Message: "The user have no permission"})
    }
})

// criar sala
routes.post('/rooms', authenticateToken,(req, res) => {
    var user = verifyUser(req);
    if(user.Status){
        const body = req.body;

        if(!body) return res.status(400)

        body.Id = roomsCont +=1;

        dbRooms.push(body)
        return res.status(200).send(dbRooms)
    }else{
        res.status(403).json({ Message: "The user have no permission"});            
    }    
})

// atualizar sala
routes.put('/rooms/:id', authenticateToken, (req, res) => {
    var user = verifyUser(req);

    if(user.Status){
        var roomBody = req.body
        if(roomBody != null){
            dbRooms.forEach((rooms) => {
                if(rooms.Id === req.params.id && user.User.Id === rooms.OwnerId){
    
                    if(userBody.Nome == ""){
                        rooms.Password = userBody.Password;
                    }else if (userBody.Password == ""){
                        rooms.Nome = userBody.Nome;
                    }else{
                        rooms.Nome = userBody.Nome;
                        rooms.Password = userBody.Password;
                    }
    
                    res.status(200).json({Message: "Updated with success!"});
                }
            })
        }else{
            res.status(404).json({Message: "Need a body to use this endpoint"}, {Example: {Nome: "Example", Password: "Example123"}})
        }
    }else{
        res.status(403).json({ Message: "The user have no permission"});
    }
})

// deletar sala
routes.delete('/rooms/:id', authenticateToken, (req, res) => {
    var user = verifyUser(req);

    if(user.Status){
        const id = req.params.id;
        const selectedRoom = dbRooms.filter(room => room.OwnerId === user.User.id)

        if(user.User.Role == 2 || selectedRoom != null){
            let newDBRooms = dbRooms.filter(room => {
                if (room.Id != id)
                    return room
            })
                dbRooms = newDBRooms
                return res.status(200).send(newDBRooms);
        }else{
            res.send(401).send({Message: "The user doesn't have permission to delete this room!"})
        }
    }else{
        res.status(403).send({ Message: "The user have no permission"})
    }
})

// listar card
routes.get('/cards', authenticateToken, (req, res) => {
    var user = verifyUser(req);

    if(user.Status){
        if(user.User.Role == 1){
            let selectedCards = dbCards.filter(x => x.IdUser == user.User.id)
            res.status(200).json(selectedCards);
        }else if(user.User.Role == 2){
            res.status(200).json(dbCards);
        }else{
            res.status(404).json({Message: "This player doesn't have cards!"})
        }  
    }else{ 
        res.status(403).json({ Message: "The user have no permission"});
    }  
})

// verifica se tem card na sala selecionada
routes.post('/authenticateCard/', authenticateToken,(req, res) => {
    var user = verifyUser(req);

    if(user.Status){
        const cardBody = req.body;
        
        let selectedCard = dbCards.filter(x => x.IdUser === user.User.Id && x.IdRoom === cardBody.IdRoom)
        if(selectedCard != null){
            res.status(200).json(selectedCard)
        }else{
            res.status(404).json({Message: "The user doesn't have a card in this room!"})
        }
    }else{
        res.status(403).json({ Message: "The user have no permission"});
    }
})

// criar card
routes.post('/cards', authenticateToken,(req, res) => {
    var user = verifyUser(req);
    if(user.Status){
        const body = req.body;

        if(!body) return res.status(400)

        body.Id = cardCont +=1;

        dbCards.push(body)
        return res.status(200).send(dbCards)
    }else{
        res.status(403).json({ Message: "The user have no permission"});
    }
})

// atualizar card
routes.put('/cards/:id', authenticateToken, (req, res) => {
    var user = verifyUser(req);

    if(user.Status){
        var cardBody = req.body

        if(cardBody != null){
            let selectedRoom = dbRooms.filter(x => x.IdRoom == cardBody.IdRoom)
            let ownerUser = db.filter(x => x.Id == selectedRoom.OwnerId)

            dbCards.forEach((card) => {
                if(card.Id === req.params.id && card.IdUser === user.User.IdUser){
                    card.Name = cardBody;Name
                    card.Description = cardBody.Description

                    res.status(200).json({Message: "Updated with success!"});
                }else if(user.User.Id === ownerUser.id){
                    card.Atack = cardBody.Atack
                    card.Defense = cardBody.Defense
                    card.Life = cardBody.Life
                    card.Tribe = cardBody.Tribe
                    card.Description = cardBody.Description
                    card.Name = cardBody.Name

                    res.status(200).json({Message: "Updated with success!"})
                }
            })
        }else{
            res.status(404).json({Message: "Need a valid body to use this endpoint"})
        }
    }else{
        res.status(403).json({ Message: "The user have no permission"});
    }
})

// deletar card
routes.delete('/cards/:id', authenticateToken, (req, res) => {
    var user = verifyUser(req);

    if(user.Status){
        const id = req.params.id;
        let selectedCard = dbCards.filter(card => card.IdUser === user.User.id)
        let selectedRoom = dbRooms.filter(room => room.Id == selectedCard.IdRoom)
        let ownerUser = db.filter(x => x.Id == selectedRoom.OwnerId)

        if(user.User.id == selectedCard.IdUser || user.User.Id == ownerUser.Id){
            let newDBCard = dbCards.filter(card => {
                if (card.Id != id)
                    return card
            })
                dbCards = newDBCard
                return res.status(200).send(dbCards);
        }else{
            res.send(401).send({Message: "The user doesn't have permission to delete this card!"})
        }
    }else{
        res.status(403).send({ Message: "The user have no permission"})
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
    var user = db.filter(db => db.Nome === req.user.name)
    const authHeader = req.headers['authorization']
    const index = blackList.findIndex(item => item === authHeader)

    if(index !== -1) return { Status: false, User: {Role: null}}

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