/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * Berachain Contract ABIs
 *
 * Minimal ABIs for interacting with Berachain protocol contracts.
 * Contains only the functions needed for common operations.
 */

/**
 * ERC-20 Standard ABI
 */
export const ERC20_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address account) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function transferFrom(address from, address to, uint256 amount) returns (bool)',
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'event Approval(address indexed owner, address indexed spender, uint256 value)',
];

/**
 * ERC-721 Standard ABI
 */
export const ERC721_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function tokenURI(uint256 tokenId) view returns (string)',
  'function balanceOf(address owner) view returns (uint256)',
  'function ownerOf(uint256 tokenId) view returns (address)',
  'function approve(address to, uint256 tokenId)',
  'function getApproved(uint256 tokenId) view returns (address)',
  'function setApprovalForAll(address operator, bool approved)',
  'function isApprovedForAll(address owner, address operator) view returns (bool)',
  'function transferFrom(address from, address to, uint256 tokenId)',
  'function safeTransferFrom(address from, address to, uint256 tokenId)',
  'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
  'event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)',
];

/**
 * ERC-1155 Standard ABI
 */
export const ERC1155_ABI = [
  'function uri(uint256 id) view returns (string)',
  'function balanceOf(address account, uint256 id) view returns (uint256)',
  'function balanceOfBatch(address[] accounts, uint256[] ids) view returns (uint256[])',
  'function setApprovalForAll(address operator, bool approved)',
  'function isApprovedForAll(address account, address operator) view returns (bool)',
  'function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes data)',
  'function safeBatchTransferFrom(address from, address to, uint256[] ids, uint256[] amounts, bytes data)',
  'event TransferSingle(address indexed operator, address indexed from, address indexed to, uint256 id, uint256 value)',
  'event TransferBatch(address indexed operator, address indexed from, address indexed to, uint256[] ids, uint256[] values)',
];

/**
 * Wrapped BERA (WBERA) ABI
 */
export const WBERA_ABI = [
  ...ERC20_ABI,
  'function deposit() payable',
  'function withdraw(uint256 amount)',
  'event Deposit(address indexed dst, uint256 wad)',
  'event Withdrawal(address indexed src, uint256 wad)',
];

/**
 * BGT Token ABI (Bera Governance Token)
 * Note: BGT is non-transferable
 */
export const BGT_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address account) view returns (uint256)',
  'function unboostedBalanceOf(address account) view returns (uint256)',
  'function boostedBalanceOf(address account) view returns (uint256)',
  'function boosts(address account) view returns (address[] validators, uint128[] amounts)',
  'function queuedBoosts(address account) view returns (address[] validators, uint128[] amounts, uint32[] timestamps)',
  'function queueBoost(address validator, uint128 amount)',
  'function cancelBoost(address validator, uint128 amount)',
  'function activateBoost(address validator)',
  'function dropBoost(address validator, uint128 amount)',
  'function delegate(address delegatee)',
  'function delegates(address account) view returns (address)',
  'function getVotes(address account) view returns (uint256)',
  'function getPastVotes(address account, uint256 blockNumber) view returns (uint256)',
  'event QueueBoost(address indexed account, address indexed validator, uint128 amount)',
  'event ActivateBoost(address indexed account, address indexed validator, uint128 amount)',
  'event CancelBoost(address indexed account, address indexed validator, uint128 amount)',
  'event DropBoost(address indexed account, address indexed validator, uint128 amount)',
  'event DelegateChanged(address indexed delegator, address indexed fromDelegate, address indexed toDelegate)',
];

/**
 * HONEY Stablecoin ABI
 */
