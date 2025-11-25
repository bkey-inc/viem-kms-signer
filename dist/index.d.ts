import { LocalAccount } from 'viem/accounts';
export interface AwsKmsSignerCredentials {
    accessKeyId?: string;
    secretAccessKey?: string;
    sessionToken?: string;
    region: string;
    keyId: string;
}
export declare class KmsSigner {
    private readonly kmsCredentials;
    private ethereumAddress;
    constructor(kmsCredentials: AwsKmsSignerCredentials);
    getAccount(): Promise<LocalAccount>;
    getAddress(): Promise<`0x${string}`>;
}
