var inspect = require('eyes').inspector({styles: {all: 'magenta'}});

const git = require('simple-git')
const path = __dirname + '/photoshop/'
var express = require('express')
var app = express();
var fs = require('fs')

var dir = './versions'
if(!fs.existsSync(dir)){
	fs.mkdirSync(dir);
}

const simpleGit = git(path);
// app.use(express.static('webpage'))
// Additionally you can provide options.file, which is the path to a file in your repository. Then only this file will be considered. 
simpleGit.log([],function(err, log) {
	console.log(log.all[0].author_name)
	// inspect(JSON.parse(log))
	var commitHistory = log.all
	//reverse the commits, so oldest one is named version0.txt
	commitHistory.reverse();

	var commitPromises = commitHistory.map(function(commit, i){
		return new Promise(function(resolve, reject){
			console.log(commit.hash)
			simpleGit.checkout(commit.hash, function(){
				fs.createReadStream(path+ 'a.txt').pipe(fs.createWriteStream(__dirname + '/versions/' + i + '.txt'));
				resolve("ok!")
			})
		});
	})
	commitPromises.unshift(new Promise(function(resolve, reject){
		simpleGit.checkout("master", function(){
			console.log("initally set to master")
			resolve();
		})
	}))


	commitPromises.push(new Promise(function(resolve, reject){
		simpleGit.checkout("master", function(){
			console.log("back to master")
			resolve();
		})
	}))
	var head = commitPromises[0]
	for (var i = 1 ; i < commitPromises.length; i++)
		head = head.then(commitPromises[i])
})

const port = 9999
var server = app.listen(process.env.PORT || port, function() {
    console.log('Listening on port %s!', server.address().port)
})