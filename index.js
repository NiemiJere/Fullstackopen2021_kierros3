const { response } = require('express')
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
app.use(express.json())
let str = ""
morgan.token("rtrn", () => JSON.stringify(str))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :rtrn'))
app.use(cors())

let numbers = [
    {
    "name": "Arto Hellas",
    "number": "040-123456",
    "id": 1
    },
    {
    "name": "Ada Lovelace",
    "number": "39-44-5323523",
    "id": 2
    },
    {
    "name": "Dan Abramov",
    "number": "12-43-234345",
    "id": 3
    },
    {
    "name": "Mary Poppendick",
    "number": "39-23-6423122",
    "id": 4
    }
]

const genId = () => {
    return Math.floor(Math.random() * 10000)
}

app.get('/', (req, res) => {
    str = req.body
    res.send('<h1>Hello World!</h1>')
})

app.get('/info', (req, res) => {
    str = req.body
    res.send(`<p>Phonebook has info for ${numbers.length} people</h1><br/><p>${new Date()}</p>`)
})

app.get('/api/persons', (req, res) => {
    str = req.body
    res.json(numbers)
})

app.get('/api/persons/:id', (req, res) => {
    str = req.body
    const id = Number(req.params.id)
    const person = numbers.find(person => person.id === id)
    if (person) {
        res.json(person)
    }
    else {
        res.status(404).end()
    }
})

app.delete('/api/persons/:id', (request, response) => {
    str = request.body
    const id = Number(request.params.id)
    numbers = numbers.filter(person => person.id !== id)
    response.status(204).end()
})


app.post('/api/persons', (req, res) => {
    const person = req.body
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
    const name = numbers.find(pers => pers.name === person.name)
    if (name) {
        return res.status(400).json({
            error: "name already in phonebook"
        })
    }
    person.id = genId()
    numbers = numbers.concat(person)
    res.json(person)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
