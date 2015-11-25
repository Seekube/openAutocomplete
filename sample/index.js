var express = require('express');
var path = require('path');
var app = express();

app.use('/dist', express.static(__dirname + '/../src'));
app.use('/bower_components', express.static(__dirname + '/bower_components'));

app.get('/jquery', function (req, res) {
    res.sendFile(path.join(__dirname+'/jquery.html'));
});

app.get('/angular', function (req, res) {
    res.sendFile(path.join(__dirname+'/angular.html'));
});

app.get('/auto-complete', function (req, res) {
    var values = ['Banana', 'Beef', 'Carrot', 'Chicken', 'Citrus', 'Garlic', 'Kelp', 'Mint', 'Olive', 'Onion', 'Salad', 'Tomato', 'Watermelon'];
    var match = [];

    values.some(function (item) {
        if (item.toLowerCase().indexOf(req.query.input.toLowerCase()) >= 0) {
            match.push(item);
        }

        return req.query.limit && match.length == req.query.limit;
    })
    
    res.status(200).json({'match': match});
});

var server = app.listen(3010, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Server running on port %s', port);
});