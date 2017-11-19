run_git(){

artchives="ARTchive"
git_file=".git"

cd ~/Desktop

if [ ! -d "$artchives" ]; then
	mkdir $artchives
else
	cd $artchives
	if [ ! -e "$git_file" ]; then
		git init
		git commit -m "initital commit" --allow -empty
	fi

	git add *
	now=$(date +"%m-%d-%Y %r")
	commitmessage="version_$now"
	  git commit -m "$commitmessage"
	return 0
fi

#when there is changes , git add and git commit

}

run_git
