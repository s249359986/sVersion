var express = require('express')
var app = express()
var bodyParser = require('body-parser')
// app.use(bodyParser.json())
app.use(express.static('example'))
app.use('/dist',express.static('dist'))
let port = 8010
console.log('端口',port)
module.exports = app.listen(port, function (err) {
  if (err) {
    console.log(err)
    return
  }

  //opn(uri)
})
