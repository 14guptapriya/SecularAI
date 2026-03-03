from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Request
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime, timedelta
from database import get_db
from models import User, PendingUser, PasswordReset
from auth_utils import get_password_hash, verify_password, create_access_token
from email_utils import send_otp_email, generate_otp

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")


# ── Schemas ────────────────────────────────────────────────────────────
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    full_name: Optional[str] = None


class OTPVerify(BaseModel):
    email: EmailStr
    otp_code: str


class ResendVerification(BaseModel):
    email: EmailStr


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    otp_code: str
    new_password: str


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    full_name: Optional[str] = None

    class Config:
        orm_mode = True


# ── Routes ─────────────────────────────────────────────────────────────


@router.post("/register")
async def register(
    user: UserCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db)
):
    try:
        if db.query(User).filter(User.email == user.email).first():
            raise HTTPException(status_code=400, detail="Email already registered")
        if db.query(User).filter(User.username == user.username).first():
            raise HTTPException(status_code=400, detail="Username already taken")

        # Remove any stale pending entries
        db.query(PendingUser).filter(PendingUser.email == user.email).delete()
        db.query(PendingUser).filter(PendingUser.username == user.username).delete()

        otp_val = generate_otp()
        pending = PendingUser(
            username=user.username,
            email=user.email,
            full_name=user.full_name,
            hashed_password=get_password_hash(user.password),
            otp_code=otp_val,
            expires_at=datetime.utcnow() + timedelta(minutes=3),
        )
        db.add(pending)
        db.commit()
        background_tasks.add_task(send_otp_email, user.email, otp_val)
        return {"message": "Verification code sent to your email. Valid for 3 minutes."}
    except HTTPException:
        raise
    except Exception as e:
        import traceback

        trace_str = traceback.format_exc()
        print("REGISTER ERROR:", trace_str)
        raise HTTPException(status_code=500, detail=trace_str)


@router.post("/verify-otp")
def verify_otp(data: OTPVerify, db: Session = Depends(get_db)):
    pending = (
        db.query(PendingUser)
        .filter(PendingUser.email == data.email, PendingUser.otp_code == data.otp_code)
        .first()
    )
    if not pending:
        raise HTTPException(status_code=400, detail="Invalid verification code")
    if pending.expires_at < datetime.utcnow():
        db.delete(pending)
        db.commit()
        raise HTTPException(
            status_code=400, detail="Code expired. Please register again."
        )

    new_user = User(
        username=pending.username,
        email=pending.email,
        full_name=pending.full_name,
        hashed_password=pending.hashed_password,
    )
    db.add(new_user)
    db.delete(pending)
    db.commit()
    return {"message": "Account created successfully!", "status": "success"}


@router.post("/resend-verification")
async def resend_verification(
    data: ResendVerification,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    pending = db.query(PendingUser).filter(PendingUser.email == data.email).first()
    if not pending:
        raise HTTPException(
            status_code=404, detail="No pending registration for this email"
        )

    otp_val = generate_otp()
    pending.otp_code = otp_val
    pending.expires_at = datetime.utcnow() + timedelta(minutes=3)
    db.commit()
    background_tasks.add_task(send_otp_email, data.email, otp_val)
    return {"message": "New verification code sent"}


@router.post("/login")
async def login(request: Request, db: Session = Depends(get_db)):
    content_type = request.headers.get("content-type", "")
    if "application/json" in content_type:
        data = await request.json()
        username = data.get("username")
        password = data.get("password")
    else:
        form = await request.form()
        username = form.get("username")
        password = form.get("password")

    if not username or not password:
        raise HTTPException(status_code=400, detail="Username and password required")

    # Block unverified users
    pending = (
        db.query(PendingUser)
        .filter((PendingUser.username == username) | (PendingUser.email == username))
        .first()
    )
    if pending:
        raise HTTPException(
            status_code=403, detail="Email not verified. Please check your inbox."
        )

    user = db.query(User).filter(User.username == username).first()
    if not user:
        user = db.query(User).filter(User.email == username).first()
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid username or password")

    token = create_access_token(data={"sub": user.username})
    return {"token": token, "token_type": "bearer", "username": user.username}


@router.get("/me", response_model=UserResponse)
def get_me(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    from jose import jwt, JWTError
    from auth_utils import SECRET_KEY, ALGORITHM

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if not username:
            raise HTTPException(status_code=401)
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.post("/forgot-password")
async def forgot_password(
    data: ForgotPasswordRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="No account with that email")

    db.query(PasswordReset).filter(PasswordReset.email == data.email).delete()
    otp_val = generate_otp()
    db.add(
        PasswordReset(
            email=data.email,
            otp_code=otp_val,
            expires_at=datetime.utcnow() + timedelta(minutes=5),
        )
    )
    db.commit()
    background_tasks.add_task(send_otp_email, data.email, otp_val)
    return {"message": "Password reset code sent to your email."}


@router.post("/reset-password")
def reset_password(data: ResetPasswordRequest, db: Session = Depends(get_db)):
    record = (
        db.query(PasswordReset)
        .filter(
            PasswordReset.email == data.email, PasswordReset.otp_code == data.otp_code
        )
        .first()
    )
    if not record or record.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Invalid or expired reset code")

    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.hashed_password = get_password_hash(data.new_password)
    db.delete(record)
    db.commit()


@router.post("/logout")
async def logout():
    # In a stateless JWT setup, logout is primarily handled on the client side
    # by deleting the token. This endpoint exists for consistency and future-proofing.
    return {"message": "Successfully logged out"}