from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr

router = APIRouter()

class ContactForm(BaseModel):
    name: str
    email: EmailStr
    message: str

@router.post("/contact")
async def contact_form(form: ContactForm):
    try:
        # Here you would typically:
        # 1. Save to database
        # 2. Send email notification
        # 3. Maybe create a support ticket
        
        # For now, we'll just simulate success
        return {"status": "success", "message": "Contact form submitted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))