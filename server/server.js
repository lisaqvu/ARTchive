var inspect = require('eyes').inspector({styles: {all: 'magenta'}});
var express = require('express')
var app = express();
var fs = require('fs')
var glob = require("glob")
const git = require('simple-git')
const path = __dirname + '/../photoshop/'

const simpleGit = git(path);

var dir = './versions'
if(!fs.existsSync(dir)){
	fs.mkdirSync(dir);
}

app.use(express.static(__dirname + '/../webpage/'))
app.use(express.static(__dirname + '/versions/'))

app.get("/", function(req, res){
	/**
    <div class="carousel-item active">
        <img src="la.jpg" alt="Los Angeles" width="1100" height="500">
        <div class="carousel-caption">
            <h3>Los Angeles</h3>
            <p>We had such a great time in LA!</p>
        </div>
    </div>
    <div class="carousel-item">
        <img src="chicago.jpg" alt="Chicago" width="1100" height="500">
        <div class="carousel-caption">
            <h3>Chicago</h3>
            <p>Thank you, Chicago!</p>
        </div>
    </div>
    <div class="carousel-item">
        <img src="ny.jpg" alt="New York" width="1100" height="500">
        <div class="carousel-caption">
            <h3>New York</h3>
            <p>We love the Big Apple!</p>
        </div>
    </div>
	**/
	var carouselHTML = ""
	var images = glob.sync(__dirname + "/versions/*.jpg")
	// inspect(images)
	var imagesHTML = '';
	for (var i = 0 ; i < images.length ; i++){
		var path = images[i].split('/')
		var image = path[path.length -1]
		if(i==0)
			var singleImageHTML = '<div class="carousel-item active"><img src="' + image + '"width="1100" height="500"><div class="carousel-caption"><h3>Image ' + i + '</h3></div></div>'
		else
			var singleImageHTML = '<div class="carousel-item"><img src="' + image + '"width="1100" height="500"><div class="carousel-caption"><h3>Image ' + i + '</h3></div></div>'
		imagesHTML = imagesHTML + singleImageHTML
	}
	var html = fs.readFileSync(__dirname + "/../webpage/index_template.html", "utf8")
	console.log(html)
	console.log("--------------")
	console.log(imagesHTML)
	var newHtml = html.replace("Images", imagesHTML)
	console.log("--------------")

	res.end(newHtml)

})
const port = 9999
var server = app.listen(process.env.PORT || port, function() {
    console.log('Listening on port %s!', server.address().port)
})


// Additionally you can provide options.file, which is the path to a file in your repository. Then only this file will be considered. 
// simpleGit.log([], gitLogCallback);

var gitLogCallback  = function(err, log) {
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
}