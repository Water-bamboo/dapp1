import {
  STORAGE_KEYS,
  ERC20_ABI,
  NETWORKS,
  ETHERSCAN_API_URLS,
  GAS_CONFIG,
  UI_CONFIG,
  TokenStorage,
  TransactionStorage,
} from '@/config/constants';

describe('config/constants', () => {
  describe('STORAGE_KEYS', () => {
    it('should have correct storage keys', () => {
      expect(STORAGE_KEYS.TOKENS).toBe('firstdapp_tokens');
      expect(STORAGE_KEYS.TRANSACTIONS).toBe('firstdapp_transactions');
    });
  });

  describe('ERC20_ABI', () => {
    it('should contain standard ERC20 functions', () => {
      const functionNames = ERC20_ABI.map((item: any) => item.name);
      expect(functionNames).toContain('name');
      expect(functionNames).toContain('symbol');
      expect(functionNames).toContain('decimals');
      expect(functionNames).toContain('balanceOf');
    });

    it('should have correct balanceOf input', () => {
      const balanceOf = ERC20_ABI.find((item: any) => item.name === 'balanceOf');
      expect(balanceOf?.inputs).toHaveLength(1);
      expect(balanceOf?.inputs[0].name).toBe('_owner');
    });
  });

  describe('NETWORKS', () => {
    it('should contain Ethereum Mainnet', () => {
      expect(NETWORKS[1]).toEqual({
        name: 'Ethereum Mainnet',
        explorer: 'https://etherscan.io/tx/',
      });
    });

    it('should contain Sepolia testnet', () => {
      expect(NETWORKS[11155111]).toEqual({
        name: 'Sepolia',
        explorer: 'https://sepolia.etherscan.io/tx/',
      });
    });

    it('should contain Polygon', () => {
      expect(NETWORKS[137]).toEqual({
        name: 'Polygon',
        explorer: 'https://polygonscan.com/tx/',
      });
    });
  });

  describe('ETHERSCAN_API_URLS', () => {
    it('should have API URLs for supported networks', () => {
      expect(ETHERSCAN_API_URLS[1]).toBe('https://api.etherscan.io/api');
      expect(ETHERSCAN_API_URLS[5]).toBe('https://api-goerli.etherscan.io/api');
      expect(ETHERSCAN_API_URLS[11155111]).toBe('https://api-sepolia.etherscan.io/api');
    });
  });

  describe('GAS_CONFIG', () => {
    it('should have standard transfer gas limit', () => {
      expect(GAS_CONFIG.STANDARD_TRANSFER).toBe(21000);
    });
  });

  describe('UI_CONFIG', () => {
    it('should have correct UI configuration values', () => {
      expect(UI_CONFIG.ADDRESS_DISPLAY_LENGTH).toBe(6);
      expect(UI_CONFIG.BALANCE_DECIMALS).toBe(4);
      expect(UI_CONFIG.MAX_TRANSACTION_HISTORY).toBe(50);
    });
  });

  describe('TokenStorage', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('should save and retrieve tokens', () => {
      const token = {
        address: '0x1234567890123456789012345678901234567890',
        symbol: 'TEST',
        decimals: 18,
      };

      TokenStorage.save(token);
      const tokens = TokenStorage.getAll();

      expect(tokens).toHaveLength(1);
      expect(tokens[0].symbol).toBe('TEST');
      expect(tokens[0].address).toBe(token.address);
    });

    it('should check if token exists (case insensitive)', () => {
      const token = {
        address: '0x1234567890123456789012345678901234567890',
        symbol: 'TEST',
        decimals: 18,
      };

      TokenStorage.save(token);

      expect(TokenStorage.exists('0x1234567890123456789012345678901234567890')).toBe(true);
      expect(TokenStorage.exists('0x1234567890123456789012345678901234567890'.toUpperCase())).toBe(true);
      expect(TokenStorage.exists('0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')).toBe(false);
    });

    it('should remove tokens (case insensitive)', () => {
      const token = {
        address: '0x1234567890123456789012345678901234567890',
        symbol: 'TEST',
        decimals: 18,
      };

      TokenStorage.save(token);
      expect(TokenStorage.getAll()).toHaveLength(1);

      TokenStorage.remove('0x1234567890123456789012345678901234567890'.toUpperCase());
      expect(TokenStorage.getAll()).toHaveLength(0);
    });

    it('should add addedAt timestamp when saving', () => {
      const token = {
        address: '0x1234567890123456789012345678901234567890',
        symbol: 'TEST',
        decimals: 18,
      };

      TokenStorage.save(token);
      const tokens = TokenStorage.getAll();

      expect(tokens[0].addedAt).toBeDefined();
      expect(new Date(tokens[0].addedAt!).getTime()).not.toBeNaN();
    });
  });

  describe('TransactionStorage', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    const account = '0x1234567890123456789012345678901234567890';

    it('should add and retrieve transactions', () => {
      const tx = {
        hash: '0xabc',
        type: 'sent' as const,
        to: '0xdef',
        from: account,
        amount: '1.0',
        status: 'confirmed' as const,
        timestamp: Date.now(),
      };

      TransactionStorage.add(account, tx);
      const txs = TransactionStorage.getAll(account);

      expect(txs).toHaveLength(1);
      expect(txs[0].hash).toBe('0xabc');
    });

    it('should return empty array for null account', () => {
      expect(TransactionStorage.getAll(null)).toEqual([]);
    });

    it('should store transactions per account (case insensitive)', () => {
      const tx1 = {
        hash: '0xabc',
        type: 'sent' as const,
        to: '0xdef',
        from: account,
        amount: '1.0',
        status: 'confirmed' as const,
        timestamp: Date.now(),
      };

      const account2 = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
      const tx2 = {
        hash: '0xdef',
        type: 'received' as const,
        to: account2,
        from: '0xabc',
        amount: '2.0',
        status: 'confirmed' as const,
        timestamp: Date.now(),
      };

      TransactionStorage.add(account, tx1);
      TransactionStorage.add(account2, tx2);

      expect(TransactionStorage.getAll(account)).toHaveLength(1);
      expect(TransactionStorage.getAll(account2)).toHaveLength(1);
      expect(TransactionStorage.getAll(account.toUpperCase())).toHaveLength(1);
    });

    it('should update transactions', () => {
      const tx = {
        hash: '0xabc',
        type: 'sent' as const,
        to: '0xdef',
        from: account,
        amount: '1.0',
        status: 'pending' as const,
        timestamp: Date.now(),
      };

      TransactionStorage.add(account, tx);
      TransactionStorage.update(account, '0xabc', { status: 'confirmed' });

      const txs = TransactionStorage.getAll(account);
      expect(txs[0].status).toBe('confirmed');
    });

    it('should limit transaction history to MAX_TRANSACTION_HISTORY', () => {
      for (let i = 0; i < 55; i++) {
        const tx = {
          hash: `0x${i}`,
          type: 'sent' as const,
          to: '0xdef',
          from: account,
          amount: '1.0',
          status: 'confirmed' as const,
          timestamp: Date.now() + i,
        };
        TransactionStorage.add(account, tx);
      }

      const txs = TransactionStorage.getAll(account);
      expect(txs.length).toBeLessThanOrEqual(UI_CONFIG.MAX_TRANSACTION_HISTORY);
    });
  });
});
