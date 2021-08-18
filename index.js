const express = require('express')
const cors = require('cors')
const {google} = require('googleapis')
require('dotenv').config()
const fs = require('fs')
const path = require('path')

// Environment variables
const {
  SS_ID,
  GOOGLE_CREDS
} = process.env

// Write creds to disk
const credsPath = path.join(`${__dirname}/creds.json`)
fs.writeFileSync(credsPath , GOOGLE_CREDS)

const app = express()
app.use(cors())

/* Fetch google sheets cells, sort, and return */
app.get('/', async (req, res) => {
  const auth = new google.auth.GoogleAuth({
    keyFile: credsPath,
    scopes: 'https://www.googleapis.com/auth/spreadsheets.readonly'
  })

  // Client instance
  const client = await auth.getClient()

  // Sheets instance
  const googleSheets = google.sheets({version: 'v4', auth: client})

  // Get all values from sheet
  const fetchedData = await googleSheets.spreadsheets.values.get({
    spreadsheetId: SS_ID,
    range: 'Sheet1'
  })

  // Sort data
  let sortedData = {}
  let tempData = [...fetchedData.data.values]
  tempData.shift()

  // Create keys
  fetchedData.data.values.map((cell, i) => {
    if(i < 1) {
      cell.map((key) => {
        sortedData[key.split(' ').join('').toLowerCase()] = []
      })
    }
  })

  // Add values to array for corresponding key
  tempData.map((cell, i) => {
    cell.map((value, j) => {
      if(value !== '') sortedData[Object.keys(sortedData)[j]].push(value)
    })
  })

  res.send(sortedData)
})

app.listen(1337, (req, res) => console.log('Running on 1337'))
