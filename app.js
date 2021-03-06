const express = require('express');
const app = express();
const path = require('path');
const router = express.Router();

router.get('/', function(req, res){
    res.sendFile(path.join(__dirname+'/index.html'));
});

app.use(express.static(__dirname), router);
app.listen(process.env.PORT || 3000);

console.log("Server is running");