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


const fetchCells = async (res) => {
  const auth = new google.auth.GoogleAuth({
    keyFile: credsPath,
    scopes: 'https://www.googleapis.com/auth/spreadsheets.readonly'
  })

  // Client instance
  const client = await auth.getClient()

  // Sheets instance
  const googleSheets = google.sheets({version: 'v4', auth: client})

  // Get all values from sheet
  let fetchedData
  try {
    fetchedData = await googleSheets.spreadsheets.values.get({
      spreadsheetId: SS_ID,
      range: 'Sheet1'
    })
  } catch(error) {
    const status = error?.response?.data?.error?.code
    const message = error?.response?.data?.error?.message
    res.status(status)
    return res.send({message})
  }

  return fetchedData
}


const sortData = (data) => {
  let sortedData = {}
  let valuesArr = [...data]
  const keysArr = valuesArr.shift()

  // Create keys
  keysArr.forEach((key) => {
    sortedData[key.split(' ').join('').toLowerCase()] = []
  })

  // Add values to array for corresponding key
  valuesArr.forEach((cell, i) => {
    cell.forEach((value, j) => {
      if(value !== '') sortedData[Object.keys(sortedData)[j]].push(value)
    })
  })

  return sortedData
}


/* Fetch google sheets cells, sort, and return */
app.get('/', async (req, res) => {
  let sortedData
  const fetchedData = await fetchCells(res)

  // Sort data
  if(fetchedData?.data?.values.length) {
    sortedData = sortData(fetchedData.data.values)
  } else {
    res.status(500)
    return res.send({message: 'Error, no data found'})
  }

  return res.send(sortedData)
})

app.listen(process.env.PORT || 5000, (req, res) => console.log('Running on port 5000'))
