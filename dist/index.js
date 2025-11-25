"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KmsSigner = void 0;
const accounts_1 = require("viem/accounts");
const kms_utils_1 = require("./utils/kms-utils");
const viem_1 = require("viem");
class KmsSigner {
    constructor(kmsCredentials) {
        this.kmsCredentials = kmsCredentials;
    }
    async getAccount() {
        const address = await this.getAddress();
        const credentials = this.kmsCredentials;
        return (0, accounts_1.toAccount)({
            address,
            async sign({ hash }) {
                return await (0, kms_utils_1.signDigestHex)(hash, credentials, address);
            },
            async signMessage({ message }) {
                return await (0, kms_utils_1.signDigestHex)((0, viem_1.hashMessage)(message), credentials, address);
            },
            async signTransaction(transaction) {
                return await (0, kms_utils_1.signTransaction)(transaction, credentials, address);
            },
            async signTypedData(typedData) {
                return await (0, kms_utils_1.signDigestHex)((0, viem_1.hashTypedData)(typedData), credentials, address);
            },
        });
    }
    async getAddress() {
        if (this.ethereumAddress === undefined) {
            const key = await (0, kms_utils_1.getPublicKey)(this.kmsCredentials);
            this.ethereumAddress = (0, kms_utils_1.getEthereumAddress)(Buffer.from(key.PublicKey));
        }
        return Promise.resolve(this.ethereumAddress);
    }
}
exports.KmsSigner = KmsSigner;
//# sourceMappingURL=index.js.map