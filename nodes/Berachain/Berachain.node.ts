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
      // Resource selector
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
          }
        ],
        default: 'bgtGovernance',
      },
      // Operation dropdowns per resource
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
      // Parameter definitions
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
      operation: ['getCollateral'],
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
  displayName: 'Address',
  name: 'address',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['honeyStablecoin'],
      operation: ['getPosition'],
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
      operation: ['getLiquidations'],
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
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('berachainApi') as any;

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;
      
      switch (operation) {
        case 'getValidators': {
          const status = this.getNodeParameter('status', i) as string;
          const limit = this.getNodeParameter('limit', i) as number;
          const offset = this.getNodeParameter('offset', i) as number;

          const queryParams = new URLSearchParams();
          if (status && status !== 'all') queryParams.append('status', status);
          if (limit) queryParams.append('limit', limit.toString());
          if (offset) queryParams.append('offset', offset.toString());

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/bgt/validators?${queryParams.toString()}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };
          
          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getValidator': {
          const address = this.getNodeParameter('address', i) as string;

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/bgt/validators/${address}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };
          
          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getDelegations': {
          const address = this.getNodeParameter('address', i) as string;
          const validator = this.getNodeParameter('validator', i) as string;

          const queryParams = new URLSearchParams();
          if (validator) queryParams.append('validator', validator);

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/bgt/delegations/${address}?${queryParams.toString()}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };
          
          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'delegateBgt': {
          const validator = this.getNodeParameter('validator', i) as string;
          const amount = this.getNodeParameter('amount', i) as string;
          const delegator = this.getNodeParameter('delegator', i) as string;

          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/bgt/delegate`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            body: {
              validator,
              amount,
              delegator,
            },
            json: true,
          };
          
          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'undelegateBgt': {
          const validator = this.getNodeParameter('validator', i) as string;
          const amount = this.getNodeParameter('amount', i) as string;
          const delegator = this.getNodeParameter('delegator', i) as string;

          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/bgt/undelegate`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            body: {
              validator,
              amount,
              delegator,
            },
            json: true,
          };
          
          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getRewards': {
          const address = this.getNodeParameter('address', i) as string;
          const validator = this.getNodeParameter('validator', i) as string;

          const queryParams = new URLSearchParams();
          if (validator) queryParams.append('validator', validator);

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/bgt/rewards/${address}?${queryParams.toString()}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };
          
          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'claimRewards': {
          const address = this.getNodeParameter('address', i) as string;
          const validators = this.getNodeParameter('validators', i) as string;

          const body: any = { address };
          if (validators) {
            body.validators = validators.split(',').map((v: string) => v.trim());
          }

          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/bgt/claim-rewards`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            body,
            json: true,
          };
          
          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getProposals': {
          const status = this.getNodeParameter('status', i) as string;
          const limit = this.getNodeParameter('limit', i) as number;

          const queryParams = new URLSearchParams();
          if (status && status !== 'all') queryParams.append('status', status);
          if (limit) queryParams.append('limit', limit.toString());

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/bgt/proposals?${queryParams.toString()}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };
          
          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'voteProposal': {
          const proposalId = this.getNodeParameter('proposalId', i) as string;
          const vote = this.getNodeParameter('vote', i) as string;
          const voter = this.getNodeParameter('voter', i) as string;

          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/bgt/vote`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            body: {
              proposalId,
              vote,
              voter,
            },
            json: true,
          };
          
          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
      }

      returnData.push({
        json: result,
        pairedItem: { item: i },
      });

    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({
          json: { error: error.message },
          pairedItem: { item: i },
        });
      } else {
        if (error.httpCode) {
          throw new NodeApiError(this.getNode(), error, { itemIndex: i });
        } else {
          throw new NodeOperationError(this.getNode(), error.message, { itemIndex: i });
        }
      }
    }
  }

  return returnData;
}

