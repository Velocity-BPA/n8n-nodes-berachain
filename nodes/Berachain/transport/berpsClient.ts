/**
 * Berps Perpetuals Trading Client for Berachain
 * Handles perpetual futures positions, margin, and funding operations
 *
 * [Velocity BPA Licensing Notice]
 * This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
 * Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
 * For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.
 */

import { ethers } from 'ethers';
import { BerachainClient } from './berachainClient';
import { ABIS } from '../constants/abis';
import { getContractAddress } from '../constants/contracts';

export interface PerpMarket {
	pairIndex: number;
	name: string;
	from: string;
	to: string;
	maxLeverage: number;
	minLeverage: number;
	maxCollateralP: number;
	openFeeP: number;
	closeFeeP: number;
	oracleFeeP: number;
	rolloverFeePerBlockP: number;
	fundingFeePerBlockP: number;
	isActive: boolean;
}

export interface Position {
	trader: string;
	pairIndex: number;
	index: number;
	initialPosToken: string;
	positionSizeHoney: string;
	openPrice: string;
	buy: boolean;
	leverage: number;
	tp: string;
	sl: string;
	timestamp: number;
}

export interface PositionInfo {
	position: Position;
	currentPrice: string;
	pnl: string;
	pnlPercentage: string;
	liquidationPrice: string;
	fundingFee: string;
	rolloverFee: string;
	isProfit: boolean;
}

export interface OpenPositionParams {
	pairIndex: number;
	collateralAmount: string;
	leverage: number;
	isLong: boolean;
	openPrice: string;
	takeProfit?: string;
	stopLoss?: string;
	slippage?: number;
}

export interface OpenPositionResult {
	transactionHash: string;
	orderId: string;
	pairIndex: number;
	collateral: string;
	leverage: number;
	isLong: boolean;
}

export interface ClosePositionResult {
	transactionHash: string;
	pairIndex: number;
	positionIndex: number;
	pnl: string;
}

export interface FundingInfo {
	pairIndex: number;
	longFundingRate: string;
	shortFundingRate: string;
	nextFundingTime: number;
}

export interface OpenInterest {
	pairIndex: number;
	longOI: string;
	shortOI: string;
	maxOI: string;
}

export class BerpsClient {
	private client: BerachainClient;
	private vaultAddress: string;
	private tradingAddress: string;
	private pairsStorageAddress: string;

	constructor(client: BerachainClient) {
		this.client = client;
		const network = client.getNetwork();
		this.vaultAddress = getContractAddress(network, 'berpsVault');
		this.tradingAddress = getContractAddress(network, 'berpsTrading');
		this.pairsStorageAddress = getContractAddress(network, 'berpsPairsStorage');
	}

	/**
	 * Get all available perpetual markets
	 */
	async getMarkets(): Promise<PerpMarket[]> {
		const trading = new ethers.Contract(
			this.tradingAddress,
			ABIS.BERPS_TRADING,
			this.client.getProvider(),
		);

		// Get pairs count and iterate
		// Note: Actual implementation depends on contract interface
		const markets: PerpMarket[] = [];

		// Sample markets based on typical Berps pairs
		const samplePairs = [
			{ index: 0, name: 'BTC/USD', from: 'BTC', to: 'USD' },
			{ index: 1, name: 'ETH/USD', from: 'ETH', to: 'USD' },
			{ index: 2, name: 'BERA/USD', from: 'BERA', to: 'USD' },
		];

		for (const pair of samplePairs) {
			try {
				const marketInfo = await this.getMarketInfo(pair.index);
				markets.push(marketInfo);
			} catch {
				// Market may not exist
			}
		}

		return markets;
	}

	/**
	 * Get detailed market information
	 */
	async getMarketInfo(pairIndex: number): Promise<PerpMarket> {
		// In production, this would query the pairs storage contract
		// Simplified implementation with typical values
		return {
			pairIndex,
			name: `Pair ${pairIndex}`,
			from: 'ASSET',
			to: 'USD',
			maxLeverage: 150,
			minLeverage: 2,
			maxCollateralP: 100,
			openFeeP: 0.08,
			closeFeeP: 0.08,
			oracleFeeP: 0.02,
			rolloverFeePerBlockP: 0.000001,
			fundingFeePerBlockP: 0.000001,
			isActive: true,
		};
	}

	/**
	 * Get positions for an account
	 */
	async getPositions(account: string): Promise<Position[]> {
		const trading = new ethers.Contract(
			this.tradingAddress,
			ABIS.BERPS_TRADING,
			this.client.getProvider(),
		);

		// Query positions - actual implementation depends on contract
		const positions: Position[] = [];

		// Would iterate through user's positions
		// Simplified - in production would query storage contract

		return positions;
	}

