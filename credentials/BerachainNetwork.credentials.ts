/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
  IAuthenticateGeneric,
  ICredentialTestRequest,
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

/**
 * Berachain Network Credentials
 *
 * Provides connection settings for Berachain blockchain including:
 * - Network selection (Mainnet, bArtio Testnet, Custom)
 * - RPC endpoint configuration
 * - Private key for transaction signing
 * - WebSocket endpoint for real-time subscriptions
 */
export class BerachainNetwork implements ICredentialType {
  name = 'berachainNetwork';
  displayName = 'Berachain Network';
  documentationUrl = 'https://docs.berachain.com';
  properties: INodeProperties[] = [
    {
      displayName: 'Network',
      name: 'network',
      type: 'options',
      default: 'bartio',
      options: [
        {
          name: 'Berachain Mainnet',
          value: 'mainnet',
          description: 'Berachain production network',
        },
        {
          name: 'Berachain bArtio Testnet',
          value: 'bartio',
          description: 'Berachain testnet for development and testing',
        },
        {
          name: 'Custom Endpoint',
          value: 'custom',
          description: 'Use a custom RPC endpoint',
        },
      ],
      description: 'Select the Berachain network to connect to',
    },
    {
      displayName: 'RPC Endpoint URL',
      name: 'rpcUrl',
      type: 'string',
      default: '',
      placeholder: 'https://bartio.rpc.berachain.com',
      description: 'The RPC endpoint URL. Leave empty to use default for selected network.',
      displayOptions: {
        show: {
          network: ['custom'],
        },
      },
    },
    {
      displayName: 'Chain ID',
      name: 'chainId',
      type: 'number',
      default: 80084,
      description:
        'The chain ID for the network. bArtio Testnet: 80084. Auto-populated for standard networks.',
      displayOptions: {
        show: {
          network: ['custom'],
        },
      },
    },
    {
      displayName: 'Private Key',
      name: 'privateKey',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      placeholder: '0x...',
      description:
        'Your wallet private key for signing transactions. Never share this with anyone.',
      hint: 'Required for write operations like sending transactions, staking, swapping, etc.',
    },
    {
      displayName: 'WebSocket Endpoint',
      name: 'wsUrl',
      type: 'string',
      default: '',
      placeholder: 'wss://bartio.rpc.berachain.com/ws',
      description:
        'WebSocket endpoint for real-time event subscriptions. Leave empty to use default.',
    },
    {
      displayName: 'Beratrail API Key',
      name: 'beratrailApiKey',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      description: 'Optional API key for Beratrail block explorer enhanced features',
    },
  ];

  authenticate: IAuthenticateGeneric = {
    type: 'generic',
    properties: {},
  };

  test: ICredentialTestRequest = {
    request: {
      baseURL: '={{$credentials.network === "bartio" ? "https://bartio.rpc.berachain.com" : $credentials.network === "mainnet" ? "https://rpc.berachain.com" : $credentials.rpcUrl}}',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_chainId',
        params: [],
        id: 1,
      }),
    },
  };
}
