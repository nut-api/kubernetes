REPO="apiplustech/naaraan"
CUTOFF_DATE=$(date -v-3m +"%Y-%m-%dT%H:%M:%SZ")

gh api repos/$REPO/branches --paginate | jq -r '.[].name' > all-branches.txt

# List all branches
for branch in $(cat all-branches.txt); do
  # Fetch the latest commit date for each branch
  COMMIT_DATE=$(gh api repos/$REPO/commits/$branch | jq -r '.commit.committer.date')

  if [[ "$COMMIT_DATE" < "$CUTOFF_DATE" ]]; then
    echo "Deleting stale branch: $branch (Last commit: $COMMIT_DATE)"
    gh api -X DELETE "repos/$REPO/git/refs/heads/$branch" --silent
  else
    echo "Skipping active branch: $branch (Last commit: $COMMIT_DATE)"
  fi
done
