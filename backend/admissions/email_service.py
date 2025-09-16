"""
Email service for admission-related communications
"""
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings
from django.utils.html import strip_tags
import logging

logger = logging.getLogger(__name__)

def send_otp_email(email, otp, applicant_name=None):
    """
    Send OTP verification email to the applicant
    """
    try:
        subject = "Verify Your Email - Acharya School Admission"
        
        # HTML email content
        html_message = f"""
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center;">
                <h2 style="color: #2563eb; margin-bottom: 20px;">Email Verification Required</h2>
                <p style="color: #374151; font-size: 16px; margin-bottom: 20px;">
                    {'Hello ' + applicant_name + ',' if applicant_name else 'Hello,'}
                </p>
                <p style="color: #374151; font-size: 16px; margin-bottom: 20px;">
                    Thank you for starting your admission application with Acharya Schools. 
                    To continue, please verify your email address using the OTP below:
                </p>
                <div style="background-color: #white; padding: 20px; border: 2px solid #2563eb; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #2563eb; font-size: 32px; letter-spacing: 4px; margin: 0;">
                        {otp}
                    </h3>
                </div>
                <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
                    This OTP will expire in 10 minutes. If you didn't request this verification, 
                    please ignore this email.
                </p>
                <p style="color: #6b7280; font-size: 14px; margin-top: 10px;">
                    <strong>Note:</strong> Do not share this OTP with anyone.
                </p>
            </div>
        </body>
        </html>
        """
        
        # Plain text version
        plain_message = f"""
        Email Verification Required
        
        {'Hello ' + applicant_name + ',' if applicant_name else 'Hello,'}
        
        Thank you for starting your admission application with Acharya Schools. 
        To continue, please verify your email address using the OTP below:
        
        Your OTP: {otp}
        
        This OTP will expire in 10 minutes. If you didn't request this verification, 
        please ignore this email.
        
        Note: Do not share this OTP with anyone.
        """
        
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            html_message=html_message,
            fail_silently=False,
        )
        
        logger.info(f"OTP email sent successfully to {email}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send OTP email to {email}: {str(e)}")
        return False

def send_admission_confirmation_email(application):
    """
    Send confirmation email with reference ID and tracking link after successful submission
    """
    try:
        subject = f"Application Submitted Successfully - Reference #{application.reference_id}"
        
        # Get school preferences as a formatted string
        preferences = application.get_school_preferences()
        school_list = "<br>".join([f"{order} Choice: {school.school_name}" for order, school in preferences])
        
        # HTML email content
        html_message = f"""
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; border-left: 4px solid #2563eb;">
                <h2 style="color: #1e40af; margin-bottom: 20px;">Application Submitted Successfully! ✅</h2>
                
                <p style="color: #374151; font-size: 16px; margin-bottom: 15px;">
                    Dear {application.applicant_name},
                </p>
                
                <p style="color: #374151; font-size: 16px; margin-bottom: 20px;">
                    Thank you for submitting your admission application. Your application has been received and is under review.
                </p>
                
                <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
                    <h3 style="color: #2563eb; margin-bottom: 15px;">Application Details:</h3>
                    <p><strong>Reference ID:</strong> <span style="color: #2563eb; font-family: monospace; font-size: 18px;">{application.reference_id}</span></p>
                    <p><strong>Course Applied:</strong> {application.course_applied}</p>
                    <p><strong>School Preferences:</strong><br>{school_list}</p>
                    <p><strong>Application Date:</strong> {application.application_date.strftime('%B %d, %Y at %I:%M %p')}</p>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{settings.FRONTEND_URL}/track?ref={application.reference_id}" 
                       style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                        Track Your Application
                    </a>
                </div>
                
                <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
                    <strong>Important:</strong> Please save this reference ID for future tracking. 
                    You can check your application status anytime using the tracking link above.
                </p>
                
                <p style="color: #6b7280; font-size: 14px;">
                    We will notify you via email once your application is reviewed. 
                    If you have any questions, please contact our admissions office.
                </p>
            </div>
        </body>
        </html>
        """
        
        # Plain text version
        plain_message = f"""
        Application Submitted Successfully!
        
        Dear {application.applicant_name},
        
        Thank you for submitting your admission application. Your application has been received and is under review.
        
        Application Details:
        - Reference ID: {application.reference_id}
        - Course Applied: {application.course_applied}
        - Application Date: {application.application_date.strftime('%B %d, %Y at %I:%M %p')}
        
        School Preferences:
        {chr(10).join([f"{order} Choice: {school.school_name}" for order, school in preferences])}
        
        Track your application at: {settings.FRONTEND_URL}/track?ref={application.reference_id}
        
        Important: Please save this reference ID for future tracking. 
        You can check your application status anytime using the tracking link.
        
        We will notify you via email once your application is reviewed. 
        If you have any questions, please contact our admissions office.
        """
        
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[application.email],
            html_message=html_message,
            fail_silently=False,
        )
        
        logger.info(f"Confirmation email sent successfully to {application.email} for application {application.reference_id}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send confirmation email to {application.email}: {str(e)}")
        return False