# n8n-nodes-berachain

> **[Velocity BPA Licensing Notice]**
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

The official n8n community node for Berachain, providing 4 comprehensive resources for automating BGT governance, Honey stablecoin operations, validator management, and DeFi protocols on the Berachain blockchain.

![n8n Community Node](https://img.shields.io/badge/n8n-Community%20Node-blue)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![Berachain](https://img.shields.io/badge/Berachain-Supported-orange)
![BGT](https://img.shields.io/badge/BGT-Governance-green)
![Honey](https://img.shields.io/badge/Honey-Stablecoin-yellow)

## Features

- **BGT Governance** - Vote on proposals, delegate stakes, and manage governance participation
- **Honey Stablecoin Operations** - Mint, redeem, and monitor Honey stablecoin transactions
- **Validator Management** - Automate validator operations, monitor performance, and handle delegations
- **DeFi Protocol Integration** - Interact with Berachain's native DeFi protocols and liquidity pools
- **Real-time Monitoring** - Track blockchain events, validator status, and governance activities
- **Multi-chain Support** - Compatible with Berachain testnet and mainnet environments
- **Advanced Error Handling** - Comprehensive error management with detailed logging
- **Flexible Authentication** - Secure API key-based authentication for all operations

## Installation

### Community Nodes (Recommended)

1. Open n8n
2. Go to **Settings** → **Community Nodes**
3. Click **Install a community node**
4. Enter `n8n-nodes-berachain`
5. Click **Install**

### Manual Installation

```bash
cd ~/.n8n
npm install n8n-nodes-berachain
```

### Development Installation

```bash
git clone https://github.com/Velocity-BPA/n8n-nodes-berachain.git
cd n8n-nodes-berachain
npm install
npm run build
mkdir -p ~/.n8n/custom
ln -s $(pwd) ~/.n8n/custom/n8n-nodes-berachain
n8n start
```

## Credentials Setup

| Field | Description | Required |
|-------|-------------|----------|
| API Key | Your Berachain API key for authentication | Yes |
| Network | Target network (testnet/mainnet) | Yes |
| Wallet Address | Your wallet address for operations | Yes |
| Private Key | Private key for transaction signing (encrypted) | Yes |

## Resources & Operations

### 1. BGT Governance

| Operation | Description |
|-----------|-------------|
| Get Proposals | Retrieve active and historical governance proposals |
| Vote on Proposal | Cast votes on governance proposals |
| Delegate Stake | Delegate BGT tokens to validators |
| Get Voting Power | Check current voting power and delegations |
| Create Proposal | Submit new governance proposals |
| Get Proposal Details | Retrieve detailed information about specific proposals |

### 2. Honey Stablecoin

| Operation | Description |
|-----------|-------------|
| Mint Honey | Mint new Honey stablecoins using collateral |
| Redeem Honey | Redeem Honey tokens for underlying collateral |
| Get Balance | Check Honey token balance for addresses |
| Transfer Honey | Send Honey tokens between addresses |
| Get Collateral Ratio | Monitor collateralization ratios |
| Get Minting History | Retrieve historical minting and redemption data |

### 3. Validator Operations

| Operation | Description |
|-----------|-------------|
| Get Validator Info | Retrieve validator details and performance metrics |
| Register Validator | Register a new validator on the network |
| Update Validator | Update validator configuration and metadata |
| Get Delegations | View delegations to specific validators |
| Claim Rewards | Claim validator and delegation rewards |
| Monitor Status | Check validator online status and performance |

### 4. DeFi Automation

| Operation | Description |
|-----------|-------------|
| Add Liquidity | Add liquidity to Berachain DEX pools |
| Remove Liquidity | Remove liquidity from pools |
| Swap Tokens | Execute token swaps on native DEX |
| Get Pool Info | Retrieve liquidity pool information and stats |
| Stake Tokens | Stake tokens in yield farming protocols |
| Harvest Rewards | Collect farming and staking rewards |
| Get Portfolio | View complete DeFi portfolio summary |

## Usage Examples

### Vote on BGT Governance Proposal

```javascript
{
  "operation": "voteOnProposal",
  "proposalId": "prop_12345",
  "vote": "yes",
  "votingPower": "1000000",
  "reason": "Supporting network upgrade for improved scalability"
}
```

### Mint Honey Stablecoins

```javascript
{
  "operation": "mintHoney",
  "collateralAmount": "500.0",
  "collateralToken": "BERA",
  "honeyAmount": "450.0",
  "slippageTolerance": "0.5"
}
```

### Monitor Validator Performance

```javascript
{
  "operation": "getValidatorInfo",
  "validatorAddress": "beraval1x2y3z4...",
  "includeMetrics": true,
  "timeRange": "7d"
}
```

### Execute DeFi Token Swap

```javascript
{
  "operation": "swapTokens",
  "fromToken": "BERA",
  "toToken": "HONEY",
  "amount": "100.0",
  "slippage": "1.0",
  "deadline": 1800
}
```

## Error Handling

| Error | Description | Solution |
|-------|-------------|----------|
| Invalid API Key | Authentication failed with provided credentials | Verify API key is correct and has proper permissions |
| Insufficient Balance | Not enough tokens for the requested operation | Check wallet balance and ensure sufficient funds |
| Network Timeout | Request timed out waiting for blockchain response | Retry operation or check network connectivity |
| Invalid Proposal ID | Governance proposal not found or expired | Verify proposal ID and check if proposal is still active |
| Validator Not Found | Specified validator does not exist | Confirm validator address is correct and validator is registered |
| Slippage Exceeded | Token swap failed due to price movement | Increase slippage tolerance or retry with current prices |

## Development

```bash
npm install
npm run build
npm test
npm run lint
npm run dev
```

## Author

**Velocity BPA**
- Website: [velobpa.com](https://velobpa.com)
- GitHub: [Velocity-BPA](https://github.com/Velocity-BPA)

## Licensing

This n8n community node is licensed under the **Business Source License 1.1**.

### Free Use
Permitted for personal, educational, research, and internal business use.

### Commercial Use
Use of this node within any SaaS, PaaS, hosted platform, managed service, or paid automation offering requires a commercial license.

For licensing inquiries: **licensing@velobpa.com**

See [LICENSE](LICENSE), [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md), and [LICENSING_FAQ.md](LICENSING_FAQ.md) for details.

## Contributing

Contributions are welcome! Please ensure:

1. Code follows existing style conventions
2. All tests pass (`npm test`)
3. Linting passes (`npm run lint`)
4. Documentation is updated for new features
5. Commit messages are descriptive

## Support

- **Issues**: [GitHub Issues](https://github.com/Velocity-BPA/n8n-nodes-berachain/issues)
- **Berachain Documentation**: [docs.berachain.com](https://docs.berachain.com)
- **Berachain Community**: [Discord](https://discord.gg/berachain)