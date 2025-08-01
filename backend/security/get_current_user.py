from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from database.database import get_db
from security.security import verify_access_token
from services import user_service

# oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/users/login")
security = HTTPBearer()

def get_current_user(
        #token: str = Depends(oauth2_scheme),
        credentials: HTTPAuthorizationCredentials = Depends(security),
        db: Session = Depends(get_db)):
    token = credentials.credentials
    payload = verify_access_token(token)
    if payload is None:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    user_email = payload.get("sub")
    user = user_service.get_user_by_email(db, user_email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
