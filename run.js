const http = require('https')
const fs = require('fs')

// Function to get the current date in the 'YYYY-MM-DD' format
function getCurrentDate() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Function to get the current hour in 24-hour format
function getCurrentHour() {
  const now = new Date()
  return String(now.getHours()).padStart(2, '0')
}

// Function to create a folder by date
function createFolderByDate(date) {
  const folderName = `./${date}`
  if (!fs.existsSync(folderName)) {
    fs.mkdirSync(folderName)
  }
  return folderName
}

function fetchAndSaveCurrencyData() {
  const currentDate = getCurrentDate()
  const currentHour = getCurrentHour()
  const folderName = createFolderByDate(currentDate)
  const fileName = `${currentHour}.json`
  const filePath = `${folderName}/${fileName}`

  const request = http.get(process.env.currlink, (response) => {
    if (response.statusCode !== 200) {
      console.error(`HTTP error! Status: ${response.statusCode}`)
      return
    }

    let data = ''

    response.on('data', (chunk) => {
      data += chunk
    })

    response.on('end', () => {
      try {
        const jsonData = JSON.parse(data)
        const json = JSON.stringify({
          ts: jsonData.timestamp,
          base: jsonData.base,
          quotes: jsonData.rates,
        })

        // Save the JSON data to the file with the hour in the filename
        fs.writeFileSync(filePath, json)
        fs.writeFileSync('latest/data.json', json)

        console.log(`Currency data saved to ${filePath}`)
      } catch (error) {
        console.error('Error parsing JSON:', error.message)
      }
    })
  })

  request.on('error', (error) => {
    console.error('Error making HTTP request:', error.message)
  })
}

// Call the function to fetch and save data
fetchAndSaveCurrencyData()
