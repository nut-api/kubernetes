gh api \
  -H "Accept: application/vnd.github.v3+json" \
  /orgs/apiplustech/actions/runners \
  -q '.runners[] | {id,status,busy} | select((.busy == false) and (.status == "offline")) | {id} | .[]' \
  --paginate | xargs -I {} \
  gh api \
  --method DELETE \
  -H "Accept: application/vnd.github.v3+json" \
  /orgs/apiplustech/actions/runners/{} --silent