export const HONEY_ABI = [
  ...ERC20_ABI,
  'function mint(address collateralToken, uint256 collateralAmount, address receiver) returns (uint256)',
  'function redeem(address collateralToken, uint256 honeyAmount, address receiver) returns (uint256)',
  'function previewMint(address collateralToken, uint256 collateralAmount) view returns (uint256)',
  'function previewRedeem(address collateralToken, uint256 honeyAmount) view returns (uint256)',
  'function getMintRate(address collateralToken) view returns (uint256)',
  'function getRedeemRate(address collateralToken) view returns (uint256)',
  'function basket() view returns (address[] collaterals, uint256[] amounts)',
  'event Mint(address indexed account, address indexed collateral, uint256 collateralAmount, uint256 honeyAmount)',
  'event Redeem(address indexed account, address indexed collateral, uint256 honeyAmount, uint256 collateralAmount)',
];

/**
 * Reward Vault ABI
 */
export const REWARD_VAULT_ABI = [
  'function stake(uint256 amount)',
  'function withdraw(uint256 amount)',
  'function getReward(address account) returns (uint256)',
  'function earned(address account) view returns (uint256)',
  'function balanceOf(address account) view returns (uint256)',
  'function totalSupply() view returns (uint256)',
  'function rewardPerToken() view returns (uint256)',
  'function stakingToken() view returns (address)',
  'function rewardToken() view returns (address)',
  'function getBoostMultiplier(address account) view returns (uint256)',
  'function rewardRate() view returns (uint256)',
  'function periodFinish() view returns (uint256)',
  'event Staked(address indexed user, uint256 amount)',
  'event Withdrawn(address indexed user, uint256 amount)',
  'event RewardPaid(address indexed user, uint256 reward)',
];

/**
 * Berachef (Cutting Board) ABI
 */
export const BERACHEF_ABI = [
  'function getActiveValidators() view returns (address[])',
  'function getValidatorCuttingBoard(address validator) view returns (address[] vaults, uint256[] weights)',
  'function setValidatorCuttingBoard(address[] vaults, uint256[] weights)',
  'function getBGTPerBlock() view returns (uint256)',
  'function getRewardsForBlock(uint256 blockNumber, address validator) view returns (address[] vaults, uint256[] amounts)',
  'function getValidatorWeight(address validator) view returns (uint256)',
  'event CuttingBoardUpdated(address indexed validator, address[] vaults, uint256[] weights)',
  'event RewardsDistributed(uint256 blockNumber, address indexed validator, uint256 totalAmount)',
];

/**
 * BEX Router ABI
 */
export const BEX_ROUTER_ABI = [
  'function swapExactTokensForTokens(uint256 amountIn, uint256 amountOutMin, address[] path, address to, uint256 deadline) returns (uint256[] amounts)',
  'function swapTokensForExactTokens(uint256 amountOut, uint256 amountInMax, address[] path, address to, uint256 deadline) returns (uint256[] amounts)',
  'function swapExactETHForTokens(uint256 amountOutMin, address[] path, address to, uint256 deadline) payable returns (uint256[] amounts)',
  'function swapTokensForExactETH(uint256 amountOut, uint256 amountInMax, address[] path, address to, uint256 deadline) returns (uint256[] amounts)',
  'function swapExactTokensForETH(uint256 amountIn, uint256 amountOutMin, address[] path, address to, uint256 deadline) returns (uint256[] amounts)',
  'function swapETHForExactTokens(uint256 amountOut, address[] path, address to, uint256 deadline) payable returns (uint256[] amounts)',
  'function addLiquidity(address tokenA, address tokenB, uint256 amountADesired, uint256 amountBDesired, uint256 amountAMin, uint256 amountBMin, address to, uint256 deadline) returns (uint256 amountA, uint256 amountB, uint256 liquidity)',
  'function addLiquidityETH(address token, uint256 amountTokenDesired, uint256 amountTokenMin, uint256 amountETHMin, address to, uint256 deadline) payable returns (uint256 amountToken, uint256 amountETH, uint256 liquidity)',
  'function removeLiquidity(address tokenA, address tokenB, uint256 liquidity, uint256 amountAMin, uint256 amountBMin, address to, uint256 deadline) returns (uint256 amountA, uint256 amountB)',
  'function removeLiquidityETH(address token, uint256 liquidity, uint256 amountTokenMin, uint256 amountETHMin, address to, uint256 deadline) returns (uint256 amountToken, uint256 amountETH)',
  'function getAmountsOut(uint256 amountIn, address[] path) view returns (uint256[] amounts)',
  'function getAmountsIn(uint256 amountOut, address[] path) view returns (uint256[] amounts)',
  'function quote(uint256 amountA, uint256 reserveA, uint256 reserveB) pure returns (uint256 amountB)',
  'function factory() view returns (address)',
  'function WETH() view returns (address)',
];

