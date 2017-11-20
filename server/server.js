// Inspect JSON Objects - Debugging Purposes
var inspect = require('eyes').inspector({ styles: { all: 'magenta' } });
var colors = require('colors');
// App Server
var express = require('express')
var fs = require('fs-extra');

// Wild Char File Finder (See Globbing)
var glob = require('glob')
// NodeJs Git Library
var git = require('simple-git/promise')

// Git Module Configurations
// Path to Git Repo
const repoPath = __dirname + '/photoGitRepo'
const simpleGit = git(repoPath);

// The versions directory will contain all png snapshots of the commit history
// If the versions folder doesnt exist, create it.
var outputDirectory = __dirname + '/versions'
if (!fs.existsSync(outputDirectory)) {
    fs.mkdirSync(outputDirectory);
}

// Web Server (Express) Set up
var app = express();
// Any files in this directory will be accessible by the client, like style.css, version1.png, index.html, etc.
var webpageDirectory = __dirname + '/webpage'
app.use(express.static(webpageDirectory))
app.use(express.static(outputDirectory))
// What port to run this local server on ?
const port = 9999
var server = app.listen(process.env.PORT || port, function() {
    console.log('Listening on port %s!', server.address().port)
})

//listen in on "localhost:9999/"
app.get("/", function(req, res) {
    //get the git log history of the git repo. The [] means no options.
    //then, call copySnapshots
    console.log("1. Receiving Request".red)
    simpleGit.log([])
    	.then((logs)=> { 
    		console.log("2. Finished Running Git Log".green)
    		return copySnapshots(logs)})
    	.then((commitHistory) => {sendHTMLPage(commitHistory, res)})
    	.catch(err => console.log(err))

})

var sendHTMLPage = function (commitHistory, response){
    var carouselHTML = ""
    var images = glob.sync(outputDirectory + "/*.png")
    // inspect(images)
    var imagesHTML = '';
    var dataTargetsHTML = '';
    for (var i = 0; i < commitHistory.length; i++) {
        var caption = "Date: " + commitHistory[i].date + " , Version: " + i + " , Hash: " + commitHistory[i].hash
        var path = images[i].split('/')
        //just get the name of the image.
        var image = path[path.length - 1]
        if (i == 0) {
            var singleImageHTML = '<div class="carousel-item active"><img src="' + image + '"width="1100" height="500"><div class="carousel-caption"><h3>' + caption + '</h3></div></div>'
            var singleDataTargetHTML = '<li data-target="#demo" data-slide-to="' + i + '" class="active"></li>'
        } else {
            var singleImageHTML = '<div class="carousel-item"><img src="' + image + '"width="1100" height="500"><div class="carousel-caption"><h3>' + caption + '</h3></div></div>'
            var singleDataTargetHTML = '<li data-target="#demo" data-slide-to="' + i + '"></li>'
        }
        imagesHTML = imagesHTML + singleImageHTML
        dataTargetsHTML = dataTargetsHTML + singleDataTargetHTML;
    }
    var html = fs.readFileSync(webpageDirectory + "/" +  "index_template.html", "utf8")
    // console.log(html)
    // console.log("	--------------")
    // console.log(imagesHTML)
    var newHtml = html.replace("Images", imagesHTML)
    newHtml = newHtml.replace("DataTargets", dataTargetsHTML)

    // console.log("--------------")

    response.end(newHtml)
}
// CopySnapshots will checkout each commit, and then copy the test.png from that commit into our local versions/ directory.
// Additionally you can provide options.file, which is the path to a file in your repository. Then only this file will be considered.
//  log is the JSON object of commits
 var copySnapshots = function(log) {
     return new Promise(function(resolve, reject) {
         //Extract the commit history. I don't need the latest, which is log.latest.
    	var commitHistory = log.all
         //reverse the commits, so oldest one is named version0.png
        commitHistory.reverse();
        var commitPromises = []
        // ForEach removes closure for the 'i' (index) variable.
        // i will be generated for each iteration, so the function gets the approrpriate 'i' value.
        commitHistory.forEach(function(commit, i) {
            // console.log("mapping promise" + JSON.stringify(commit) + " " + i)
			console.log("3. Creating and Pushing a promise to checkout and copy files from each commit".yellow)
            commitPromises.push( //need to wrap promise in function so as to not run immediately
            	function(){
            		return new Promise(function(resolve, reject){
		            	simpleGit.checkout(commit.hash)
		            		.then(()=> {
		            			console.log(colors.blue("4. Finished Checkout to %s"), commit.hash)
		            			//file system extra , returns a promise.
		            			return fs.copy(repoPath + '/' + '6.png', outputDirectory + '/' + i + '.png')})
		            		.then(()=>{
		            			console.log(colors.magenta("5. Successfully copied over %s.png"), i)
		            			resolve();
		            		})
	            	})
	            }
            )
        })
        //starts off with Promise.resolve():
        // as in :
        // Promise.resolve().then(commitPromises[1])
        commitPromises.reduce(function(cur, next){
        	return cur.then(next); //for the next iteration, 'cur' will be the promise returned by then() 
        }, Promise.resolve()).then(function(){
        	console.log(colors.cyan("6. Finished All checkout and copies, going back to master"))
        	return simpleGit.checkout("master")        	
        }).then(()=>{
        	console.log(colors.white("7. Passing commit history to parse"))
        	inspect(commitHistory)
        	resolve(commitHistory)
        })   	
    })
}
