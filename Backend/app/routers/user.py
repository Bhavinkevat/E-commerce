from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
import random
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timezone, timedelta

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


def send_otp_email(to_email: str, otp: str):
    if not (settings.smtp_host and settings.smtp_user):
        return
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"Your Password Reset Code: {otp} - Gahena"
        msg["From"] = settings.smtp_from or settings.smtp_user
        msg["To"] = to_email

        text_content = f"Your OTP for resetting password is {otp}. Valid for 10 minutes."
        html_content = f"""
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <h2 style="color: #0d5c46; text-align: center;">Gahena - Password Reset</h2>
            <p>Hello,</p>
            <p>We received a request to reset your password. Use the following 6-digit OTP code to proceed:</p>
            <div style="background-color: #f4fbf7; text-align: center; padding: 15px; border-radius: 6px; font-size: 28px; font-weight: bold; letter-spacing: 5px; color: #0d5c46; margin: 20px 0;">
                {otp}
            </div>
            <p style="color: #666; font-size: 13px;">This OTP is valid for 10 minutes. If you did not request a password reset, please ignore this email.</p>
        </div>
        """

        msg.attach(MIMEText(text_content, "plain"))
        msg.attach(MIMEText(html_content, "html"))

        with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=5) as server:
            if settings.smtp_port == 587:
                server.starttls()
            if settings.smtp_user and settings.smtp_password:
                clean_password = settings.smtp_password.replace(" ", "").strip()
                server.login(settings.smtp_user, clean_password)
            server.sendmail(msg["From"], [to_email], msg.as_string())
            print(f"--> OTP email sent successfully to {to_email}")
    except Exception as e:
        print(f"\n!!! Background SMTP Send Error for {to_email}: {str(e)} !!!\n")


def send_welcome_email(to_email: str, user_name: str):
    if not (settings.smtp_host and settings.smtp_user):
        return
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = "Welcome to GAHENA! 💎"
        msg["From"] = settings.smtp_from or settings.smtp_user
        msg["To"] = to_email

        text_content = f"""Welcome to GAHENA! 💎

Dear {user_name},

Thank you for joining GAHENA — where elegance meets timeless beauty. ✨

Your account has been successfully created, and we’re delighted to have you with us.

Discover beautiful jewellery, explore timeless designs, and find something that perfectly matches your style and your story.

✨ Your GAHENA journey starts here.

We look forward to being a part of your special moments.

With love,
Team GAHENA💛
Elegance. Tradition. You."""

        html_content = f"""
        <div style="font-family: 'Georgia', 'Arial', sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background-color: #090a0e; color: #ffffff; border: 1px solid #d4af37; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
            <div style="text-align: center; margin-bottom: 24px; border-bottom: 1px solid rgba(212, 175, 55, 0.3); padding-bottom: 20px;">
                <h1 style="color: #f3e5ab; font-size: 28px; letter-spacing: 2px; margin: 0;">GAHENA</h1>
                <p style="color: #d4af37; font-size: 11px; letter-spacing: 3px; margin-top: 4px; text-transform: uppercase;">Luxury E-Commerce</p>
            </div>
            
            <h2 style="color: #f5d77f; font-size: 22px; margin-bottom: 16px;">Welcome to GAHENA! 💎</h2>
            
            <p style="font-size: 16px; color: #ffffff; line-height: 1.6;">Dear <strong>{user_name}</strong>,</p>
            
            <p style="font-size: 15px; color: #e2e8f0; line-height: 1.6;">
                Thank you for joining <strong>GAHENA</strong> — where elegance meets timeless beauty. ✨
            </p>
            
            <p style="font-size: 15px; color: #e2e8f0; line-height: 1.6;">
                Your account has been successfully created, and we’re delighted to have you with us.
            </p>
            
            <p style="font-size: 15px; color: #e2e8f0; line-height: 1.6;">
                Discover beautiful jewellery, explore timeless designs, and find something that perfectly matches your style and your story.
            </p>
            
            <div style="background: linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(170, 124, 17, 0.05) 100%); border-left: 4px solid #d4af37; padding: 16px 20px; border-radius: 8px; margin: 24px 0;">
                <p style="font-size: 16px; font-weight: bold; color: #f3e5ab; margin: 0;">
                    ✨ Your GAHENA journey starts here.
                </p>
            </div>
            
            <p style="font-size: 15px; color: #e2e8f0; line-height: 1.6;">
                We look forward to being a part of your special moments.
            </p>
            
            <div style="margin-top: 32px; border-top: 1px solid rgba(212, 175, 55, 0.3); padding-top: 20px; font-size: 15px; color: #f3e5ab;">
                <p style="margin: 0; font-weight: bold;">With love,</p>
                <p style="margin: 4px 0 0; font-size: 17px; color: #f5d77f; font-weight: bold;">Team GAHENA 💛</p>
                <p style="margin: 4px 0 0; font-size: 12px; color: #d4af37; letter-spacing: 1.5px; text-transform: uppercase;">Elegance. Tradition. You.</p>
            </div>
        </div>
        """

        msg.attach(MIMEText(text_content, "plain"))
        msg.attach(MIMEText(html_content, "html"))

        with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=5) as server:
            if settings.smtp_port == 587:
                server.starttls()
            if settings.smtp_user and settings.smtp_password:
                clean_password = settings.smtp_password.replace(" ", "").strip()
                server.login(settings.smtp_user, clean_password)
            server.sendmail(msg["From"], [to_email], msg.as_string())
            print(f"--> Welcome email sent successfully to {to_email}")
    except Exception as e:
        print(f"\n!!! Background SMTP Welcome Email Error for {to_email}: {str(e)} !!!\n")


def build_user_read(user: User, db: Session) -> UserRead:
    from app.services.role import get_user_permissions
    perms = get_user_permissions(db, user)
    return UserRead(
        id=user.id,
        name=user.name,
        first_name=user.first_name,
        last_name=user.last_name,
        email=user.email,
        phone=user.phone,
        address=user.address,
        role=user.role,
        created_at=user.created_at,
        permissions=perms,
    )


@router.post("/signup", response_model=TokenResponse)
def signup(payload: UserCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    existing_user = get_user_by_email(db, payload.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    payload.role = "user"
    user = create_user(db, payload)
    
    # Send Welcome Email in background task
    background_tasks.add_task(send_welcome_email, user.email, user.name)

    token = create_access_token(subject=user.email)
    return TokenResponse(access_token=token, user=build_user_read(user, db))


@router.post("/login", response_model=TokenResponse)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    user = authenticate_user(db, payload.email, payload.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    token = create_access_token(subject=user.email)
    return TokenResponse(access_token=token, user=build_user_read(user, db))



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
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
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

    # Always log OTP in server console for instant developer reference
    print(f"\n==========================================")
    print(f"PASSWORD RESET OTP FOR {payload.email}: {otp}")
    print(f"==========================================\n")

    # Send email in background so UI button is NEVER stuck on Please Wait!
    background_tasks.add_task(send_otp_email, payload.email, otp)

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
    from app.core.security import hash_password

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

    user.hashed_password = hash_password(payload.new_password)
    user.reset_otp = None
    user.reset_otp_expires_at = None
    db.commit()
    return {"message": "Password reset successfully"}



@router.get("/me", response_model=UserRead)
def me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return build_user_read(current_user, db)



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
