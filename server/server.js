// Inspect JSON Objects - Debugging Purposes
var inspect = require('eyes').inspector({ styles: { all: 'magenta' } });
// App Server
var express = require('express')
var fs = require('fs-extra');

// Wild Char File Finder (See Globbing)
var glob = require('glob')
// NodeJs Git Library
var git = require('simple-git')

// Git Module Configurations
// Path to Git Repo
const repoPath = __dirname + '/../photoshop/'
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
app.use(express.static(__dirname + '/../webpage/'))
app.use(express.static(outputDirectory))
// What port to run this local server on ?
const port = 9999
// Start listening to server
var server = app.listen(process.env.PORT || port, function() {
    console.log('Listening on port %s!', server.address().port)
})

//listen in on "localhost:9999/"
app.get("/", function(req, res) {
    //get the git log history of the git repo. The [] means no options.
    //then, call copySnapshots
    simpleGit.log([], function(err, log) {
    	console.log(log)
        var commitHistory = log.all
        //reverse the commits, so oldest one is named version0.png
        commitHistory.reverse();
        for (var i = 0; i < commitHistory.length; i++) {
        	//http://www.geekabyte.io/2013/04/callback-functions-in-loops-in.html
            (function (clsn){
            	let commit = commitHistory[clsn]
            	simpleGit.checkout(commit.hash, function() {
                	fs.copy(repoPath + 'test.png', outputDirectory + '/' + clsn + '.png')
            	})
            })(i)
        }
        simpleGit.checkout("master", function() {
            console.log("reverted back to master")
            var carouselHTML = ""
            var images = glob.sync(outputDirectory + "/*.png")
            // inspect(images)
            var imagesHTML = '';
            var dataTargetsHTML = '';
            for (var i = 0; i < images.length; i++) {
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
            var html = fs.readFileSync(__dirname + "/../webpage/index_template.html", "utf8")
            // console.log(html)
            // console.log("	--------------")
            // console.log(imagesHTML)
            var newHtml = html.replace("Images", imagesHTML)
            newHtml = newHtml.replace("DataTargets", dataTargetsHTML)

            // console.log("--------------")

            res.end(newHtml)
        })

    })
})
// CopySnapshots will checkout each commit, and then copy the test.png from that commit into our local versions/ directory.
// Additionally you can provide options.file, which is the path to a file in your repository. Then only this file will be considered. 
// log is the JSON object of commits
// var copySnapshots = function(log) {
//     // parentResolve because nested promises...
//     return new Promise(function(parentResolve, parentReject) {
//         //Extract the commit history. I don't need the latest, which is log.latest.
//         var commitHistory = log.all
//         //reverse the commits, so oldest one is named version0.png
//         commitHistory.reverse();

//         commitHistory.map(function(commit, i) {
//             // console.log("mapping promise" + JSON.stringify(commit) + " " + i)
//             simpleGit.checkout(commit.hash).then(fs.copy(repoPath + 'test.png', outputDirectory + '/' + i + '.png'))
//         })
//         // commitPromises.unshift(new Promise(function(resolve, reject) {
//         simpleGit.checkout("master").then(parentResolve(commitHistory))
//         // }))

//         // var head = commitPromises[0]
//         // for(var i = 0 ; i < commitPromises.length ; i++) {
//         // 	head = head.then(commitPromises[i])
//         // }
//         // Promise.all(commitPromises).then(parentResolve(commitHistory))
//         // Promise.all(commitPromises)
//         // 	.then(function() {
//         //     	return simpleGit.checkout("master")
//         // 	})
//         // 	.then(function() {
//         //         return console.log("Set branch to master")
//         //     }).then(parentResolve(commitHistory))
//     })
// }

// var checkoutCommit = function(commit, i) {
//     return new Promise(function(resolve, reject) {
//         console.log("checking out " + commit.hash)
//         return simpleGit.checkout(commit.hash).then(resolve())
//     })
// }
// Promise
// resolve -> .then()	
// reject -> .catch()
// var copyFile = function(i) {
//     return new Promise(function(resolve, reject) {
//         console.log("copying " + i)
//         // fs.createReadStream(repoPath + 'test.png').pipe(fs.createWriteStream(__dirname + '/' + dir + '/' + i + '.png')
//         fs.copy(repoPath + 'test.png', outputDirectory + '/' + i + '.png').then(function() {
//             console.log("supposedly done write stream.")
//             resolve()
//         });
//     })
// }

// var checkoutMaster = function() {
//     return new Promise(function(resolve, reject) {
//         return 
//     })
// }

// var finishCheckoutMaster = function(parentResolve, commitHistory) {
//     return new Promise(function(resolve, reject) {
//         simpleGit.checkout("master").then(function() {
//             console.log("Set branch to master")
//             parentResolve(commitHistory)
//             resolve();
//         })

//     })
// }