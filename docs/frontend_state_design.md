# Frontend State Management for Shobeis

## Context Structure

```typescript
// Types
interface ShobeisState {
  balance: number;
  totalAllocated: number;
  rollover: number;
  lastAllocationAt: string;
  transactions: Transaction[];
  pricing: PricingTier[];
  isLoading: boolean;
  error: string | null;
}

interface Transaction {
  id: string;
  amount: number;
  actionType: string;
  description: string;
  createdAt: string;
  metadata: any;
}

interface PricingTier {
  actionType: string;
  baseCost: number;
  discountPercent: number;
  minQuantity: number;
}

// Context
const ShobeisContext = createContext<{
  state: ShobeisState;
  dispatch: React.Dispatch<ShobeisAction>;
}>({ state: initialState, dispatch: () => null });

// Actions
type ShobeisAction =
  | { type: 'SET_BALANCE'; payload: number }
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'SET_PRICING'; payload: PricingTier[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string };

// Custom Hook
function useShobeis() {
  const { state, dispatch } = useContext(ShobeisContext);
  
  const estimateCost = async (actionType: string, quantity: number) => {
    // Implementation
  };
  
  const charge = async (actionType: string, quantity: number, referenceId: string) => {
    // Implementation with optimistic update
  };
  
  const getBalance = async () => {
    // Implementation
  };
  
  return {
    balance: state.balance,
    transactions: state.transactions,
    pricing: state.pricing,
    isLoading: state.isLoading,
    error: state.error,
    estimateCost,
    charge,
    getBalance,
  };
}

// Caching Strategy
const cachingConfig = {
  balance: {
    staleTime: 60000, // 1 minute
    cacheTime: 300000, // 5 minutes
  },
  transactions: {
    staleTime: 300000, // 5 minutes
    cacheTime: 3600000, // 1 hour
  },
  pricing: {
    staleTime: 3600000, // 1 hour
    cacheTime: 86400000, // 24 hours
  },
};

// Optimistic Updates
function optimisticReducer(state: ShobeisState, action: ShobeisAction): ShobeisState {
  switch (action.type) {
    case 'ADD_TRANSACTION':
      return {
        ...state,
        balance: state.balance - action.payload.amount,
        transactions: [action.payload, ...state.transactions],
      };
    // Other cases...
  }
}
```

## Component Structure

```typescript
// Components
interface BalanceDisplayProps {
  showDetails?: boolean;
}

interface TransactionHistoryProps {
  limit?: number;
  filter?: string;
}

interface CostEstimatorProps {
  actionType: string;
  quantity: number;
}

// Usage Example
function AnalyzePage() {
  const { balance, estimateCost, charge } = useShobeis();
  const [wordCount, setWordCount] = useState(0);
  const [cost, setCost] = useState(0);
  
  useEffect(() => {
    const getCost = async () => {
      const estimate = await estimateCost('ANALYSIS', wordCount);
      setCost(estimate.final);
    };
    getCost();
  }, [wordCount]);
  
  return (
    <div>
      <BalanceDisplay showDetails />
      <CostEstimator actionType="ANALYSIS" quantity={wordCount} />
      <Button 
        disabled={balance < cost}
        onClick={() => charge('ANALYSIS', wordCount)}
      >
        Analyze Text
      </Button>
    </div>
  );
}