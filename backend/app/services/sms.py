import logging
import os
from dotenv import load_dotenv
from twilio.rest import Client
from twilio.base.exceptions import TwilioRestException

load_dotenv()

logger = logging.getLogger(__name__)

# Load Twilio credentials from environment
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER")

# Initialize Twilio client only if credentials are provided
twilio_client = None
if TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN and TWILIO_PHONE_NUMBER:
    try:
        twilio_client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
        logger.info("Twilio client initialized successfully.")
    except Exception as e:
        logger.error(f"Failed to initialize Twilio client: {e}")

def send_sms(phone_number: str, message: str):
    """
    Sends an SMS via Twilio if configured, otherwise falls back to a mock console print.
    """
    # Prepend the system name so patients know who it's from
    formatted_message = f"[6ty7ers Clinic] {message}"

    if twilio_client and TWILIO_PHONE_NUMBER:
        try:
            msg = twilio_client.messages.create(
                body=formatted_message,
                from_=TWILIO_PHONE_NUMBER,
                to=phone_number
            )
            logger.info(f"Twilio SMS sent successfully to {phone_number}. SID: {msg.sid}")
            return msg.sid
        except TwilioRestException as e:
            logger.error(f"Twilio Error: Failed to send SMS to {phone_number}: {e}")
            # Fall through to mock output so we can at least see it in the console
    
    # Fallback / Mock Behavior
    print(f"\n{'='*50}")
    print(f"SMS NOTIFICATION to {phone_number} (MOCK / FALLBACK)")
    print(f"{'-'*50}")
    print(f"{message}")
    print(f"{'='*50}\n")
    logger.info(f"Mock SMS sent to {phone_number}: {message}")
    return None
