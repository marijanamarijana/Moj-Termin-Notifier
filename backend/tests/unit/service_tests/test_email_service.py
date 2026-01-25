import pytest
from unittest.mock import AsyncMock, patch
from fastapi import HTTPException
from services.email_service import send_email_notification


@pytest.mark.asyncio
@patch("services.email_service.aiosmtplib.send", new_callable=AsyncMock)
async def test_send_email_notification_success(mock_send):
    result = await send_email_notification("user@example.com", "Test", "Hello")
    mock_send.assert_awaited_once()
    assert result == {"message": "Email sent successfully"}


@pytest.mark.asyncio
@patch("services.email_service.aiosmtplib.send", new_callable=AsyncMock)
async def test_send_email_notification_failure(mock_send):
    mock_send.side_effect = Exception("SMTP error")
    with pytest.raises(HTTPException) as exc:
        await send_email_notification("user@example.com", "Test", "Body")
    assert exc.value.status_code == 500
    assert "Failed to send email" in exc.value.detail


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "to_email, subject, body",
    [
        ("", "Subject", "Body"),
        ("user@example.com", "", "Body"),
        ("user@example.com", "Subj", ""),
    ],
)
async def test_send_email_notification_missing_fields(to_email, subject, body):
    with pytest.raises(HTTPException) as exc:
        await send_email_notification(to_email, subject, body)

    assert exc.value.status_code == 400
    assert "Missing required email fields" in str(exc.value.detail)
