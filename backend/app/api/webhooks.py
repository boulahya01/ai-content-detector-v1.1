from fastapi import APIRouter, Depends, HTTPException, Request, Response
from sqlalchemy.orm import Session
from app.utils.database import get_db
from app.models.user import User
from app.models.shobeis_transaction import ShobeisTransaction, TransactionType
from app.utils.config import settings
from typing import Dict, Any
import hmac
import hashlib
import json
import stripe

router = APIRouter(prefix="/api/webhooks", tags=["webhooks"])

async def verify_stripe_signature(request: Request) -> Dict[str, Any]:
    """Verify Stripe webhook signature"""
    payload = await request.body()
    sig_header = request.headers.get('stripe-signature')
    
    try:
        event = stripe.Webhook.construct_event(
            payload,
            sig_header,
            settings.STRIPE_WEBHOOK_SECRET
        )
        return event
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")

async def process_payment_succeeded(event_data: Dict[str, Any], db: Session):
    """Handle successful payment webhook"""
    try:
        # Get user from metadata
        user_id = event_data.metadata.get('user_id')
        if not user_id:
            raise ValueError("No user_id in payment metadata")
            
        user = db.query(User).filter_by(id=user_id).with_for_update().first()
        if not user:
            raise ValueError(f"User not found: {user_id}")
            
        # Get Shobeis amount from metadata
        shobeis_amount = int(event_data.metadata.get('shobeis_amount', 0))
        if not shobeis_amount:
            raise ValueError("No Shobeis amount specified")
        
        # Create transaction
        transaction = ShobeisTransaction.create(
            db=db,
            user=user,
            amount=shobeis_amount,
            transaction_type=TransactionType.PURCHASE,
            meta={
                'payment_intent_id': event_data.id,
                'amount_paid': event_data.amount,
                'currency': event_data.currency,
                'payment_method': event_data.payment_method
            }
        )
        
        db.commit()
        return transaction.to_dict()
        
    except Exception as e:
        db.rollback()
        raise ValueError(f"Error processing payment: {str(e)}")

async def process_subscription_change(event_data: Dict[str, Any], db: Session):
    """Handle subscription created/updated webhook"""
    try:
        user_id = event_data.metadata.get('user_id')
        new_plan = event_data.metadata.get('plan')
        
        if not user_id or not new_plan:
            raise ValueError("Missing user_id or plan in metadata")
            
        user = db.query(User).filter_by(id=user_id).with_for_update().first()
        if not user:
            raise ValueError(f"User not found: {user_id}")
            
        old_plan = user.subscription_tier
        user.subscription_tier = new_plan
        
        # Add signup bonus for new subscriptions
        if event_data.status == 'trialing' or event_data.status == 'active':
            bonus_amounts = {
                'basic': 100,
                'pro': 300,
                'enterprise': 500
            }
            
            if bonus := bonus_amounts.get(new_plan):
                transaction = ShobeisTransaction.create(
                    db=db,
                    user=user,
                    amount=bonus,
                    transaction_type=TransactionType.SIGNUP_BONUS,
                    meta={
                        'subscription_id': event_data.id,
                        'old_plan': old_plan,
                        'new_plan': new_plan
                    }
                )
        
        # Record plan change
        transaction = ShobeisTransaction.create(
            db=db,
            user=user,
            amount=0,
            transaction_type=TransactionType.PLAN_CHANGE,
            meta={
                'subscription_id': event_data.id,
                'old_plan': old_plan,
                'new_plan': new_plan,
                'status': event_data.status
            }
        )
        
        db.commit()
        return transaction.to_dict()
        
    except Exception as e:
        db.rollback()
        raise ValueError(f"Error processing subscription: {str(e)}")

async def process_refund(event_data: Dict[str, Any], db: Session):
    """Handle refund webhook"""
    try:
        payment_intent_id = event_data.payment_intent
        transaction = db.query(ShobeisTransaction)\
                       .filter(
                           ShobeisTransaction.meta['payment_intent_id'].astext == payment_intent_id
                       ).first()
                       
        if transaction and not transaction.is_refunded:
            refund_tx = transaction.refund(
                db,
                f"Payment refunded: {event_data.reason or 'No reason provided'}"
            )
            db.commit()
            return refund_tx.to_dict()
            
        return {"status": "ignored", "reason": "Transaction not found or already refunded"}
        
    except Exception as e:
        db.rollback()
        raise ValueError(f"Error processing refund: {str(e)}")

@router.post("/stripe")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    """Handle Stripe webhook events"""
    event = await verify_stripe_signature(request)
    event_data = event.data.object
    
    try:
        if event.type == "payment_intent.succeeded":
            result = await process_payment_succeeded(event_data, db)
            
        elif event.type == "customer.subscription.created" or \
             event.type == "customer.subscription.updated":
            result = await process_subscription_change(event_data, db)
            
        elif event.type == "charge.refunded":
            result = await process_refund(event_data, db)
            
        else:
            # Acknowledge but ignore other event types
            return {"status": "ignored", "type": event.type}
            
        return {"status": "success", "result": result}
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")