async function executeHoneyStablecoinOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('berachainApi') as any;

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;
      
      switch (operation) {
        case 'getSupply': {
          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/honey/supply`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };
          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getCollateral': {
          const asset = this.getNodeParameter('asset', i) as string;
          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/honey/collateral`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            qs: {
              asset: asset,
            },
            json: true,
          };
          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'mintHoney': {
          const collateralAmount = this.getNodeParameter('collateralAmount', i) as string;
          const collateralAsset = this.getNodeParameter('collateralAsset', i) as string;
          const recipient = this.getNodeParameter('recipient', i) as string;
          
          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/honey/mint`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            body: {
              collateralAmount: collateralAmount,
              collateralAsset: collateralAsset,
              recipient: recipient,
            },
            json: true,
          };
          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'burnHoney': {
          const honeyAmount = this.getNodeParameter('honeyAmount', i) as string;
          const collateralAsset = this.getNodeParameter('collateralAsset', i) as string;
          const recipient = this.getNodeParameter('recipient', i) as string;
          
          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/honey/burn`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            body: {
              honeyAmount: honeyAmount,
              collateralAsset: collateralAsset,
              recipient: recipient,
            },
            json: true,
          };
          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getPosition': {
          const address = this.getNodeParameter('address', i) as string;
          const asset = this.getNodeParameter('asset', i, '') as string;
          
          const queryParams: any = {};
          if (asset) {
            queryParams.asset = asset;
          }

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/honey/positions/${address}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            qs: queryParams,
            json: true,
          };
          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getLiquidations': {
          const limit = this.getNodeParameter('limit', i, 10) as number;
          const minRatio = this.getNodeParameter('minRatio', i, '') as string;
          
          const queryParams: any = {
            limit: limit,
          };
          if (minRatio) {
            queryParams.minRatio = minRatio;
          }

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/honey/liquidations`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            qs: queryParams,
            json: true,
          };
          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'liquidatePosition': {
          const positionId = this.getNodeParameter('positionId', i) as string;
          const liquidator = this.getNodeParameter('liquidator', i) as string;
          
          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/honey/liquidate`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            body: {
              positionId: positionId,
              liquidator: liquidator,
            },
            json: true,
          };
          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getPrice': {
          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/honey/price`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };
          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getStabilityPool': {
          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/honey/stability-pool`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };
          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
      }

      returnData.push({ json: result, pairedItem: { item: i } });
    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({ 
          json: { error: error.message }, 
          pairedItem: { item: i } 
        });
      } else {
        throw new NodeApiError(this.getNode(), error);
      }
    }
  }

  return returnData;
}

