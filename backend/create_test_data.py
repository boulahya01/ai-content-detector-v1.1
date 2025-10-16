from datetime import datetime, timedelta
import random
from faker import Faker
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.user import User, UserRole
from app.models.analysis_result import AnalysisResult
from app.utils.database import Base, get_db_url
from app.utils.document_processor import DocumentProcessor
from app.utils.security import get_password_hash

# Initialize Faker
fake = Faker()

# Sample texts for analysis (mix of AI and human content)
SAMPLE_TEXTS = {
    "ai_content": [
        """The quantum realm represents a fascinating frontier in modern physics. Quantum entanglement, superposition, and wave-particle duality challenge our classical understanding of reality. These phenomena, while counter-intuitive, form the foundation of quantum computing and cryptography.""",
        """Climate change poses significant challenges to global ecosystems. Rising temperatures, ocean acidification, and extreme weather events impact biodiversity. Mitigation strategies require international cooperation and technological innovation to reduce greenhouse gas emissions.""",
        """Artificial intelligence continues to evolve rapidly, transforming various industries. Machine learning algorithms process vast amounts of data to identify patterns and make predictions. Neural networks simulate human cognitive processes, enabling complex decision-making capabilities."""
    ],
    "human_content": [
        """Last weekend, I went hiking with my friends in the mountains. The weather was perfect - sunny but not too hot. We found this amazing hidden waterfall and had lunch there. Sarah almost fell into the stream trying to take a selfie!""",
        """My grandmother's chocolate chip cookies are the best in the world. She never measures anything, just throws ingredients together by feel. The secret, she says, is using brown butter and letting the dough rest overnight.""",
        """The local coffee shop down my street has this quirky barista who remembers everyone's order. He once made me try his experimental lavender latte - it was weird but surprisingly good. Now it's become my regular order."""
    ]
}

def create_database():
    engine = create_engine(get_db_url())
    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)
    return engine

def create_test_users(session):
    users = []
    
    # Create admin user with full administrative access
    admin = User(
        email="admin@aidetector.com",
        password_hash=get_password_hash("Admin@123"),
        full_name="Admin User",
        role=UserRole.ADMIN,
        credits=9999,
        is_active=True,
        subscription_tier='enterprise',
        requests_count=100,
        credits_total=9999,
        credits_used=100,
        analysis_count=100
    )
    users.append(admin)

    # Create pro user with premium features
    pro = User(
        email="pro@example.com",
        password_hash=get_password_hash("Pro@123"),
        full_name=fake.name(),
        role=UserRole.PRO,
        credits=500,
        is_active=True,
        subscription_tier='pro',
        requests_count=50,
        credits_total=500,
        credits_used=50,
        analysis_count=50
    )
    users.append(pro)

    # Create free user with basic access
    free = User(
        email="free@example.com",
        password_hash=get_password_hash("Free@123"),
        full_name=fake.name(),
        role=UserRole.FREE,
        credits=5,
        is_active=True,
        subscription_tier='free',
        requests_count=3,
        credits_total=5,
        credits_used=3,
        analysis_count=3
    )
    users.append(free)

    session.add_all(users)
    session.commit()
    return users

def create_analysis_history(session, users):
    from app.models.analyzer import AIContentAnalyzer
    processor = AIContentAnalyzer()
    
    for user in users:
        # Number of analyses based on user role
        num_analyses = {
            "admin": 50,
            "pro": 30,
            "free": 10
        }.get(user.role.value, 10)
        
        for _ in range(num_analyses):
            # Randomly select content type and text
            is_ai = random.choice([True, False])
            text = random.choice(SAMPLE_TEXTS['ai_content' if is_ai else 'human_content'])
            
            # Add some random variations to make text unique
            if random.random() > 0.7:
                text = text + " " + fake.sentence()
            
            # Process the text through our actual detector
            result = processor.analyze_text(text)
            
            # Create analysis result
            analysis = AnalysisResult(
                user_id=user.id,
                content=text,
                ai_probability=result['analysisDetails']['aiProbability'] / 100.0,  # Convert from percentage to decimal
                length=len(text),
                language=result['languageInfo']['detected'] if 'languageInfo' in result else 'en',
                created_at=datetime.now() - timedelta(days=random.randint(0, 30),
                                                    hours=random.randint(0, 23),
                                                    minutes=random.randint(0, 59))
            )
            session.add(analysis)
            
            # Update user's analysis stats if we haven't hit the credit limit
            if user.credits_used < user.credits_total:
                user.credits_used += 1
                user.analysis_count += 1
                user.requests_count += 1
    
    session.commit()

def main():
    # Create fresh database
    engine = create_database()
    Session = sessionmaker(bind=engine)
    session = Session()
    
    try:
        # Create test users
        users = create_test_users(session)
        print("Created test users:")
        for user in users:
            print(f"- {user.role.value}: {user.email} (password: {user.role.value.capitalize()}@123)")
        
        # Create analysis history
        print("\nGenerating analysis history...")
        create_analysis_history(session, users)
        print("Analysis history created successfully!")
        
    except Exception as e:
        print(f"Error: {e}")
        session.rollback()
    finally:
        session.close()

if __name__ == "__main__":
    main()