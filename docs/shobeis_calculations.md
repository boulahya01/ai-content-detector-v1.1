# Shobeis Calculations and Examples

## Basic Formulas

1. Analysis Cost
```python
def calculate_analysis_cost(words: int, plan: str) -> int:
    base_cost = 100  # Shobeis per 500 words
    discount = {
        'free': 0,
        'basic': 0.20,
        'pro': 0.40,
        'enterprise': 0.50
    }.get(plan, 0)
    
    chunks = math.ceil(words / 500)
    total = base_cost * chunks
    discounted = total * (1 - discount)
    return math.ceil(discounted)
```

2. Batch Upload Cost
```python
def calculate_batch_cost(files: list, plan: str) -> int:
    base_per_file = 50  # Base Shobeis per file
    total_words = sum(file.word_count for file in files)
    analysis_cost = calculate_analysis_cost(total_words, plan)
    
    # Batch discount for 10+ files
    batch_discount = 0.10 if len(files) >= 10 else 0
    total = (base_per_file * len(files)) + analysis_cost
    final = total * (1 - batch_discount)
    return math.ceil(final)
```

3. Monthly Rollover
```python
def calculate_rollover(balance: int, plan: str) -> int:
    rollover_percent = {
        'free': 0,
        'basic': 0.25,
        'pro': 0.50,
        'enterprise': 0.75
    }.get(plan, 0)
    
    return math.floor(balance * rollover_percent)
```

## Example Scenarios

1. Single Analysis (2000 words, Basic plan)
```
Base cost = 100 * ceil(2000/500) = 100 * 4 = 400 Shobeis
Discount = 20%
Final cost = 400 * (1 - 0.20) = 320 Shobeis
```

2. Batch Upload (5 files, 1000 words each, Pro plan)
```
Base file cost = 50 * 5 = 250 Shobeis
Analysis cost = (100 * ceil(5000/500)) * (1 - 0.40)
              = (100 * 10) * 0.6
              = 1000 * 0.6
              = 600 Shobeis
Total = 250 + 600 = 850 Shobeis
```

3. API Burst Pricing (150 calls/hour, Basic plan)
```
First 100 calls = 100 * 20 = 2000 Shobeis
Next 50 calls = 50 * 15 = 750 Shobeis
Total = 2750 Shobeis
```

4. Monthly Refresh (Pro plan)
```
Previous balance = 5000 Shobeis
Rollover = 5000 * 0.50 = 2500 Shobeis
New allocation = 25000 Shobeis
New balance = 2500 + 25000 = 27500 Shobeis
```

## Edge Cases

1. Insufficient Balance
```python
if user.balance < required_cost:
    raise InsufficientShobeisError(
        f"Required: {required_cost}, Available: {user.balance}"
    )
```

2. Minimum Transaction
```python
MIN_TRANSACTION = 1
if calculated_cost < MIN_TRANSACTION:
    calculated_cost = MIN_TRANSACTION
```

3. Maximum Rollover
```python
def apply_rollover_cap(rollover: int, plan: str) -> int:
    max_months = {
        'basic': 1,
        'pro': 2,
        'enterprise': 3
    }.get(plan, 0)
    
    monthly_allocation = get_monthly_allocation(plan)
    max_rollover = monthly_allocation * max_months
    return min(rollover, max_rollover)
```

4. Refunds
```python
def process_refund(transaction_id: str) -> dict:
    transaction = get_transaction(transaction_id)
    if (datetime.now() - transaction.created_at).days > 30:
        raise RefundError("Refunds only allowed within 30 days")
    
    refund_amount = transaction.amount
    user.balance += refund_amount
    
    return create_transaction(
        user_id=transaction.user_id,
        amount=refund_amount,
        type="REFUND",
        reference_id=transaction_id
    )
```