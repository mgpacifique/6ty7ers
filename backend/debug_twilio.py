from app.services.sms import twilio_client, TWILIO_PHONE_NUMBER
from twilio.base.exceptions import TwilioRestException

phone = "+250790855780"
message = "Test message from 6ty7ers backend!"

if not twilio_client:
    print("Twilio client is not initialized. Check your .env file credentials.")
else:
    print(f"Attempting to send SMS from {TWILIO_PHONE_NUMBER} to {phone}...")
    try:
        msg = twilio_client.messages.create(
            body=message,
            from_=TWILIO_PHONE_NUMBER,
            to=phone
        )
        print(f"Success! Message SID: {msg.sid}")
    except TwilioRestException as e:
        print(f"TwilioRestException caught: {e}")
    except Exception as e:
        print(f"Other exception caught: {e}")
