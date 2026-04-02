/**
 * Copyright (c) 2026 Velocity BPA
 * Licensed under the Business Source License 1.1
 */

import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { Berachain } from '../nodes/Berachain/Berachain.node';

// Mock n8n-workflow
jest.mock('n8n-workflow', () => ({
  ...jest.requireActual('n8n-workflow'),
  NodeApiError: class NodeApiError extends Error {
    constructor(node: any, error: any) { super(error.message || 'API Error'); }
  },
  NodeOperationError: class NodeOperationError extends Error {
    constructor(node: any, message: string) { super(message); }
  },
}));

describe('Berachain Node', () => {
  let node: Berachain;

  beforeAll(() => {
    node = new Berachain();
  });

  describe('Node Definition', () => {
    it('should have correct basic properties', () => {
      expect(node.description.displayName).toBe('Berachain');
      expect(node.description.name).toBe('berachain');
      expect(node.description.version).toBe(1);
      expect(node.description.inputs).toContain('main');
      expect(node.description.outputs).toContain('main');
    });

    it('should define 5 resources', () => {
      const resourceProp = node.description.properties.find(
        (p: any) => p.name === 'resource'
      );
      expect(resourceProp).toBeDefined();
      expect(resourceProp!.type).toBe('options');
      expect(resourceProp!.options).toHaveLength(5);
    });

    it('should have operation dropdowns for each resource', () => {
      const operations = node.description.properties.filter(
        (p: any) => p.name === 'operation'
      );
      expect(operations.length).toBe(5);
    });

    it('should require credentials', () => {
      expect(node.description.credentials).toBeDefined();
      expect(node.description.credentials!.length).toBeGreaterThan(0);
      expect(node.description.credentials![0].required).toBe(true);
    });

    it('should have parameters with proper displayOptions', () => {
      const params = node.description.properties.filter(
        (p: any) => p.displayOptions?.show?.resource
      );
      for (const param of params) {
        expect(param.displayOptions.show.resource).toBeDefined();
        expect(Array.isArray(param.displayOptions.show.resource)).toBe(true);
      }
    });
  });

  // Resource-specific tests
describe('Validators Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({ 
        apiKey: 'test-key', 
        baseUrl: 'https://api.berachain.com/v1' 
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: { 
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn() 
      },
    };
  });

  it('should get validators successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getValidators')
      .mockReturnValueOnce('active')
      .mockReturnValueOnce(1)
      .mockReturnValueOnce(10);

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({ validators: [] });

    const result = await executeValidatorsOperations.call(mockExecuteFunctions, [{ json: {} }]);
    
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith(expect.objectContaining({
      method: 'GET',
      url: 'https://api.berachain.com/v1/validators'
    }));
    expect(result).toEqual([{ json: { validators: [] }, pairedItem: { item: 0 } }]);
  });

  it('should get specific validator successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getValidator')
      .mockReturnValueOnce('validator123');

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({ address: 'validator123' });

    const result = await executeValidatorsOperations.call(mockExecuteFunctions, [{ json: {} }]);
    
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith(expect.objectContaining({
      method: 'GET',
      url: 'https://api.berachain.com/v1/validators/validator123'
    }));
    expect(result).toEqual([{ json: { address: 'validator123' }, pairedItem: { item: 0 } }]);
  });

  it('should create validator successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('createValidator')
      .mockReturnValueOnce('operator123')
      .mockReturnValueOnce('consensus_key')
      .mockReturnValueOnce(0.1);

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({ success: true });

    const result = await executeValidatorsOperations.call(mockExecuteFunctions, [{ json: {} }]);
    
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith(expect.objectContaining({
      method: 'POST',
      url: 'https://api.berachain.com/v1/validators',
      body: { operatorAddress: 'operator123', consensusKey: 'consensus_key', commission: 0.1 }
    }));
    expect(result).toEqual([{ json: { success: true }, pairedItem: { item: 0 } }]);
  });

  it('should handle errors gracefully', async () => {
    mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('getValidators');
    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));
    mockExecuteFunctions.continueOnFail.mockReturnValue(true);

    const result = await executeValidatorsOperations.call(mockExecuteFunctions, [{ json: {} }]);
    
    expect(result).toEqual([{ json: { error: 'API Error' }, pairedItem: { item: 0 } }]);
  });
});

