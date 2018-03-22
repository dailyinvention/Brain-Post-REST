const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const redis = require('redis')
const MongoClient = require('mongodb').MongoClient
const assert = require('assert')

// replace all occurances in a string
const replaceAll = (string, target, replacement) => {
  return this.split(target).join(replacement)
}

// sort on key values
const sortByKey = (array, key) => {
  return array.sort((a, b) => {
    return new Date(b[key]) - new Date(a[key])
  })
}

// Configure app to use bodyParser()
// This will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.set('json spaces', 40)

const port = process.env.PORT || 8080 // set our port

// CONNECT TO REDIS

const redisClient = redis.createClient()
redisClient.on('connect', () => {
  console.log('redis connected')
})

// ROUTES FOR OUR API
// =============================================================================
const router = express.Router() // get an instance of the express Router

// middleware to use for all requests
router.use((req, res, next) => {
  // do logging
  console.log('Request received.')
  next() // make sure we go to the next routes and don't stop here
})

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', (req, res) => {
  res.json({ message: 'hooray! welcome to our api!' })
})

// more routes for our API will happen here

// Get brain stats

router.route('/neurobrainget').get((req, res) => {
  let objects = []
  redisClient.keys('*', (err, keys) => {
    if (err) {
      return err
    } else {
      // res.json(keys)
      let _i, _len, seen
      seen = 0
      for ((_i = 0), (_len = keys.length); _i < _len; _i++) {
        (i => {
          redisClient.hgetall(keys[i], (err, obj) => {
            if (err) {
              return err
            } else {
              objects.push({ key: replaceAll(keys[i], '_', ':'), obj })
              seen++
              if (seen === _len) {
                let sorted = sortByKey(objects, 'key')

                // Offload Redis data to Mongo

                // Create insert document
                const insertDocuments = (db, callback) => {
                  // Get the documents collection
                  let collection = db.collection('brainpoststats')
                  // Insert some documents
                  collection.insertMany(sorted.reverse(), (err, result) => {
                    assert.equal(err, null)
                    console.log('Inserted objects')
                    callback(result)
                  })
                }

                // Connect to Mongo and insert data
                const url = 'mongodb://localhost:27017/brainpost'
                MongoClient.connect(url, (err, db) => {
                  assert.equal(null, err)
                  console.log('Connected correctly to server')
                  insertDocuments(db, () => {
                    db.close()
                  })
                })

                // Clear data from Redis
                redisClient.flushall(didSucceed => {
                  console.log(didSucceed) // true
                })

                return res.end(JSON.stringify(sorted))
              }
            }
          })
        })(_i)
      }
    }
  })
})

// Post brain stats

router.route('/neurobrainpost').post((req, res) => {
  let date = new Date()
  let day = date.getDate()
  let month = date.getMonth() + 1
  let year = date.getFullYear()
  let hours = date.getHours()
  let minutes = date.getMinutes()
  let seconds = date.getSeconds()
  let dateString = year + '-' + month + '-' + day + ' ' + hours + '_' + minutes + '_' + seconds
  let attention = req.body.attention
  let meditation = req.body.meditation
  let delta = req.body.delta
  let theta = req.body.theta
  let alpha = req.body.alpha
  let beta = req.body.beta
  let gamma = req.body.gamma

  console.log('attention: ' + attention)
  console.log('meditation: ' + meditation)
  console.log('delta: ' + delta)
  console.log('theta: ' + theta)
  console.log('alpha: ' + alpha)
  console.log('beta: ' + beta)
  console.log('gamma:' + gamma)

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
      if (error) res.send(error)

      res.json({ message: 'Added instance.' })
    }
  )
})

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router)

// START THE SERVER
// =============================================================================
app.listen(port)
console.log('Magic happens on port ' + port)
