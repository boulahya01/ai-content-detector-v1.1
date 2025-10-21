from apscheduler.schedulers.background import BackgroundScheduler
from sqlalchemy.orm import Session
from app.models.user import User
from app.utils.database import SessionLocal
from datetime import datetime, UTC
import logging

logger = logging.getLogger(__name__)
scheduler = BackgroundScheduler()


def refresh_monthly_balances():
    db: Session = SessionLocal()
    try:
        users = db.query(User).all()
        for user in users:
            # Only refresh if next_refresh_date is due or missing
            now = datetime.now(UTC)
            if not user.next_refresh_date or user.next_refresh_date <= now:
                # Use monthly_refresh_amount for refresh
                user.monthly_balance = user.monthly_refresh_amount
                user.next_refresh_date = now.replace(hour=0, minute=0, second=0, microsecond=0) + timedelta(days=30)
                user.last_refresh_date = now
                logger.info(f"Refreshed monthly balance for user {user.email}")
        db.commit()
    except Exception as e:
        logger.error(f"Error refreshing monthly balances: {e}")
    finally:
        db.close()


def start_scheduler():
    # Run job every day at midnight UTC, but only refresh if due
    scheduler.add_job(refresh_monthly_balances, 'cron', hour=0, minute=0)
    scheduler.start()
    logger.info("Balance scheduler started.")