describe('Governance Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({ 
        apiKey: 'test-key', 
        baseUrl: 'https://api.berachain.com/v1' 
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: { 
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn() 
      },
    };
  });

  it('should get governance proposals successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getProposals')
      .mockReturnValueOnce('active')
      .mockReturnValueOnce(1)
      .mockReturnValueOnce(20);

    const mockResponse = { proposals: [{ id: '1', title: 'Test Proposal' }] };
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeGovernanceOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toEqual([{
      json: mockResponse,
      pairedItem: { item: 0 }
    }]);
  });

  it('should get specific proposal successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getProposal')
      .mockReturnValueOnce('1');

    const mockResponse = { id: '1', title: 'Test Proposal', status: 'active' };
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeGovernanceOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toEqual([{
      json: mockResponse,
      pairedItem: { item: 0 }
    }]);
  });

  it('should create proposal successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('createProposal')
      .mockReturnValueOnce('Test Proposal')
      .mockReturnValueOnce('Test Description')
      .mockReturnValueOnce('text')
      .mockReturnValueOnce('1000000');

    const mockResponse = { id: '2', title: 'Test Proposal', status: 'pending' };
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeGovernanceOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toEqual([{
      json: mockResponse,
      pairedItem: { item: 0 }
    }]);
  });

  it('should vote on proposal successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('voteProposal')
      .mockReturnValueOnce('1')
      .mockReturnValueOnce('yes')
      .mockReturnValueOnce('1.0');

    const mockResponse = { success: true, vote_id: 'vote_123' };
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeGovernanceOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toEqual([{
      json: mockResponse,
      pairedItem: { item: 0 }
    }]);
  });

  it('should get proposal votes successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getProposalVotes')
      .mockReturnValueOnce('1')
      .mockReturnValueOnce(1)
      .mockReturnValueOnce(20);

    const mockResponse = { votes: [{ voter: 'addr1', option: 'yes' }] };
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeGovernanceOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toEqual([{
      json: mockResponse,
      pairedItem: { item: 0 }
    }]);
  });

  it('should get BGT delegations successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getBgtDelegations')
      .mockReturnValueOnce('delegator_addr')
      .mockReturnValueOnce('validator_addr');

    const mockResponse = { delegations: [{ amount: '1000', validator: 'validator_addr' }] };
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeGovernanceOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toEqual([{
      json: mockResponse,
      pairedItem: { item: 0 }
    }]);
  });

  it('should handle API errors gracefully when continueOnFail is true', async () => {
    mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('getProposals');
    mockExecuteFunctions.continueOnFail.mockReturnValue(true);
    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));

    const result = await executeGovernanceOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toEqual([{
      json: { error: 'API Error' },
      pairedItem: { item: 0 }
    }]);
  });

  it('should throw error when continueOnFail is false', async () => {
    mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('getProposals');
    mockExecuteFunctions.continueOnFail.mockReturnValue(false);
    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));

    await expect(executeGovernanceOperations.call(mockExecuteFunctions, [{ json: {} }]))
      .rejects.toThrow('API Error');
  });
});

