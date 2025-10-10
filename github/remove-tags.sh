REPO="apiplustech/core"
CUTOFF_DATE=$(date -v-3m +"%Y-%m-%dT%H:%M:%SZ")

gh api repos/$REPO/git/refs/tags --paginate | jq -r '.[].ref' | sed 's|refs/tags/||' > all-tags.txt

for tag in $(cat all-tags.txt); do
  # Fetch the latest commit date for each tag
  COMMIT_DATE=$(gh api repos/$REPO/commits/$tag | jq -r '.commit.committer.date' 2>/dev/null)

  if [[ -n "$COMMIT_DATE" && "$COMMIT_DATE" < "$CUTOFF_DATE" ]]; then
    echo "Deleting stale tag: $tag (Last commit: $COMMIT_DATE)"
    gh api --silent -X DELETE "repos/$REPO/git/refs/tags/$tag"
  else
    echo "Skipping active or orphaned tag: $tag (Last commit: ${COMMIT_DATE:-N/A})"
  fi
done