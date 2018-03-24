const express = require('express')
const http = require('http')
const url = require('url')
const WebSocket = require('ws')
const redis = require('redis')

const app = express()

// Include Redis client.
const redisClient = redis.createClient()
redisClient.on('connect', () => {
  console.log('redis connected')
})

app.use(function (req, res) {
  res.send({ msg: 'hello' })
})

const server = http.createServer(app)
const wss = new WebSocket.Server({ server })

// On web socket connection
wss.on('connection', function connection (ws, req) {
  const location = url.parse(req.url, true)
  // You might use location.query.access_token to authenticate or share sessions
  // or req.headers.cookie (see http://stackoverflow.com/a/16395220/151312)

  // When web socket receives message, create object and store in Redis.
  ws.on('message', function incoming (message) {
    console.log('received:', message)
    let messageObj = JSON.parse(message)
    let date = new Date()
    let day = date.getDate()
    let month = date.getMonth() + 1
    let year = date.getFullYear()
    let hours = date.getHours()
    let minutes = date.getMinutes()
    let seconds = date.getSeconds()
    let dateString = year + '-' + month + '-' + day + ' ' + hours + '_' + minutes + '_' + seconds
    let attention = messageObj.attention
    let meditation = messageObj.meditation
    let delta = messageObj.delta
    let theta = messageObj.theta
    let alpha = messageObj.alpha
    let beta = messageObj.beta
    let gamma = messageObj.gamma
  
    console.log('attention: ' + attention)
    console.log('meditation: ' + meditation)
    console.log('delta: ' + delta)
    console.log('theta: ' + theta)
    console.log('alpha: ' + alpha)
    console.log('beta: ' + beta)
    console.log('gamma:' + gamma)
  
    // Store in Redis
    redisClient.hmset(
      [
        dateString,
        'attention',
        attention,
        'meditation',
        meditation,
        'delta',
        delta,
        'theta',
        theta,
        'alpha',
        alpha,
        'beta',
        beta,
        'gamma',
        gamma
      ],
      (error, result) => {
        if (error) console.log(error)
      }
    )
  })

  //ws.send('something')
})

server.listen(8080, function listening () {
  console.log('Listening on %d', server.address().port)
})