/**
 * BEX Factory ABI
 */
export const BEX_FACTORY_ABI = [
  'function getPair(address tokenA, address tokenB) view returns (address pair)',
  'function allPairs(uint256 index) view returns (address pair)',
  'function allPairsLength() view returns (uint256)',
  'function createPair(address tokenA, address tokenB) returns (address pair)',
  'function feeTo() view returns (address)',
  'function feeToSetter() view returns (address)',
  'event PairCreated(address indexed token0, address indexed token1, address pair, uint256)',
];

/**
 * BEX Pair ABI
 */
export const BEX_PAIR_ABI = [
  ...ERC20_ABI,
  'function token0() view returns (address)',
  'function token1() view returns (address)',
  'function getReserves() view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)',
  'function price0CumulativeLast() view returns (uint256)',
  'function price1CumulativeLast() view returns (uint256)',
  'function kLast() view returns (uint256)',
  'function mint(address to) returns (uint256 liquidity)',
  'function burn(address to) returns (uint256 amount0, uint256 amount1)',
  'function swap(uint256 amount0Out, uint256 amount1Out, address to, bytes data)',
  'function skim(address to)',
  'function sync()',
  'event Mint(address indexed sender, uint256 amount0, uint256 amount1)',
  'event Burn(address indexed sender, uint256 amount0, uint256 amount1, address indexed to)',
  'event Swap(address indexed sender, uint256 amount0In, uint256 amount1In, uint256 amount0Out, uint256 amount1Out, address indexed to)',
];

/**
 * Bend Pool ABI
 */
export const BEND_POOL_ABI = [
  'function supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode)',
  'function withdraw(address asset, uint256 amount, address to) returns (uint256)',
  'function borrow(address asset, uint256 amount, uint256 interestRateMode, uint16 referralCode, address onBehalfOf)',
  'function repay(address asset, uint256 amount, uint256 interestRateMode, address onBehalfOf) returns (uint256)',
  'function getUserAccountData(address user) view returns (uint256 totalCollateralBase, uint256 totalDebtBase, uint256 availableBorrowsBase, uint256 currentLiquidationThreshold, uint256 ltv, uint256 healthFactor)',
  'function getReserveData(address asset) view returns (tuple(uint256 configuration, uint128 liquidityIndex, uint128 currentLiquidityRate, uint128 variableBorrowIndex, uint128 currentVariableBorrowRate, uint128 currentStableBorrowRate, uint40 lastUpdateTimestamp, uint16 id, address aTokenAddress, address stableDebtTokenAddress, address variableDebtTokenAddress, address interestRateStrategyAddress, uint128 accruedToTreasury, uint128 unbacked, uint128 isolationModeTotalDebt))',
  'function getReservesList() view returns (address[])',
  'event Supply(address indexed reserve, address user, address indexed onBehalfOf, uint256 amount, uint16 indexed referralCode)',
  'event Withdraw(address indexed reserve, address indexed user, address indexed to, uint256 amount)',
  'event Borrow(address indexed reserve, address user, address indexed onBehalfOf, uint256 amount, uint256 interestRateMode, uint256 borrowRate, uint16 indexed referralCode)',
  'event Repay(address indexed reserve, address indexed user, address indexed repayer, uint256 amount, bool useATokens)',
];

/**
 * Berps Vault ABI
 */
