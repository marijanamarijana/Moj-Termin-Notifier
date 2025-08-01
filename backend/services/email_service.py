import aiosmtplib
from email.message import EmailMessage


async def send_email_notification(to_email: str, subject: str, body: str):
    message = EmailMessage()
    message["From"] = "youremail@example.com"
    message["To"] = to_email
    message["Subject"] = subject
    message.set_content(body)

    await aiosmtplib.send(
        message,
        hostname="smtp.mailtrap.io",
        port=2525,
        username="cafa14953932ee",  # Mailtrap username
        password="6cc78cdcf37f7b",  # Mailtrap password
        start_tls=False,
    )
    return {"message": "Email sent successfully"}