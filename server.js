const crHandler = require('./crHandler');
const prHandler = require('./prHandler');
const bodyParser = require('body-parser');
const express = require('express');
const app = express();

app.use(express.static('public'));
app.use(bodyParser.json(), bodyParser.urlencoded({ extended: false }));

app.post('/crs', crHandler.getCRs);
app.post('/prs', prHandler.getPRs);

const listener = app.listen(process.env.PORT, () => {
  console.log('Listening on port ' + listener.address().port);
});
