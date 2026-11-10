
import jwt
from jwt import PyJWKClient
from jwt.exceptions import PyJWTError

from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.config import settings


security = HTTPBearer(auto_error=False)

JWKS_URL = (
    f"{settings.CLERK_FRONTEND_API_URL.rstrip('/')}/.well-known/jwks.json"
)

jwks_client = PyJWKClient(JWKS_URL)


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:

    if credentials is None:
        raise HTTPException(
            status_code=401,
            detail="Authentication required"
        )

    token = credentials.credentials

    try:
        signing_key = jwks_client.get_signing_key_from_jwt(token)

        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            issuer=settings.CLERK_FRONTEND_API_URL,
            options={
                "require": ["exp", "iat", "sub", "iss"]
            }
        )

        if payload.get("azp") != "http://localhost:3000":
            raise HTTPException(
                status_code=401,
                detail="Invalid token origin"
            )

        return {
            "user_id": payload["sub"],
            "session_id": payload.get("sid")
        }

    except PyJWTError:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired authentication token"
        )
