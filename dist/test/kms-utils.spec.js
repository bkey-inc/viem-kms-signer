"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const kms_utils_1 = require("../utils/kms-utils");
const kmsModule = __importStar(require("@aws-sdk/client-kms"));
const viem_1 = require("viem");
jest.mock('@aws-sdk/client-kms');
describe('KMS Utils', () => {
    let credentials = { keyId: 'key-id' };
    describe('Get Public Key', () => {
        it('Should send request to AWS KMS server', async () => {
            const command = new kmsModule.GetPublicKeyCommand({
                KeyId: credentials.keyId,
            });
            jest.spyOn(kmsModule, 'KMSClient').mockImplementation(() => {
                class KMSClient {
                    async send(command) {
                        return { PublicKey: 'pubkey', command };
                    }
                }
                return new KMSClient();
            });
            const res = await (0, kms_utils_1.getPublicKey)(credentials);
            expect(JSON.stringify(res)).toBe(JSON.stringify({
                PublicKey: 'pubkey',
                command,
            }));
        });
    });
    describe('Get Ethereum Address', () => {
        it('Should return correct address', () => {
            expect((0, kms_utils_1.getEthereumAddress)(Buffer.from('3056301006072a8648ce3d020106052b8104000a03420004f2de8ae7a9f594fb0d399abfb58639f43fb80960a1ed7c6e257c11e764d4759e1773a2c7ec7b913bec5d0e3a12bd7acd199f62e86de3f83b35bf6749fc1144ba', 'hex'))).toBe('0xe94e130546485b928c9c9b9a5e69eb787172952e');
        });
    });
    describe('Sign Digest Hex', () => {
        it('Should revert if signature response does not exist', async () => {
            const addr = '0xe94e130546485b928c9c9b9a5e69eb787172952e';
            jest.spyOn(kmsModule, 'KMSClient').mockImplementation(() => {
                class KMSClient {
                    async send(command) {
                        return undefined;
                    }
                }
                return new KMSClient();
            });
            try {
                await (0, kms_utils_1.signDigestHex)((0, viem_1.hashMessage)('Hello world'), credentials, addr);
                expect(true).toBe(false);
            }
            catch (e) {
                expect(e.message).toBe('AWS KMS call failed');
            }
        });
        it('Should revert if signature does not exist', async () => {
            const addr = '0xe94e130546485b928c9c9b9a5e69eb787172952e';
            jest.spyOn(kmsModule, 'KMSClient').mockImplementation(() => {
                class KMSClient {
                    async send(command) {
                        return {
                            Signature: undefined,
                        };
                    }
                }
                return new KMSClient();
            });
            try {
                await (0, kms_utils_1.signDigestHex)((0, viem_1.hashMessage)('Hello world'), credentials, addr);
                expect(true).toBe(false);
            }
            catch (e) {
                expect(e.message).toBe('AWS KMS call failed');
            }
        });
        it('Should sign digest string', async () => {
            const addr = '0xe94e130546485b928c9c9b9a5e69eb787172952e';
            jest.spyOn(kmsModule, 'KMSClient').mockImplementation(() => {
                class KMSClient {
                    async send(command) {
                        return {
                            Signature: Uint8Array.from(Buffer.from('304502203f25afdb7ed67094101cd71109261886db9abbf1ba20cc53aec20ba01c2e6baa022100ab0de6d40f8960c252fc6f21e35e8369126fb19033f10953c42a61766635df82', 'hex')),
                        };
                    }
                }
                return new KMSClient();
            });
            const sig = await (0, kms_utils_1.signDigestHex)((0, viem_1.hashMessage)('Hello world'), credentials, addr);
            expect(sig).toBe('0x3f25afdb7ed67094101cd71109261886db9abbf1ba20cc53aec20ba01c2e6baa54f2192bf0769f3dad0390de1ca17c95a83f2b567b5796e7fba7fd166a0061bf1c');
        });
    });
    describe('Sign Transaction', () => {
        it('Should return sig', async () => {
            const tx = {
                maxFeePerGas: (0, viem_1.parseGwei)('20'),
                maxPriorityFeePerGas: (0, viem_1.parseGwei)('3'),
                gas: 21000n,
                nonce: 69,
                to: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
                chainId: 1,
            };
            const sig = await (0, kms_utils_1.signTransaction)(tx, credentials, tx.to);
            expect(sig).toBe('0x02f86b014584b2d05e008504a817c80082520894f39fd6e51aad88f6f4ce6ab8827279cfffb922668080c001a03f25afdb7ed67094101cd71109261886db9abbf1ba20cc53aec20ba01c2e6baaa054f2192bf0769f3dad0390de1ca17c95a83f2b567b5796e7fba7fd166a0061bf');
        });
    });
});
//# sourceMappingURL=kms-utils.spec.js.map