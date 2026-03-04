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

    it('should define 4 resources', () => {
      const resourceProp = node.description.properties.find(
        (p: any) => p.name === 'resource'
      );
      expect(resourceProp).toBeDefined();
      expect(resourceProp!.type).toBe('options');
      expect(resourceProp!.options).toHaveLength(4);
    });

    it('should have operation dropdowns for each resource', () => {
      const operations = node.description.properties.filter(
        (p: any) => p.name === 'operation'
      );
      expect(operations.length).toBe(4);
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
describe('BgtGovernance Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-api-key',
        baseUrl: 'https://artio.api.berachain.com/v1',
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn(),
      },
    };
  });

  test('getValidators should return validators list', async () => {
    const mockValidators = {
      validators: [
        { address: '0x123', name: 'Validator 1', status: 'active' },
        { address: '0x456', name: 'Validator 2', status: 'active' }
      ]
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      if (param === 'operation') return 'getValidators';
      if (param === 'status') return 'active';
      if (param === 'limit') return 100;
      if (param === 'offset') return 0;
      return '';
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockValidators);

    const result = await executeBgtGovernanceOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockValidators);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'GET',
      url: 'https://artio.api.berachain.com/v1/bgt/validators?status=active&limit=100&offset=0',
      headers: {
        'Authorization': 'Bearer test-api-key',
        'Content-Type': 'application/json',
      },
      json: true,
    });
  });

  test('getValidator should return specific validator details', async () => {
    const mockValidator = {
      address: '0x123',
      name: 'Test Validator',
      commission: '5%',
      totalStaked: '1000000'
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      if (param === 'operation') return 'getValidator';
      if (param === 'address') return '0x123';
      return '';
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockValidator);

    const result = await executeBgtGovernanceOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockValidator);
  });

  test('delegateBgt should delegate BGT to validator', async () => {
    const mockResponse = {
      success: true,
      transactionHash: '0xabc123',
      delegatedAmount: '1000000'
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      if (param === 'operation') return 'delegateBgt';
      if (param === 'validator') return '0x123';
      if (param === 'amount') return '1000000';
      if (param === 'delegator') return '0x456';
      return '';
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeBgtGovernanceOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'POST',
      url: 'https://artio.api.berachain.com/v1/bgt/delegate',
      headers: {
        'Authorization': 'Bearer test-api-key',
        'Content-Type': 'application/json',
      },
      body: {
        validator: '0x123',
        amount: '1000000',
        delegator: '0x456',
      },
      json: true,
    });
  });

  test('getProposals should return governance proposals', async () => {
    const mockProposals = {
      proposals: [
        { id: '1', title: 'Proposal 1', status: 'active' },
        { id: '2', title: 'Proposal 2', status: 'active' }
      ]
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      if (param === 'operation') return 'getProposals';
      if (param === 'status') return 'active';
      if (param === 'limit') return 50;
      return '';
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockProposals);

    const result = await executeBgtGovernanceOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockProposals);
  });

  test('voteProposal should vote on governance proposal', async () => {
    const mockResponse = {
      success: true,
      transactionHash: '0xdef456',
      vote: 'yes'
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      if (param === 'operation') return 'voteProposal';
      if (param === 'proposalId') return '1';
      if (param === 'vote') return 'yes';
      if (param === 'voter') return '0x789';
      return '';
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeBgtGovernanceOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'POST',
      url: 'https://artio.api.berachain.com/v1/bgt/vote',
      headers: {
        'Authorization': 'Bearer test-api-key',
        'Content-Type': 'application/json',
      },
      body: {
        proposalId: '1',
        vote: 'yes',
        voter: '0x789',
      },
      json: true,
    });
  });

  test('should handle errors correctly', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      if (param === 'operation') return 'getValidators';
      return '';
    });

    const mockError = new Error('API request failed');
    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(mockError);
    mockExecuteFunctions.continueOnFail.mockReturnValue(true);

    const result = await executeBgtGovernanceOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual({ error: 'API request failed' });
  });
});

