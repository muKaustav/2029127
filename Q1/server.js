require('dotenv').config()
const cors = require('cors')
const axios = require('axios')
const express = require('express')

const app = express()
app.use(cors())
app.use(express.json())

app.get('/trains', (req, res) => {
    try {
        // The prices, seatsAvailability of all tickets are subject to change based on market conditions such as demand, supply, departure time. Refreshing this data can be done on the frontend using useEffect (if using ReactJS).
        // For further optimization of the API, we can use a caching mechanism to store the data for a certain period of time, and then refresh it. This will reduce the number of API calls made to the server, reduce the load on the server, and decrease the response time of the API significantly.

        let bodyData = {
            "companyName": "Train Central",
            "clientID": "564f0251-347e-4ead-b0e4-11c641bdcb7d",
            "ownerName": "Kaustav",
            "ownerEmail": "2029127@kiit.ac.in",
            "rollNo": "2029127",
            "clientSecret": "tXlnbdWOKzddfZvt"
        }

        axios.post('http://20.244.56.144/train/auth', bodyData)
            .then((response) => {
                accessToken = response.data.access_token

                let headers = { 'Authorization': "Bearer " + accessToken }

                axios.get('http://20.244.56.144/train/trains', { headers })
                    .then((response) => {
                        let trains = response.data

                        const currentTime = new Date()
                        const timeBuffer = new Date(currentTime.getTime() + 30 * 60000)

                        trains = trains.filter(train => {
                            const departureTime = new Date()
                            departureTime.setHours(train.departureTime.Hours)
                            departureTime.setMinutes(train.departureTime.Minutes + train.delayedBy)

                            return departureTime >= currentTime && departureTime >= timeBuffer
                        })

                        let price_asc = trains.slice().sort((a, b) => {
                            return a.price.sleeper - b.price.sleeper
                        })

                        let ticket_desc = trains.slice().sort((a, b) => {
                            return b.seatsAvailable.sleeper + b.seatsAvailable.AC - (a.seatsAvailable.sleeper + a.seatsAvailable.AC)
                        })

                        let dep_desc = trains.slice().sort((a, b) => {
                            const aDepartureTimeInMinutes = a.departureTime.Hours * 60 + a.departureTime.Minutes + a.delayedBy
                            const bDepartureTimeInMinutes = b.departureTime.Hours * 60 + b.departureTime.Minutes + b.delayedBy
                            return bDepartureTimeInMinutes - aDepartureTimeInMinutes
                        })

                        // sending response for all 3 conditions mentioned, since 3 sorting conditions were asked, and the question did not specify which one to give priority to.
                        res.status(200).send({
                            "message": "Success",
                            trains: {
                                "price_asc": price_asc,
                                "ticket_desc": ticket_desc,
                                "dep_desc": dep_desc
                            }
                        })
                    }).catch((err) => {
                        res.status(500).send({
                            "message": 'Server Error',
                            "error": err.message
                        })
                    })
            }).catch((err) => {
                res.status(500).send({
                    "message": 'Server Error',
                    "error": err.message
                })
            })
    } catch (err) {
        res.status(500).send({
            "message": 'Server Error',
            "error": err.message
        })
    }
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})