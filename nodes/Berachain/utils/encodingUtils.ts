/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { ethers, Interface, AbiCoder } from 'ethers';

/**
 * Encoding Utilities
 *
 * Helper functions for encoding and decoding Ethereum data.
 */

/**
 * Encode function data for contract calls
 */
export function encodeFunctionData(
  abi: string[],
  functionName: string,
  params: unknown[],
): string {
  const iface = new Interface(abi);
  return iface.encodeFunctionData(functionName, params);
}

/**
 * Decode function result
 */
export function decodeFunctionResult(
  abi: string[],
  functionName: string,
  data: string,
): ethers.Result {
  const iface = new Interface(abi);
  return iface.decodeFunctionResult(functionName, data);
}

/**
 * Encode event topics for filtering
 */
export function encodeEventTopics(
  abi: string[],
  eventName: string,
  indexed?: unknown[],
): (string | null)[] {
  const iface = new Interface(abi);
  const event = iface.getEvent(eventName);
  if (!event) {
    throw new Error(`Event ${eventName} not found in ABI`);
  }
  const topics = iface.encodeFilterTopics(event, indexed ?? []);
  // Flatten and convert to string | null array
  return topics.map(t => {
    if (Array.isArray(t)) {
      return t[0] || null;
    }
    return t;
  });
}

/**
 * Decode event log
 */
export function decodeEventLog(
  abi: string[],
  eventName: string,
  data: string,
  topics: string[],
): ethers.Result {
  const iface = new Interface(abi);
  const event = iface.getEvent(eventName);
  if (!event) {
    throw new Error(`Event ${eventName} not found in ABI`);
  }
  return iface.decodeEventLog(event, data, topics);
}

/**
 * Encode ABI parameters
 */
export function encodeParams(types: string[], values: unknown[]): string {
  const coder = AbiCoder.defaultAbiCoder();
  return coder.encode(types, values);
}

/**
 * Decode ABI parameters
 */
export function decodeParams(types: string[], data: string): ethers.Result {
  const coder = AbiCoder.defaultAbiCoder();
  return coder.decode(types, data);
}

/**
 * Keccak256 hash
 */
export function keccak256(data: string | Uint8Array): string {
  return ethers.keccak256(data);
}

/**
 * Calculate function selector (first 4 bytes of keccak256)
 */
export function getFunctionSelector(signature: string): string {
  return ethers.id(signature).slice(0, 10);
}

/**
 * Parse ABI from JSON string
 */
export function parseAbi(abiJson: string): ethers.InterfaceAbi {
  try {
    return JSON.parse(abiJson);
  } catch (error) {
    throw new Error('Invalid ABI JSON format');
  }
}

/**
 * Validate ABI structure
 */
export function isValidAbi(abi: unknown): boolean {
  if (!Array.isArray(abi)) {
    return false;
  }
  return abi.every((item) => {
    if (typeof item === 'string') {
      // Human-readable ABI format
      return true;
    }
    if (typeof item === 'object' && item !== null) {
      // JSON ABI format
      return 'type' in item;
    }
    return false;
  });
}

/**
 * Convert hex string to bytes
 */
export function hexToBytes(hex: string): Uint8Array {
  return ethers.getBytes(hex);
}

/**
 * Convert bytes to hex string
 */
export function bytesToHex(bytes: Uint8Array): string {
  return ethers.hexlify(bytes);
}

/**
 * Pad hex string to specified length
 */
export function padHex(hex: string, length: number): string {
  return ethers.zeroPadValue(hex, length);
}

/**
 * Encode packed data (non-standard ABI encoding)
 */
export function encodePacked(types: string[], values: unknown[]): string {
  return ethers.solidityPacked(types, values);
}