export const BERPS_VAULT_ABI = [
  'function deposit(uint256 amount, address receiver) returns (uint256 shares)',
  'function withdraw(uint256 shares, address receiver, address owner) returns (uint256 assets)',
  'function totalAssets() view returns (uint256)',
  'function convertToShares(uint256 assets) view returns (uint256)',
  'function convertToAssets(uint256 shares) view returns (uint256)',
  'function maxDeposit(address receiver) view returns (uint256)',
  'function maxWithdraw(address owner) view returns (uint256)',
  'function balanceOf(address account) view returns (uint256)',
  'function asset() view returns (address)',
];

/**
 * Berps Trading ABI
 */
export const BERPS_TRADING_ABI = [
  'function openTrade(tuple(address trader, uint256 pairIndex, uint256 index, uint256 initialPosToken, uint256 positionSizeHoney, uint256 openPrice, bool buy, uint256 leverage, uint256 tp, uint256 sl) trade, uint256 slippageP, bytes[] priceData) payable',
  'function closeTrade(uint256 pairIndex, uint256 index, bytes[] priceData) payable',
  'function updateSl(uint256 pairIndex, uint256 index, uint256 newSl)',
  'function updateTp(uint256 pairIndex, uint256 index, uint256 newTp)',
  'function getTrade(address trader, uint256 pairIndex, uint256 index) view returns (tuple(address trader, uint256 pairIndex, uint256 index, uint256 initialPosToken, uint256 positionSizeHoney, uint256 openPrice, bool buy, uint256 leverage, uint256 tp, uint256 sl))',
  'function getTradesCount(address trader) view returns (uint256)',
  'function getPendingOrder(uint256 orderId) view returns (tuple(address trader, uint256 pairIndex, uint256 index, uint256 positionSize, uint256 openPrice, bool buy, uint256 leverage, uint256 tp, uint256 sl, uint256 minPrice, uint256 maxPrice))',
  'event TradeOpened(address indexed trader, uint256 pairIndex, uint256 index, tuple(address trader, uint256 pairIndex, uint256 index, uint256 initialPosToken, uint256 positionSizeHoney, uint256 openPrice, bool buy, uint256 leverage, uint256 tp, uint256 sl) trade)',
  'event TradeClosed(address indexed trader, uint256 pairIndex, uint256 index, uint256 closePrice, uint256 percentProfit, uint256 positionSizeHoney)',
];

/**
 * Infrared Vault ABI
 */
export const INFRARED_VAULT_ABI = [
  'function deposit(uint256 amount, address receiver) returns (uint256)',
  'function withdraw(uint256 amount, address receiver, address owner) returns (uint256)',
  'function redeem(uint256 shares, address receiver, address owner) returns (uint256)',
  'function totalAssets() view returns (uint256)',
  'function convertToShares(uint256 assets) view returns (uint256)',
  'function convertToAssets(uint256 shares) view returns (uint256)',
  'function previewDeposit(uint256 assets) view returns (uint256)',
  'function previewRedeem(uint256 shares) view returns (uint256)',
  'function balanceOf(address account) view returns (uint256)',
  'function asset() view returns (address)',
  'function exchangeRate() view returns (uint256)',
  'event Deposit(address indexed sender, address indexed owner, uint256 assets, uint256 shares)',
  'event Withdraw(address indexed sender, address indexed receiver, address indexed owner, uint256 assets, uint256 shares)',
];

/**
 * Multicall3 ABI
 */
