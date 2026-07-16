import logging

logger = logging.getLogger(__name__)

def send_sms(phone_number: str, message: str):
    """
    Mock SMS service.
    In a real-world scenario, you would integrate Twilio or AWS SNS here.
    """
    print(f"\n{'='*50}")
    print(f"SMS NOTIFICATION to {phone_number}")
    print(f"{'-'*50}")
    print(f"{message}")
    print(f"{'='*50}\n")
    logger.info(f"Mock SMS sent to {phone_number}: {message}")
