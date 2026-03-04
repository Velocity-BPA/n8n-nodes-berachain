import {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class BerachainApi implements ICredentialType {
	name = 'berachainApi';
	displayName = 'Berachain API';
	documentationUrl = 'https://docs.berachain.com/api';
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'Your Berachain API key for authentication',
		},
		{
			displayName: 'API Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://artio.api.berachain.com/v1',
			required: true,
			description: 'The base URL for Berachain API endpoints',
		},
	];
}