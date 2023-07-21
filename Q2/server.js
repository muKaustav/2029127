const cors = require('cors')
const axios = require('axios')
const express = require('express')

const app = express()
app.use(cors())
app.use(express.json())

const set = new Set()
set.add('http://20.244.56.144/numbers/primes')
set.add('http://20.244.56.144/numbers/fibo')
set.add('http://20.244.56.144/numbers/odd')
set.add('http://20.244.56.144/numbers/rand')

const REQUEST_TIMEOUT = 500

app.get('/numbers', async (req, res) => {
    const requestTimeout = setTimeout(async () => {
        const urls = Array.isArray(req.query.url) ? req.query.url : [req.query.url]

        let numbers = []
        let promises = []

        try {
            urls.forEach(url => {
                if (set.has(url)) {
                    promises.push(axios.get(url)
                        .then(response => {
                            return response.data.numbers
                        }).catch(error => {
                            console.log(error)
                            return null
                        }))
                }
            })

            await Promise.all(promises).then(values => {
                values.forEach(value => {
                    if (value) {
                        numbers = numbers.concat(value)
                    }
                })
            })

            let answer = new Set()

            numbers.forEach(number => {
                answer.add(number)
            })

            res.send({ "numbers": Array.from(answer).sort((a, b) => a - b) })
        } catch (error) {
            console.log(error)
        }
    }, REQUEST_TIMEOUT)
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
})
