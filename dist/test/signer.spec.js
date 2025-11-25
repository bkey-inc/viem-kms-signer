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
const viem_1 = require("viem");
const viem = __importStar(require("viem"));
const __1 = require("../");
const utils = __importStar(require("../utils/kms-utils"));
describe('Viem KMS Signer', () => {
    let signer;
    let credentials;
    beforeEach(() => {
        credentials = {
            keyId: 'kms-key-id',
        };
        signer = new __1.KmsSigner(credentials);
    });
    it('Should be defined', () => {
        expect(signer).toBeDefined();
    });
    describe('Get Address', () => {
        it('Should get eth address from kms private key', async () => {
            const expectedAddress = '0xe94e130546485b928c9c9b9a5e69eb787172952e';
            const pubKey = Uint8Array.from(Buffer.from('eafb54d808f29324e8bb65ac7b8e71531e67473dee2d48724624decc58c268a4', 'hex'));
            jest.spyOn(utils, 'getPublicKey').mockImplementation(() => {
                return {
                    PublicKey: pubKey,
                };
            });
            jest
                .spyOn(utils, 'getEthereumAddress')
                .mockImplementation(() => expectedAddress);
            const addr = await signer.getAddress();
            expect(addr).toBe(expectedAddress);
            expect(utils.getPublicKey).toHaveBeenCalledWith(credentials);
            expect(utils.getEthereumAddress).toHaveBeenCalledWith(Buffer.from(pubKey));
        });
        it('Should cache eth address in memory', async () => {
            const expectedAddress = '0xe94e130546485b928c9c9b9a5e69eb787172952e';
            const pubKey = Uint8Array.from(Buffer.from('eafb54d808f29324e8bb65ac7b8e71531e67473dee2d48724624decc58c268a4', 'hex'));
            jest.spyOn(utils, 'getPublicKey').mockImplementation(() => {
                return {
                    PublicKey: pubKey,
                };
            });
            jest
                .spyOn(utils, 'getEthereumAddress')
                .mockImplementation(() => expectedAddress);
            let addr = await signer.getAddress();
            expect(addr).toBe(expectedAddress);
            addr = await signer.getAddress();
            expect(addr).toBe(expectedAddress);
            expect(utils.getPublicKey).toHaveBeenCalledTimes(2);
            expect(utils.getEthereumAddress).toHaveBeenCalledTimes(2);
        });
    });
    describe('Get Account', () => {
        it('Should return viem account', async () => {
            const expectedAddress = '0xe94e130546485b928c9c9b9a5e69eb787172952e';
            const pubKey = Uint8Array.from(Buffer.from('eafb54d808f29324e8bb65ac7b8e71531e67473dee2d48724624decc58c268a4', 'hex'));
            jest.spyOn(utils, 'getPublicKey').mockImplementation(() => {
                return {
                    PublicKey: pubKey,
                };
            });
            jest
                .spyOn(utils, 'getEthereumAddress')
                .mockImplementation(() => expectedAddress);
            const account = await signer.getAccount();
            expect(account.address).toBe(expectedAddress);
            expect(account.signMessage).toBeDefined();
            expect(account.signTransaction).toBeDefined();
            expect(account.signTypedData).toBeDefined();
        });
    });
    describe('Account - Sign Message', () => {
        it('Should sign message', async () => {
            const expectedAddress = '0xe94e130546485b928c9c9b9a5e69eb787172952e';
            const message = 'Hello World';
            const pubKey = Uint8Array.from(Buffer.from('eafb54d808f29324e8bb65ac7b8e71531e67473dee2d48724624decc58c268a4', 'hex'));
            jest.spyOn(utils, 'getPublicKey').mockImplementation(() => {
                return {
                    PublicKey: pubKey,
                };
            });
            jest
                .spyOn(utils, 'getEthereumAddress')
                .mockImplementation(() => expectedAddress);
            jest
                .spyOn(utils, 'signDigestHex')
                .mockImplementation(() => '0xsig');
            const account = await signer.getAccount();
            const sig = await account.signMessage({ message });
            expect(sig).toBe('0xsig');
            expect(utils.signDigestHex).toHaveBeenCalledWith((0, viem_1.hashMessage)(message), credentials, expectedAddress);
        });
    });
    describe('Account - Sign Transaction', () => {
        it('Should sign message', async () => {
            const expectedAddress = '0xe94e130546485b928c9c9b9a5e69eb787172952e';
            const pubKey = Uint8Array.from(Buffer.from('eafb54d808f29324e8bb65ac7b8e71531e67473dee2d48724624decc58c268a4', 'hex'));
            const tx = {
                to: expectedAddress,
                value: (0, viem_1.parseEther)('0.1'),
            };
            jest.spyOn(utils, 'getPublicKey').mockImplementation(() => {
                return {
                    PublicKey: pubKey,
                };
            });
            jest
                .spyOn(utils, 'getEthereumAddress')
                .mockImplementation(() => expectedAddress);
            jest
                .spyOn(utils, 'signTransaction')
                .mockImplementation(() => '0xsig');
            const account = await signer.getAccount();
            const sig = await account.signTransaction(tx);
            expect(sig).toBe('0xsig');
            expect(utils.signTransaction).toHaveBeenCalledWith(tx, credentials, expectedAddress);
        });
    });
    describe('Account - Sign Typed Data', () => {
        it('Should sign message', async () => {
            const expectedAddress = '0xe94e130546485b928c9c9b9a5e69eb787172952e';
            const pubKey = Uint8Array.from(Buffer.from('eafb54d808f29324e8bb65ac7b8e71531e67473dee2d48724624decc58c268a4', 'hex'));
            const data = {
                to: expectedAddress,
                value: (0, viem_1.parseEther)('0.1'),
            };
            jest.spyOn(utils, 'getPublicKey').mockImplementation(() => {
                return {
                    PublicKey: pubKey,
                };
            });
            jest
                .spyOn(utils, 'getEthereumAddress')
                .mockImplementation(() => expectedAddress);
            jest
                .spyOn(utils, 'signDigestHex')
                .mockImplementation(() => '0xsig');
            jest
                .spyOn(viem, 'hashTypedData')
                .mockImplementation(() => '0xsig');
            const account = await signer.getAccount();
            const sig = await account.signTypedData(data);
            expect(sig).toBe('0xsig');
            expect(utils.signDigestHex).toHaveBeenCalledWith((0, viem_1.hashTypedData)(data), credentials, expectedAddress);
        });
    });
});
//# sourceMappingURL=signer.spec.js.map