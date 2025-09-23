// // proxy.js
// const express = require('express');
// const request = require('request');
// const cors = require('cors');
// const app = express();

// app.use(cors()); // Autorise toutes les origines

// app.use('/api', (req, res) => {
//   const url = `http://10.3.119.232:8889/${req.url}`;
//   req.pipe(request(url)).pipe(res);
// });

// app.listen(3001, () => console.log('Proxy running on port 3001'));
