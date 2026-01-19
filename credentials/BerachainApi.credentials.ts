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
 * Berachain API Credentials
 *
 * Provides API access to Berachain services including:
 * - Beratrail block explorer API
 * - BGT Station API for governance data
 * - Subgraph endpoints for indexed data
 */
export class BerachainApi implements ICredentialType {
  name = 'berachainApi';
  displayName = 'Berachain API';
  documentationUrl = 'https://docs.berachain.com';
  properties: INodeProperties[] = [
    {
      displayName: 'Environment',
      name: 'environment',
      type: 'options',
      default: 'bartio',
      options: [
        {
          name: 'Mainnet',
          value: 'mainnet',
          description: 'Production API endpoints',
        },
        {
          name: 'bArtio Testnet',
          value: 'bartio',
          description: 'Testnet API endpoints',
        },
      ],
      description: 'Select the environment for API calls',
    },
    {
      displayName: 'Beratrail API Key',
      name: 'beratrailApiKey',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      description: 'API key for Beratrail block explorer. Required for enhanced explorer features.',
    },
    {
      displayName: 'Beratrail API Endpoint',
      name: 'beratrailEndpoint',
      type: 'string',
      default: '',
      placeholder: 'https://api.beratrail.io',
      description: 'Custom Beratrail API endpoint. Leave empty to use default.',
    },
    {
      displayName: 'BGT Station API',
      name: 'bgtStationApi',
      type: 'string',
      default: '',
      placeholder: 'https://api.bgtstation.com',
      description: 'BGT Station API endpoint for governance and staking data',
    },
    {
      displayName: 'BEX Subgraph URL',
      name: 'bexSubgraphUrl',
      type: 'string',
      default: '',
      placeholder: 'https://api.goldsky.com/api/public/project_xxx/subgraphs/bex/v1/gn',
      description: 'GraphQL endpoint for BEX DEX subgraph queries',
    },
    {
      displayName: 'Bend Subgraph URL',
      name: 'bendSubgraphUrl',
      type: 'string',
      default: '',
      placeholder: 'https://api.goldsky.com/api/public/project_xxx/subgraphs/bend/v1/gn',
      description: 'GraphQL endpoint for Bend lending protocol subgraph queries',
    },
    {
      displayName: 'Berps Subgraph URL',
      name: 'berpsSubgraphUrl',
      type: 'string',
      default: '',
      placeholder: 'https://api.goldsky.com/api/public/project_xxx/subgraphs/berps/v1/gn',
      description: 'GraphQL endpoint for Berps perpetuals subgraph queries',
    },
    {
      displayName: 'General Subgraph URL',
      name: 'subgraphUrl',
      type: 'string',
      default: '',
      placeholder: 'https://api.goldsky.com/api/public/project_xxx/subgraphs/berachain/v1/gn',
      description: 'General Berachain subgraph endpoint for custom GraphQL queries',
    },
  ];

  authenticate: IAuthenticateGeneric = {
    type: 'generic',
    properties: {
      headers: {
        Authorization: '=Bearer {{$credentials.beratrailApiKey}}',
      },
    },
  };

  test: ICredentialTestRequest = {
    request: {
      baseURL:
        '={{$credentials.beratrailEndpoint || ($credentials.environment === "bartio" ? "https://api.routescan.io/v2/network/testnet/evm/80084/etherscan" : "https://api.beratrail.io")}}',
      url: '/api',
      method: 'GET',
      qs: {
        module: 'block',
        action: 'getblocknobytime',
        timestamp: '={{Math.floor(Date.now() / 1000) - 60}}',
        closest: 'before',
      },
    },
  };
}
