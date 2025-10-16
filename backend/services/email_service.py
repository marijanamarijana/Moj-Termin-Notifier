import aiosmtplib
from email.message import EmailMessage


async def send_email_notification(to_email: str, subject: str, body: str):
    message = EmailMessage()
    message["From"] = "your.termin.notifier@example.com"
    message["To"] = to_email
    message["Subject"] = subject
    message.set_content(body)

    await aiosmtplib.send(
        message,
        hostname="smtp.mailtrap.io",
        port=2525,
        username="97f1da217a3c5b",  # Mailtrap username
        password="ef9f0d289ed868",  # Mailtrap password
        start_tls=False,
    )
    return {"message": "Email sent successfully"}