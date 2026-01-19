/**
 * Bend Lending Protocol Client for Berachain
 * Handles supply, borrow, repay, and liquidation operations
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

export interface MarketInfo {
	asset: string;
	symbol: string;
	decimals: number;
	totalSupply: string;
	totalBorrow: string;
	supplyApy: string;
	borrowApy: string;
	utilizationRate: string;
	collateralFactor: string;
	liquidationThreshold: string;
	liquidationBonus: string;
	isActive: boolean;
	isFrozen: boolean;
	borrowEnabled: boolean;
}

export interface AccountPosition {
	totalCollateralBase: string;
	totalDebtBase: string;
	availableBorrowsBase: string;
	currentLiquidationThreshold: string;
	ltv: string;
	healthFactor: string;
}

export interface AssetPosition {
	asset: string;
	supplyBalance: string;
	borrowBalance: string;
	supplyApy: string;
	borrowApy: string;
	isCollateral: boolean;
}

export interface SupplyResult {
	transactionHash: string;
	asset: string;
	amount: string;
	account: string;
}

export interface BorrowResult {
	transactionHash: string;
	asset: string;
	amount: string;
	account: string;
	interestRateMode: number;
}

export interface RepayResult {
	transactionHash: string;
	asset: string;
	amount: string;
	account: string;
}

export interface WithdrawResult {
	transactionHash: string;
	asset: string;
	amount: string;
	account: string;
}

export interface LiquidationInfo {
	isLiquidatable: boolean;
	healthFactor: string;
	debtToCover: string;
	collateralToReceive: string;
}

export class BendClient {
	private client: BerachainClient;
	private poolAddress: string;
	private oracleAddress: string;
	private dataProviderAddress: string;

	constructor(client: BerachainClient) {
		this.client = client;
		const network = client.getNetwork();
		this.poolAddress = getContractAddress(network, 'bendPool');
		this.oracleAddress = getContractAddress(network, 'bendOracle');
		this.dataProviderAddress = getContractAddress(network, 'bendDataProvider');
	}

	/**
	 * Get all lending markets
	 */
	async getMarkets(): Promise<MarketInfo[]> {
		const pool = new ethers.Contract(this.poolAddress, ABIS.BEND_POOL, this.client.getProvider());

		const reservesList = await pool.getReservesList();
		const markets: MarketInfo[] = [];

		for (const asset of reservesList) {
			try {
				const marketInfo = await this.getMarketInfo(asset);
				markets.push(marketInfo);
			} catch {
				// Skip invalid markets
			}
		}

		return markets;
	}

	/**
	 * Get detailed market information
	 */
	async getMarketInfo(asset: string): Promise<MarketInfo> {
		const pool = new ethers.Contract(this.poolAddress, ABIS.BEND_POOL, this.client.getProvider());

		const reserveData = await pool.getReserveData(asset);

		// Get token info
		const token = new ethers.Contract(asset, ABIS.ERC20, this.client.getProvider());
		const [symbol, decimals] = await Promise.all([
			token.symbol().catch(() => 'UNKNOWN'),
			token.decimals().catch(() => 18),
		]);

		// Calculate APYs from rates (rates are in RAY = 1e27)
		const RAY = BigInt(10) ** BigInt(27);
		const SECONDS_PER_YEAR = 31536000n;

		const liquidityRate = BigInt(reserveData.currentLiquidityRate);
		const borrowRate = BigInt(reserveData.currentVariableBorrowRate);

		// APY = (1 + rate/SECONDS_PER_YEAR)^SECONDS_PER_YEAR - 1
		// Simplified: APY ≈ rate (for small rates)
		const supplyApy = (liquidityRate * 100n) / RAY;
		const borrowApy = (borrowRate * 100n) / RAY;

		// Get configuration
		const config = reserveData.configuration;
		const ltv = (config >> 0n) & 0xffffn;
		const liquidationThreshold = (config >> 16n) & 0xffffn;
		const liquidationBonus = (config >> 32n) & 0xffffn;
		const isActive = ((config >> 56n) & 1n) === 1n;
		const isFrozen = ((config >> 57n) & 1n) === 1n;
		const borrowEnabled = ((config >> 58n) & 1n) === 1n;

		// Get aToken for total supply
		const aTokenAddress = reserveData.aTokenAddress;
		const aToken = new ethers.Contract(aTokenAddress, ABIS.ERC20, this.client.getProvider());
		const totalSupply = await aToken.totalSupply();

		// Get variable debt token for total borrow
		const debtTokenAddress = reserveData.variableDebtTokenAddress;
		const debtToken = new ethers.Contract(debtTokenAddress, ABIS.ERC20, this.client.getProvider());
		const totalBorrow = await debtToken.totalSupply();

		// Calculate utilization
		const utilizationRate =
			BigInt(totalSupply) > 0n
				? (BigInt(totalBorrow) * 10000n) / BigInt(totalSupply)
				: 0n;

		return {
			asset,
			symbol,
			decimals: Number(decimals),
			totalSupply: totalSupply.toString(),
			totalBorrow: totalBorrow.toString(),
			supplyApy: `${supplyApy}%`,
			borrowApy: `${borrowApy}%`,
			utilizationRate: `${Number(utilizationRate) / 100}%`,
			collateralFactor: `${Number(ltv) / 100}%`,
			liquidationThreshold: `${Number(liquidationThreshold) / 100}%`,
			liquidationBonus: `${Number(liquidationBonus - 10000n) / 100}%`,
			isActive,
			isFrozen,
			borrowEnabled,
		};
	}

	/**
	 * Get account position across all markets
	 */
	async getAccountPosition(account: string): Promise<AccountPosition> {
		const pool = new ethers.Contract(this.poolAddress, ABIS.BEND_POOL, this.client.getProvider());

		const userData = await pool.getUserAccountData(account);

		return {
			totalCollateralBase: userData.totalCollateralBase.toString(),
			totalDebtBase: userData.totalDebtBase.toString(),
			availableBorrowsBase: userData.availableBorrowsBase.toString(),
			currentLiquidationThreshold: `${Number(userData.currentLiquidationThreshold) / 100}%`,
			ltv: `${Number(userData.ltv) / 100}%`,
			healthFactor: ethers.formatUnits(userData.healthFactor, 18),
		};
	}

	/**
	 * Get account position for specific asset
	 */
	async getAssetPosition(asset: string, account: string): Promise<AssetPosition> {
		const pool = new ethers.Contract(this.poolAddress, ABIS.BEND_POOL, this.client.getProvider());

		const reserveData = await pool.getReserveData(asset);
		const aTokenAddress = reserveData.aTokenAddress;
		const debtTokenAddress = reserveData.variableDebtTokenAddress;

		const aToken = new ethers.Contract(aTokenAddress, ABIS.ERC20, this.client.getProvider());
		const debtToken = new ethers.Contract(debtTokenAddress, ABIS.ERC20, this.client.getProvider());

		const [supplyBalance, borrowBalance] = await Promise.all([
			aToken.balanceOf(account),
			debtToken.balanceOf(account),
		]);

		// Check if used as collateral
		const userConfig = await pool.getUserConfiguration(account);
		// This is simplified - actual implementation would parse the bitmap
		const isCollateral = BigInt(supplyBalance) > 0n;

		const marketInfo = await this.getMarketInfo(asset);

		return {
			asset,
			supplyBalance: supplyBalance.toString(),
			borrowBalance: borrowBalance.toString(),
			supplyApy: marketInfo.supplyApy,
			borrowApy: marketInfo.borrowApy,
			isCollateral,
		};
	}

	/**
	 * Supply asset to lending pool
	 */
	async supply(asset: string, amount: string, onBehalfOf?: string): Promise<SupplyResult> {
		const wallet = this.client.getWallet();
		if (!wallet) {
			throw new Error('Wallet required for supply');
		}

		const pool = new ethers.Contract(this.poolAddress, ABIS.BEND_POOL, wallet);
		const recipient = onBehalfOf || (await wallet.getAddress());

		// Approve asset
		await this.ensureApproval(asset, amount, wallet);

		const tx = await pool.supply(asset, amount, recipient, 0);
		const receipt = await tx.wait();

		return {
			transactionHash: receipt.hash,
			asset,
			amount,
			account: recipient,
		};
	}

	/**
	 * Withdraw asset from lending pool
	 */
	async withdraw(asset: string, amount: string, recipient?: string): Promise<WithdrawResult> {
		const wallet = this.client.getWallet();
		if (!wallet) {
			throw new Error('Wallet required for withdraw');
		}

		const pool = new ethers.Contract(this.poolAddress, ABIS.BEND_POOL, wallet);
		const to = recipient || (await wallet.getAddress());

		const tx = await pool.withdraw(asset, amount, to);
		const receipt = await tx.wait();

		return {
			transactionHash: receipt.hash,
			asset,
			amount,
			account: to,
		};
	}

	/**
	 * Borrow asset from lending pool
	 */
	async borrow(
		asset: string,
		amount: string,
		interestRateMode: number = 2, // 2 = variable rate
		onBehalfOf?: string,
	): Promise<BorrowResult> {
		const wallet = this.client.getWallet();
		if (!wallet) {
			throw new Error('Wallet required for borrow');
		}

		const pool = new ethers.Contract(this.poolAddress, ABIS.BEND_POOL, wallet);
		const borrower = onBehalfOf || (await wallet.getAddress());

		const tx = await pool.borrow(asset, amount, interestRateMode, 0, borrower);
		const receipt = await tx.wait();

		return {
			transactionHash: receipt.hash,
			asset,
			amount,
			account: borrower,
			interestRateMode,
		};
	}

	/**
	 * Repay borrowed asset
	 */
	async repay(
		asset: string,
		amount: string,
		interestRateMode: number = 2,
		onBehalfOf?: string,
	): Promise<RepayResult> {
		const wallet = this.client.getWallet();
		if (!wallet) {
			throw new Error('Wallet required for repay');
		}

		const pool = new ethers.Contract(this.poolAddress, ABIS.BEND_POOL, wallet);
		const borrower = onBehalfOf || (await wallet.getAddress());

		// Approve asset
		await this.ensureApproval(asset, amount, wallet);

		const tx = await pool.repay(asset, amount, interestRateMode, borrower);
		const receipt = await tx.wait();

		return {
			transactionHash: receipt.hash,
			asset,
			amount,
			account: borrower,
		};
	}

	/**
	 * Set asset as collateral
	 */
	async setUserUseReserveAsCollateral(asset: string, useAsCollateral: boolean): Promise<string> {
		const wallet = this.client.getWallet();
		if (!wallet) {
			throw new Error('Wallet required');
		}

		const pool = new ethers.Contract(this.poolAddress, ABIS.BEND_POOL, wallet);

		const tx = await pool.setUserUseReserveAsCollateral(asset, useAsCollateral);
		const receipt = await tx.wait();

		return receipt.hash;
	}

	/**
	 * Get health factor for an account
	 */
	async getHealthFactor(account: string): Promise<string> {
		const position = await this.getAccountPosition(account);
		return position.healthFactor;
	}

	/**
	 * Check if account is liquidatable
	 */
	async getLiquidationInfo(
		account: string,
		collateralAsset: string,
		debtAsset: string,
	): Promise<LiquidationInfo> {
		const position = await this.getAccountPosition(account);
		const healthFactor = parseFloat(position.healthFactor);

		const isLiquidatable = healthFactor < 1.0;

		if (!isLiquidatable) {
			return {
				isLiquidatable: false,
				healthFactor: position.healthFactor,
				debtToCover: '0',
				collateralToReceive: '0',
			};
		}

		// Calculate max liquidatable (50% of debt typically)
		const assetPosition = await this.getAssetPosition(debtAsset, account);
		const maxDebtToCover = (BigInt(assetPosition.borrowBalance) * 5000n) / 10000n;

		return {
			isLiquidatable: true,
			healthFactor: position.healthFactor,
			debtToCover: maxDebtToCover.toString(),
			collateralToReceive: '0', // Would need oracle price to calculate
		};
	}

	/**
	 * Liquidate an unhealthy position
	 */
	async liquidate(
		collateralAsset: string,
		debtAsset: string,
		user: string,
		debtToCover: string,
		receiveAToken: boolean = false,
	): Promise<string> {
		const wallet = this.client.getWallet();
		if (!wallet) {
			throw new Error('Wallet required for liquidation');
		}

		const pool = new ethers.Contract(this.poolAddress, ABIS.BEND_POOL, wallet);

		// Approve debt asset
		await this.ensureApproval(debtAsset, debtToCover, wallet);

		const tx = await pool.liquidationCall(
			collateralAsset,
			debtAsset,
			user,
			debtToCover,
			receiveAToken,
		);
		const receipt = await tx.wait();

		return receipt.hash;
	}

	/**
	 * Get asset price from oracle
	 */
	async getAssetPrice(asset: string): Promise<string> {
		// Would query the price oracle
		// Simplified implementation
		return '0';
	}

	/**
	 * Get total value locked in Bend
	 */
	async getTvl(): Promise<string> {
		const markets = await this.getMarkets();
		let totalTvl = 0n;

		for (const market of markets) {
			totalTvl += BigInt(market.totalSupply);
		}

		return totalTvl.toString();
	}

	/**
	 * Ensure token approval for pool
	 */
	private async ensureApproval(
		tokenAddress: string,
		amount: string,
		wallet: ethers.Wallet,
	): Promise<void> {
		const token = new ethers.Contract(tokenAddress, ABIS.ERC20, wallet);
		const owner = await wallet.getAddress();

		const allowance = await token.allowance(owner, this.poolAddress);
		if (BigInt(allowance) < BigInt(amount)) {
			const tx = await token.approve(this.poolAddress, ethers.MaxUint256);
			await tx.wait();
		}
	}
}
