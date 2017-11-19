run_git(){

projDir=~/User/Desktop/
artchives="ARTchive"
git_file=".git"

cd $projDir

if [ ! -d "$projDir" ]; then
	mkdir $artchives
	echo "created folder"
else
	echo "folder already exists"
	cd $artchives
	if [ ! -e "$git_file" ]; then
		git init
		echo "git repo created"
	fi
fi

#when there is changes , git add and git commit

if git diff-index --quiet HEAD --; then
    # no changes
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
