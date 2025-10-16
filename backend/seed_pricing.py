"""
Seed pricing data for Shobeis system.
"""
import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.utils.database import SessionLocal
from sqlalchemy import text

def seed_pricing_data():
    db = SessionLocal()
    try:
        # Clear existing pricing data
        db.execute(text("DELETE FROM pricing_table"))
        
        # Insert base pricing
        pricing_data = [
            # Analysis pricing
            {
                'action_type': 'ANALYSIS_PER_500',
                'unit': 'WORDS',
                'base_shobeis': 100,  # 100 Shobeis per 500 words
                'min_charge': 50  # Minimum 50 Shobeis
            },
            # Upload pricing
            {
                'action_type': 'UPLOAD_FILE',
                'unit': 'FILE',
                'base_shobeis': 50,  # 50 Shobeis per file
                'min_charge': 50
            },
            # Export pricing
            {
                'action_type': 'EXPORT_PDF',
                'unit': 'FILE',
                'base_shobeis': 200,
                'min_charge': 200
            },
            {
                'action_type': 'EXPORT_CSV',
                'unit': 'FILE',
                'base_shobeis': 100,
                'min_charge': 100
            },
            # API pricing
            {
                'action_type': 'API_CALL',
                'unit': 'CALL',
                'base_shobeis': 20,
                'min_charge': 20
            },
            {
                'action_type': 'API_BURST',
                'unit': 'CALL',
                'base_shobeis': 15,  # Reduced rate for high volume
                'min_charge': 15
            }
        ]
        
        # Insert data
        for pricing in pricing_data:
            db.execute(
                text("""
                    INSERT INTO pricing_table 
                    (action_type, unit, base_shobeis, min_charge)
                    VALUES (:action_type, :unit, :base_shobeis, :min_charge)
                """),
                pricing
            )
        
        db.commit()
        print("Successfully seeded pricing data")
        
    except Exception as e:
        print(f"Error seeding pricing data: {str(e)}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_pricing_data()