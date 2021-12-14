import nacl_factory from '@/assets/js/nacl_factory.min'
import {
    Mnemonic
} from '@/assets/js/jsbip39'
import Base58 from '@/assets/js/Base58.js'
import SHA256 from '@/assets/js/sha256'
import CryptoJS from 'crypto-js'
import api from '@/api/api'
import {
    Dialog
} from 'cube-ui'

const mcf = (function () {
    let cachedPrivateKeys = []
    const generateAddress = mnemonic => {
        return new Promise((resolve, reject) => {
            nacl_factory.instantiate(nacl => {
                let mnemo = new Mnemonic("english")
                let hexStr = mnemonic ? mnemo.revertEntropy(mnemonic) : nacl.to_hex(nacl.random_bytes(16))
                // console.log(hexStr)
                // if (!hexStr) return reject({ err_message: '助记词无效' })
                if (!hexStr) return reject({
                    err_message: window.vm.$t('mcf.mnemonicError')
                })
                mnemonic = mnemo.toMnemonic(nacl.from_hex(hexStr))
                let privateKey = Base58.encode(nacl.crypto_hash_sha256(nacl.from_hex(hexStr)))
                // console.log("privateKey:" + privateKey)
                let publicKey = Base58.encode(nacl.crypto_sign_seed_keypair(nacl.crypto_hash_sha256(nacl.from_hex(hexStr))).signPk)
                // console.log("publicKey:" + publicKey)
                let _publicKey = typeof publicKey === "string" ? Base58.decode(publicKey) : reject({
                    err_message: window.vm.$t('mcf.publicKeyError')
                })
                let publicKeyHashSHA256 = nacl.crypto_hash_sha256(_publicKey)
                let publicKeyHashHex = nacl.to_hex(publicKeyHashSHA256)
                let publicKeyHashWordArray = CryptoJS.enc.Hex.parse(publicKeyHashHex)
                let publicKeyHash = CryptoJS.RIPEMD160(publicKeyHashWordArray).toString()
                const ADDRESS_VERSION = 58
                let addressArray = new Uint8Array()
                addressArray = concatUint8Arrays(addressArray, [ADDRESS_VERSION])
                addressArray = concatUint8Arrays(addressArray, nacl.from_hex(publicKeyHash))
                let checkSum = nacl.crypto_hash_sha256(nacl.crypto_hash_sha256(addressArray))
                addressArray = concatUint8Arrays(addressArray, checkSum.subarray(0, 4))
                let address = Base58.encode(addressArray)
                // console.log("address:" + address)
                resolve({
                    mnemonic,
                    privateKey,
                    publicKey,
                    address
                })
            })
        })
    }

    const transactions = async (txType, config) => {
        console.log(config)
        let {
            creator
        } = config
        let privateKey = await getPrivateKey(creator, config.code)
        console.log(privateKey)
        return new Promise((resolve, reject) => {
            api.getAddresses(creator, {
                showLoading: true
            }).then(res => {
                let reference = res.data.reference
                if (reference) {
                    console.log(reference)
                    nacl_factory.instantiate(function (nacl) {
                        let str = generateTransactionStr(nacl, txType, reference, privateKey, config)
                        console.log(str)
                        api.transactionsProcess(str, {
                            showLoading: true
                        }).then(res => {
                            resolve(res.data)
                        }).catch(err => {
                            console.log(err)
                            reject(err)
                        })
                    })
                } else {
                    reject({
                        err_message: window.vm.$t('mcf.newAddressError')
                    })
                }
            })
        })
    }

    const getPrivateKey = (address, code) => {
        console.log(address)
        return new Promise((resolve, reject) => {
            if (!address)
                reject({
                    err_message: window.vm.$t('mcf.addressError')
                })
            if (cachedPrivateKeys[address]) {
                resolve(cachedPrivateKeys[address])
            } else {
                Dialog.$create({
                    type: 'prompt',
                    title: window.vm.$t('mcf.enterPwd'),
                    confirmBtn: {
                        text: window.vm.$t('common.btnConfirm')
                    },
                    cancelBtn: {
                        text: window.vm.$t('common.btnCancel')
                    },
                    prompt: {
                        value: '',
                        placeholder: window.vm.$t('mcf.enterPwd'),
                        type: 'password',
                    },
                    onConfirm: (e, promptValue) => {
                        let privateKey = decryptPwd(code, promptValue)
                        if (privateKey) {
                            cachedPrivateKeys[address] = privateKey
                            resolve(privateKey)
                        } else {
                            reject({
                                err_message: window.vm.$t('mcf.pwdError')
                            })
                        }

                    },
                    onCancel: () => {
                        document.querySelector('.cube-input-field').value = ''
                        reject({
                            err_message: window.vm.$t('common.btnCancel')
                        })
                    }
                }).show()
            }
        })
    }

    const encryptPwd = (plaintText, key) => {
        let salt = localStorage.getItem('salt')
        console.log("encryptPwd salt", salt)
        key = hardenKey(salt, key, 10000)
        let enc = CryptoJS.AES.encrypt(plaintText, key).toString()
        return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(enc))
        // return CryptoJS.AES.encrypt(plaintText, key).toString()
    }

    const decryptPwd = (ciphertext, key) => {
        let salt = localStorage.getItem('salt')
        console.log("decryptPwd salt", salt)
        let data = CryptoJS.enc.Base64.parse(ciphertext).toString(CryptoJS.enc.Utf8)
        key = hardenKey(salt, key, 10000)
        // console.log(key)
        console.log(CryptoJS.AES.decrypt(data, key).toString(CryptoJS.enc.Utf8))
        return CryptoJS.AES.decrypt(data, key).toString(CryptoJS.enc.Utf8)
        // return CryptoJS.AES.decrypt(ciphertext, key).toString(CryptoJS.enc.Utf8);
    }

    const generateTransactionStr = (nacl, txType, reference, privateKey, config) => {
        console.log(txType)
        const txConfig = {
            'PAYMENT': {
                txTypeID: 2
            },
            'TRANSFER_ASSET': {
                txTypeID: 12
            },
            'CREATE_ASSET_ORDER': {
                txTypeID: 13
            },
            'CANCEL_ASSET_ORDER': {
                txTypeID: 14
            },
            'JOIN_GROUP': {
                txTypeID: 31
            },
            'GROUP_APPROVAL': {
                txTypeID: 33
            },
            'ENABLE_FORGING': {
                txTypeID: 37
            },
            'PROXY_FORGING': {
                txTypeID: 38
            },

        }
        let head = strAddZero(parseInt(txConfig[txType].txTypeID).toString(16), 8)
        let timestamp = strAddZero(parseInt(new Date().getTime()).toString(16), 16)
        let txGroupId = '00000000'
        reference = nacl.to_hex(Base58.decode(reference))
        let spk = nacl.to_hex(nacl.crypto_sign_seed_keypair(Base58.decode(privateKey)).signPk)
        let fee = strAddZero(parseInt(0.00001 * 100000000).toString(16), 16)

        let signStr, recipient, amount
        switch (txType) {
            case 'PAYMENT':
                recipient = nacl.to_hex(Base58.decode(config.recipient))
                amount = strAddZero(parseInt(config.amount * 100000000).toString(16), 16)
                signStr = head + timestamp + txGroupId + reference + spk + recipient + amount + fee
                break;
            case 'TRANSFER_ASSET':
                console.log(config)
                recipient = nacl.to_hex(Base58.decode(config.recipient))
                amount = strAddZero(parseInt(config.amount * 100000000).toString(16), 24)
                console.log(config.amount * 100000000)
                console.log(parseInt(config.amount * 100000000).toString(16))
                let assetId = strAddZero(parseInt(config.assetId).toString(16), 16)
                signStr = head + timestamp + txGroupId + reference + spk + recipient + assetId + amount + fee
                break;
            case 'CREATE_ASSET_ORDER':
                let haveAssetId = strAddZero(parseInt(config.haveAssetId).toString(16), 16);
                let wantAssetId = strAddZero(parseInt(config.wantAssetId).toString(16), 16);
                amount = strAddZero(parseInt(config.amount * 100000000).toString(16), 24)
                let price = strAddZero(parseInt(config.price * 100000000).toString(16), 24)
                signStr = head + timestamp + txGroupId + reference + spk + haveAssetId + wantAssetId + amount + price + fee
                break;
            case 'CANCEL_ASSET_ORDER':
                let oId = nacl.to_hex(Base58.decode(config.orderId))
                signStr = head + timestamp + txGroupId + reference + spk + oId + fee
                break;
            case 'JOIN_GROUP':
                let groupId = strAddZero(parseInt(config.groupId).toString(16), 8)
                signStr = head + timestamp + txGroupId + reference + spk + groupId + fee
                break;
            case 'GROUP_APPROVAL':
                let signature = nacl.to_hex(Base58.decode(config.signature))
                let decision = '01'
                signStr = head + timestamp + txGroupId + reference + spk + signature + decision + fee
                break;
            case 'ENABLE_FORGING':
                recipient = nacl.to_hex(Base58.decode(config.recipient))
                signStr = head + timestamp + txGroupId + reference + spk + recipient + fee
                break;
            case 'PROXY_FORGING':
                recipient = nacl.to_hex(Base58.decode(config.recipient))
                let mintingAccountPrkB58 = Base58.decode(privateKey);
                let recipientAccountPukB85 = Base58.decode(config.recipientPublicKey);
                let mintingEd25519KeyPair = nacl.crypto_sign_seed_keypair(mintingAccountPrkB58);
                let mintingX25519KeyPair = nacl.crypto_box_keypair_from_sign_sk(mintingEd25519KeyPair.signSk)
                let mintingX25519Prk = mintingX25519KeyPair.boxSk;
                let recipientAccountX25519Puk = nacl.crypto_box_pk_from_sign_pk(recipientAccountPukB85)
                let sharedSecret = nacl.crypto_scalarmult(mintingX25519Prk, recipientAccountX25519Puk)
                let proxyPrivateKey = nacl.crypto_hash_sha256(sharedSecret)
                let proxyKeyPair = nacl.crypto_sign_seed_keypair(proxyPrivateKey)
                let proxyPuk = nacl.to_hex(Base58.decode(Base58.encode(proxyKeyPair.signPk)))
                let share = strAddZero(parseInt(config.share * 100000000).toString(16), 16)
                signStr = head + timestamp + txGroupId + reference + spk + recipient + proxyPuk + share + fee
                break;
            default:
                break;
        }

        let trBytes = nacl.from_hex(signStr);
        let dc = nacl.crypto_sign_detached(trBytes, nacl.crypto_sign_seed_keypair(Base58.decode(privateKey)).signSk);
        let tmp = Base58.encode(concatUint8Arrays(trBytes, dc))
        return tmp
    }

    const proxyMinting = (type, publicKey, privateKey) => {
        return new Promise((resolve, reject) => {
            nacl_factory.instantiate(nacl => {
                let mintingAccountPrkB58 = Base58.decode(privateKey)
                let recipientAccountPukB85 = Base58.decode(publicKey)
                let mintingEd25519KeyPair = nacl.crypto_sign_seed_keypair(mintingAccountPrkB58)
                let mintingX25519KeyPair = nacl.crypto_box_keypair_from_sign_sk(mintingEd25519KeyPair.signSk)
                let mintingX25519Prk = mintingX25519KeyPair.boxSk
                // var mintingAccountPuk = mintingEd25519KeyPair.signPk;
                let recipientAccountX25519Puk = nacl.crypto_box_pk_from_sign_pk(recipientAccountPukB85)
                let sharedSecret = nacl.crypto_scalarmult(mintingX25519Prk, recipientAccountX25519Puk)
                let proxyPrivateKey = nacl.crypto_hash_sha256(sharedSecret)
                proxyPrivateKey = Base58.encode(proxyPrivateKey)
                let _api = type === 'on' ? api.addForgingAccounts(proxyPrivateKey) : api.removeForgingAccounts(proxyPrivateKey)
                console.log(_api)
                _api.then(res => {
                    console.log(res.data)
                    resolve(res.data)
                })

            })
        })
    }


    const getAccountByStorage = address => {
        let accountList = getStorage('accountList')
        if (accountList.length > 0) {
            return accountList.filter(item => {
                return item.address === address
            })[0]
        } else {
            return false
        }

    }

    const strAddZero = (str, length) => {
        return str.padStart(length, '0')
    }

    const getStorage = i => {
        let obj = window.localStorage
        if (!obj[i]) {
            return [];
        } else {
            try {
                let a = JSON.parse(obj[i])
                return a
            } catch (error) {
                return false
            }
        }
    }

    const deriveStorageKey = (nacl, salt, passwordArray) => {
        var toBeHashed = concatUint8Arrays(salt, passwordArray)
        var hash = nacl.crypto_hash_sha256(toBeHashed)
        toBeHashed = new Uint8Array(passwordArray.length + hash.length)
        toBeHashed.set(passwordArray, 0)
        for (var rounds = 0; rounds < 10000; ++rounds) {
            toBeHashed.set(hash, passwordArray.length)
            hash = nacl.crypto_hash_sha256(toBeHashed)
        }
        return hash
    }

    const concatUint8Arrays = (array1, array2) => {
        var bigArray = new Uint8Array(array1.length + array2.length)
        bigArray.set(array1, 0)
        bigArray.set(array2, array1.length)
        return bigArray
    }

    const hardenKey = (salt, key, rounds) => {
        return hashRounds(key + salt, rounds);
    }

    const hashRounds = (s, n) => {
        var os = s;
        for (var i = 0; i < n; i++) {
            s = SHA256.hash(s + os);
        }
        return s;
    }
    const format = function (timestamp) {
        //shijianchuo是整数，否则要parseInt转换
        const add0 = m => {
            return m < 10 ? '0' + m : m
        }

        var time = new Date(timestamp);
        var y = time.getFullYear();
        var m = time.getMonth() + 1;
        var d = time.getDate();
        var h = time.getHours();
        var mm = time.getMinutes();
        var s = time.getSeconds();
        return y + '-' + add0(m) + '-' + add0(d) + ' ' + add0(h) + ':' + add0(mm) + ':' + add0(s);
    }

    function numFormat(num, digits = 3) {
        var si = [{
                value: 1,
                symbol: ""
            },
            // { value: 1E3, symbol: "K" },
            {
                value: 1E6,
                symbol: "M"
            },
            {
                value: 1E9,
                symbol: "B"
            }
        ];
        var rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
        var i;
        for (i = si.length - 1; i > 0; i--) {
            if (num >= si[i].value) {
                break;
            }
        }
        return (num / si[i].value).toFixed(digits).replace(rx, "$1") + si[i].symbol;
    }

    const cutZero = old => {
        old = old + ""
        var newstr = old
        var leng = old.length - old.indexOf(".") - 1;
        if (old.indexOf(".") > -1) {
            for (let i = leng; i > 0; i--) {
                if (newstr.lastIndexOf("0") > -1 && newstr.substr(newstr.length - 1, 1) == 0) {
                    var k = newstr.lastIndexOf("0")
                    if (newstr.charAt(k - 1) == ".") {
                        return newstr.substring(0, k - 1)
                    } else {
                        newstr = newstr.substring(0, k)
                    }
                } else {
                    return newstr
                }
            }
        }
        return old
    }

    return {
        cachedPrivateKeys,
        generateAddress,
        encryptPwd,
        decryptPwd,
        getPrivateKey,
        getStorage,
        transactions,
        proxyMinting,
        getAccountByStorage,
        format,
        numFormat,
        cutZero
    }
})();

export default mcf;