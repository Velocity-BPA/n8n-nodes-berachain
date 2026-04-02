/**
 * Copyright (c) 2026 Velocity BPA
 * 
 * Licensed under the Business Source License 1.1 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     https://github.com/VelocityBPA/n8n-nodes-berachain/blob/main/LICENSE
 * 
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeOperationError,
  NodeApiError,
} from 'n8n-workflow';

export class Berachain implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Berachain',
    name: 'berachain',
    icon: 'file:berachain.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description: 'Interact with the Berachain API',
    defaults: {
      name: 'Berachain',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'berachainApi',
        required: true,
      },
    ],
    properties: [
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'BgtGovernance',
            value: 'bgtGovernance',
          },
          {
            name: 'HoneyStablecoin',
            value: 'honeyStablecoin',
          },
          {
            name: 'ValidatorOperations',
            value: 'validatorOperations',
          },
          {
            name: 'DeFiAutomation',
            value: 'deFiAutomation',
          },
          {
            name: 'Validators',
            value: 'validators',
          },
          {
            name: 'Governance',
            value: 'governance',
          },
          {
            name: 'Defi',
            value: 'defi',
          },
          {
            name: 'Automation',
            value: 'automation',
          }
        ],
        default: 'bgtGovernance',
      },
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['bgtGovernance'],
    },
  },
  options: [
    {
      name: 'Get Validators',
      value: 'getValidators',
      description: 'Get list of active validators',
      action: 'Get validators',
    },
    {
      name: 'Get Validator',
      value: 'getValidator',
      description: 'Get specific validator details',
      action: 'Get validator details',
    },
    {
      name: 'Get Delegations',
      value: 'getDelegations',
      description: 'Get user delegations',
      action: 'Get user delegations',
    },
    {
      name: 'Delegate BGT',
      value: 'delegateBgt',
      description: 'Delegate BGT to validator',
      action: 'Delegate BGT to validator',
    },
    {
      name: 'Undelegate BGT',
      value: 'undelegateBgt',
      description: 'Undelegate BGT from validator',
      action: 'Undelegate BGT from validator',
    },
    {
      name: 'Get Rewards',
      value: 'getRewards',
      description: 'Get staking rewards',
      action: 'Get staking rewards',
    },
    {
      name: 'Claim Rewards',
      value: 'claimRewards',
      description: 'Claim staking rewards',
      action: 'Claim staking rewards',
    },
    {
      name: 'Get Proposals',
      value: 'getProposals',
      description: 'Get governance proposals',
      action: 'Get governance proposals',
    },
    {
      name: 'Vote on Proposal',
      value: 'voteProposal',
      description: 'Vote on governance proposal',
      action: 'Vote on governance proposal',
    },
  ],
  default: 'getValidators',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['honeyStablecoin'],
    },
  },
  options: [
    {
      name: 'Get Supply',
      value: 'getSupply',
      description: 'Get total HONEY supply and metrics',
      action: 'Get HONEY supply',
    },
    {
      name: 'Get Collateral',
      value: 'getCollateral',
      description: 'Get collateral pool information',
      action: 'Get collateral pool information',
    },
    {
      name: 'Mint HONEY',
      value: 'mintHoney',
      description: 'Mint HONEY with collateral',
      action: 'Mint HONEY tokens',
    },
    {
      name: 'Burn HONEY',
      value: 'burnHoney',
      description: 'Burn HONEY to reclaim collateral',
      action: 'Burn HONEY tokens',
    },
    {
      name: 'Get Position',
      value: 'getPosition',
      description: 'Get user collateral position',
      action: 'Get user position',
    },
    {
      name: 'Get Liquidations',
      value: 'getLiquidations',
      description: 'Get liquidation opportunities',
      action: 'Get liquidation opportunities',
    },
    {
      name: 'Liquidate Position',
      value: 'liquidatePosition',
      description: 'Liquidate undercollateralized position',
      action: 'Liquidate position',
    },
    {
      name: 'Get Price',
      value: 'getPrice',
      description: 'Get HONEY price and stability metrics',
      action: 'Get HONEY price',
    },
    {
      name: 'Get Stability Pool',
      value: 'getStabilityPool',
      description: 'Get stability pool information',
      action: 'Get stability pool',
    },
    {
      name: 'Get HONEY Supply',
      value: 'getHoneySupply',
      description: 'Get total HONEY supply information',
      action: 'Get HONEY supply',
    },
    {
      name: 'Get Collateral Info',
      value: 'getCollateralInfo',
      description: 'Get collateral backing HONEY',
      action: 'Get collateral info',
    },
    {
      name: 'Get Stability Metrics',
      value: 'getStabilityMetrics',
      description: 'Get HONEY stability metrics',
      action: 'Get stability metrics',
    },
    {
      name: 'Get HONEY Positions',
      value: 'getHoneyPositions',
      description: 'Get user HONEY positions',
      action: 'Get HONEY positions',
    },
  ],
  default: 'getSupply',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['validatorOperations'],
    },
  },
  options: [
    {
      name: 'Get All Validators',
      value: 'getAllValidators',
      description: 'Get all validators with their current status',
      action: 'Get all validators',
    },
    {
      name: 'Get Validator Details',
      value: 'getValidatorDetails',
      description: 'Get detailed information about a specific validator',
      action: 'Get validator details',
    },
    {
      name: 'Register Validator',
      value: 'registerValidator',
      description: 'Register a new validator on the network',
      action: 'Register validator',
    },
    {
      name: 'Update Validator',
      value: 'updateValidator',
      description: 'Update validator configuration settings',
      action: 'Update validator',
    },
    {
      name: 'Get Validator Performance',
      value: 'getValidatorPerformance',
      description: 'Get performance metrics for a validator',
      action: 'Get validator performance',
    },
    {
      name: 'Get Validator Delegators',
      value: 'getValidatorDelegators',
      description: "Get list of a validator's delegators",
      action: 'Get validator delegators',
    },
    {
      name: 'Unjail Validator',
      value: 'unjailValidator',
      description: 'Unjail a validator after slashing event',
      action: 'Unjail validator',
    },
    {
      name: 'Get Validator Rewards',
      value: 'getValidatorRewards',
      description: 'Get validator commission rewards',
      action: 'Get validator rewards',
    },
    {
      name: 'Get Slashing Events',
      value: 'getSlashingEvents',
      description: 'Get validator slashing history',
      action: 'Get slashing events',
    },
  ],
  default: 'getAllValidators',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['deFiAutomation'],
    },
  },
  options: [
    {
      name: 'Get Pools',
      value: 'getPools',
      description: 'Get available liquidity pools',
      action: 'Get liquidity pools',
    },
    {
      name: 'Get Pool',
      value: 'getPool',
      description: 'Get specific pool details',
      action: 'Get pool details',
    },
    {
      name: 'Add Liquidity',
      value: 'addLiquidity',
      description: 'Add liquidity to pool',
      action: 'Add liquidity to pool',
    },
    {
      name: 'Remove Liquidity',
      value: 'removeLiquidity',
      description: 'Remove liquidity from pool',
      action: 'Remove liquidity from pool',
    },
    {
      name: 'Get Positions',
      value: 'getPositions',
      description: 'Get user DeFi positions',
      action: 'Get DeFi positions',
    },
    {
      name: 'Execute Swap',
      value: 'executeSwap',
      description: 'Execute token swap',
      action: 'Execute token swap',
    },
    {
      name: 'Get Yield Opportunities',
      value: 'getYieldOpportunities',
      description: 'Get yield farming opportunities',
      action: 'Get yield opportunities',
    },
    {
      name: 'Stake Tokens',
      value: 'stakeTokens',
      description: 'Stake tokens in yield farm',
      action: 'Stake tokens',
    },
    {
      name: 'Unstake Tokens',
      value: 'unstakeTokens',
      description: 'Unstake tokens from yield farm',
      action: 'Unstake tokens',
    },
    {
      name: 'Get DeFi Rewards',
      value: 'getDeFiRewards',
      description: 'Get DeFi protocol rewards',
      action: 'Get DeFi rewards',
    },
  ],
  default: 'getPools',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: { show: { resource: ['validators'] } },
  options: [
    { name: 'Get Validators', value: 'getValidators', description: 'Get list of all validators', action: 'Get validators' },
    { name: 'Get Validator', value: 'getValidator', description: 'Get specific validator details', action: 'Get validator' },
    { name: 'Create Validator', value: 'createValidator', description: 'Create new validator registration', action: 'Create validator' },
    { name: 'Update Validator', value: 'updateValidator', description: 'Update validator configuration', action: 'Update validator' },
    { name: 'Get Validator Delegations', value: 'getValidatorDelegations', description: 'Get validator delegations', action: 'Get validator delegations' },
    { name: 'Get Validator Rewards', value: 'getValidatorRewards', description: 'Get validator rewards', action: 'Get validator rewards' }
  ],
  default: 'getValidators',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: { show: { resource: ['governance'] } },
  options: [
    { name: 'Get Proposals', value: 'getProposals', description: 'Get governance proposals', action: 'Get governance proposals' },
    { name: 'Get Proposal', value: 'getProposal', description: 'Get specific proposal details', action: 'Get specific proposal details' },
    { name: 'Create Proposal', value: 'createProposal', description: 'Submit new governance proposal', action: 'Submit new governance proposal' },
    { name: 'Vote Proposal', value: 'voteProposal', description: 'Vote on governance proposal', action: 'Vote on governance proposal' },
    { name: 'Get Proposal Votes', value: 'getProposalVotes', description: 'Get proposal voting results', action: 'Get proposal voting results' },
    { name: 'Get BGT Delegations', value: 'getBgtDelegations', description: 'Get BGT delegation info', action: 'Get BGT delegation info' }
  ],
  default: 'getProposals',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: { show: { resource: ['defi'] } },
  options: [
    { name: 'Get Pools', value: 'getPools', description: 'Get liquidity pools information', action: 'Get liquidity pools' },
    { name: 'Get Pool', value: 'getPool', description: 'Get specific pool details', action: 'Get pool details' },
    { name: 'Add Liquidity', value: 'addLiquidity', description: 'Add liquidity to pool', action: 'Add liquidity to pool' },
    { name: 'Remove Liquidity', value: 'removeLiquidity', description: 'Remove liquidity from pool', action: 'Remove liquidity from pool' },
    { name: 'Execute Swap', value: 'executeSwap', description: 'Execute token swap', action: 'Execute token swap' },
    { name: 'Get DeFi Positions', value: 'getDefiPositions', description: 'Get user DeFi positions', action: 'Get DeFi positions' }
  ],
  default: 'getPools',
},
{
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: {
		show: {
			resource: ['automation'],
		},
	},
	options: [
		{
			name: 'Get Strategies',
			value: 'getStrategies',
			description: 'Get automation strategies',
			action: 'Get automation strategies',
		},
		{
			name: 'Get Strategy',
			value: 'getStrategy',
			description: 'Get specific strategy details',
			action: 'Get specific strategy details',
		},
		{
			name: 'Create Strategy',
			value: 'createStrategy',
			description: 'Create new automation strategy',
			action: 'Create new automation strategy',
		},
		{
			name: 'Update Strategy',
			value: 'updateStrategy',
			description: 'Update automation strategy',
			action: 'Update automation strategy',
		},
		{
			name: 'Delete Strategy',
			value: 'deleteStrategy',
			description: 'Delete automation strategy',
			action: 'Delete automation strategy',
		},
		{
			name: 'Get Executions',
			value: 'getExecutions',
			description: 'Get strategy execution history',
			action: 'Get strategy execution history',
		},
	],
	default: 'getStrategies',
},
{
  displayName: 'Status',
  name: 'status',
  type: 'options',
  displayOptions: {
    show: {
      resource: ['bgtGovernance'],
      operation: ['getValidators'],
    },
  },
  options: [
    {
      name: 'Active',
      value: 'active',
    },
    {
      name: 'Inactive',
      value: 'inactive',
    },
    {
      name: 'All',
      value: 'all',
    },
  ],
  default: 'active',
  description: 'Filter validators by status',
},
{
  displayName: 'Limit',
  name: 'limit',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['bgtGovernance'],
      operation: ['getValidators', 'getProposals'],
    },
  },
  default: 100,
  description: 'Maximum number of results to return',
},
{
  displayName: 'Offset',
  name: 'offset',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['bgtGovernance'],
      operation: ['getValidators'],
    },
  },
  default: 0,
  description: 'Number of results to skip',
},
{
  displayName: 'Validator Address',
  name: 'address',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['bgtGovernance'],
      operation: ['getValidator'],
    },
  },
  default: '',
  description: 'The validator address',
},
{
  displayName: 'User Address',
  name: 'address',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['bgtGovernance'],
      operation: ['getDelegations', 'getRewards', 'claimRewards'],
    },
  },
  default: '',
  description: 'The user wallet address',
},
{
  displayName: 'Validator Filter',
  name: 'validator',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['bgtGovernance'],
      operation: ['getDelegations', 'getRewards'],
    },
  },
  default: '',
  description: 'Filter by specific validator address',
},
{
  displayName: 'Validator Address',
  name: 'validator',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['bgtGovernance'],
      operation: ['delegateBgt', 'undelegateBgt'],
    },
  },
  default: '',
  description: 'The validator address to delegate to or undelegate from',
},
{
  displayName: 'Amount',
  name: 'amount',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['bgtGovernance'],
      operation: ['delegateBgt', 'undelegateBgt'],
    },
  },
  default: '',
  description: 'Amount of BGT to delegate or undelegate (in wei)',
},
{
  displayName: 'Delegator Address',
  name: 'delegator',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['bgtGovernance'],
      operation: ['delegateBgt', 'undelegateBgt'],
    },
  },
  default: '',
  description: 'The delegator wallet address',
},
{
  displayName: 'Validators',
  name: 'validators',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['bgtGovernance'],
      operation: ['claimRewards'],
    },
  },
  default: '',
  description: 'Comma-separated list of validator addresses to claim rewards from (optional)',
},
{
  displayName: 'Proposal Status',
  name: 'status',
  type: 'options',
  displayOptions: {
    show: {
      resource: ['bgtGovernance'],
      operation: ['getProposals'],
    },
  },
  options: [
    {
      name: 'Active',
      value: 'active',
    },
    {
      name: 'Passed',
      value: 'passed',
    },
    {
      name: 'Failed',
      value: 'failed',
    },
    {
      name: 'All',
      value: 'all',
    },
  ],
  default: 'active',
  description: 'Filter proposals by status',
},
{
  displayName: 'Proposal ID',
  name: 'proposalId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['bgtGovernance'],
      operation: ['voteProposal'],
    },
  },
  default: '',
  description: 'The governance proposal ID',
},
{
  displayName: 'Vote',
  name: 'vote',
  type: 'options',
  required: true,
  displayOptions: {
    show: {
      resource: ['bgtGovernance'],
      operation: ['voteProposal'],
    },
  },
  options: [
    {
      name: 'Yes',
      value: 'yes',
    },
    {
      name: 'No',
      value: 'no',
    },
    {
      name: 'Abstain',
      value: 'abstain',
    },
  ],
  default: 'yes',
  description: 'Vote choice for the proposal',
},
{
  displayName: 'Voter Address',
  name: 'voter',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['bgtGovernance'],
      operation: ['voteProposal'],
    },
  },
  default: '',
  description: 'The voter wallet address',
},
{
  displayName: 'Asset',
  name: 'asset',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['honeyStablecoin'],
      operation: ['getCollateral', 'getCollateralInfo'],
    },
  },
  default: '',
  description: 'The collateral asset symbol',
},
{
  displayName: 'Collateral Amount',
  name: 'collateralAmount',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['honeyStablecoin'],
      operation: ['mintHoney'],
    },
  },
  default: '',
  description: 'Amount of collateral to use for minting',
},
{
  displayName: 'Collateral Asset',
  name: 'collateralAsset',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['honeyStablecoin'],
      operation: ['mintHoney', 'burnHoney'],
    },
  },
  default: '',
  description: 'The collateral asset symbol',
},
{
  displayName: 'Recipient',
  name: 'recipient',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['honeyStablecoin'],
      operation: ['mintHoney', 'burnHoney'],
    },
  },
  default: '',
  description: 'Recipient address for the minted HONEY or reclaimed collateral',
},
{
  displayName: 'HONEY Amount',
  name: 'honeyAmount',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['honeyStablecoin'],
      operation: ['burnHoney'],
    },
  },
  default: '',
  description: 'Amount of HONEY to burn',
},
{
  displayName: 'Amount',
  name: 'amount',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['honeyStablecoin'],
      operation: ['mintHoney', 'burnHoney'],
    },
  },
  default: '',
  description: 'The amount of HONEY tokens to mint or burn',
},
{
  displayName: 'Address',
  name: 'address',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['honeyStablecoin'],
      operation: ['getPosition', 'getHoneyPositions'],
    },
  },
  default: '',
  description: 'User address to get position for',
},
{
  displayName: 'Asset',
  name: 'asset',
  type: 'string',
  required: false,
  displayOptions: {
    show: {
      resource: ['honeyStablecoin'],
      operation: ['getPosition'],
    },
  },
  default: '',
  description: 'Specific asset to get position for (optional)',
},
{
  displayName: 'Limit',
  name: 'limit',
  type: 'number',
  required: false,
  displayOptions: {
    show: {
      resource: ['honeyStablecoin'],
      operation: ['getLiquidations', 'getHoneyPositions'],
    },
  },
  default: 10,
  description: 'Maximum number of liquidation opportunities to return',
},
{
  displayName: 'Minimum Ratio',
  name: 'minRatio',
  type: 'string',
  required: false,
  displayOptions: {
    show: {
      resource: ['honeyStablecoin'],
      operation: ['getLiquidations'],
    },
  },
  default: '',
  description: 'Minimum collateralization ratio threshold',
},
{
  displayName: 'Position ID',
  name: 'positionId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['honeyStablecoin'],
      operation: ['liquidatePosition'],
    },
  },
  default: '',
  description: 'ID of the position to liquidate',
},
{
  displayName: 'Liquidator',
  name: 'liquidator',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['honeyStablecoin'],
      operation: ['liquidatePosition'],
    },
  },
  default: '',
  description: 'Address of the liquidator',
},
{
  displayName: 'Timeframe',
  name: 'timeframe',
  type: 'options',
  options: [
    { name: '1 Hour', value: '1h' },
    { name: '24 Hours', value: '24h' },
    { name: '7 Days', value: '7d' },
    { name: '30 Days', value: '30d' },
  ],
  default: '24h',
  displayOptions: { show: { resource: ['honeyStablecoin'], operation: ['getStabilityMetrics'] } },
  description: 'The timeframe for stability metrics',
},
{
  displayName: 'Page',
  name: 'page',
  type: 'number',
  typeOptions: { minValue: 1 },
  default: 1,
  displayOptions: { show: { resource: ['honeyStablecoin'], operation: ['getHoneyPositions'] } },
  description: 'Page number for pagination',
},
{
  displayName: 'Status',
  name: 'status',
  type: 'options',
  displayOptions: {
    show: {
      resource: ['validatorOperations'],
      operation: ['getAllValidators'],
    },
  },
  options: [
    {
      name: 'All',
      value: 'all',
    },
    {
      name: 'Active',
      value: 'active',
    },
    {
      name: 'Inactive',
      value: 'inactive',
    },
    {
      name: 'Jailed',
      value: 'jailed',
    },
  ],
  default: 'all',
  description: 'Filter validators by status',
},
{
  displayName: 'Sort By',
  name: 'sortBy',
  type: 'options',
  displayOptions: {
    show: {
      resource: ['validatorOperations'],
      operation: ['getAllValidators'],
    },
  },
  options: [
    {
      name: 'Voting Power',
      value: 'voting_power',
    },
    {
      name: 'Commission',
      value: 'commission',
    },
    {
      name: 'Name',
      value: 'name',
    },
  ],
  default: 'voting_power',
  description: 'Sort validators by field',
},
{
  displayName: 'Limit',
  name: 'limit',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['validatorOperations'],
      operation: ['getAllValidators', 'getValidatorDelegators', 'getSlashingEvents'],
    },
  },
  default: 100,
  description: 'Maximum number of results to return',
},
{
  displayName: 'Validator Address',
  name: 'address',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['validatorOperations'],
      operation: ['getValidatorDetails', 'updateValidator', 'getValidatorPerformance', 'getValidatorDelegators', 'unjailValidator'],
    },
  },
  default: '',
  description: 'The validator address',
},
{
  displayName: 'Validator Address',
  name: 'address',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['validatorOperations'],
      operation: ['registerValidator'],
    },
  },
  default: '',
  description: 'The validator address to register',
},
{
  displayName: 'Moniker',
  name: 'moniker',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['validatorOperations'],
      operation: ['registerValidator'],
    },
  },
  default: '',
  description: 'The validator display name',
},
{
  displayName: 'Commission',
  name: 'commission',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['validatorOperations'],
      operation: ['registerValidator', 'updateValidator'],
    },
  },
  default: '0.1',
  description: 'Commission rate (e.g., 0.1 for 10%)',
},
{
  displayName: 'Details',
  name: 'details',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['validatorOperations'],
      operation: ['registerValidator', 'updateValidator'],
    },
  },
  default: '',
  description: 'Validator description details',
},
{
  displayName: 'Period',
  name: 'period',
  type: 'options',
  displayOptions: {
    show: {
      resource: ['validatorOperations'],
      operation: ['getValidatorPerformance', 'getValidatorRewards'],
    },
  },
  options: [
    {
      name: '24 Hours',
      value: '24h',
    },
    {
      name: '7 Days',
      value: '7d',
    },
    {
      name: '30 Days',
      value: '30d',
    },
    {
      name: '90 Days',
      value: '90d',
    },
  ],
  default: '24h',
  description: 'Time period for metrics',
},
{
  displayName: 'Reason',
  name: 'reason',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['validatorOperations'],
      operation: ['unjailValidator'],
    },
  },
  default: '',
  description: 'Reason for unjailing the validator',
},
{
  displayName: 'Validator',
  name: 'validator',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['validatorOperations'],
      operation: ['getValidatorRewards', 'getSlashingEvents'],
    },
  },
  default: '',
  description: 'Validator address to filter by',
},
{
  displayName: 'Protocol',
  name: 'protocol',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['deFiAutomation'],
      operation: ['getPools'],
    },
  },
  default: '',
  description: 'Filter pools by protocol',
},
{
  displayName: 'Asset',
  name: 'asset',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['deFiAutomation'],
      operation: ['getPools'],
    },
  },
  default: '',
  description: 'Filter pools by asset',
},
{
  displayName: 'Minimum TVL',
  name: 'minTvl',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['deFiAutomation'],
      operation: ['getPools'],
    },
  },
  default: 0,
  description: 'Minimum Total Value Locked',
},
{
  displayName: 'Pool ID',
  name: 'id',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['deFiAutomation'],
      operation: ['getPool'],
    },
  },
  default: '',
  description: 'The pool identifier',
},
{
  displayName: 'Pool ID',
  name: 'poolId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['deFiAutomation'],
      operation: ['addLiquidity', 'removeLiquidity'],
    },
  },
  default: '',
  description: 'The pool identifier',
},
{
  displayName: 'Token A',
  name: 'tokenA',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['deFiAutomation'],
      operation: ['addLiquidity'],
    },
  },
  default: '',
  description: 'First token address',
},
{
  displayName: 'Token B',
  name: 'tokenB',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['deFiAutomation'],
      operation: ['addLiquidity'],
    },
  },
  default: '',
  description: 'Second token address',
},
{
  displayName: 'Amount A',
  name: 'amountA',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['deFiAutomation'],
      operation: ['addLiquidity'],
    },
  },
  default: '',
  description: 'Amount of token A to add',
},
{
  displayName: 'Amount B',
  name: 'amountB',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['deFiAutomation'],
      operation: ['addLiquidity'],
    },
  },
  default: '',
  description: 'Amount of token B to add',
},
{
  displayName: 'LP Tokens',
  name: 'lpTokens',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['deFiAutomation'],
      operation: ['removeLiquidity'],
    },
  },
  default: '',
  description: 'Amount of LP tokens to remove',
},
{
  displayName: 'Recipient',
  name: 'recipient',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['deFiAutomation'],
      operation: ['removeLiquidity', 'executeSwap'],
    },
  },
  default: '',
  description: 'Recipient address',
},
{
  displayName: 'Address',
  name: 'address',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['deFiAutomation'],
      operation: ['getPositions', 'getDeFiRewards'],
    },
  },
  default: '',
  description: 'User address',
},
{
  displayName: 'Protocol',
  name: 'protocol',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['deFiAutomation'],
      operation: ['getPositions', 'getYieldOpportunities', 'stakeTokens', 'unstakeTokens', 'getDeFiRewards'],
    },
  },
  default: '',
  description: 'Filter by protocol',
},
{
  displayName: 'Token In',
  name: 'tokenIn',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['deFiAutomation'],
      operation: ['executeSwap'],
    },
  },
  default: '',
  description: 'Input token address',
},
{
  displayName: 'Token Out',
  name: 'tokenOut',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['deFiAutomation'],
      operation: ['executeSwap'],
    },
  },
  default: '',
  description: 'Output token address',
},
{
  displayName: 'Amount In',
  name: 'amountIn',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['deFiAutomation'],
      operation: ['executeSwap'],
    },
  },
  default: '',
  description: 'Input amount',
},
{
  displayName: 'Slippage',
  name: 'slippage',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['deFiAutomation'],
      operation: ['executeSwap'],
    },
  },
  default: 0.5,
  description: 'Maximum slippage tolerance (%)',
},
{
  displayName: 'Minimum APY',
  name: 'minApy',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['deFiAutomation'],
      operation: ['getYieldOpportunities'],
    },
  },
  default: 0,
  description: 'Minimum APY percentage',
},
{
  displayName: 'Asset',
  name: 'asset',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['deFiAutomation'],
      operation: ['getYieldOpportunities'],
    },
  },
  default: '',
  description: 'Filter by asset',
},
{
  displayName: 'Pool',
  name: 'pool',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['deFiAutomation'],
      operation: ['stakeTokens', 'unstakeTokens'],
    },
  },
  default: '',
  description: 'Pool identifier',
},
{
  displayName: 'Amount',
  name: 'amount',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['deFiAutomation'],
      operation: ['stakeTokens', 'unstakeTokens'],
    },
  },
  default: '',
  description: 'Amount to stake/unstake',
},
{
  displayName: 'Staker',
  name: 'staker',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['deFiAutomation'],
      operation: ['stakeTokens', 'unstakeTokens'],
    },
  },
  default: '',
  description: 'Staker address',
},
{
  displayName: 'Status',
  name: 'status',
  type: 'options',
  displayOptions: { show: { resource: ['validators'], operation: ['getValidators'] } },
  options: [
    { name: 'Active', value: 'active' },
    { name: 'Inactive', value: 'inactive' },
    { name: 'Jailed', value: 'jailed' },
    { name: 'All', value: 'all' }
  ],
  default: 'all',
  description: 'Filter validators by status',
},
{
  displayName: 'Page',
  name: 'page',
  type: 'number',
  displayOptions: { show: { resource: ['validators'], operation: ['getValidators', 'getValidatorDelegations'] } },
  default: 1,
  description: 'Page number for pagination',
},
{
  displayName: 'Limit',
  name: 'limit',
  type: 'number',
  displayOptions: { show: { resource: ['validators'], operation: ['getValidators', 'getValidatorDelegations'] } },
  default: 100,
  description: 'Number of items per page',
},
{
  displayName: 'Address',
  name: 'address',
  type: 'string',
  displayOptions: { show: { resource: ['validators'], operation: ['getValidator', 'updateValidator', 'getValidatorDelegations', 'getValidatorRewards'] } },
  default: '',
  required: true,
  description: 'Validator address',
},
{
  displayName: 'Operator Address',
  name: 'operatorAddress',
  type: 'string',
  displayOptions: { show: { resource: ['validators'], operation: ['createValidator'] } },
  default: '',
  required: true,
  description: 'Operator address for the validator',
},
{
  displayName: 'Consensus Key',
  name: 'consensusKey',
  type: 'string',
  displayOptions: { show: { resource: ['validators'], operation: ['createValidator'] } },
  default: '',
  required: true,
  description: 'Consensus public key for the validator',
},
{
  displayName: 'Commission',
  name: 'commission',
  type: 'number',
  displayOptions: { show: { resource: ['validators'], operation: ['createValidator', 'updateValidator'] } },
  default: 0.1,
  description: 'Commission rate (0.0 to 1.0)',
},
{
  displayName: 'Description',
  name: 'description',
  type: 'string',
  displayOptions: { show: { resource: ['validators'], operation: ['updateValidator'] } },
  default: '',
  description: 'Validator description',
},
{
  displayName: 'Epoch',
  name: 'epoch',
  type: 'number',
  displayOptions: { show: { resource: ['validators'], operation: ['getValidatorRewards'] } },
  default: 0,
  description: 'Epoch number for rewards query',
},
{
  displayName: 'Status',
  name: 'status',
  type: 'options',
  displayOptions: { show: { resource: ['governance'], operation: ['getProposals'] } },
  options: [
    { name: 'Active', value: 'active' },
    { name: 'Pending', value: 'pending' },
    { name: 'Passed', value: 'passed' },
    { name: 'Rejected', value: 'rejected' },
    { name: 'All', value: 'all' }
  ],
  default: 'all',
  description: 'Filter proposals by status'
},
{
  displayName: 'Page',
  name: 'page',
  type: 'number',
  displayOptions: { show: { resource: ['governance'], operation: ['getProposals', 'getProposalVotes'] } },
  default: 1,
  description: 'Page number for pagination'
},
{
  displayName: 'Limit',
  name: 'limit',
  type: 'number',
  displayOptions: { show: { resource: ['governance'], operation: ['getProposals', 'getProposalVotes'] } },
  default: 20,
  description: 'Number of items per page'
},
{
  displayName: 'Proposal ID',
  name: 'id',
  type: 'string',
  required: true,
  displayOptions: { show: { resource: ['governance'], operation: ['getProposal', 'voteProposal', 'getProposalVotes'] } },
  default: '',
  description: 'ID of the governance proposal'
},
{
  displayName: 'Title',
  name: 'title',
  type: 'string',
  required: true,
  displayOptions: { show: { resource: ['governance'], operation: ['createProposal'] } },
  default: '',
  description: 'Title of the governance proposal'
},
{
  displayName: 'Description',
  name: 'description',
  type: 'string',
  required: true,
  displayOptions: { show: { resource: ['governance'], operation: ['createProposal'] } },
  typeOptions: { rows: 4 },
  default: '',
  description: 'Description of the governance proposal'
},
{
  displayName: 'Type',
  name: 'type',
  type: 'options',
  required: true,
  displayOptions: { show: { resource: ['governance'], operation: ['createProposal'] } },
  options: [
    { name: 'Text', value: 'text' },
    { name: 'Parameter Change', value: 'parameter_change' },
    { name: 'Community Pool Spend', value: 'community_pool_spend' },
    { name: 'Software Upgrade', value: 'software_upgrade' }
  ],
  default: 'text',
  description: 'Type of governance proposal'
},
{
  displayName: 'Deposit',
  name: 'deposit',
  type: 'string',
  required: true,
  displayOptions: { show: { resource: ['governance'], operation: ['createProposal'] } },
  default: '1000000',
  description: 'Deposit amount for the proposal'
},
{
  displayName: 'Vote Option',
  name: 'option',
  type: 'options',
  required: true,
  displayOptions: { show: { resource: ['governance'], operation: ['voteProposal'] } },
  options: [
    { name: 'Yes', value: 'yes' },
    { name: 'No', value: 'no' },
    { name: 'Abstain', value: 'abstain' },
    { name: 'No With Veto', value: 'no_with_veto' }
  ],
  default: 'yes',
  description: 'Vote option for the proposal'
},
{
  displayName: 'Vote Weight',
  name: 'weight',
  type: 'string',
  displayOptions: { show: { resource: ['governance'], operation: ['voteProposal'] } },
  default: '1.0',
  description: 'Weight of the vote (optional)'
},
{
  displayName: 'Delegator',
  name: 'delegator',
  type: 'string',
  displayOptions: { show: { resource: ['governance'], operation: ['getBgtDelegations'] } },
  default: '',
  description: 'Delegator address to filter delegations'
},
{
  displayName: 'Validator',
  name: 'validator',
  type: 'string',
  displayOptions: { show: { resource: ['governance'], operation: ['getBgtDelegations'] } },
  default: '',
  description: 'Validator address to filter delegations'
},
{
  displayName: 'Protocol',
  name: 'protocol',
  type: 'string',
  displayOptions: { show: { resource: ['defi'], operation: ['getPools', 'getDefiPositions'] } },
  default: '',
  description: 'Protocol name to filter pools or positions'
},
{
  displayName: 'Asset',
  name: 'asset',
  type: 'string',
  displayOptions: { show: { resource: ['defi'], operation: ['getPools'] } },
  default: '',
  description: 'Asset symbol to filter pools'
},
{
  displayName: 'Page',
  name: 'page',
  type: 'number',
  displayOptions: { show: { resource: ['defi'], operation: ['getPools', 'getDefiPositions'] } },
  default: 1,
  description: 'Page number for pagination'
},
{
  displayName: 'Limit',
  name: 'limit',
  type: 'number',
  displayOptions: { show: { resource: ['defi'], operation: ['getPools', 'getDefiPositions'] } },
  default: 20,
  description: 'Number of items per page'
},
{
  displayName: 'Pool ID',
  name: 'id',
  type: 'string',
  required: true,
  displayOptions: { show: { resource: ['defi'], operation: ['getPool'] } },
  default: '',
  description: 'ID of the specific pool'
},
{
  displayName: 'Pool ID',
  name: 'poolId',
  type: 'string',
  required: true,
  displayOptions: { show: { resource: ['defi'], operation: ['addLiquidity', 'removeLiquidity'] } },
  default: '',
  description: 'ID of the pool'
},
{
  displayName: 'Token A',
  name: 'tokenA',
  type: 'string',
  required: true,
  displayOptions: { show: { resource: ['defi'], operation: ['addLiquidity'] } },
  default: '',
  description: 'Address of the first token'
},
{
  displayName: 'Token B',
  name: 'tokenB',
  type: 'string',
  required: true,
  displayOptions: { show: { resource: ['defi'], operation: ['addLiquidity'] } },
  default: '',
  description: 'Address of the second token'
},
{
  displayName: 'Amount A',
  name: 'amountA',
  type: 'string',
  required: true,
  displayOptions: { show: { resource: ['defi'], operation: ['addLiquidity'] } },
  default: '',
  description: 'Amount of token A to add'
},
{
  displayName: 'Amount B',
  name: 'amountB',
  type: 'string',
  required: true,
  displayOptions: { show: { resource: ['defi'], operation: ['addLiquidity'] } },
  default: '',
  description: 'Amount of token B to add'
},
{
  displayName: 'Liquidity Amount',
  name: 'liquidityAmount',
  type: 'string',
  required: true,
  displayOptions: { show: { resource: ['defi'], operation: ['removeLiquidity'] } },
  default: '',
  description: 'Amount of liquidity tokens to remove'
},
{
  displayName: 'Token In',
  name: 'tokenIn',
  type: 'string',
  required: true,
  displayOptions: { show: { resource: ['defi'], operation: ['executeSwap'] } },
  default: '',
  description: 'Address of the input token'
},
{
  displayName: 'Token Out',
  name: 'tokenOut',
  type: 'string',
  required: true,
  displayOptions: { show: { resource: ['defi'], operation: ['executeSwap'] } },
  default: '',
  description: 'Address of the output token'
},
{
  displayName: 'Amount In',
  name: 'amountIn',
  type: 'string',
  required: true,
  displayOptions: { show: { resource: ['defi'], operation: ['executeSwap'] } },
  default: '',
  description: 'Amount of input tokens'
},
{
  displayName: 'Slippage',
  name: 'slippage',
  type: 'number',
  displayOptions: { show: { resource: ['defi'], operation: ['executeSwap'] } },
  default: 0.5,
  description: 'Maximum slippage tolerance percentage'
},
{
  displayName: 'Address',
  name: 'address',
  type: 'string',
  required: true,
  displayOptions: { show: { resource: ['defi'], operation: ['getDefiPositions'] } },
  default: '',
  description: 'Wallet address to get positions for'
},
{
	displayName: 'Strategy Type',
	name: 'type',
	type: 'options',
	displayOptions: {
		show: {
			resource: ['automation'],
			operation: ['getStrategies'],
		},
	},
	options: [
		{
			name: 'All',
			value: '',
		},
		{
			name: 'DCA',
			value: 'dca',
		},
		{
			name: 'Yield Farming',
			value: 'yield_farming',
		},
		{
			name: 'Arbitrage',
			value: 'arbitrage',
		},
		{
			name: 'Rebalancing',
			value: 'rebalancing',
		},
	],
	default: '',
	description: 'Filter by strategy type',
},
{
	displayName: 'Status',
	name: 'status',
	type: 'options',
	displayOptions: {
		show: {
			resource: ['automation'],
			operation: ['getStrategies'],
		},
	},
	options: [
		{
			name: 'All',
			value: '',
		},
		{
			name: 'Active',
			value: 'active',
		},
		{
			name: 'Paused',
			value: 'paused',
		},
		{
			name: 'Completed',
			value: 'completed',
		},
		{
			name: 'Failed',
			value: 'failed',
		},
	],
	default: '',
	description: 'Filter by status',
},
{
	displayName: 'Page',
	name: 'page',
	type: 'number',
	displayOptions: {
		show: {
			resource: ['automation'],
			operation: ['getStrategies', 'getExecutions'],
		},
	},
	default: 1,
	description: 'Page number for pagination',
},
{
	displayName: 'Limit',
	name: 'limit',
	type: 'number',
	displayOptions: {
		show: {
			resource: ['automation'],
			operation: ['getStrategies', 'getExecutions'],
		},
	},
	default: 100,
	description: 'Number of results per page',
},
{
	displayName: 'Strategy ID',
	name: 'strategyId',
	type: 'string',
	required: true,
	displayOptions: {
		show: {
			resource: ['automation'],
			operation: ['getStrategy', 'updateStrategy', 'deleteStrategy'],
		},
	},
	default: '',
	description: 'The ID of the strategy',
},
{
	displayName: 'Strategy Type',
	name: 'strategyType',
	type: 'options',
	required: true,
	displayOptions: {
		show: {
			resource: ['automation'],
			operation: ['createStrategy', 'updateStrategy'],
		},
	},
	options: [
		{
			name: 'DCA',
			value: 'dca',
		},
		{
			name: 'Yield Farming',
			value: 'yield_farming',
		},
		{
			name: 'Arbitrage',
			value: 'arbitrage',
		},
		{
			name: 'Rebalancing',
			value: 'rebalancing',
		},
	],
	default: 'dca',
	description: 'Type of automation strategy',
},
{
	displayName: 'Triggers',
	name: 'triggers',
	type: 'json',
	required: true,
	displayOptions: {
		show: {
			resource: ['automation'],
			operation: ['createStrategy', 'updateStrategy'],
		},
	},
	default: '[]',
	description: 'Array of trigger conditions for the strategy',
},
{
	displayName: 'Actions',
	name: 'actions',
	type: 'json',
	required: true,
	displayOptions: {
		show: {
			resource: ['automation'],
			operation: ['createStrategy', 'updateStrategy'],
		},
	},
	default: '[]',
	description: 'Array of actions to execute when triggers are met',
},
{
	displayName: 'Parameters',
	name: 'parameters',
	type: 'json',
	displayOptions: {
		show: {
			resource: ['automation'],
			operation: ['createStrategy'],
		},
	},
	default: '{}',
	description: 'Strategy-specific parameters and configuration',
},
{
	displayName: 'Strategy Status',
	name: 'strategyStatus',
	type: 'options',
	displayOptions: {
		show: {
			resource: ['automation'],
			operation: ['updateStrategy'],
		},
	},
	options: [
		{
			name: 'Active',
			value: 'active',
		},
		{
			name: 'Paused',
			value: 'paused',
		},
		{
			name: 'Completed',
			value: 'completed',
		},
	],
	default: 'active',
	description: 'Status of the strategy',
},
{
	displayName: 'Strategy ID Filter',
	name: 'strategyIdFilter',
	type: 'string',
	displayOptions: {
		show: {
			resource: ['automation'],
			operation: ['getExecutions'],
		},
	},
	default: '',
	description: 'Filter executions by strategy ID',
},
{
	displayName: 'Execution Status',
	name: 'executionStatus',
	type: 'options',
	displayOptions: {
		show: {
			resource: ['automation'],
			operation: ['getExecutions'],
		},
	},
	options: [
		{
			name: 'All',
			value: '',
		},
		{
			name: 'Pending',
			value: 'pending',
		},
		{
			name: 'Executing',
			value: 'executing',
		},
		{
			name: 'Completed',
			value: 'completed',
		},
		{
			name: 'Failed',
			value: 'failed',
		},
	],
	default: '',
	description: 'Filter by execution status',
},
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const resource = this.getNodeParameter('resource', 0) as string;

    switch (resource) {
      case 'bgtGovernance':
        return [await executeBgtGovernanceOperations.call(this, items)];
      case 'honeyStablecoin':
        return [await executeHoneyStablecoinOperations.call(this, items)];
      case 'validatorOperations':
        return [await executeValidatorOperationsOperations.call(this, items)];
      case 'deFiAutomation':
        return [await executeDeFiAutomationOperations.call(this, items)];
      case 'validators':
        return [await executeValidatorsOperations.call(this, items)];
      case 'governance':
        return [await executeGovernanceOperations.call(this, items)];
      case 'defi':
        return [await executeDefiOperations.call(this, items)];
      case 'automation':
        return [await executeAutomationOperations.call(this, items)];
      default:
        throw new NodeOperationError(this.getNode(), `The resource "${resource}" is not supported`);
    }
  }
}

// ============================================================
// Resource Handler Functions
// ============================================================

async function executeBgtGovernanceOperations(
  this: IExecuteFunctions,