import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/hooks/useToast';
import { apiKeyService, type ApiKey } from '@/services/apiKeys';
import { Loader2 } from 'lucide-react';

export default function ApiKeysPage() {
  const { toast } = useToast();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    const fetchApiKeys = async () => {
      try {
        const keys = await apiKeyService.list();
        setApiKeys(keys);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load API keys.',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchApiKeys();
  }, [toast]);

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      const newKey = await apiKeyService.create({ name: newKeyName });
      setApiKeys(prev => [...prev, newKey]);
      setShowCreateForm(false);
      setNewKeyName('');
      toast({
        title: 'API Key Created',
        description: 'Your new API key has been created successfully.'
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to create API key.',
        variant: 'destructive'
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteKey = async (id: string) => {
    try {
      await apiKeyService.delete(id);
      setApiKeys(prev => prev.filter(key => key.id !== id));
      toast({
        title: 'API Key Deleted',
        description: 'The API key has been deleted successfully.'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete API key.',
        variant: 'destructive'
      });
    }
  };

  const handleCopyKey = async (key: string) => {
    try {
      await navigator.clipboard.writeText(key);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (error) {
      console.error('Failed to copy key:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">API Keys</h1>
          <p className="mt-2 text-gray-600">
            Manage your API keys for programmatic access to the AI Content Detector
          </p>
        </div>
        <Button
          onClick={() => setShowCreateForm(true)}
          disabled={showCreateForm}
        >
          Create New Key
        </Button>
      </div>

      {showCreateForm && (
        <Card className="mb-8 p-6">
          <form onSubmit={handleCreateKey} className="space-y-4">
            <div>
              <label htmlFor="keyName" className="block text-sm font-medium text-gray-700">
                Key Name
              </label>
              <div className="mt-1 flex items-center gap-4">
                <Input
                  id="keyName"
                  type="text"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="e.g., Development, Production, Testing"
                  required
                  className="flex-1"
                />
                <Button type="submit" isLoading={isCreating}>
                  Create Key
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewKeyName('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </form>
        </Card>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  API Key
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Used
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {apiKeys.map((key) => (
                <tr key={key.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {key.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <code className="bg-gray-100 px-2 py-1 rounded">
                      {key.key}
                    </code>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(key.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {key.lastUsed ? formatDate(key.lastUsed) : 'Never'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyKey(key.key)}
                      >
                        {copiedKey === key.key ? 'Copied!' : 'Copy'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                        onClick={() => handleDeleteKey(key.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {apiKeys.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                    No API keys found. Create one to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">API Key Usage Guide</h2>
        <Card className="p-6 space-y-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Authentication</h3>
            <p className="mt-1 text-gray-600">
              Include your API key in the request headers:
            </p>
            <pre className="mt-2 p-4 bg-gray-800 text-gray-100 rounded-lg overflow-x-auto">
              {`curl -X POST https://api.aidetector.com/analyze \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"text": "Your text to analyze"}'`}
            </pre>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900">Rate Limits</h3>
            <p className="mt-1 text-gray-600">
              API keys are subject to rate limits based on your subscription plan:
            </p>
            <ul className="mt-2 list-disc list-inside text-gray-600">
              <li>Free: 100 requests/day</li>
              <li>Pro: 1,000 requests/day</li>
              <li>Enterprise: Custom limits</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900">Security</h3>
            <ul className="mt-2 list-disc list-inside text-gray-600">
              <li>Keep your API keys secure and never share them publicly</li>
              <li>Rotate keys regularly for enhanced security</li>
              <li>Use different keys for development and production environments</li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
}