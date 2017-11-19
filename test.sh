run_git(){
artchives="photoshop"
git_file=".git"

if [ ! -d "$artchives" ]; then
	mkdir $artchives
else
	cd $artchives
	if [ ! -e "$git_file" ]; then
		git init
		git commit -m "initital commit" --allow -empty
	fi
	if git diff-index --quiet HEAD --; then
   # no changes	return 0
		return 0;
	else
		git add *
		now=$(date +"%m-%d-%Y %r")
		commitmessage="version_$now"
	  git commit -m "$commitmessage"
		return 0
	fi	
fi

#when there is changes , git add and git commit

}

run_git
