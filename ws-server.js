const express = require('express')
const http = require('http')
const url = require('url')
const WebSocket = require('ws')

const app = express()

app.use(function (req, res) {
  res.send({ msg: 'hello' })
})

const server = http.createServer(app)
const wss = new WebSocket.Server({ server })

let lastJSON = {
  date: ''
}
let connections = []

// On web socket connection
wss.on('connection', function connection (ws, req) {
  // Get the client id from the url params
  let clientID = parseInt(url.parse(req.url, true).query.clientID)
  connections[clientID] = ws

  console.log(clientID)

  // When web socket connects, build message.
  ws.on('message', function incoming (message) {
    let messageObj = JSON.parse(message)
    let date = new Date()
    let day = date.getDate()
    let month = date.getMonth() + 1
    let year = date.getFullYear()
    let hours = date.getHours()
    let minutes = date.getMinutes()
    let seconds = date.getSeconds()
    let newMessageObj = {
      date: year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds,
      attention: messageObj.attention,
      meditation: messageObj.meditation,
      delta: messageObj.delta,
      theta: messageObj.theta,
      alpha: messageObj.alpha,
      beta: messageObj.beta,
      gamma: messageObj.gamma
    }
    // Only display output by millisecond.
    if (newMessageObj.date !== lastJSON.date) {
      lastJSON = newMessageObj
      // Check to see if client is first connection defined in params.  If so, send message.
      if (connections[1]) {
        connections[1].send(JSON.stringify(newMessageObj))
        console.log('newMessageObj: ' + JSON.stringify(newMessageObj))
      }
    }
  })
})

server.listen(8080, function listening () {
  console.log('Listening on %d', server.address().port)
})