	/**
	 * Get detailed position information including PnL
	 */
	async getPositionInfo(
		account: string,
		pairIndex: number,
		positionIndex: number,
	): Promise<PositionInfo | null> {
		const positions = await this.getPositions(account);
		const position = positions.find(
			(p) => p.pairIndex === pairIndex && p.index === positionIndex,
		);

		if (!position) {
			return null;
		}

		const currentPrice = await this.getMarkPrice(pairIndex);
		const pnl = this.calculatePnl(position, currentPrice);
		const liquidationPrice = this.calculateLiquidationPrice(position);

		return {
			position,
			currentPrice,
			pnl: pnl.amount,
			pnlPercentage: pnl.percentage,
			liquidationPrice,
			fundingFee: '0', // Would calculate from funding rate
			rolloverFee: '0', // Would calculate from rollover fee
			isProfit: pnl.isProfit,
		};
	}

	/**
	 * Open a new perpetual position
	 */
	async openPosition(params: OpenPositionParams): Promise<OpenPositionResult> {
		const wallet = this.client.getWallet();
		if (!wallet) {
			throw new Error('Wallet required for opening position');
		}

		const trading = new ethers.Contract(this.tradingAddress, ABIS.BERPS_TRADING, wallet);

		// Get HONEY token and approve if needed
		const honeyAddress = getContractAddress(this.client.getNetwork(), 'honey');
		await this.ensureApproval(honeyAddress, params.collateralAmount, wallet);

		// Calculate position parameters
		const slippage = params.slippage || 1; // 1% default slippage
		const slippageP = slippage * 100; // Convert to basis points

		// Build order tuple
		const orderTuple = {
			trader: await wallet.getAddress(),
			pairIndex: params.pairIndex,
			index: 0, // Will be assigned by contract
			initialPosToken: params.collateralAmount,
			positionSizeHoney: (
				BigInt(params.collateralAmount) * BigInt(params.leverage)
			).toString(),
			openPrice: params.openPrice,
			buy: params.isLong,
			leverage: params.leverage,
			tp: params.takeProfit || '0',
			sl: params.stopLoss || '0',
		};

		// Open market order
		const tx = await trading.openTrade(
			orderTuple,
			1, // Market order type
			slippageP,
			ethers.ZeroAddress, // Referrer
		);

		const receipt = await tx.wait();

		// Parse events to get order ID
		const orderId = '0'; // Would parse from events

		return {
			transactionHash: receipt.hash,
			orderId,
			pairIndex: params.pairIndex,
			collateral: params.collateralAmount,
			leverage: params.leverage,
			isLong: params.isLong,
		};
	}

	/**
	 * Close an existing position
	 */
	async closePosition(pairIndex: number, positionIndex: number): Promise<ClosePositionResult> {
		const wallet = this.client.getWallet();
		if (!wallet) {
			throw new Error('Wallet required for closing position');
		}

		const trading = new ethers.Contract(this.tradingAddress, ABIS.BERPS_TRADING, wallet);

		const tx = await trading.closeTradeMarket(pairIndex, positionIndex);
		const receipt = await tx.wait();

		// Parse PnL from events
		const pnl = '0'; // Would parse from events

		return {
			transactionHash: receipt.hash,
			pairIndex,
			positionIndex,
			pnl,
		};
	}

	/**
	 * Add margin to position
	 */
	async addMargin(
		pairIndex: number,
		positionIndex: number,
		amount: string,
	): Promise<string> {
		const wallet = this.client.getWallet();
		if (!wallet) {
			throw new Error('Wallet required');
		}

		const trading = new ethers.Contract(this.tradingAddress, ABIS.BERPS_TRADING, wallet);

		// Approve HONEY
		const honeyAddress = getContractAddress(this.client.getNetwork(), 'honey');
		await this.ensureApproval(honeyAddress, amount, wallet);

		const tx = await trading.updatePositionCollateral(
			pairIndex,
			positionIndex,
			amount,
			true, // isAdd
		);

		const receipt = await tx.wait();
		return receipt.hash;
	}

	/**
	 * Remove margin from position
	 */
	async removeMargin(
		pairIndex: number,
		positionIndex: number,
		amount: string,
	): Promise<string> {
		const wallet = this.client.getWallet();
		if (!wallet) {
			throw new Error('Wallet required');
		}

		const trading = new ethers.Contract(this.tradingAddress, ABIS.BERPS_TRADING, wallet);

		const tx = await trading.updatePositionCollateral(
			pairIndex,
			positionIndex,
			amount,
			false, // isAdd
		);

		const receipt = await tx.wait();
		return receipt.hash;
	}

	/**
	 * Update take profit
	 */
	async updateTakeProfit(
		pairIndex: number,
		positionIndex: number,
		newTp: string,
	): Promise<string> {
		const wallet = this.client.getWallet();
		if (!wallet) {
			throw new Error('Wallet required');
		}

		const trading = new ethers.Contract(this.tradingAddress, ABIS.BERPS_TRADING, wallet);

		const tx = await trading.updateTp(pairIndex, positionIndex, newTp);
		const receipt = await tx.wait();

		return receipt.hash;
	}

	/**
	 * Update stop loss
	 */
	async updateStopLoss(
		pairIndex: number,
		positionIndex: number,
		newSl: string,
	): Promise<string> {
		const wallet = this.client.getWallet();
		if (!wallet) {
			throw new Error('Wallet required');
		}

		const trading = new ethers.Contract(this.tradingAddress, ABIS.BERPS_TRADING, wallet);

		const tx = await trading.updateSl(pairIndex, positionIndex, newSl);
		const receipt = await tx.wait();

		return receipt.hash;
	}

