/// <reference types="node" />
import { GetPublicKeyCommandOutput } from '@aws-sdk/client-kms';
import { AwsKmsSignerCredentials } from '..';
import { TransactionSerializable } from 'viem';
export declare function getPublicKey(kmsCredentials: AwsKmsSignerCredentials): Promise<GetPublicKeyCommandOutput>;
export declare function getEthereumAddress(publicKey: Buffer): `0x${string}`;
export declare function signDigestHex(digestString: string, kmsCredentials: AwsKmsSignerCredentials, address: `0x${string}`): Promise<`0x${string}`>;
export declare function signTransaction(transaction: TransactionSerializable, kmsCredentials: AwsKmsSignerCredentials, address: `0x${string}`): Promise<`0x${string}`>;
