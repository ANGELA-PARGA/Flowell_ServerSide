"use strict";

import dotenv from 'dotenv';
import app from './src/app.js'
dotenv.config({ path: 'variables.env' });

const PORT = process.env.PORT || 8000;

app.listen(PORT, "::", () => {
    console.log(`Flowell app listening on port ${PORT}`)
});

export default app;



