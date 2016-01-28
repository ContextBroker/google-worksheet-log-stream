var Writable = require('stream').Writable

var GoogleSpreadsheet = require('google-spreadsheet')
var inherits          = require('inherits')


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


  var worksheet = options.worksheet || 0

  var sheet = new GoogleSpreadsheet(spreadsheetKey)


  function onError(err)
  {
    self.emit('error', err)
    self.end()
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

      // Start writting all the (buffered) data
      self.uncork()
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

    sheet.addWorksheet(opts, function(error, info)
    {
      // [ToDo] Ignore errors related to existing worksheet and notify others

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
    worksheet.addColnames(Object.keys(row), function(error)
    {
      if(error) return onError(error)

      worksheet.addRow(row, callback)
    })
  }
}
inherits(WorksheetLog, Writable)


module.exports = WorksheetLog
