var Writable = require('stream').Writable

var GoogleSpreadsheet = require('google-spreadsheet')
var inherits          = require('inherits')


const SANITIZE = /\W+/g


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
  return name.toLowerCase().replace(SANITIZE, '')
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
 * @param {Integer} [options.worksheet_id=1]
 */
function WorksheetLog(spreadsheetKey, creds, options)
{
  if(!(this instanceof WorksheetLog))
    return new WorksheetLog(spreadsheetKey, creds, options)

  var self = this

  options = options || {}
  options.objectMode = true

  WorksheetLog.super_.call(this, options)

  var worksheet_id = options.worksheet_id || 1

  var sheet = new GoogleSpreadsheet(spreadsheetKey)

  var buffer = []
  var _token

  function addRow(row, callback)
  {
    sheet.addRow(worksheet_id, sanitizeColumnNames(row), callback)
  }

  sheet.useServiceAccountAuth(creds, function(err, token)
  {
    if(err) return self.emit('error', err)

    _token = token

    buffer.forEach(function(item)
    {
      addRow(item.row, item.callback)
    })
    buffer = []
  })

  this._write = function(row, _, callback)
  {
    if(!_token) return buffer.push({row: row, callback: callback})

    addRow(row, callback)
  }
}
inherits(WorksheetLog, Writable)


module.exports = WorksheetLog