export const MULTICALL3_ABI = [
  'function aggregate(tuple(address target, bytes callData)[] calls) payable returns (uint256 blockNumber, bytes[] returnData)',
  'function aggregate3(tuple(address target, bool allowFailure, bytes callData)[] calls) payable returns (tuple(bool success, bytes returnData)[] returnData)',
  'function aggregate3Value(tuple(address target, bool allowFailure, uint256 value, bytes callData)[] calls) payable returns (tuple(bool success, bytes returnData)[] returnData)',
  'function blockAndAggregate(tuple(address target, bytes callData)[] calls) payable returns (uint256 blockNumber, bytes32 blockHash, tuple(bool success, bytes returnData)[] returnData)',
  'function getBasefee() view returns (uint256 basefee)',
  'function getBlockHash(uint256 blockNumber) view returns (bytes32 blockHash)',
  'function getBlockNumber() view returns (uint256 blockNumber)',
  'function getChainId() view returns (uint256 chainid)',
  'function getCurrentBlockCoinbase() view returns (address coinbase)',
  'function getCurrentBlockDifficulty() view returns (uint256 difficulty)',
  'function getCurrentBlockGasLimit() view returns (uint256 gaslimit)',
  'function getCurrentBlockTimestamp() view returns (uint256 timestamp)',
  'function getEthBalance(address addr) view returns (uint256 balance)',
  'function getLastBlockHash() view returns (bytes32 blockHash)',
  'function tryAggregate(bool requireSuccess, tuple(address target, bytes callData)[] calls) payable returns (tuple(bool success, bytes returnData)[] returnData)',
  'function tryBlockAndAggregate(bool requireSuccess, tuple(address target, bytes callData)[] calls) payable returns (uint256 blockNumber, bytes32 blockHash, tuple(bool success, bytes returnData)[] returnData)',
];

/**
 * Governance ABI
 */
export const GOVERNANCE_ABI = [
  'function propose(address[] targets, uint256[] values, bytes[] calldatas, string description) returns (uint256)',
  'function castVote(uint256 proposalId, uint8 support) returns (uint256)',
  'function castVoteWithReason(uint256 proposalId, uint8 support, string reason) returns (uint256)',
  'function execute(address[] targets, uint256[] values, bytes[] calldatas, bytes32 descriptionHash) payable returns (uint256)',
  'function state(uint256 proposalId) view returns (uint8)',
  'function proposalVotes(uint256 proposalId) view returns (uint256 againstVotes, uint256 forVotes, uint256 abstainVotes)',
  'function proposalSnapshot(uint256 proposalId) view returns (uint256)',
  'function proposalDeadline(uint256 proposalId) view returns (uint256)',
  'function proposalProposer(uint256 proposalId) view returns (address)',
  'function hasVoted(uint256 proposalId, address account) view returns (bool)',
  'function getVotes(address account, uint256 blockNumber) view returns (uint256)',
  'function quorum(uint256 blockNumber) view returns (uint256)',
  'function votingDelay() view returns (uint256)',
  'function votingPeriod() view returns (uint256)',
  'function proposalThreshold() view returns (uint256)',
  'event ProposalCreated(uint256 proposalId, address proposer, address[] targets, uint256[] values, string[] signatures, bytes[] calldatas, uint256 startBlock, uint256 endBlock, string description)',
  'event VoteCast(address indexed voter, uint256 proposalId, uint8 support, uint256 weight, string reason)',
  'event ProposalExecuted(uint256 proposalId)',
];

/**
 * Aggregated ABIS object for easy access
 */
export const ABIS = {
  ERC20: ERC20_ABI,
  ERC721: ERC721_ABI,
  ERC1155: ERC1155_ABI,
  WBERA: WBERA_ABI,
  BGT: BGT_ABI,
  HONEY: HONEY_ABI,
  BERACHEF: BERACHEF_ABI,
  REWARD_VAULT: REWARD_VAULT_ABI,
  BEX_ROUTER: BEX_ROUTER_ABI,
  BEX_POOL: BEX_PAIR_ABI,
  BEX_PAIR: BEX_PAIR_ABI,
  BEX_FACTORY: BEX_FACTORY_ABI,
  BEND_POOL: BEND_POOL_ABI,
  BERPS_TRADING: BERPS_TRADING_ABI,
  BERPS_VAULT: BERPS_VAULT_ABI,
  IBGT: INFRARED_VAULT_ABI,
  INFRARED_VAULT: INFRARED_VAULT_ABI,
  MULTICALL3: MULTICALL3_ABI,
  GOVERNANCE: GOVERNANCE_ABI,
};
