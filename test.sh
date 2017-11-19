run_git(){

projDir=~/Desktop/
artchives="ARTchive"
git_file=".git"

cd $projDir

if [ ! -d "$projDir" ]; then
	mkdir $artchives
else
	cd $artchives
	if [ ! -e "$git_file" ]; then
		git init
		echo "git repo created"
	fi
fi

if git diff-index --quiet HEAD --; then
	return 0
else
    git add *
    now=$(date +"%m-%d-%Y %r")
    commitmessage="version_$now"
    echo $commitmessage
    git commit -m "$commitmessage"
    return 0
fi

}

run_git