describe('HoneyStablecoin Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-api-key',
        baseUrl: 'https://artio.api.berachain.com/v1',
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn(),
      },
    };
  });

  it('should get HONEY supply successfully', async () => {
    const mockSupplyData = {
      totalSupply: '1000000000000000000000',
      circulatingSupply: '900000000000000000000',
      stabilityPoolBalance: '100000000000000000000',
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      if (param === 'operation') return 'getSupply';
      return undefined;
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockSupplyData);

    const result = await executeHoneyStablecoinOperations.call(
      mockExecuteFunctions,
      [{ json: {} }]
    );

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockSupplyData);
  });

  it('should get collateral information successfully', async () => {
    const mockCollateralData = {
      asset: 'WBERA',
      totalCollateral: '500000000000000000000',
      collateralRatio: '150',
      liquidationThreshold: '110',
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      if (param === 'operation') return 'getCollateral';
      if (param === 'asset') return 'WBERA';
      return undefined;
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockCollateralData);

    const result = await executeHoneyStablecoinOperations.call(
      mockExecuteFunctions,
      [{ json: {} }]
    );

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockCollateralData);
  });

  it('should mint HONEY successfully', async () => {
    const mockMintData = {
      transactionHash: '0x123456789',
      honeyMinted: '100000000000000000000',
      collateralUsed: '150000000000000000000',
      newCollateralRatio: '150',
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string, index: number) => {
      if (param === 'operation') return 'mintHoney';
      if (param === 'collateralAmount') return '150000000000000000000';
      if (param === 'collateralAsset') return 'WBERA';
      if (param === 'recipient') return '0x742d35Cc6610C7532C8cc2f7e4b8e8b8b64c9f5e';
      return undefined;
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockMintData);

    const result = await executeHoneyStablecoinOperations.call(
      mockExecuteFunctions,
      [{ json: {} }]
    );

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockMintData);
  });

  it('should get user position successfully', async () => {
    const mockPositionData = {
      address: '0x742d35Cc6610C7532C8cc2f7e4b8e8b8b64c9f5e',
      collateralBalance: '200000000000000000000',
      honeyDebt: '100000000000000000000',
      collateralRatio: '200',
      healthFactor: '2.0',
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string, index: number, defaultValue?: any) => {
      if (param === 'operation') return 'getPosition';
      if (param === 'address') return '0x742d35Cc6610C7532C8cc2f7e4b8e8b8b64c9f5e';
      if (param === 'asset') return '';
      return defaultValue;
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockPositionData);

    const result = await executeHoneyStablecoinOperations.call(
      mockExecuteFunctions,
      [{ json: {} }]
    );

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockPositionData);
  });

  it('should handle API errors gracefully', async () => {
    mockExecuteFunctions.getNodeParameter.mockReturnValue('getSupply');
    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));
    mockExecuteFunctions.continueOnFail.mockReturnValue(true);

    const result = await executeHoneyStablecoinOperations.call(
      mockExecuteFunctions,
      [{ json: {} }]
    );

    expect(result).toHaveLength(1);
    expect(result[0].json.error).toBe('API Error');
  });

  it('should liquidate position successfully', async () => {
    const mockLiquidationData = {
      transactionHash: '0x987654321',
      positionId: 'pos_123',
      liquidatedCollateral: '50000000000000000000',
      liquidationReward: '5000000000000000000',
      liquidator: '0x742d35Cc6610C7532C8cc2f7e4b8e8b8b64c9f5e',
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string, index: number) => {
      if (param === 'operation') return 'liquidatePosition';
      if (param === 'positionId') return 'pos_123';
      if (param === 'liquidator') return '0x742d35Cc6610C7532C8cc2f7e4b8e8b8b64c9f5e';
      return undefined;
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockLiquidationData);

    const result = await executeHoneyStablecoinOperations.call(
      mockExecuteFunctions,
      [{ json: {} }]
    );

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockLiquidationData);
  });

  it('should get HONEY price successfully', async () => {
    const mockPriceData = {
      price: '1.00',
      priceUSD: '1.00',
      pegStability: '99.8%',
      volume24h: '1000000000000000000000',
      marketCap: '1000000000000000000000',
    };

    mockExecuteFunctions.getNodeParameter.mockReturnValue('getPrice');
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockPriceData);

    const result = await executeHoneyStablecoinOperations.call(
      mockExecuteFunctions,
      [{ json: {} }]
    );

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockPriceData);
  });
});