describe('HoneyStablecoin Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({ 
        apiKey: 'test-key', 
        baseUrl: 'https://api.berachain.com/v1' 
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: { 
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn() 
      },
    };
  });

  it('should get HONEY supply successfully', async () => {
    mockExecuteFunctions.getNodeParameter.mockReturnValue('getHoneySupply');
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
      totalSupply: '1000000',
      circulatingSupply: '900000',
    });

    const result = await executeHoneyStablecoinOperations.call(
      mockExecuteFunctions,
      [{ json: {} }],
    );

    expect(result).toHaveLength(1);
    expect(result[0].json.totalSupply).toBe('1000000');
  });

  it('should handle getHoneySupply error', async () => {
    mockExecuteFunctions.getNodeParameter.mockReturnValue('getHoneySupply');
    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));
    mockExecuteFunctions.continueOnFail.mockReturnValue(true);

    const result = await executeHoneyStablecoinOperations.call(
      mockExecuteFunctions,
      [{ json: {} }],
    );

    expect(result).toHaveLength(1);
    expect(result[0].json.error).toBe('API Error');
  });

  it('should get collateral info successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getCollateralInfo')
      .mockReturnValueOnce('WETH');
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
      asset: 'WETH',
      collateralRatio: '150%',
      totalCollateral: '500000',
    });

    const result = await executeHoneyStablecoinOperations.call(
      mockExecuteFunctions,
      [{ json: {} }],
    );

    expect(result).toHaveLength(1);
    expect(result[0].json.asset).toBe('WETH');
  });

  it('should mint HONEY successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('mintHoney')
      .mockReturnValueOnce('1000')
      .mockReturnValueOnce('WETH')
      .mockReturnValueOnce('2000');
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
      txHash: '0x123...',
      amount: '1000',
      status: 'pending',
    });

    const result = await executeHoneyStablecoinOperations.call(
      mockExecuteFunctions,
      [{ json: {} }],
    );

    expect(result).toHaveLength(1);
    expect(result[0].json.amount).toBe('1000');
  });

  it('should burn HONEY successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('burnHoney')
      .mockReturnValueOnce('500')
      .mockReturnValueOnce('0x456...');
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
      txHash: '0x789...',
      amount: '500',
      status: 'confirmed',
    });

    const result = await executeHoneyStablecoinOperations.call(
      mockExecuteFunctions,
      [{ json: {} }],
    );

    expect(result).toHaveLength(1);
    expect(result[0].json.amount).toBe('500');
  });

  it('should get stability metrics successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getStabilityMetrics')
      .mockReturnValueOnce('24h');
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
      peg: '0.998',
      volatility: '0.02%',
      timeframe: '24h',
    });

    const result = await executeHoneyStablecoinOperations.call(
      mockExecuteFunctions,
      [{ json: {} }],
    );

    expect(result).toHaveLength(1);
    expect(result[0].json.peg).toBe('0.998');
  });

  it('should get HONEY positions successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getHoneyPositions')
      .mockReturnValueOnce('0xabc...')
      .mockReturnValueOnce(1)
      .mockReturnValueOnce(50);
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
      positions: [{ id: '1', balance: '1000' }],
      total: 1,
      page: 1,
    });

    const result = await executeHoneyStablecoinOperations.call(
      mockExecuteFunctions,
      [{ json: {} }],
    );

    expect(result).toHaveLength(1);
    expect(result[0].json.positions).toHaveLength(1);
  });

  it('should throw error for unknown operation', async () => {
    mockExecuteFunctions.getNodeParameter.mockReturnValue('unknownOperation');

    await expect(
      executeHoneyStablecoinOperations.call(mockExecuteFunctions, [{ json: {} }]),
    ).rejects.toThrow('Unknown operation: unknownOperation');
  });
});

describe('Defi Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({ 
        apiKey: 'test-key', 
        baseUrl: 'https://api.berachain.com/v1' 
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: { 
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn() 
      },
    };
  });

  describe('getPools operation', () => {
    it('should get pools successfully', async () => {
      const mockResponse = { pools: [{ id: 'pool1', name: 'Test Pool' }] };
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getPools')
        .mockReturnValueOnce('uniswap')
        .mockReturnValueOnce('ETH')
        .mockReturnValueOnce(1)
        .mockReturnValueOnce(20);
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeDefiOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: expect.stringContaining('/defi/pools'),
        })
      );
    });

    it('should handle errors gracefully', async () => {
      mockExecuteFunctions.getNodeParameter.mockReturnValue('getPools');
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);

      const result = await executeDefiOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result[0].json.error).toBe('API Error');
    });
  });

  describe('getPool operation', () => {
    it('should get specific pool successfully', async () => {
      const mockResponse = { id: 'pool1', name: 'Test Pool' };
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getPool')
        .mockReturnValueOnce('pool1');
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeDefiOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
    });
  });

  describe('addLiquidity operation', () => {
    it('should add liquidity successfully', async () => {
      const mockResponse = { txHash: '0x123', status: 'pending' };
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('addLiquidity')
        .mockReturnValueOnce('pool1')
        .mockReturnValueOnce('0xTokenA')
        .mockReturnValueOnce('0xTokenB')
        .mockReturnValueOnce('1000')
        .mockReturnValueOnce('1000');
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeDefiOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: expect.stringContaining('/defi/pools/add-liquidity'),
        })
      );
    });
  });

  describe('executeSwap operation', () => {
    it('should execute swap successfully', async () => {
      const mockResponse = { txHash: '0x456', amountOut: '950' };
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('executeSwap')
        .mockReturnValueOnce('0xTokenIn')
        .mockReturnValueOnce('0xTokenOut')
        .mockReturnValueOnce('1000')
        .mockReturnValueOnce(0.5);
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeDefiOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result[0].json).toEqual(mockResponse);
    });
  });

  describe('getDefiPositions operation', () => {
    it('should get positions successfully', async () => {
      const mockResponse = { positions: [{ poolId: 'pool1', amount: '500' }] };
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getDefiPositions')
        .mockReturnValueOnce('0x123...abc')
        .mockReturnValueOnce('uniswap')
        .mockReturnValueOnce(1)
        .mockReturnValueOnce(20);
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeDefiOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result[0].json).toEqual(mockResponse);
    });
  });
});

