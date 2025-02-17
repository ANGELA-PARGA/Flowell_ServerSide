"use strict";

require('dotenv').config({ path: 'variables.env' });
const app = require('./src/app')
const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
    console.log(`Flowell app listening on port ${PORT}`)
});

module.exports = app;



