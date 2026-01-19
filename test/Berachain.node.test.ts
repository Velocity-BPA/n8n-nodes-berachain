/**
 * Berachain Node Tests
 *
 * SPDX-License-Identifier: BSL-1.1
 * Copyright (c) 2025 Velocity BPA
 */

import { Berachain } from '../nodes/Berachain/Berachain.node';
import { BerachainTrigger } from '../nodes/Berachain/BerachainTrigger.node';

describe('Berachain Node', () => {
	let berachainNode: Berachain;

	beforeEach(() => {
		berachainNode = new Berachain();
	});

	describe('Node Definition', () => {
		it('should have correct display name', () => {
			expect(berachainNode.description.displayName).toBe('Berachain');
		});

		it('should have correct node name', () => {
			expect(berachainNode.description.name).toBe('berachain');
		});

		it('should be in blockchain group', () => {
			expect(berachainNode.description.group).toContain('transform');
		});

		it('should have version 1', () => {
			expect(berachainNode.description.version).toBe(1);
		});

		it('should require berachainNetwork credential', () => {
			const credentials = berachainNode.description.credentials;
			expect(credentials).toBeDefined();
			const networkCred = credentials?.find(c => c.name === 'berachainNetwork');
			expect(networkCred).toBeDefined();
			expect(networkCred?.required).toBe(true);
		});

		it('should have optional berachainApi credential', () => {
			const credentials = berachainNode.description.credentials;
			const apiCred = credentials?.find(c => c.name === 'berachainApi');
			expect(apiCred).toBeDefined();
			expect(apiCred?.required).toBeFalsy();
		});
	});

	describe('Resources', () => {
		it('should have resource property', () => {
			const resourceProp = berachainNode.description.properties.find(
				p => p.name === 'resource'
			);
			expect(resourceProp).toBeDefined();
			expect(resourceProp?.type).toBe('options');
		});

		it('should have all 23 resources', () => {
			const resourceProp = berachainNode.description.properties.find(
				p => p.name === 'resource'
			);
			const options = resourceProp?.options as Array<{ value: string }>;
			expect(options).toBeDefined();
			expect(options.length).toBe(23);

			const expectedResources = [
				'account', 'transaction', 'bera', 'bgt', 'honey',
				'validator', 'rewardVault', 'cuttingBoard', 'gauge',
				'bex', 'bend', 'berps', 'contract', 'token', 'nft',
				'block', 'event', 'governance', 'infrared', 'multicall',
				'analytics', 'subgraph', 'utility'
			];

			expectedResources.forEach(resource => {
				const found = options.find(o => o.value === resource);
				expect(found).toBeDefined();
			});
		});
	});

	describe('Properties Structure', () => {
		it('should have properties array', () => {
			expect(berachainNode.description.properties).toBeDefined();
			expect(Array.isArray(berachainNode.description.properties)).toBe(true);
		});

		it('should have more than just resource property', () => {
			expect(berachainNode.description.properties.length).toBeGreaterThan(1);
		});
	});
});

describe('Berachain Trigger Node', () => {
	let triggerNode: BerachainTrigger;

	beforeEach(() => {
		triggerNode = new BerachainTrigger();
	});

	describe('Node Definition', () => {
		it('should have correct display name', () => {
			expect(triggerNode.description.displayName).toBe('Berachain Trigger');
		});

		it('should have correct node name', () => {
			expect(triggerNode.description.name).toBe('berachainTrigger');
		});

		it('should be in trigger group', () => {
			expect(triggerNode.description.group).toContain('trigger');
		});

		it('should have no inputs', () => {
			expect(triggerNode.description.inputs).toEqual([]);
		});

		it('should have one main output', () => {
			expect(triggerNode.description.outputs).toContain('main');
		});
	});

	describe('Events', () => {
		it('should have event property', () => {
			const eventProp = triggerNode.description.properties.find(
				p => p.name === 'event'
			);
			expect(eventProp).toBeDefined();
			expect(eventProp?.type).toBe('options');
		});

		it('should have all expected event types', () => {
			const eventProp = triggerNode.description.properties.find(
				p => p.name === 'event'
			);
			const options = eventProp?.options as Array<{ value: string }>;
			expect(options).toBeDefined();

			const expectedEvents = [
				'newBlock', 'pendingTransaction',
				'bgtQueued', 'bgtActivated', 'bgtDropped', 'bgtDelegated',
				'honeyMinted', 'honeyRedeemed',
				'validatorReward',
				'vaultStake', 'vaultWithdraw',
				'bexSwap', 'bendSupply', 'bendBorrow',
				'berpsPositionOpened', 'berpsPositionClosed',
				'contractEvent'
			];

			expectedEvents.forEach(event => {
				const found = options.find(o => o.value === event);
				expect(found).toBeDefined();
			});
		});
	});

	describe('Custom Event Configuration', () => {
		it('should have contractAddress field for custom events', () => {
			const contractProp = triggerNode.description.properties.find(
				p => p.name === 'contractAddress'
			);
			expect(contractProp).toBeDefined();
			expect(contractProp?.displayOptions?.show?.event).toContain('contractEvent');
		});

		it('should have eventName field for custom events', () => {
			const signatureProp = triggerNode.description.properties.find(
				p => p.name === 'eventName'
			);
			expect(signatureProp).toBeDefined();
			expect(signatureProp?.displayOptions?.show?.event).toContain('contractEvent');
		});
	});
});
