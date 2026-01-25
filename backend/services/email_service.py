import aiosmtplib
from email.message import EmailMessage
from fastapi import HTTPException, status


async def send_email_notification(to_email: str, subject: str, body: str):

    if not to_email or not subject or not body:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing required email fields: to_email, subject, or body."
        )

    message = EmailMessage()
    message["From"] = "your.termin.notifier@example.com"
    message["To"] = to_email
    message["Subject"] = subject
    message.set_content(body)

    try:
        await aiosmtplib.send(
            message,
            hostname="smtp.mailtrap.io",
            port=2525,
            username="97f1da217a3c5b",  # Mailtrap username
            password="ef9f0d289ed868",  # Mailtrap password
            start_tls=False,
        )
        return {"message": "Email sent successfully"}

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send email: {str(e)}"
        )
