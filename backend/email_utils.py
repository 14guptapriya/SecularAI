import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import random
import string
import os
from dotenv import load_dotenv

load_dotenv()

SMTP_HOST = "smtp.gmail.com"
SMTP_PORT = 587
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASS = os.getenv("SMTP_PASS")


def generate_otp() -> str:
    return "".join(random.choices(string.digits, k=6))


def send_otp_email(to_email: str, otp_code: str):
    subject = "Your SecularAI Verification Code"
    html_body = f"""
    <div style="font-family: Inter, Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #0d1016; color: #e2e8f0; border-radius: 16px;">
      <h1 style="font-size: 24px; font-weight: 700; margin-bottom: 8px;">
        Secular<span style="color: #38bdf8;">AI</span>
      </h1>
      <p style="color: #64748b; margin-bottom: 24px;">Explore the wisdom of all traditions</p>
      <hr style="border-color: #1e293b; margin-bottom: 24px;" />
      <p style="margin-bottom: 8px; color: #94a3b8;">Your verification code is:</p>
      <div style="font-size: 40px; font-weight: 800; letter-spacing: 12px; color: #38bdf8; margin: 16px 0 24px; text-align: center; background: #0f172a; border-radius: 12px; padding: 16px;">
        {otp_code}
      </div>
      <p style="font-size: 13px; color: #64748b;">This code expires in 3 minutes. If you didn't request this, please ignore this email.</p>
    </div>
    """

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = SMTP_USER
    msg["To"] = to_email
    msg.attach(MIMEText(html_body, "html"))

    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASS)
            server.sendmail(SMTP_USER, to_email, msg.as_string())
    except Exception as e:
        print(f"[EMAIL ERROR] Failed to send OTP to {to_email}: {e}")
