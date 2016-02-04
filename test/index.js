var assert       = require('assert')
var readFileSync = require('fs').readFileSync
var resolve      = require('path').resolve

var nock = require('nock')

var WorksheetLog = require('..')

nock.disableNetConnect()
//nock.recorder.rec();

const SERVER          = 'spreadsheets.google.com'
const SPREADSHEET_KEY = '19pi-EIKBDP-WMKVxqPvFbhf5Hg6kEjpINH5L2lXsf8U'


var accounts = nock('https://accounts.google.com')
var server   = nock('https://'+SERVER)


afterEach(nock.cleanAll)


it('send', function(done)
{
  var expected = {a: 'b'}


  accounts
  .post('/o/oauth2/token')
  .reply(200,
  {
    access_token: "ya29.fgIo4XbBSVd2wtRomKlAswO1MkhaCBjSsfrn9domvHsHi_tb0mqrxCO2Q5N2_ze_GOwmmw",
    token_type: "Bearer",
    expires_in: 3600
  })

  server
  .get('/feeds/worksheets/'+SPREADSHEET_KEY+'/private/full')
  .replyWithFile(200, __dirname + '/fixtures/1_response.xml',
    require('./fixtures/1_headers.json'))

  .get('/feeds/cells/'+SPREADSHEET_KEY+'/od6/private/full')
  .query(require('./fixtures/2_request.json'))
  .replyWithFile(200, __dirname + '/fixtures/2_response.xml', { 'content-type': 'application/atom+xml; charset=UTF-8; type=feed',
  'x-robots-tag': 'noindex, nofollow, nosnippet',
  expires: 'Thu, 04 Feb 2016 16:13:49 GMT',
  date: 'Thu, 04 Feb 2016 16:13:49 GMT',
  'cache-control': 'private, max-age=0, must-revalidate, no-transform',
  vary: 'Accept, X-GData-Authorization, GData-Version',
  'gdata-version': '3.0',
  etag: 'W/"CEUBSH0ycSt7ImA9XRNXFk0."',
  'last-modified': 'Thu, 04 Feb 2016 16:10:59 GMT',
  'transfer-encoding': 'chunked',
  p3p: 'CP="This is not a P3P policy! See https://support.google.com/accounts/answer/151657?hl=en for more info.", CP="This is not a P3P policy! See https://support.google.com/accounts/answer/151657?hl=en for more info."',
  'x-content-type-options': 'nosniff',
  'x-frame-options': 'SAMEORIGIN',
  'x-xss-protection': '1; mode=block',
  server: 'GSE',
  'set-cookie':
   [ 'NID=76=S77rzh4l_TnsZRArhM2AvSNZLPzIeK8e99ydP9CSmE4m01Hkbis2UZICVaPqJ8CsmZlSwgvG-Jr-HNNpgFrIFnH5XVZNoxwngPZCzNjtzBekdc1ObGmTtBrw_tCkCoVk;Domain=.google.com;Path=/;Expires=Fri, 05-Aug-2016 16:13:49 GMT;HttpOnly',
     'NID=76=4cnMlgwtji3EGon63mvmQvVEczFnixdBoxv-AmhBl9YCR2jkJgQ4eyTfzbsgr2JI-qFS1XqVlm4bqhxB3TZSl5Z1lxcWIqnLHfmelPUzFhEmbPyRfCUSyD4hO67d7w38;Domain=.google.com;Path=/;Expires=Fri, 05-Aug-2016 16:13:49 GMT;HttpOnly' ],
  'alternate-protocol': '443:quic,p=1',
  'alt-svc': 'quic=":443"; ma=604800; v="30,29,28,27,26,25"',
  connection: 'close' })

  .put('/feeds/worksheets/'+SPREADSHEET_KEY+'/private/full/od6')
//         readFileSync(__dirname + '/fixtures/3_request.xml', 'utf8'))
  .replyWithFile(200, __dirname + '/fixtures/3_response.xml', { 'content-type': 'application/atom+xml; charset=UTF-8; type=entry',
  'x-robots-tag': 'noindex, nofollow, nosnippet',
  'gdata-version': '3.0',
  p3p: 'CP="This is not a P3P policy! See https://support.google.com/accounts/answer/151657?hl=en for more info.", CP="This is not a P3P policy! See https://support.google.com/accounts/answer/151657?hl=en for more info."',
  date: 'Thu, 04 Feb 2016 16:13:50 GMT',
  expires: 'Thu, 04 Feb 2016 16:13:50 GMT',
  'cache-control': 'private, max-age=0',
  'x-content-type-options': 'nosniff',
  'x-frame-options': 'SAMEORIGIN',
  'x-xss-protection': '1; mode=block',
  server: 'GSE',
  'set-cookie':
   [ 'NID=76=dw9hKDCq1BV4_5PUcs-MYxti0YbrWA7j2JAj-tP8hzg9-UQZ3kG41JEFlxrtDqY3G8wznJ1xis6vfSMKNYPDKBwb94277wxX33wKA_-xQjk0TSYsVKG9I4I2svEU_zu9;Domain=.google.com;Path=/;Expires=Fri, 05-Aug-2016 16:13:50 GMT;HttpOnly',
     'NID=76=g7dRaFP9OTQBlHFe2gwfmvafbFqzJPi3Wjr4HUdW3fUeU-giBw_qMGBPhawnQewC1R9kZZWDaxcuKFXmdSdgjad73jZzKsmXVhIPk6fbj5Vg8HptJfbXV0BKlb-diYXa;Domain=.google.com;Path=/;Expires=Fri, 05-Aug-2016 16:13:50 GMT;HttpOnly' ],
  'alternate-protocol': '443:quic,p=1',
  'alt-svc': 'quic=":443"; ma=604800; v="30,29,28,27,26,25"',
  'accept-ranges': 'none',
  vary: 'Accept-Encoding',
  connection: 'close' })

  .post('/feeds/cells/'+SPREADSHEET_KEY+'/od6/private/full/batch')
//         readFileSync(__dirname + '/fixtures/4_request.xml', 'utf8'))
  .replyWithFile(200, __dirname + '/fixtures/4_response.xml', { 'content-type': 'application/atom+xml; charset=UTF-8; type=feed',
  'x-robots-tag': 'noindex, nofollow, nosnippet',
  'gdata-version': '3.0',
  p3p: 'CP="This is not a P3P policy! See https://support.google.com/accounts/answer/151657?hl=en for more info.", CP="This is not a P3P policy! See https://support.google.com/accounts/answer/151657?hl=en for more info."',
  date: 'Thu, 04 Feb 2016 16:13:51 GMT',
  expires: 'Thu, 04 Feb 2016 16:13:51 GMT',
  'cache-control': 'private, max-age=0',
  'x-content-type-options': 'nosniff',
  'x-frame-options': 'SAMEORIGIN',
  'x-xss-protection': '1; mode=block',
  server: 'GSE',
  'set-cookie':
   [ 'NID=76=3kp4R1BfsO6BxIaJAi-Lp-mpl0gylMgxrwilwlAVcqUNgn8jWBJLZtC-CbOLAZAYZrq0GyjVT09PSA7Ve1tUpBGZhtmDEcJsALp7tjedo3QFdcYP1cYEZAVGeTJb1lr-;Domain=.google.com;Path=/;Expires=Fri, 05-Aug-2016 16:13:51 GMT;HttpOnly',
     'NID=76=3QS68gms9B7ooEp5RrK5f5gYDW8DFXDFcPLmJhkXxsALmY2Yyu5dxWbU5ck53ZCRbZcp28OJOGM4wH-QMqqucTiA_CPUbioyjuRcEYMNGAy6qWgQsfELhsmPVnJZJiFn;Domain=.google.com;Path=/;Expires=Fri, 05-Aug-2016 16:13:51 GMT;HttpOnly' ],
  'alternate-protocol': '443:quic,p=1',
  'alt-svc': 'quic=":443"; ma=604800; v="30,29,28,27,26,25"',
  'accept-ranges': 'none',
  vary: 'Accept-Encoding',
  connection: 'close' })

  .post('/feeds/list/'+SPREADSHEET_KEY+'/od6/private/full')
//    readFileSync(__dirname + '/fixtures/5_request.xml', 'utf8'))
  .reply(201, function()
  {
    done()

    return readFileSync(__dirname + '/fixtures/5_response.xml', 'utf8')
  })


  var log = WorksheetLog(SPREADSHEET_KEY, __dirname + '/creds.json')

  log.on('error', done)

  log.write(expected)
})
