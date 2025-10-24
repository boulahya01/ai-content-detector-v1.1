from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import JSONResponse
from ..models.user import User
from ..utils.database import get_db
from ..utils.security import get_current_user
from sqlalchemy.orm import Session
import stripe
from ..utils.config import settings

# Initialize Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY

router = APIRouter(prefix="/api/subscriptions", tags=["subscriptions"])

SUBSCRIPTION_PRICES = {
    'basic': 'price_basic_monthly',  # Replace with actual Stripe price IDs
    'pro': 'price_pro_monthly',
    'enterprise': 'price_enterprise_monthly'
}

CREDIT_PACKAGES = {
    'small': 'price_20credits',
    'medium': 'price_100credits',
    'large': 'price_500credits'
}

@router.get("/status")
def get_subscription_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get the current user's subscription status."""
    try:
        # If the user has a Stripe subscription ID, fetch the details
        if current_user.stripe_subscription_id:
            subscription = stripe.Subscription.retrieve(current_user.stripe_subscription_id)
            return {
                "subscription": {
                    "tier": current_user.subscription_tier,
                    "status": subscription.status,
                    "current_period_end": datetime.fromtimestamp(subscription.current_period_end),
                    "cancel_at_period_end": subscription.cancel_at_period_end
                }
            }
        
        # Otherwise return the free tier details
        return {
            "subscription": {
                "tier": "free",
                "status": "active",
                "current_period_end": None,
                "cancel_at_period_end": False
            }
        }
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/create-checkout")
async def create_checkout_session(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a Stripe Checkout session for subscription or credit purchase."""
    try:
        data = await request.json()
        price_id = data.get('priceId')
        success_url = data.get('successUrl')
        cancel_url = data.get('cancelUrl')

        if not all([price_id, success_url, cancel_url]):
            raise HTTPException(status_code=400, detail="Missing required parameters")

        # Ensure the customer exists in Stripe
        if not current_user.stripe_customer_id:
            customer = stripe.Customer.create(
                email=current_user.email,
                metadata={'user_id': str(current_user.id)}
            )
            current_user.stripe_customer_id = customer.id
            db.commit()

        # Create the checkout session
        checkout_session = stripe.checkout.Session.create(
            customer=current_user.stripe_customer_id,
            payment_method_types=['card'],
            mode='subscription' if price_id in SUBSCRIPTION_PRICES.values() else 'payment',
            line_items=[{'price': price_id, 'quantity': 1}],
            success_url=success_url,
            cancel_url=cancel_url,
            metadata={
                'user_id': str(current_user.id)
            }
        )

        return JSONResponse({'sessionId': checkout_session.id})

    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/create-portal")
async def create_portal_session(
    request: Request,
    current_user: User = Depends(get_current_user)
):
    """Create a Stripe Customer Portal session."""
    try:
        data = await request.json()
        return_url = data.get('returnUrl')

        if not return_url:
            raise HTTPException(status_code=400, detail="Missing return URL")

        if not current_user.stripe_customer_id:
            raise HTTPException(status_code=400, detail="No subscription found")

        portal_session = stripe.billing_portal.Session.create(
            customer=current_user.stripe_customer_id,
            return_url=return_url
        )

        return JSONResponse({'url': portal_session.url})

    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/cancel")
async def cancel_subscription(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Cancel the current subscription at the end of the billing period."""
    try:
        if not current_user.stripe_subscription_id:
            raise HTTPException(status_code=400, detail="No active subscription")

        # Cancel the subscription at the end of the current period
        stripe.Subscription.modify(
            current_user.stripe_subscription_id,
            cancel_at_period_end=True
        )

        return {"status": "success", "message": "Subscription will be canceled at the end of the billing period"}

    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/prices")
def get_subscription_prices():
    """Get all subscription prices."""
    try:
        prices = stripe.Price.list(
            lookup_keys=list(SUBSCRIPTION_PRICES.values()),
            active=True
        )

        return {
            "prices": [
                {
                    "id": price.id,
                    "lookup_key": price.lookup_key,
                    "unit_amount": price.unit_amount,
                    "currency": price.currency,
                    "recurring": price.recurring
                }
                for price in prices.data
            ]
        }

    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
