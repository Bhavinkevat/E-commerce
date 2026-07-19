from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.core.security import create_access_token
from app.core.config import settings
from app.database import get_db
from app.models import User
from app.schemas.auth import (
    ForgotPassword,
    ForgotPasswordRequest,
    ForgotPasswordVerify,
    ForgotPasswordReset,
    TokenResponse,
    UserCreate,
    UserLogin,
    UserRead
)
from app.schemas.profile import ProfileUpdate
from app.services.user import authenticate_user, create_user, get_user_by_email, reset_password
from app.services.profile import update_profile


router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/signup", response_model=TokenResponse)
def signup(payload: UserCreate, db: Session = Depends(get_db)):
    existing_user = get_user_by_email(db, payload.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    user = create_user(db, payload)
    token = create_access_token(subject=user.email)
    return TokenResponse(access_token=token, user=user)


@router.post("/login", response_model=TokenResponse)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    user = authenticate_user(db, payload.email, payload.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    token = create_access_token(subject=user.email)
    return TokenResponse(access_token=token, user=user)


@router.post("/forgot-password")
def forgot_password(payload: ForgotPassword, db: Session = Depends(get_db)):
    user = reset_password(db, payload.email, payload.new_password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Email not found",
        )
    return {"message": "Password reset successfully"}


@router.post("/forgot-password/request")
def request_forgot_password_otp(
    payload: ForgotPasswordRequest,
    db: Session = Depends(get_db)
):
    import random
    import smtplib
    from email.mime.text import MIMEText
    from datetime import datetime, timezone, timedelta

    user = get_user_by_email(db, payload.email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Email not found",
        )

    # Generate 6-digit OTP
    otp = f"{random.randint(100000, 999999):06d}"
    user.reset_otp = otp
    user.reset_otp_expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)
    db.commit()

    # Always log OTP in server console for development reference
    print(f"\n==========================================")
    print(f"PASSWORD RESET OTP FOR {payload.email}: {otp}")
    print(f"==========================================\n")

    # Send via SMTP if configured
    if settings.smtp_host and settings.smtp_user:
        try:
            msg = MIMEText(f"Your password reset OTP is: {otp}. It is valid for 10 minutes.")
            msg["Subject"] = "Password Reset OTP"
            msg["From"] = settings.smtp_from
            msg["To"] = payload.email

            with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
                if settings.smtp_port == 587:
                    server.starttls()
                if settings.smtp_user and settings.smtp_password:
                    server.login(settings.smtp_user, settings.smtp_password)
                server.sendmail(settings.smtp_from, [payload.email], msg.as_string())
        except Exception as e:
            import traceback
            traceback.print_exc()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"SMTP Error: Could not send email. Details: {str(e)}",
            )

    return {"message": "OTP sent to your email successfully"}


@router.post("/forgot-password/verify")
def verify_forgot_password_otp(
    payload: ForgotPasswordVerify,
    db: Session = Depends(get_db)
):
    from datetime import datetime, timezone

    user = get_user_by_email(db, payload.email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Email not found",
        )

    if not user.reset_otp or user.reset_otp != payload.otp:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OTP code",
        )

    if user.reset_otp_expires_at:
        now = datetime.now(timezone.utc)
        expires = user.reset_otp_expires_at
        if expires.tzinfo is not None:
            if now > expires:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="OTP expired")
        else:
            from datetime import datetime as dt
            if dt.utcnow() > expires:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="OTP expired")

    return {"message": "OTP verified successfully"}


@router.post("/forgot-password/reset")
def reset_password_with_otp(
    payload: ForgotPasswordReset,
    db: Session = Depends(get_db)
):
    from datetime import datetime, timezone
    from app.core.security import get_password_hash

    user = get_user_by_email(db, payload.email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Email not found",
        )

    if not user.reset_otp or user.reset_otp != payload.otp:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OTP code",
        )

    if user.reset_otp_expires_at:
        now = datetime.now(timezone.utc)
        expires = user.reset_otp_expires_at
        if expires.tzinfo is not None:
            if now > expires:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="OTP expired")
        else:
            from datetime import datetime as dt
            if dt.utcnow() > expires:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="OTP expired")

    user.hashed_password = get_password_hash(payload.new_password)
    user.reset_otp = None
    user.reset_otp_expires_at = None
    db.commit()
    return {"message": "Password reset successfully"}



@router.get("/me", response_model=UserRead)
def me(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/profile", response_model=UserRead)
def update_me(
    payload: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if payload.email and payload.email != current_user.email:
        existing_user = get_user_by_email(db, payload.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",
            )
    return update_profile(db, current_user, payload)
