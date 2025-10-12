from sqlalchemy import create_engine, MetaData, Table, Column, Boolean
from app.utils.database import DATABASE_URL

def remove_email_verified_column():
    # Create engine
    engine = create_engine(DATABASE_URL)
    
    try:
        # Get MetaData
        metadata = MetaData()
        
        # Reflect the users table
        users = Table('users', metadata, autoload_with=engine)
        
        # Check if email_verified column exists
        if 'email_verified' in users.columns:
            # Create a new connection
            with engine.begin() as conn:
                # Drop the email_verified column
                conn.execute('ALTER TABLE users DROP COLUMN email_verified')
                conn.execute('ALTER TABLE users DROP COLUMN email_verified_at')
                print("Successfully removed email_verified columns")
        else:
            print("email_verified column does not exist")
            
    except Exception as e:
        print(f"Error updating database: {e}")

if __name__ == "__main__":
    remove_email_verified_column()