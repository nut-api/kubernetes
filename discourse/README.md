# Create client on hydra(/admin/clients) with this body
      {
        "client_id": "discourse-client",
        "client_name": "Discourse Application",
        "grant_types": ["authorization_code", "refresh_token"],
        "redirect_uris": ["https://forum.dicast.io/auth/oidc/callback"],
        "response_types": ["code", "id_token"],
        "scope": "openid profile email offline_access",
        "token_endpoint_auth_method": "client_secret_basic"
    }