describe('ValidatorOperations Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-api-key',
        baseUrl: 'https://artio.api.berachain.com/v1',
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn(),
      },
    };
  });

  test('getAllValidators should fetch all validators successfully', async () => {
    const mockResponse = {
      validators: [
        {
          address: 'beravaloper1xxx',
          moniker: 'Test Validator',
          status: 'active',
          voting_power: '1000000',
        },
      ],
      total: 1,
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((name: string) => {
      switch (name) {
        case 'operation': return 'getAllValidators';
        case 'status': return 'all';
        case 'sortBy': return 'voting_power';
        case 'limit': return 100;
        default: return undefined;
      }
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeValidatorOperationsOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'GET',
      url: 'https://artio.api.berachain.com/v1/validators?sort_by=voting_power&limit=100',
      headers: {
        'Authorization': 'Bearer test-api-key',
        'Content-Type': 'application/json',
      },
      json: true,
    });
  });

  test('getValidatorDetails should fetch validator details successfully', async () => {
    const mockResponse = {
      address: 'beravaloper1xxx',
      moniker: 'Test Validator',
      status: 'active',
      commission: '0.1',
      voting_power: '1000000',
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((name: string) => {
      switch (name) {
        case 'operation': return 'getValidatorDetails';
        case 'address': return 'beravaloper1xxx';
        default: return undefined;
      }
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeValidatorOperationsOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'GET',
      url: 'https://artio.api.berachain.com/v1/validators/beravaloper1xxx',
      headers: {
        'Authorization': 'Bearer test-api-key',
        'Content-Type': 'application/json',
      },
      json: true,
    });
  });

  test('registerValidator should register validator successfully', async () => {
    const mockResponse = {
      success: true,
      tx_hash: '0xabc123',
      validator: {
        address: 'beravaloper1xxx',
        moniker: 'New Validator',
      },
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((name: string) => {
      switch (name) {
        case 'operation': return 'registerValidator';
        case 'address': return 'beravaloper1xxx';
        case 'moniker': return 'New Validator';
        case 'commission': return '0.1';
        case 'details': return 'Test validator details';
        default: return undefined;
      }
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeValidatorOperationsOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'POST',
      url: 'https://artio.api.berachain.com/v1/validators/register',
      headers: {
        'Authorization': 'Bearer test-api-key',
        'Content-Type': 'application/json',
      },
      body: {
        address: 'beravaloper1xxx',
        moniker: 'New Validator',
        commission: '0.1',
        details: 'Test validator details',
      },
      json: true,
    });
  });

  test('getValidatorPerformance should fetch performance metrics successfully', async () => {
    const mockResponse = {
      validator: 'beravaloper1xxx',
      period: '24h',
      uptime: 0.99,
      blocks_signed: 8640,
      blocks_missed: 86,
      performance_score: 95.5,
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((name: string) => {
      switch (name) {
        case 'operation': return 'getValidatorPerformance';
        case 'address': return 'beravaloper1xxx';
        case 'period': return '24h';
        default: return undefined;
      }
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeValidatorOperationsOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'GET',
      url: 'https://artio.api.berachain.com/v1/validators/beravaloper1xxx/performance?period=24h',
      headers: {
        'Authorization': 'Bearer test-api-key',
        'Content-Type': 'application/json',
      },
      json: true,
    });
  });

  test('should handle API errors gracefully', async () => {
    const mockError = new Error('API request failed');

    mockExecuteFunctions.getNodeParameter.mockImplementation((name: string) => {
      switch (name) {
        case 'operation': return 'getAllValidators';
        case 'status': return 'all';
        case 'sortBy': return 'voting_power';
        case 'limit': return 100;
        default: return undefined;
      }
    });

    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(mockError);

    await expect(
      executeValidatorOperationsOperations.call(mockExecuteFunctions, [{ json: {} }])
    ).rejects.toThrow('API request failed');
  });

  test('should continue on fail when configured', async () => {
    const mockError = new Error('API request failed');

    mockExecuteFunctions.getNodeParameter.mockImplementation((name: string) => {
      switch (name) {
        case 'operation': return 'getAllValidators';
        case 'status': return 'all';
        case 'sortBy': return 'voting_power';
        case 'limit': return 100;
        default: return undefined;
      }
    });

    mockExecuteFunctions.continueOnFail.mockReturnValue(true);
    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(mockError);

    const result = await executeValidatorOperationsOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json.error).toBe('API request failed');
  });
});

describe('DeFiAutomation Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-api-key',
        baseUrl: 'https://artio.api.berachain.com/v1',
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn(),
      },
    };
  });

  describe('getPools operation', () => {
    it('should get pools successfully', async () => {
      const mockResponse = {
        pools: [
          { id: '1', protocol: 'uniswap', tvl: '1000000' },
          { id: '2', protocol: 'sushiswap', tvl: '500000' },
        ],
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((name: string) => {
        switch (name) {
          case 'operation': return 'getPools';
          case 'protocol': return 'uniswap';
          case 'asset': return 'HONEY';
          case 'minTvl': return 100000;
          default: return undefined;
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeDeFiAutomationOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://artio.api.berachain.com/v1/defi/pools?protocol=uniswap&asset=HONEY&minTvl=100000',
        headers: {
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
        json: true,
      });
    });
  });

  describe('addLiquidity operation', () => {
    it('should add liquidity successfully', async () => {
      const mockResponse = {
        transactionHash: '0x123...',
        poolId: 'pool123',
        lpTokensReceived: '100.5',
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((name: string) => {
        switch (name) {
          case 'operation': return 'addLiquidity';
          case 'poolId': return 'pool123';
          case 'tokenA': return '0xabc...';
          case 'tokenB': return '0xdef...';
          case 'amountA': return '1000';
          case 'amountB': return '2000';
          default: return undefined;
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeDeFiAutomationOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: 'https://artio.api.berachain.com/v1/defi/add-liquidity',
        headers: {
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
        body: {
          poolId: 'pool123',
          tokenA: '0xabc...',
          tokenB: '0xdef...',
          amountA: '1000',
          amountB: '2000',
        },
        json: true,
      });
    });
  });

  describe('executeSwap operation', () => {
    it('should execute swap successfully', async () => {
      const mockResponse = {
        transactionHash: '0x456...',
        amountOut: '950.5',
        executedPrice: '0.95',
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((name: string) => {
        switch (name) {
          case 'operation': return 'executeSwap';
          case 'tokenIn': return '0xabc...';
          case 'tokenOut': return '0xdef...';
          case 'amountIn': return '1000';
          case 'recipient': return '0x123...';
          case 'slippage': return 1.0;
          default: return undefined;
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeDeFiAutomationOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: 'https://artio.api.berachain.com/v1/defi/swap',
        headers: {
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
        body: {
          tokenIn: '0xabc...',
          tokenOut: '0xdef...',
          amountIn: '1000',
          recipient: '0x123...',
          slippage: 1.0,
        },
        json: true,
      });
    });
  });

  describe('getYieldOpportunities operation', () => {
    it('should get yield opportunities successfully', async () => {
      const mockResponse = {
        opportunities: [
          { protocol: 'compound', apy: 15.5, asset: 'HONEY' },
          { protocol: 'aave', apy: 12.3, asset: 'USDC' },
        ],
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((name: string) => {
        switch (name) {
          case 'operation': return 'getYieldOpportunities';
          case 'minApy': return 10;
          case 'asset': return 'HONEY';
          case 'protocol': return 'compound';
          default: return undefined;
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeDeFiAutomationOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://artio.api.berachain.com/v1/defi/yields?minApy=10&asset=HONEY&protocol=compound',
        headers: {
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
        json: true,
      });
    });
  });

  describe('error handling', () => {
    it('should handle API errors', async () => {
      const mockError = {
        httpCode: 404,
        message: 'Pool not found',
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((name: string) => {
        switch (name) {
          case 'operation': return 'getPool';
          case 'id': return 'invalid-pool';
          default: return undefined;
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(mockError);

      await expect(
        executeDeFiAutomationOperations.call(mockExecuteFunctions, [{ json: {} }])
      ).rejects.toThrow();
    });

    it('should continue on fail when enabled', async () => {
      const mockError = new Error('Network error');
      
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);
      mockExecuteFunctions.getNodeParameter.mockImplementation((name: string) => {
        if (name === 'operation') return 'getPools';
        return undefined;
      });
      
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(mockError);

      const result = await executeDeFiAutomationOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{ json: { error: 'Network error' }, pairedItem: { item: 0 } }]);
    });
  });
});
});