async function executeValidatorOperationsOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('berachainApi') as any;

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;

      switch (operation) {
        case 'getAllValidators': {
          const status = this.getNodeParameter('status', i) as string;
          const sortBy = this.getNodeParameter('sortBy', i) as string;
          const limit = this.getNodeParameter('limit', i) as number;

          const queryParams: any = {};
          if (status !== 'all') queryParams.status = status;
          if (sortBy) queryParams.sort_by = sortBy;
          if (limit) queryParams.limit = limit.toString();

          const queryString = new URLSearchParams(queryParams).toString();
          const url = `${credentials.baseUrl}/validators${queryString ? `?${queryString}` : ''}`;

          const options: any = {
            method: 'GET',
            url,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getValidatorDetails': {
          const address = this.getNodeParameter('address', i) as string;

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/validators/${address}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'registerValidator': {
          const address = this.getNodeParameter('address', i) as string;
          const moniker = this.getNodeParameter('moniker', i) as string;
          const commission = this.getNodeParameter('commission', i) as string;
          const details = this.getNodeParameter('details', i) as string;

          const body: any = {
            address,
            moniker,
            commission,
          };
          if (details) body.details = details;

          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/validators/register`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            body,
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'updateValidator': {
          const address = this.getNodeParameter('address', i) as string;
          const commission = this.getNodeParameter('commission', i) as string;
          const details = this.getNodeParameter('details', i) as string;

          const body: any = {};
          if (commission) body.commission = commission;
          if (details) body.details = details;

          const options: any = {
            method: 'PUT',
            url: `${credentials.baseUrl}/validators/${address}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            body,
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getValidatorPerformance': {
          const address = this.getNodeParameter('address', i) as string;
          const period = this.getNodeParameter('period', i) as string;

          const queryParams = new URLSearchParams({ period });
          const url = `${credentials.baseUrl}/validators/${address}/performance?${queryParams.toString()}`;

          const options: any = {
            method: 'GET',
            url,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getValidatorDelegators': {
          const address = this.getNodeParameter('address', i) as string;
          const limit = this.getNodeParameter('limit', i) as number;

          const queryParams = new URLSearchParams();
          if (limit) queryParams.append('limit', limit.toString());

          const url = `${credentials.baseUrl}/validators/${address}/delegators${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

          const options: any = {
            method: 'GET',
            url,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'unjailValidator': {
          const address = this.getNodeParameter('address', i) as string;
          const reason = this.getNodeParameter('reason', i) as string;

          const body: any = {};
          if (reason) body.reason = reason;

          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/validators/${address}/unjail`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            body,
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getValidatorRewards': {
          const validator = this.getNodeParameter('validator', i) as string;
          const period = this.getNodeParameter('period', i) as string;

          const queryParams = new URLSearchParams({ period });
          if (validator) queryParams.append('validator', validator);

          const url = `${credentials.baseUrl}/validators/rewards?${queryParams.toString()}`;

          const options: any = {
            method: 'GET',
            url,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getSlashingEvents': {
          const validator = this.getNodeParameter('validator', i) as string;
          const limit = this.getNodeParameter('limit', i) as number;

          const queryParams = new URLSearchParams();
          if (validator) queryParams.append('validator', validator);
          if (limit) queryParams.append('limit', limit.toString());

          const url = `${credentials.baseUrl}/validators/slashing${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

          const options: any = {
            method: 'GET',
            url,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
      }

      returnData.push({
        json: result,
        pairedItem: { item: i },
      });

    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({
          json: { error: error.message },
          pairedItem: { item: i },
        });
      } else {
        if (error.httpCode) {
          throw new NodeApiError(this.getNode(), error);
        }
        throw new NodeOperationError(this.getNode(), error.message);
      }
    }
  }

  return returnData;
}

async function executeDeFiAutomationOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('berachainApi') as any;

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;
      
      switch (operation) {
        case 'getPools': {
          const protocol = this.getNodeParameter('protocol', i) as string;
          const asset = this.getNodeParameter('asset', i) as string;
          const minTvl = this.getNodeParameter('minTvl', i) as number;
          
          const queryParams: any = {};
          if (protocol) queryParams.protocol = protocol;
          if (asset) queryParams.asset = asset;
          if (minTvl > 0) queryParams.minTvl = minTvl.toString();
          
          const queryString = Object.keys(queryParams).length > 0 
            ? '?' + new URLSearchParams(queryParams).toString() 
            : '';
          
          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/defi/pools${queryString}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };
          
          result = await this.helpers.httpRequest(options) as any;
          break;
        }
        
        case 'getPool': {
          const id = this.getNodeParameter('id', i) as string;
          
          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/defi/pools/${id}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };
          
          result = await this.helpers.httpRequest(options) as any;
          break;
        }
        
        case 'addLiquidity': {
          const poolId = this.getNodeParameter('poolId', i) as string;
          const tokenA = this.getNodeParameter('tokenA', i) as string;
          const tokenB = this.getNodeParameter('tokenB', i) as string;
          const amountA = this.getNodeParameter('amountA', i) as string;
          const amountB = this.getNodeParameter('amountB', i) as string;
          
          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/defi/add-liquidity`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            body: {
              poolId,
              tokenA,
              tokenB,
              amountA,
              amountB,
            },
            json: true,
          };
          
          result = await this.helpers.httpRequest(options) as any;
          break;
        }
        
        case 'removeLiquidity': {
          const poolId = this.getNodeParameter('poolId', i) as string;
          const lpTokens = this.getNodeParameter('lpTokens', i) as string;
          const recipient = this.getNodeParameter('recipient', i) as string;
          
          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/defi/remove-liquidity`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            body: {
              poolId,
              lpTokens,
              recipient,
            },
            json: true,
          };
          
          result = await this.helpers.httpRequest(options) as any;
          break;
        }
        
        case 'getPositions': {
          const address = this.getNodeParameter('address', i) as string;
          const protocol = this.getNodeParameter('protocol', i) as string;
          
          const queryParams: any = {};
          if (protocol) queryParams.protocol = protocol;
          
          const queryString = Object.keys(queryParams).length > 0 
            ? '?' + new URLSearchParams(queryParams).toString() 
            : '';
          
          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/defi/positions/${address}${queryString}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };
          
          result = await this.helpers.httpRequest(options) as any;
          break;
        }
        
        case 'executeSwap': {
          const tokenIn = this.getNodeParameter('tokenIn', i) as string;
          const tokenOut = this.getNodeParameter('tokenOut', i) as string;
          const amountIn = this.getNodeParameter('amountIn', i) as string;
          const recipient = this.getNodeParameter('recipient', i) as string;
          const slippage = this.getNodeParameter('slippage', i) as number;
          
          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/defi/swap`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            body: {
              tokenIn,
              tokenOut,
              amountIn,
              recipient,
              slippage,
            },
            json: true,
          };
          
          result = await this.helpers.httpRequest(options) as any;
          break;
        }
        
        case 'getYieldOpportunities': {
          const minApy = this.getNodeParameter('minApy', i) as number;
          const asset = this.getNodeParameter('asset', i) as string;
          const protocol = this.getNodeParameter('protocol', i) as string;
          
          const queryParams: any = {};
          if (minApy > 0) queryParams.minApy = minApy.toString();
          if (asset) queryParams.asset = asset;
          if (protocol) queryParams.protocol = protocol;
          
          const queryString = Object.keys(queryParams).length > 0 
            ? '?' + new URLSearchParams(queryParams).toString() 
            : '';
          
          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/defi/yields${queryString}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };
          
          result = await this.helpers.httpRequest(options) as any;
          break;
        }
        
        case 'stakeTokens': {
          const protocol = this.getNodeParameter('protocol', i) as string;
          const pool = this.getNodeParameter('pool', i) as string;
          const amount = this.getNodeParameter('amount', i) as string;
          const staker = this.getNodeParameter('staker', i) as string;
          
          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/defi/stake`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            body: {
              protocol,
              pool,
              amount,
              staker,
            },
            json: true,
          };
          
          result = await this.helpers.httpRequest(options) as any;
          break;
        }
        
        case 'unstakeTokens': {
          const protocol = this.getNodeParameter('protocol', i) as string;
          const pool = this.getNodeParameter('pool', i) as string;
          const amount = this.getNodeParameter('amount', i) as string;
          const staker = this.getNodeParameter('staker', i) as string;
          
          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/defi/unstake`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            body: {
              protocol,
              pool,
              amount,
              staker,
            },
            json: true,
          };
          
          result = await this.helpers.httpRequest(options) as any;
          break;
        }
        
        case 'getDeFiRewards': {
          const address = this.getNodeParameter('address', i) as string;
          const protocol = this.getNodeParameter('protocol', i) as string;
          
          const queryParams: any = {};
          if (protocol) queryParams.protocol = protocol;
          
          const queryString = Object.keys(queryParams).length > 0 
            ? '?' + new URLSearchParams(queryParams).toString() 
            : '';
          
          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/defi/rewards/${address}${queryString}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };
          
          result = await this.helpers.httpRequest(options) as any;
          break;
        }
        
        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
      }
      
      returnData.push({ json: result, pairedItem: { item: i } });
      
    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({ json: { error: error.message }, pairedItem: { item: i } });
      } else {
        if (error.httpCode) {
          throw new NodeApiError(this.getNode(), error);
        } else {
          throw new NodeOperationError(this.getNode(), error.message);
        }
      }
    }
  }
  
  return returnData;
}
