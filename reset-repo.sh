#!/bin/bash

# Define the default branch name (change to 'master' if using that)
BRANCH_NAME="main"

# Ensure you are on the branch where the changes should be applied
git checkout $BRANCH_NAME

# Create an orphan branch (no commit history)
git checkout --orphan new-initial-branch

# Stage all files for commit
git add -A

# Create a new commit with the current state
git commit -m "update"

# Delete the old branch with the history
git branch -D $BRANCH_NAME

# Rename the current branch to the default branch name
git branch -m $BRANCH_NAME

# Force push the changes to overwrite remote history
git push --force origin $BRANCH_NAME

# Output success message
echo "Repository is now reset, with only the current commit as the initial commit."
