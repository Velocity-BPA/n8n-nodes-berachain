/**
 * Serialization utilities for converting complex types to IDataObject
 * [Velocity BPA Licensing Notice] - BSL 1.1
 */

import { IDataObject } from 'n8n-workflow';

/**
 * Convert any value to a JSON-serializable format
 */
export function serializeValue(value: unknown): unknown {
  if (value === null || value === undefined) {
    return value;
  }
  if (typeof value === 'bigint') {
    return value.toString();
  }
  if (Array.isArray(value)) {
    return value.map(serializeValue);
  }
  if (typeof value === 'object') {
    return serializeObject(value as Record<string, unknown>);
  }
  return value;
}

/**
 * Convert an object to IDataObject, handling BigInt and nested objects
 */
export function serializeObject(obj: Record<string, unknown>): IDataObject {
  const result: IDataObject = {};
  for (const [key, value] of Object.entries(obj)) {
    result[key] = serializeValue(value) as IDataObject[keyof IDataObject];
  }
  return result;
}

/**
 * Serialize ethers.js Block to IDataObject
 */
export function serializeBlock(block: any): IDataObject {
  if (!block) return { error: 'Block not found' };
  return {
    hash: block.hash,
    parentHash: block.parentHash,
    number: block.number?.toString() || block.number,
    timestamp: block.timestamp?.toString() || block.timestamp,
    nonce: block.nonce,
    difficulty: block.difficulty?.toString(),
    gasLimit: block.gasLimit?.toString(),
    gasUsed: block.gasUsed?.toString(),
    miner: block.miner,
    baseFeePerGas: block.baseFeePerGas?.toString(),
    transactions: block.transactions?.length || 0,
  };
}

/**
 * Serialize ethers.js TransactionResponse to IDataObject
 */
export function serializeTransaction(tx: any): IDataObject {
  if (!tx) return { error: 'Transaction not found' };
  return {
    hash: tx.hash,
    blockNumber: tx.blockNumber?.toString(),
    blockHash: tx.blockHash,
    from: tx.from,
    to: tx.to,
    value: tx.value?.toString(),
    gasLimit: tx.gasLimit?.toString(),
    gasPrice: tx.gasPrice?.toString(),
    maxFeePerGas: tx.maxFeePerGas?.toString(),
    maxPriorityFeePerGas: tx.maxPriorityFeePerGas?.toString(),
    nonce: tx.nonce,
    data: tx.data,
    chainId: tx.chainId?.toString(),
  };
}

/**
 * Serialize ethers.js TransactionReceipt to IDataObject
 */
export function serializeReceipt(receipt: any): IDataObject {
  if (!receipt) return { error: 'Receipt not found' };
  return {
    transactionHash: receipt.hash || receipt.transactionHash,
    blockNumber: receipt.blockNumber?.toString(),
    blockHash: receipt.blockHash,
    from: receipt.from,
    to: receipt.to,
    contractAddress: receipt.contractAddress,
    gasUsed: receipt.gasUsed?.toString(),
    cumulativeGasUsed: receipt.cumulativeGasUsed?.toString(),
    effectiveGasPrice: receipt.effectiveGasPrice?.toString(),
    status: receipt.status,
    logsCount: receipt.logs?.length || 0,
  };
}