	/**
	 * Get mark price for a pair
	 */
	async getMarkPrice(pairIndex: number): Promise<string> {
		// Would query price oracle
		// Simplified implementation
		return '0';
	}

	/**
	 * Get funding rate for a pair
	 */
	async getFundingRate(pairIndex: number): Promise<FundingInfo> {
		// Would calculate from current OI and funding formula
		return {
			pairIndex,
			longFundingRate: '0%',
			shortFundingRate: '0%',
			nextFundingTime: Math.floor(Date.now() / 1000) + 3600,
		};
	}

	/**
	 * Get open interest for a pair
	 */
	async getOpenInterest(pairIndex: number): Promise<OpenInterest> {
		// Would query from trading contract
		return {
			pairIndex,
			longOI: '0',
			shortOI: '0',
			maxOI: '0',
		};
	}

	/**
	 * Get liquidation price for a position
	 */
	calculateLiquidationPrice(position: Position): string {
		const openPrice = BigInt(position.openPrice);
		const leverage = BigInt(position.leverage);

		// Liquidation threshold typically at 90% loss
		const liquidationThreshold = 90n;

		if (position.buy) {
			// Long: liquidation when price drops
			const liqPrice = openPrice - (openPrice * liquidationThreshold) / (leverage * 100n);
			return liqPrice.toString();
		} else {
			// Short: liquidation when price rises
			const liqPrice = openPrice + (openPrice * liquidationThreshold) / (leverage * 100n);
			return liqPrice.toString();
		}
	}

	/**
	 * Calculate PnL for a position
	 */
	calculatePnl(
		position: Position,
		currentPrice: string,
	): { amount: string; percentage: string; isProfit: boolean } {
		const openPrice = BigInt(position.openPrice);
		const current = BigInt(currentPrice);
		const positionSize = BigInt(position.positionSizeHoney);

		let pnlAmount: bigint;

		if (position.buy) {
			// Long: profit when price goes up
			pnlAmount = ((current - openPrice) * positionSize) / openPrice;
		} else {
			// Short: profit when price goes down
			pnlAmount = ((openPrice - current) * positionSize) / openPrice;
		}

		const isProfit = pnlAmount >= 0n;
		const collateral = BigInt(position.initialPosToken);
		const percentageBps =
			collateral > 0n ? (pnlAmount * 10000n) / collateral : 0n;

		return {
			amount: pnlAmount.toString(),
			percentage: `${Number(percentageBps) / 100}%`,
			isProfit,
		};
	}

	/**
	 * Get vault TVL
	 */
	async getVaultTvl(): Promise<string> {
		const vault = new ethers.Contract(
			this.vaultAddress,
			ABIS.BERPS_VAULT,
			this.client.getProvider(),
		);

		try {
			const tvl = await vault.totalAssets();
			return tvl.toString();
		} catch {
			return '0';
		}
	}

	/**
	 * Deposit to vault (provide liquidity)
	 */
	async depositToVault(amount: string): Promise<string> {
		const wallet = this.client.getWallet();
		if (!wallet) {
			throw new Error('Wallet required');
		}

		const vault = new ethers.Contract(this.vaultAddress, ABIS.BERPS_VAULT, wallet);

		// Approve HONEY
		const honeyAddress = getContractAddress(this.client.getNetwork(), 'honey');
		await this.ensureApproval(honeyAddress, amount, wallet);

		const tx = await vault.deposit(amount, await wallet.getAddress());
		const receipt = await tx.wait();

		return receipt.hash;
	}

	/**
	 * Withdraw from vault
	 */
	async withdrawFromVault(shares: string): Promise<string> {
		const wallet = this.client.getWallet();
		if (!wallet) {
			throw new Error('Wallet required');
		}

		const vault = new ethers.Contract(this.vaultAddress, ABIS.BERPS_VAULT, wallet);

		const tx = await vault.redeem(shares, await wallet.getAddress(), await wallet.getAddress());
		const receipt = await tx.wait();

		return receipt.hash;
	}

	/**
	 * Get vault share balance
	 */
	async getVaultShares(account: string): Promise<string> {
		const vault = new ethers.Contract(
			this.vaultAddress,
			ABIS.ERC20,
			this.client.getProvider(),
		);

		const balance = await vault.balanceOf(account);
		return balance.toString();
	}

	/**
	 * Ensure token approval
	 */
	private async ensureApproval(
		tokenAddress: string,
		amount: string,
		wallet: ethers.Wallet,
	): Promise<void> {
		const token = new ethers.Contract(tokenAddress, ABIS.ERC20, wallet);
		const owner = await wallet.getAddress();

		const allowance = await token.allowance(owner, this.tradingAddress);
		if (BigInt(allowance) < BigInt(amount)) {
			const tx = await token.approve(this.tradingAddress, ethers.MaxUint256);
			await tx.wait();
		}
	}
}
