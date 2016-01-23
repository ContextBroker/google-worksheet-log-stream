var Writable = require('stream').Writable

var GoogleSpreadsheet = require('google-spreadsheet')
var inherits          = require('inherits')


const REGEXP_SANITIZE = /\W+/g


/**
 * Sanitize the column name to be a valid one
 *
 * The column names are the header values of the worksheet lowercased and with
 * all non-alpha-numeric characters removed. For example, if the cell `A1`
 * contains the value "Time 2 Eat!" the column name would be "time2eat".
 *
 * @param {string} name
 *
 * @return {string}
 */
function sanitizeColumnName(name)
{
  return name.toLowerCase().replace(REGEXP_SANITIZE, '')
}

/**
 * Convert columns names to be valid ones for the requests
 *
 * Column names are set by Google and are based on the header row (first row)
 * of the sheet
 *
 * @param {Object} row
 *
 * @return {Object}
 */
function sanitizeColumnNames(row)
{
  var result = {}

  Object.keys(row).forEach(function(key)
  {
    result[sanitizeColumnName(key)] = row[key]
  })

  return result
}


/**
 * Store data on a spreadsheet appending new rows
 *
 * @param {string} spreadsheetKey - the long id in the sheets URL
 * @param {(Object|string)} creds
 * @param {string} creds.client_email
 * @param {string} creds.private_key
 * @param {Object} [options]
 * @param {Integer} [options.worksheet=1]
 */
function WorksheetLog(spreadsheetKey, creds, options)
{
  if(!(this instanceof WorksheetLog))
    return new WorksheetLog(spreadsheetKey, creds, options)

  var self = this

  options = options || {}
  options.objectMode = true

  WorksheetLog.super_.call(this, options)

  // Buffer data until we are ready
  this.cork()


  var colnames
  var worksheet = options.worksheet || 0

  var sheet = new GoogleSpreadsheet(spreadsheetKey)


  function onError(err)
  {
    self.emit('error', err)
    self.end()
  }

  function headerNotExist(item)
  {
    return colnames.indexOf(item) < 0
  }

  function filterWorksheet(element)
  {
    return element.title === worksheet
  }

  /**
   * Get the worksheet by its title or position
   */
  function getWorksheet()
  {
    sheet.getInfo(function(error, info)
    {
      if(error) return onError(error)

      // Get the worksheet
      var worksheets = info.worksheets
      worksheet = worksheets.filter(filterWorksheet)[0] || worksheets[worksheet]

      // Get the colnames
      worksheet.getCells({'max-row': 1}, function(error, cells)
      {
        if(error) return onError(error)

        colnames = cells.map(function(item){return item.value})

        // Start writting all the (buffered) data
        self.uncork()
      })
    })
  }


  sheet.useServiceAccountAuth(creds, function(err, token)
  {
    if(err) return onError(err)

    // Worksheet already selected by its ID
    if(typeof worksheet === 'number') return getWorksheet()

    // Create a new worksheet by its title if don't exists yet and get its ID

    var opts =
    {
      title: worksheet,
      rowCount: 1,
      colCount: 1
    }

    sheet.addWorksheet(opts, function(error, info){
      // [ToDo] Ignore only error related to existing worksheet

      getWorksheet()
    })
  })


  /**
   * Write a streamed row on the worksheet
   *
   * @param {Object} row
   * @param {*} _ - ignored
   * @param {Function} callback
   *
   * @private
   */
  this._write = function(row, _, callback)
  {
    var newColumns = Object.keys(row).filter(headerNotExist)

    // No new columns, add row directly
    if(!newColumns.length)
      return worksheet.addRow(sanitizeColumnNames(row), callback)

    // New columns, add the new colnames to the header before adding the data
    colnames = colnames.concat(newColumns)

    worksheet.setHeaders(colnames, function(error)
    {
      if(error) return onError(error)

      worksheet.addRow(sanitizeColumnNames(row), callback)
    })
  }
}
inherits(WorksheetLog, Writable)


module.exports = WorksheetLog
