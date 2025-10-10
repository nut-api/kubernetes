Set up secrets
The following steps will show you how to set up an OAuth app.

Create your GitHub Oauth application

https://developer.github.com/apps/building-oauth-apps/creating-an-oauth-app/

Make sure to create a GitHub Oauth App and not a regular GitHub App.

The callback url should be:

<PROW_BASE_URL>/github-login/redirect

Create a secret file for GitHub OAuth that has the following content. The information can be found in the GitHub OAuth developer settings:

client_id: <APP_CLIENT_ID>
client_secret: <APP_CLIENT_SECRET>
redirect_url: <PROW_BASE_URL>/github-login/redirect
final_redirect_url: <PROW_BASE_URL>/pr
If Prow is expected to work with private repositories, add

scopes:
- repo
Create another secret file for the cookie store. This cookie secret will also be used for CSRF protection. The file should contain a random 32-byte length base64 key. For example, you can use openssl to generate the key

openssl rand -out cookie.txt -base64 32
Use kubectl, which should already point to your Prow cluster, to create secrets using the command:

kubectl create secret generic github-oauth-config --from-file=secret=<PATH_TO_YOUR_GITHUB_SECRET>

kubectl create secret generic cookie --from-file=secret=<PATH_TO_YOUR_COOKIE_KEY_SECRET>

To use the secrets, you can either:

Mount secrets to your deck volume:

Open test-infra/config/prow/cluster/deck_deployment.yaml. Under volumes token, add:

- name: oauth-config
  secret:
      secretName: github-oauth-config
- name: cookie-secret
  secret:
      secretName: cookie
Under volumeMounts token, add:

- name: oauth-config
  mountPath: /etc/githuboauth
  readOnly: true
- name: cookie-secret
  mountPath: /etc/cookie
  readOnly: true
Add the following flags to deck:

- --github-oauth-config-file=/etc/githuboauth/secret
- --oauth-url=/github-login
- --cookie-secret=/etc/cookie/secret
Note that the --oauth-url should eventually be changed to a boolean as described in #13804.

You can also set your own path to the cookie secret using the --cookie-secret flag.

To prevent deck from making mutating GitHub API calls, pass in the --dry-run flag.
