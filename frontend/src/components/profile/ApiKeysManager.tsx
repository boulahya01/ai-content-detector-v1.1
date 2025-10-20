import { useState } from 'react';
import { toast } from 'sonner';
import { formStyles } from '@/components/auth/styles';
import { FiKey, FiTrash2, FiCopy, FiPlus } from 'react-icons/fi';
import { cn } from '@/lib/utils';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsed?: string;
}

export default function ApiKeysManager() {
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);

  const createApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(false);
    setIsLoading(true);

    try {
      // TODO: Implement API call
      const newKey = {
        id: Date.now().toString(),
        name: newKeyName,
        key: 'sk_test_' + Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString(),
      };
      setApiKeys([...apiKeys, newKey]);
      toast.success('API key created successfully');
      setNewKeyName('');
    } catch (error) {
      toast.error('Failed to create API key');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteApiKey = async (keyId: string) => {
    try {
      // TODO: Implement API call
      setApiKeys(apiKeys.filter(key => key.id !== keyId));
      toast.success('API key deleted successfully');
    } catch (error) {
      toast.error('Failed to delete API key');
    }
  };

  const copyApiKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success('API key copied to clipboard');
  };

  return (
    <div className="space-y-6">
      {/* API Keys List */}
      <div className="space-y-4">
        {apiKeys.map((key) => (
          <div
            key={key.id}
            className="flex items-center justify-between p-4 rounded-lg border border-white/10 bg-white/5"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-accent-500/20 flex items-center justify-center">
                <FiKey className="w-5 h-5 text-accent-300" />
              </div>
              <div>
                <h4 className="font-medium text-white/90">{key.name}</h4>
                <p className="text-sm text-white/60">
                  Created {new Date(key.createdAt).toLocaleDateString()}
                  {key.lastUsed && ` • Last used ${new Date(key.lastUsed).toLocaleDateString()}`}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => copyApiKey(key.key)}
                className="p-2 text-white/60 hover:text-white/90 transition-colors"
                title="Copy API key"
              >
                <FiCopy className="w-5 h-5" />
              </button>
              <button
                onClick={() => deleteApiKey(key.id)}
                className="p-2 text-white/60 hover:text-red-500 transition-colors"
                title="Delete API key"
              >
                <FiTrash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create New Key Form */}
      {isCreating ? (
        <form onSubmit={createApiKey} className="space-y-4">
          <div className="form-group">
            <input
              type="text"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              className={formStyles.input}
              placeholder="API Key Name"
              required
            />
          </div>
          <div className="flex space-x-2">
            <button
              type="submit"
              disabled={isLoading || !newKeyName}
              className={cn(
                formStyles.button,
                'flex-1'
              )}
              style={{ background: 'var(--accent-500)' }}
            >
              {isLoading ? 'Creating...' : 'Create API Key'}
            </button>
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-6 py-3 text-sm font-medium text-white/70 hover:text-white/90 transition-colors rounded-lg border border-white/10 hover:border-white/20"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-accent-300 hover:text-accent-200 transition-colors"
        >
          <FiPlus className="w-5 h-5" />
          <span>Create New API Key</span>
        </button>
      )}
    </div>
  );
}