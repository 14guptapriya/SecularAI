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
SMTP_USER = os.getenv("SMTP_USER", "bhandarisanketp@gmail.com")
SMTP_PASS = os.getenv("SMTP_PASS", "")


def generate_otp() -> str:
    return "".join(random.choices(string.digits, k=6))

def send_otp_email(to_email: str, otp_code: str):
    subject = "Your SecularAI Verification Code"
    html_body = f"""
    <div style="font-family: Georgia, serif; max-width: 460px; margin: 0 auto;
         padding: 32px; background: #1a0d3a; color: #d4c4f0;
         border-radius: 20px; border: 1px solid rgba(180,130,255,0.18);">

      <h1 style="font-size: 22px; font-weight: 600; margin: 0 0 4px; letter-spacing: 0.04em; color: #f5e6b8;">
        Secular<span style="color: #c07020;">AI</span>
      </h1>

      <p style="color: rgba(200,170,255,0.5); margin: 0 0 24px;
         font-size: 10px; letter-spacing: 0.25em; text-transform: uppercase;">
        A universe of spiritual wisdom
      </p>

      <hr style="border: none; border-top: 1px solid rgba(180,130,255,0.12); margin-bottom: 24px;" />

      <p style="margin: 0 0 12px; color: rgba(200,170,255,0.5);
         font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase;">
        Your verification code
      </p>

      <div style="font-size: 38px; font-weight: 600; letter-spacing: 14px;
           color: #f5c842; margin: 0 0 24px; text-align: center;
           background: rgba(255,255,255,0.03);
           border: 1px solid rgba(180,130,255,0.2);
           border-radius: 14px; padding: 20px 16px;">
        {otp_code}
      </div>

      <p style="font-size: 12px; color: rgba(200,170,255,0.35); line-height: 1.7; margin: 0;">
        This code expires in
        <strong style="color: rgba(245,200,66,0.7);">3 minutes</strong>.
        If you didn't request this, please ignore this email.
      </p>

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