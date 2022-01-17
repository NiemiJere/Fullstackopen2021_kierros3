require('dotenv').config()

const { response } = require('express')
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
app.use(express.json())
app.use(express.static('build'))
let str = ""
morgan.token("rtrn", () => JSON.stringify(str))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :rtrn'))
app.use(cors())
const Person = require('./models/person')

const genId = () => {
    return Math.floor(Math.random() * 10000)
}

const errorHandler = (error, request, response, next) => {
    console.error(error.name)

    if (error.name === 'CastError') {
      return response.status(400).send({ error: 'malformatted id' })
    }
    else if (error.name === 'ValidationError') {
        console.log(error.message)
        return response.status(400).json({ error: error.message})
    }
    next(error)
  }

app.get('/', (req, res) => {
    str = req.body
    res.send('<h1>Hello World!</h1>')
})

app.get('/info', (req, res, next) => {
    str = req.body
    let amount = 0
    Person.find({}).then(result => {
        amount = result.length
        res.send(`<p>Phonebook has info for ${amount} people</h1><br/><p>${new Date()}</p>`)
    })
    .catch(error => next(error))
})

app.get('/api/persons', (req, res, next) => {
    str = req.body
    Person.find({}).then(result => {
        res.json(result)
    })
    .catch(error => next(error))
})

app.get('/api/persons/:id', (req, res, next) => {
    str = req.body
    Person.findById(req.params.id).then(person => {
        if (person) {
            res.json(person)
        }
        else {
            res.status(404).end()
        }
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
    str = request.body
    Person.findByIdAndRemove(request.params.id).then(result => {
        response.status(204).end()
    })
    .catch(error => next(error))
})


app.post('/api/persons', (req, res, next) => {
    const person = new Person({
        name: req.body.name,
        number: req.body.number,
    })
    str = person
    if (!person.name) {
        return res.status(400).json({
            error: "name missing"
        })
    }
    if (!person.number) {
        return res.status(400).json({
            error: "number missing"
        })
    }
    
    let name = ""

    Person.find({name: req.body.name}).then(result => {
        if (result[0]) {
            name = result[0].name
        }
        if (name !== "") {
            return res.status(400).json({
                error: "name already in phonebook"
            })
        }
    })
    .catch(error => next(error))

    person.id = genId()

    person.save().then(saved => {
        res.json(saved.toJSON())
        res.status(201)
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
    str = request.body
    const updatedPerson = {
        name: request.body.name,
        number: request.body.number,
    }
    Person.findByIdAndUpdate(request.params.id, updatedPerson).then(result => {
        response.json()
        response.status(200).end()
    })
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
  }

app.use(unknownEndpoint)

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
