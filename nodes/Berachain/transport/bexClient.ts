/**
 * BEX DEX Client for Berachain
 * Handles swaps, liquidity provision, and pool operations
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
import { formatUnits, parseUnits } from 'ethers';

export interface PoolInfo {
	address: string;
	token0: string;
	token1: string;
	reserve0: string;
	reserve1: string;
	totalSupply: string;
	fee: number;
	token0Symbol?: string;
	token1Symbol?: string;
	token0Decimals?: number;
	token1Decimals?: number;
}

export interface SwapQuote {
	amountIn: string;
	amountOut: string;
	priceImpact: string;
	path: string[];
	fee: string;
	minimumReceived: string;
}

export interface LiquidityPosition {
	poolAddress: string;
	lpTokenBalance: string;
	token0Amount: string;
	token1Amount: string;
	shareOfPool: string;
}

export interface SwapResult {
	transactionHash: string;
	amountIn: string;
	amountOut: string;
	tokenIn: string;
	tokenOut: string;
	path: string[];
}

export interface LiquidityResult {
	transactionHash: string;
	lpTokensReceived?: string;
	lpTokensBurned?: string;
	token0Amount: string;
	token1Amount: string;
}

export class BexClient {
	private client: BerachainClient;
	private routerAddress: string;
	private factoryAddress: string;
	private vaultAddress: string;

	constructor(client: BerachainClient) {
		this.client = client;
		const network = client.getNetwork();
		this.routerAddress = getContractAddress(network, 'bexRouter');
		this.factoryAddress = getContractAddress(network, 'bexFactory');
		this.vaultAddress = getContractAddress(network, 'bexVault');
	}

	/**
	 * Get all pools from the factory
	 */
	async getPools(limit: number = 100, offset: number = 0): Promise<PoolInfo[]> {
		const factory = new ethers.Contract(
			this.factoryAddress,
			ABIS.BEX_FACTORY,
			this.client.getProvider(),
		);

		const poolCount = await factory.allPairsLength();
		const pools: PoolInfo[] = [];

		const end = Math.min(offset + limit, Number(poolCount));
		for (let i = offset; i < end; i++) {
			try {
				const poolAddress = await factory.allPairs(i);
				const poolInfo = await this.getPoolInfo(poolAddress);
				pools.push(poolInfo);
			} catch {
				// Skip invalid pools
			}
		}

		return pools;
	}

	/**
	 * Get detailed pool information
	 */
	async getPoolInfo(poolAddress: string): Promise<PoolInfo> {
		const pair = new ethers.Contract(poolAddress, ABIS.BEX_PAIR, this.client.getProvider());

		const [token0, token1, reserves, totalSupply] = await Promise.all([
			pair.token0(),
			pair.token1(),
			pair.getReserves(),
			pair.totalSupply(),
		]);

		// Get token info
		const token0Contract = new ethers.Contract(token0, ABIS.ERC20, this.client.getProvider());
		const token1Contract = new ethers.Contract(token1, ABIS.ERC20, this.client.getProvider());

		const [token0Symbol, token1Symbol, token0Decimals, token1Decimals] = await Promise.all([
			token0Contract.symbol().catch(() => 'UNKNOWN'),
			token1Contract.symbol().catch(() => 'UNKNOWN'),
			token0Contract.decimals().catch(() => 18),
			token1Contract.decimals().catch(() => 18),
		]);

		return {
			address: poolAddress,
			token0,
			token1,
			reserve0: reserves[0].toString(),
			reserve1: reserves[1].toString(),
			totalSupply: totalSupply.toString(),
			fee: 30, // 0.3% standard fee
			token0Symbol,
			token1Symbol,
			token0Decimals: Number(token0Decimals),
			token1Decimals: Number(token1Decimals),
		};
	}

	/**
	 * Get pool by token pair
	 */
	async getPoolByTokens(tokenA: string, tokenB: string): Promise<string | null> {
		const factory = new ethers.Contract(
			this.factoryAddress,
			ABIS.BEX_FACTORY,
			this.client.getProvider(),
		);

		const pairAddress = await factory.getPair(tokenA, tokenB);
		if (pairAddress === ethers.ZeroAddress) {
			return null;
		}

		return pairAddress;
	}

	/**
	 * Get swap quote for exact input
	 */
	async getSwapQuote(
		tokenIn: string,
		tokenOut: string,
		amountIn: string,
		slippageTolerance: number = 0.5,
	): Promise<SwapQuote> {
		const router = new ethers.Contract(
			this.routerAddress,
			ABIS.BEX_ROUTER,
			this.client.getProvider(),
		);

		// Get amounts out
		const path = [tokenIn, tokenOut];
		const amounts = await router.getAmountsOut(amountIn, path);
		const amountOut = amounts[amounts.length - 1];

		// Calculate price impact
		const poolAddress = await this.getPoolByTokens(tokenIn, tokenOut);
		let priceImpact = '0';

		if (poolAddress) {
			const poolInfo = await this.getPoolInfo(poolAddress);
			const reserveIn =
				tokenIn.toLowerCase() === poolInfo.token0.toLowerCase()
					? poolInfo.reserve0
					: poolInfo.reserve1;
			priceImpact = ((BigInt(amountIn) * 10000n) / BigInt(reserveIn) / 100n).toString();
		}

		// Calculate minimum received with slippage
		const slippageBps = Math.floor(slippageTolerance * 100);
		const minimumReceived = (BigInt(amountOut) * BigInt(10000 - slippageBps)) / 10000n;

		return {
			amountIn,
			amountOut: amountOut.toString(),
			priceImpact: `${priceImpact}%`,
			path,
			fee: '0.3%',
			minimumReceived: minimumReceived.toString(),
		};
	}

	/**
	 * Get swap quote for exact output
	 */
	async getSwapQuoteExactOutput(
		tokenIn: string,
		tokenOut: string,
		amountOut: string,
		slippageTolerance: number = 0.5,
	): Promise<SwapQuote> {
		const router = new ethers.Contract(
			this.routerAddress,
			ABIS.BEX_ROUTER,
			this.client.getProvider(),
		);

		const path = [tokenIn, tokenOut];
		const amounts = await router.getAmountsIn(amountOut, path);
		const amountIn = amounts[0];

		// Calculate maximum input with slippage
		const slippageBps = Math.floor(slippageTolerance * 100);
		const maximumInput = (BigInt(amountIn) * BigInt(10000 + slippageBps)) / 10000n;

		return {
			amountIn: amountIn.toString(),
			amountOut,
			priceImpact: '0%',
			path,
			fee: '0.3%',
			minimumReceived: amountOut,
		};
	}

	/**
	 * Execute a token swap
	 */
	async swap(
		tokenIn: string,
		tokenOut: string,
		amountIn: string,
		minAmountOut: string,
		recipient?: string,
		deadline?: number,
	): Promise<SwapResult> {
		const wallet = this.client.getWallet();
		if (!wallet) {
			throw new Error('Wallet required for swap');
		}

		const router = new ethers.Contract(this.routerAddress, ABIS.BEX_ROUTER, wallet);

		// Check and approve token if needed
		await this.ensureApproval(tokenIn, amountIn, wallet);

		const to = recipient || (await wallet.getAddress());
		const txDeadline = deadline || Math.floor(Date.now() / 1000) + 1800; // 30 min default

		const path = [tokenIn, tokenOut];

		// Check if swapping from/to native BERA
		const wberaAddress = getContractAddress(this.client.getNetwork(), 'wbera');
		const isFromBera = tokenIn.toLowerCase() === wberaAddress.toLowerCase();
		const isToBera = tokenOut.toLowerCase() === wberaAddress.toLowerCase();

		let tx;
		if (isFromBera) {
			tx = await router.swapExactETHForTokens(minAmountOut, path, to, txDeadline, {
				value: amountIn,
			});
		} else if (isToBera) {
			tx = await router.swapExactTokensForETH(amountIn, minAmountOut, path, to, txDeadline);
		} else {
			tx = await router.swapExactTokensForTokens(amountIn, minAmountOut, path, to, txDeadline);
		}

		const receipt = await tx.wait();

		return {
			transactionHash: receipt.hash,
			amountIn,
			amountOut: minAmountOut, // Actual amount from events would be more accurate
			tokenIn,
			tokenOut,
			path,
		};
	}

	/**
	 * Add liquidity to a pool
	 */
	async addLiquidity(
		tokenA: string,
		tokenB: string,
		amountADesired: string,
		amountBDesired: string,
		amountAMin: string,
		amountBMin: string,
		recipient?: string,
		deadline?: number,
	): Promise<LiquidityResult> {
		const wallet = this.client.getWallet();
		if (!wallet) {
			throw new Error('Wallet required for adding liquidity');
		}

		const router = new ethers.Contract(this.routerAddress, ABIS.BEX_ROUTER, wallet);

		// Approve both tokens
		await this.ensureApproval(tokenA, amountADesired, wallet);
		await this.ensureApproval(tokenB, amountBDesired, wallet);

		const to = recipient || (await wallet.getAddress());
		const txDeadline = deadline || Math.floor(Date.now() / 1000) + 1800;

		const wberaAddress = getContractAddress(this.client.getNetwork(), 'wbera');
		const isTokenABera = tokenA.toLowerCase() === wberaAddress.toLowerCase();
		const isTokenBBera = tokenB.toLowerCase() === wberaAddress.toLowerCase();

		let tx;
		if (isTokenABera || isTokenBBera) {
			const token = isTokenABera ? tokenB : tokenA;
			const tokenAmount = isTokenABera ? amountBDesired : amountADesired;
			const tokenAmountMin = isTokenABera ? amountBMin : amountAMin;
			const ethAmount = isTokenABera ? amountADesired : amountBDesired;
			const ethAmountMin = isTokenABera ? amountAMin : amountBMin;

			tx = await router.addLiquidityETH(
				token,
				tokenAmount,
				tokenAmountMin,
				ethAmountMin,
				to,
				txDeadline,
				{ value: ethAmount },
			);
		} else {
			tx = await router.addLiquidity(
				tokenA,
				tokenB,
				amountADesired,
				amountBDesired,
				amountAMin,
				amountBMin,
				to,
				txDeadline,
			);
		}

		const receipt = await tx.wait();

		return {
			transactionHash: receipt.hash,
			token0Amount: amountADesired,
			token1Amount: amountBDesired,
		};
	}

	/**
	 * Remove liquidity from a pool
	 */
	async removeLiquidity(
		tokenA: string,
		tokenB: string,
		liquidity: string,
		amountAMin: string,
		amountBMin: string,
		recipient?: string,
		deadline?: number,
	): Promise<LiquidityResult> {
		const wallet = this.client.getWallet();
		if (!wallet) {
			throw new Error('Wallet required for removing liquidity');
		}

		const router = new ethers.Contract(this.routerAddress, ABIS.BEX_ROUTER, wallet);

		// Get pool address and approve LP tokens
		const poolAddress = await this.getPoolByTokens(tokenA, tokenB);
		if (!poolAddress) {
			throw new Error('Pool not found');
		}

		await this.ensureApproval(poolAddress, liquidity, wallet);

		const to = recipient || (await wallet.getAddress());
		const txDeadline = deadline || Math.floor(Date.now() / 1000) + 1800;

		const wberaAddress = getContractAddress(this.client.getNetwork(), 'wbera');
		const isTokenABera = tokenA.toLowerCase() === wberaAddress.toLowerCase();
		const isTokenBBera = tokenB.toLowerCase() === wberaAddress.toLowerCase();

		let tx;
		if (isTokenABera || isTokenBBera) {
			const token = isTokenABera ? tokenB : tokenA;
			const tokenAmountMin = isTokenABera ? amountBMin : amountAMin;
			const ethAmountMin = isTokenABera ? amountAMin : amountBMin;

			tx = await router.removeLiquidityETH(
				token,
				liquidity,
				tokenAmountMin,
				ethAmountMin,
				to,
				txDeadline,
			);
		} else {
			tx = await router.removeLiquidity(
				tokenA,
				tokenB,
				liquidity,
				amountAMin,
				amountBMin,
				to,
				txDeadline,
			);
		}

		const receipt = await tx.wait();

		return {
			transactionHash: receipt.hash,
			lpTokensBurned: liquidity,
			token0Amount: amountAMin,
			token1Amount: amountBMin,
		};
	}

	/**
	 * Get LP token balance for an account
	 */
	async getLpBalance(poolAddress: string, account: string): Promise<string> {
		const pair = new ethers.Contract(poolAddress, ABIS.ERC20, this.client.getProvider());
		const balance = await pair.balanceOf(account);
		return balance.toString();
	}

	/**
	 * Get liquidity position details
	 */
	async getLiquidityPosition(poolAddress: string, account: string): Promise<LiquidityPosition> {
		const poolInfo = await this.getPoolInfo(poolAddress);
		const lpBalance = await this.getLpBalance(poolAddress, account);

		if (BigInt(lpBalance) === 0n) {
			return {
				poolAddress,
				lpTokenBalance: '0',
				token0Amount: '0',
				token1Amount: '0',
				shareOfPool: '0%',
			};
		}

		const totalSupply = BigInt(poolInfo.totalSupply);
		const balance = BigInt(lpBalance);

		const token0Amount = (balance * BigInt(poolInfo.reserve0)) / totalSupply;
		const token1Amount = (balance * BigInt(poolInfo.reserve1)) / totalSupply;
		const shareOfPool = (balance * 10000n) / totalSupply;

		return {
			poolAddress,
			lpTokenBalance: lpBalance,
			token0Amount: token0Amount.toString(),
			token1Amount: token1Amount.toString(),
			shareOfPool: `${Number(shareOfPool) / 100}%`,
		};
	}

	/**
	 * Calculate pool APY based on trading fees and BGT emissions
	 */
	async getPoolApy(poolAddress: string): Promise<{
		tradingFeeApy: string;
		bgtApy: string;
		totalApy: string;
	}> {
		// This would typically query historical data or a subgraph
		// For now, return placeholder
		return {
			tradingFeeApy: '0%',
			bgtApy: '0%',
			totalApy: '0%',
		};
	}

	/**
	 * Get BEX TVL
	 */
	async getTvl(): Promise<string> {
		// Would typically query vault or aggregate pool data
		const vault = new ethers.Contract(this.vaultAddress, ABIS.ERC20, this.client.getProvider());
		try {
			const balance = await this.client.getProvider().getBalance(this.vaultAddress);
			return balance.toString();
		} catch {
			return '0';
		}
	}

	/**
	 * Ensure token approval for router
	 */
	private async ensureApproval(
		tokenAddress: string,
		amount: string,
		wallet: ethers.Wallet,
	): Promise<void> {
		const token = new ethers.Contract(tokenAddress, ABIS.ERC20, wallet);
		const owner = await wallet.getAddress();

		const allowance = await token.allowance(owner, this.routerAddress);
		if (BigInt(allowance) < BigInt(amount)) {
			const tx = await token.approve(this.routerAddress, ethers.MaxUint256);
			await tx.wait();
		}
	}

	/**
	 * Get whitelisted pools (pools with BGT emissions)
	 */
	async getWhitelistedPools(): Promise<string[]> {
		// This would query the reward vault factory or a registry
		// For now, return empty - in production would query chain
		return [];
	}
}
