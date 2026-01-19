/**
 * NFT Resource Operations
 * [Velocity BPA Licensing Notice] - BSL 1.1
 */

import { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { serializeObject } from '../../utils/serializeUtils';
import { BerachainClient } from '../../transport/berachainClient';
import { isValidAddress } from '../../utils/addressUtils';
import { Contract } from 'ethers';
import { ERC721_ABI, ERC1155_ABI } from '../../constants/abis';

export const nftOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['nft'] } },
		options: [
			{ name: 'Get Owner (ERC721)', value: 'getOwner', description: 'Get NFT owner', action: 'Get owner' },
			{ name: 'Get Balance (ERC721)', value: 'getBalance', description: 'Get NFT balance', action: 'Get balance' },
			{ name: 'Get Token URI', value: 'getTokenUri', description: 'Get token URI', action: 'Get token URI' },
			{ name: 'Transfer (ERC721)', value: 'transfer', description: 'Transfer NFT', action: 'Transfer' },
			{ name: 'Get Balance (ERC1155)', value: 'getBalance1155', description: 'Get ERC1155 balance', action: 'Get ERC1155 balance' },
		],
		default: 'getOwner',
	},
];

export const nftFields: INodeProperties[] = [
	{
		displayName: 'Contract Address',
		name: 'contractAddress',
		type: 'string',
		required: true,
		default: '',
		placeholder: '0x...',
		description: 'NFT contract address',
		displayOptions: { show: { resource: ['nft'] } },
	},
	{
		displayName: 'Token ID',
		name: 'tokenId',
		type: 'string',
		required: true,
		default: '',
		description: 'Token ID',
		displayOptions: { show: { resource: ['nft'], operation: ['getOwner', 'getTokenUri', 'transfer', 'getBalance1155'] } },
	},
	{
		displayName: 'Address',
		name: 'address',
		type: 'string',
		required: true,
		default: '',
		placeholder: '0x...',
		description: 'Account address',
		displayOptions: { show: { resource: ['nft'], operation: ['getBalance', 'getBalance1155'] } },
	},
	{
		displayName: 'To Address',
		name: 'toAddress',
		type: 'string',
		required: true,
		default: '',
		placeholder: '0x...',
		description: 'Recipient address',
		displayOptions: { show: { resource: ['nft'], operation: ['transfer'] } },
	},
];

export async function executeNftOperation(
	this: IExecuteFunctions,
	client: BerachainClient,
	operation: string,
	index: number,
): Promise<INodeExecutionData[]> {
	const returnData: INodeExecutionData[] = [];
	const provider = client.getProvider();

	switch (operation) {
		case 'getOwner': {
			const contractAddress = this.getNodeParameter('contractAddress', index) as string;
			const tokenId = this.getNodeParameter('tokenId', index) as string;
			if (!isValidAddress(contractAddress)) throw new Error('Invalid contract address');
			const contract = new Contract(contractAddress, ERC721_ABI, provider);
			const owner = await contract.ownerOf(tokenId);
			returnData.push({ json: { contract: contractAddress, tokenId, owner } });
			break;
		}

		case 'getBalance': {
			const contractAddress = this.getNodeParameter('contractAddress', index) as string;
			const address = this.getNodeParameter('address', index) as string;
			if (!isValidAddress(contractAddress) || !isValidAddress(address)) throw new Error('Invalid address');
			const contract = new Contract(contractAddress, ERC721_ABI, provider);
			const balance = await contract.balanceOf(address);
			returnData.push({ json: { contract: contractAddress, account: address, balance: balance.toString() } });
			break;
		}

		case 'getTokenUri': {
			const contractAddress = this.getNodeParameter('contractAddress', index) as string;
			const tokenId = this.getNodeParameter('tokenId', index) as string;
			if (!isValidAddress(contractAddress)) throw new Error('Invalid contract address');
			const contract = new Contract(contractAddress, ERC721_ABI, provider);
			const tokenUri = await contract.tokenURI(tokenId);
			returnData.push({ json: { contract: contractAddress, tokenId, tokenUri } });
			break;
		}

		case 'transfer': {
			const contractAddress = this.getNodeParameter('contractAddress', index) as string;
			const toAddress = this.getNodeParameter('toAddress', index) as string;
			const tokenId = this.getNodeParameter('tokenId', index) as string;
			if (!isValidAddress(contractAddress) || !isValidAddress(toAddress)) throw new Error('Invalid address');
			const wallet = client.getWallet();
			if (!wallet) throw new Error('Wallet not available');
			const contract = new Contract(contractAddress, ERC721_ABI, wallet);
			const tx = await contract.transferFrom(await wallet.getAddress(), toAddress, tokenId);
			returnData.push({ json: { txHash: tx.hash, contract: contractAddress, tokenId, to: toAddress, status: 'pending' } });
			break;
		}

		case 'getBalance1155': {
			const contractAddress = this.getNodeParameter('contractAddress', index) as string;
			const address = this.getNodeParameter('address', index) as string;
			const tokenId = this.getNodeParameter('tokenId', index) as string;
			if (!isValidAddress(contractAddress) || !isValidAddress(address)) throw new Error('Invalid address');
			const contract = new Contract(contractAddress, ERC1155_ABI, provider);
			const balance = await contract.balanceOf(address, tokenId);
			returnData.push({ json: { contract: contractAddress, account: address, tokenId, balance: balance.toString() } });
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return returnData;
}
