var express = require('express');
var bodyParser = require('body-parser');
var async = require('async');
var fs = require('fs');
var app = express();
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;


app.set('view engine', 'ejs');
app.use('/public', express.static('public'));

app.listen(3000);

var json = bodyParser.json();

var urlencodedParser = bodyParser.urlencoded({ extended: false });

var writeStream = fs.createWriteStream(__dirname + '/public/usernames.txt');
var readStream = fs.createReadStream(__dirname + '/usernames.txt', 'utf8');

app.get('/', function(req, res){
	res.render('index');
});

var users;
var usersArray;


app.post('/parse', urlencodedParser, function(req, res) {
	var usersString = JSON.stringify(req.body);
	users = usersString.replace('usernames', '').replace(/"/g, '').replace(/:/g, '').replace(/{/g, '').replace(/}/g, '');
	usersArray = users.toString().split(/\\r?\\n/);
	console.log(usersArray);
	parseRun();
	res.render('index');
});


function usersToArray(){
	var usernames = users;
	// var output = document.getElementById('output');
	stringArray = usernames.value.split('\r\n');
	console.log(stringArray);
	// output.value = stringArray.join('\r\n');
}

function parseRun(){
	fs.writeFile(__dirname + '/public/usernames.txt', '', function(){});
	async.eachSeries(usersArray, function(element, next) {
		setTimeout(function() {
			Parse(element);
			next();
		}, 1000);
	}, function() {
		// fs.truncate('/public/usernames.txt', 0, function(){ console.log('File cleared'); });
		// fs.writeFile(__dirname + '/public/usernames.txt', '', function(){});
		// fs.unlink(__dirname + '/public/usernames.txt', (err) => {
		// 	if(err) throw err;
		// 	console.log('File was deleted');
		// });
	});
	
}

function Parse(username){
	var request = require('request');
	var JSSoup = require('jssoup').default;
	request('https://old.reddit.com/user/' + username + '/overview/', function (error, response, body) {
		//console.log('error:', error); // Print the error if one occurred
		//console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
		
		var soup = new JSSoup(body);
		
		// v2
		var soupName = soup.findAll('h1');
		var soupKarma = soup.findAll('span', 'karma');
		var soupAge = soup.findAll('span', 'age');
		var stripedAge = soupAge.toString().replace(/<[^>]+>/g, '').replace('redditor for&#32;', '');
		var soupVerified = soup.findAll('span', 'trophy-name');	

		if(soupName[0].nextElement._text === "page not found"){
			writeStream.write('User doesn\'t exist!\n\n', 'utf8');
			console.log('User doesn\'t exist!\n');
		} else{
			var username = soupName[0].nextElement._text;
			var postKarma = soupKarma[0].nextElement._text;
			var commentKarma = soupKarma[1].nextElement._text;
			var age = stripedAge;
			var verified;

			console.log("Username:      " + username);
			console.log("Post Karma:    " + postKarma);
			console.log("Comment Karma: " + commentKarma);
			console.log("Age:           " + age);
			
			soupVerified.forEach(function(element) {
				// Display Verified Email Only
				if(element.nextElement._text === 'Verified Email'){
					verified = 'Verified Email';
					console.log("               Verified Email");
				} else{
					verified = '';
				}
				// Display All Trophies
				// console.log(element.nextElement._text); 
			});

			writeStream.write('Username: ' + username + '\n', 'utf8');
			writeStream.write('Post Karma: ' + postKarma + '\n', 'utf8');
			writeStream.write('Comment Karma: ' + commentKarma + '\n', 'utf8');
			writeStream.write('Age: ' + age + '\n', 'utf8');
			writeStream.write(verified + '\n', 'utf8');
			writeStream.write('\n', 'utf8');

			writeStream.on('finish', function(){
				writeStream.end();
			});	
		}

	});
}



// function usersToArray() {
// 	var usernames = document.getElementById('usernames');
// 	var output = document.getElementById('output');
// 	stringArray = usernames.value.split('\r\n');
// 	console.log(stringArray);
// 	output.value = stringArray.join('\r\n');
// }

