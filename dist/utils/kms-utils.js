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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signTransaction = exports.signDigestHex = exports.getEthereumAddress = exports.getPublicKey = void 0;
const client_kms_1 = require("@aws-sdk/client-kms");
const asn1 = __importStar(require("asn1.js"));
const viem_1 = require("viem");
const bn_js_1 = __importDefault(require("bn.js"));
const EcdsaSigAsnParse = asn1.define('EcdsaSig', function () {
    this.seq().obj(this.key('r').int(), this.key('s').int());
});
const EcdsaPubKey = asn1.define('EcdsaPubKey', function () {
    this.seq().obj(this.key('algo').seq().obj(this.key('a').objid(), this.key('b').objid()), this.key('pubKey').bitstr());
});
async function getPublicKey(kmsCredentials) {
    const kms = new client_kms_1.KMSClient(kmsCredentials);
    const input = {
        KeyId: kmsCredentials.keyId,
    };
    const command = new client_kms_1.GetPublicKeyCommand(input);
    return await kms.send(command);
}
exports.getPublicKey = getPublicKey;
function getEthereumAddress(publicKey) {
    const res = EcdsaPubKey.decode(publicKey, 'der');
    const pubKeyBuffer = res.pubKey.data.slice(1);
    const address = (0, viem_1.keccak256)(pubKeyBuffer);
    return `0x${address.slice(-40)}`;
}
exports.getEthereumAddress = getEthereumAddress;
async function requestKmsSignature(plaintext, kmsCredentials) {
    const signature = await sign(plaintext, kmsCredentials);
    if (!signature || signature.Signature === undefined) {
        console.log('AWS KMS call failed');
        console.log(signature);
        throw new Error(`AWS KMS call failed`);
    }
    return findEthereumSig(Buffer.from(signature.Signature));
}
async function sign(digest, kmsCredentials) {
    const kms = new client_kms_1.KMSClient(kmsCredentials);
    const input = {
        KeyId: kmsCredentials.keyId,
        Message: digest,
        SigningAlgorithm: 'ECDSA_SHA_256',
        MessageType: 'DIGEST',
    };
    const command = new client_kms_1.SignCommand(input);
    return await kms.send(command);
}
function findEthereumSig(signature) {
    const decoded = EcdsaSigAsnParse.decode(signature, 'der');
    const { r, s } = decoded;
    const secp256k1N = new bn_js_1.default('fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141', 16);
    const secp256k1halfN = secp256k1N.div(new bn_js_1.default(2));
    return { r, s: s.gt(secp256k1halfN) ? secp256k1N.sub(s) : s };
}
async function determineCorrectV(msg, r, s, expectedEthAddr) {
    let v = 27;
    const pubKey = await recoverPubKeyFromSig(msg, r, s, v);
    if (pubKey.toLowerCase() !== expectedEthAddr.toLowerCase()) {
        v = 28;
    }
    return v;
}
function recoverPubKeyFromSig(msg, r, s, v) {
    return (0, viem_1.recoverAddress)({
        hash: `0x${msg.toString('hex')}`,
        signature: (0, viem_1.signatureToHex)({
            r: `0x${r.toString('hex')}`,
            s: `0x${s.toString('hex')}`,
            v: BigInt(v),
        }),
    });
}
async function signDigestHex(digestString, kmsCredentials, address) {
    return (0, viem_1.signatureToHex)(await _signDigest(digestString, kmsCredentials, address));
}
exports.signDigestHex = signDigestHex;
async function _signDigest(digestString, kmsCredentials, address) {
    const digestBuffer = Buffer.from(digestString.slice(2), 'hex');
    const sig = await requestKmsSignature(digestBuffer, kmsCredentials);
    const v = await determineCorrectV(digestBuffer, sig.r, sig.s, address);
    return {
        r: `0x${sig.r.toString('hex')}`,
        s: `0x${sig.s.toString('hex')}`,
        v: BigInt(v),
    };
}
async function signTransaction(transaction, kmsCredentials, address) {
    const serializedTx = (0, viem_1.serializeTransaction)(transaction);
    const transactionSignature = await _signDigest((0, viem_1.keccak256)(serializedTx), kmsCredentials, address);
    return (0, viem_1.serializeTransaction)(transaction, transactionSignature);
}
exports.signTransaction = signTransaction;
//# sourceMappingURL=kms-utils.js.map