describe('Automation Resource', () => {
	let mockExecuteFunctions: any;

	beforeEach(() => {
		mockExecuteFunctions = {
			getNodeParameter: jest.fn(),
			getCredentials: jest.fn().mockResolvedValue({
				apiKey: 'test-api-key',
				baseUrl: 'https://api.berachain.com/v1',
			}),
			getInputData: jest.fn().mockReturnValue([{ json: {} }]),
			getNode: jest.fn().mockReturnValue({ name: 'Test Berachain Node' }),
			continueOnFail: jest.fn().mockReturnValue(false),
			helpers: {
				httpRequest: jest.fn(),
				requestWithAuthentication: jest.fn(),
			},
		};
	});

	test('getStrategies operation should make correct API call', async () => {
		mockExecuteFunctions.getNodeParameter
			.mockReturnValueOnce('getStrategies')
			.mockReturnValueOnce('dca')
			.mockReturnValueOnce('active')
			.mockReturnValueOnce(1)
			.mockReturnValueOnce(50);

		const mockResponse = {
			strategies: [
				{ id: 'strategy-1', type: 'dca', status: 'active' },
			],
			pagination: { page: 1, limit: 50, total: 1 },
		};

		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

		const result = await executeAutomationOperations.call(mockExecuteFunctions, [{ json: {} }]);

		expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
			method: 'GET',
			url: 'https://api.berachain.com/v1/automation/strategies?page=1&limit=50&type=dca&status=active',
			headers: {
				'Authorization': 'Bearer test-api-key',
				'Content-Type': 'application/json',
			},
			json: true,
		});
		expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
	});

	test('createStrategy operation should make correct API call', async () => {
		mockExecuteFunctions.getNodeParameter
			.mockReturnValueOnce('createStrategy')
			.mockReturnValueOnce('dca')
			.mockReturnValueOnce('[{"type": "price", "value": 1000}]')
			.mockReturnValueOnce('[{"type": "buy", "amount": 100}]')
			.mockReturnValueOnce('{"interval": "daily"}');

		const mockResponse = {
			id: 'new-strategy-id',
			type: 'dca',
			status: 'active',
		};

		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

		const result = await executeAutomationOperations.call(mockExecuteFunctions, [{ json: {} }]);

		expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
			method: 'POST',
			url: 'https://api.berachain.com/v1/automation/strategies',
			headers: {
				'Authorization': 'Bearer test-api-key',
				'Content-Type': 'application/json',
			},
			body: {
				type: 'dca',
				triggers: [{ type: 'price', value: 1000 }],
				actions: [{ type: 'buy', amount: 100 }],
				parameters: { interval: 'daily' },
			},
			json: true,
		});
		expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
	});

	test('should handle API errors correctly', async () => {
		mockExecuteFunctions.getNodeParameter.mockReturnValue('getStrategies');
		mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));
		mockExecuteFunctions.continueOnFail.mockReturnValue(true);

		const result = await executeAutomationOperations.call(mockExecuteFunctions, [{ json: {} }]);

		expect(result).toEqual([{ json: { error: 'API Error' }, pairedItem: { item: 0 } }]);
	});

	test('deleteStrategy operation should make correct API call', async () => {
		mockExecuteFunctions.getNodeParameter
			.mockReturnValueOnce('deleteStrategy')
			.mockReturnValueOnce('strategy-123');

		const mockResponse = { success: true };
		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

		const result = await executeAutomationOperations.call(mockExecuteFunctions, [{ json: {} }]);

		expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
			method: 'DELETE',
			url: 'https://api.berachain.com/v1/automation/strategies/strategy-123',
			headers: {
				'Authorization': 'Bearer test-api-key',
				'Content-Type': 'application/json',
			},
			json: true,
		});
		expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
	});

	test('getExecutions operation should make correct API call', async () => {
		mockExecuteFunctions.getNodeParameter
			.mockReturnValueOnce('getExecutions')
			.mockReturnValueOnce('strategy-123')
			.mockReturnValueOnce('completed')
			.mockReturnValueOnce(1)
			.mockReturnValueOnce(25);

		const mockResponse = {
			executions: [
				{ id: 'exec-1', strategyId: 'strategy-123', status: 'completed' },
			],
			pagination: { page: 1, limit: 25, total: 1 },
		};

		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

		const result = await executeAutomationOperations.call(mockExecuteFunctions, [{ json: {} }]);

		expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
			method: 'GET',
			url: 'https://api.berachain.com/v1/automation/executions?page=1&limit=25&strategyId=strategy-123&status=completed',
			headers: {
				'Authorization': 'Bearer test-api-key',
				'Content-Type': 'application/json',
			},
			json: true,
		});
		expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
	});
});
});
