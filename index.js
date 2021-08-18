const express = require('express')
const {google} = require('googleapis')
const app = express()
const spreadsheetId = '1QfRY4wwkRK_yCh-mw3r6JumRNoADbe9rLVWU8yn8Bzo'

app.get('/', async (req, res) => {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'creds.json',
    scopes: 'https://www.googleapis.com/auth/spreadsheets.readonly'
  })

  // Client instance
  const client = await auth.getClient()

  // Sheets instance
  const googleSheets = google.sheets({version: 'v4', auth: client})

  // Get all values from sheet
  const fetchedData = await googleSheets.spreadsheets.values.get({
    spreadsheetId,
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