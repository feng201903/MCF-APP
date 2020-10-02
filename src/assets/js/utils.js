/* eslint-disable */
import {
  Mnemonic
} from '@/assets/js/libs/jsbip39.js'
import wordlistEnglish from '@/assets/js/libs/wordlist_english.js'
import Base58 from '@/assets/js/libs/Base58.js'
import SHA256 from '@/assets/js/libs/sha256'
import CryptoJS from 'crypto-js'
import math from 'mathjs/dist/math.min.js'
import Vue from 'vue'

//创建地址
export const getAddress = function (mnemonic) {
  var response = new Promise(function (resolve) {
    // eslint-disable-next-line
    nacl_factory.instantiate(function (nacl) {
      var mnemo = new Mnemonic('english')
      var hexStr
      if (mnemonic) {
        hexStr = mnemo.revertEntropy(mnemonic)
      } else {
        // 生成12个助记词
        hexStr = nacl.to_hex(nacl.random_bytes(16))
        mnemonic = mnemo.toMnemonic(nacl.from_hex(hexStr))
      }
      if (!hexStr) {
        alert('助记词无效')
        return false
      }
      var privateKeyHex = nacl.to_hex(nacl.crypto_hash_sha256(nacl.from_hex(hexStr)))
      var privateKey = Base58.encode(nacl.from_hex(privateKeyHex))
      var kp = nacl.crypto_sign_seed_keypair(nacl.from_hex(privateKeyHex))
      var publicKey = Base58.encode(kp.signPk)
      var ADDRESS_VERSION = 58
      if (typeof publicKey === 'string') {
        publicKey = Base58.decode(publicKey)
      }
      var publicKeyHashSHA256 = nacl.crypto_hash_sha256(publicKey)
      var publicKeyHashHex = nacl.to_hex(publicKeyHashSHA256)
      var publicKeyHashWordArray = CryptoJS.enc.Hex.parse(publicKeyHashHex)
      CryptoJS.RIPEMD160(publicKeyHashSHA256).toString()
      var publicKeyHash = CryptoJS.RIPEMD160(
        publicKeyHashWordArray
      ).toString()
      var addressArray = new Uint8Array()
      addressArray = appendBuffer(addressArray, [ADDRESS_VERSION])
      addressArray = appendBuffer(addressArray, nacl.from_hex(publicKeyHash))
      var checkSum = nacl.crypto_hash_sha256(nacl.crypto_hash_sha256(addressArray))
      addressArray = appendBuffer(addressArray, checkSum.subarray(0, 4))
      var address = Base58.encode(addressArray) // 钱包地址

      var addressInfo = {}
      addressInfo.mnemonic = mnemonic
      addressInfo.privateKey = privateKey
      addressInfo.publicKey = Base58.encode(publicKey)
      addressInfo.address = address
      resolve(addressInfo)
    })
  })
  return response
}

// 创建转账
export const trans = async function (addressInfo, opt) {
  var result = await new Promise((resolve, reject) => {
    nacl_factory.instantiate(function (nacl) {
      Vue.axios.get('addresses/' + addressInfo.address).then((response) => {
        // console.log(response);
        if (response.data.reference) {
          var head, amount, recipient, signStr
          var privateKeyHex = nacl.to_hex(Base58.decode(addressInfo
            .privateKey))
          var kp = nacl.crypto_sign_seed_keypair(nacl.from_hex(
            privateKeyHex))
          var publicKey = Base58.encode(kp.signPk)
          var timestamp = strAddZero(parseInt(new Date().getTime())
            .toString(16), 16)
          var TxGroupId = '00000000'
          var reference = nacl.to_hex(Base58.decode(response.data
            .reference))
          var fee = strAddZero(parseInt(0.00001 * 100000000).toString(
            16), 16)
          var spk = nacl.to_hex(Base58.decode(publicKey))
          recipient = nacl.to_hex(Base58.decode(opt.recipient))
          if (opt.assetId && opt.assetId >= 1) {
            head = '0000000c'
            var assetId = strAddZero(parseInt(opt.assetId).toString(16), 16)
            amount = strAddZero(parseInt(opt.amount * 100000000)
              .toString(16), 24)
            signStr = head + timestamp + TxGroupId + reference +
              spk + recipient + assetId + amount + fee
          } else {
            head = '00000002'
            amount = strAddZero(parseInt(opt.amount * 100000000)
              .toString(16), 16)
            signStr = head + timestamp + TxGroupId + reference +
              spk + recipient + amount + fee
          }
          signStr = Base58.encode(nacl.from_hex(signStr))

          var trBytes = Base58.decode(signStr)
          var c = nacl.crypto_sign_detached(trBytes, kp.signSk)
          var buffer1 = new Uint8Array(trBytes)
          var buffer2 = new Uint8Array(c)
          var signature = Base58.encode(buffer2)
          var tmp = new Uint8Array(buffer1.byteLength + buffer2
            .byteLength)
          tmp.set(buffer1, 0)
          tmp.set(buffer2, buffer1.byteLength)

          Vue.axios.post('transactions/process', Base58.encode(tmp))
            .then((response) => {
              resolve({
                data: response.data,
                signature: signature
              })
            }).catch(function (error) {
              console.log(error);
              if (error.response) {
                reject(error.response.data)
              }
            })
        } else {
          console.log("地址未激活")
          alert("地址未激活")
        }
      })
    })
  })
  return result
}

// 激活钱包
export const activeWallet = async function (addressInfo) {
  var result = await new Promise((resolve, reject) => {
    nacl_factory.instantiate(function (nacl) {
      Vue.axios.get('addresses/' + addressInfo.address).then((response) => {
        // console.log(response);
        if (response.data.reference) {
          var privateKeyHex = nacl.to_hex(Base58.decode(addressInfo
            .privateKey))
          var kp = nacl.crypto_sign_seed_keypair(nacl.from_hex(
            privateKeyHex))
          var publicKey = Base58.encode(kp.signPk)
          var timestamp = strAddZero(parseInt(new Date().getTime())
            .toString(16), 16)
          var reference = nacl.to_hex(Base58.decode(response.data
            .reference))
          var fee = strAddZero(parseInt(0.00001 * 100000000).toString(
            16), 16)
          var spk = nacl.to_hex(Base58.decode(publicKey))
          var head = '0000001f'
          var txGroupId = '00000000'
          var groupId = '00000002'
          var signStr = head + timestamp + txGroupId + reference + spk + groupId + fee
          signStr = Base58.encode(nacl.from_hex(signStr))

          var trBytes = Base58.decode(signStr)
          var c = nacl.crypto_sign_detached(trBytes, kp.signSk)
          var buffer1 = new Uint8Array(trBytes)
          var buffer2 = new Uint8Array(c)
          var signature = Base58.encode(buffer2)
          var tmp = new Uint8Array(buffer1.byteLength + buffer2
            .byteLength)
          tmp.set(buffer1, 0)
          tmp.set(buffer2, buffer1.byteLength)

          Vue.axios.post('transactions/process', Base58.encode(tmp))
            .then((response) => {
              resolve({
                data: response.data,
                signature: signature
              })
            }).catch(function (error) {
              console.log(error);
              if (error.response) {
                reject(error.response.data)
              }
            })
        } else {
          console.log("地址未激活")
          alert("地址未激活")
        }
      })
    })
  })
  return result
}

// 通过审核
export const doVerify = async function (addressInfo, sign) {
  var result = await new Promise((resolve, reject) => {
    nacl_factory.instantiate(function (nacl) {
      Vue.axios.get('addresses/' + addressInfo.address).then((response) => {
        // console.log(response);
        if (response.data.reference) {
          var privateKeyHex = nacl.to_hex(Base58.decode(addressInfo
            .privateKey))
          var kp = nacl.crypto_sign_seed_keypair(nacl.from_hex(
            privateKeyHex))
          var publicKey = Base58.encode(kp.signPk)
          var timestamp = strAddZero(parseInt(new Date().getTime())
            .toString(16), 16)
          var reference = nacl.to_hex(Base58.decode(response.data
            .reference))
          var fee = strAddZero(parseInt(0.00001 * 100000000).toString(
            16), 16)
          var spk = nacl.to_hex(Base58.decode(publicKey))
          var signature = nacl.to_hex(Base58.decode(sign))
          var head = '00000021'
          var txGroupId = '00000000'
          var approval = "01"
          var signStr = head + timestamp + txGroupId + reference + spk + signature + approval + fee;
          signStr = Base58.encode(nacl.from_hex(signStr))

          var trBytes = Base58.decode(signStr)
          var c = nacl.crypto_sign_detached(trBytes, kp.signSk)
          var buffer1 = new Uint8Array(trBytes)
          var buffer2 = new Uint8Array(c)
          var signature = Base58.encode(buffer2)
          var tmp = new Uint8Array(buffer1.byteLength + buffer2
            .byteLength)
          tmp.set(buffer1, 0)
          tmp.set(buffer2, buffer1.byteLength)
          // console.log(Base58.encode(tmp))

          Vue.axios.post('transactions/process', Base58.encode(tmp))
            .then((response) => {
              resolve({
                data: response.data,
                signature: signature
              })
            }).catch(function (error) {
              console.log(error);
              if (error.response) {
                reject(error.response.data)
              }
            })
        } else {
          console.log("地址未激活")
          alert("地址未激活")
        }
      })
    })
  })
  return result
}

// 创建交易（兑换）
export const createDeal = async function (addressInfo, obj) {
  var result = await new Promise((resolve, reject) => {
    nacl_factory.instantiate(function (nacl) {
      Vue.axios.get('addresses/' + addressInfo.address).then((response) => {
        // console.log(response);
        if (response.data.reference) {
          var privateKeyHex = nacl.to_hex(Base58.decode(addressInfo
            .privateKey))
          var kp = nacl.crypto_sign_seed_keypair(nacl.from_hex(
            privateKeyHex))
          var publicKey = Base58.encode(kp.signPk)
          var timestamp = strAddZero(parseInt(new Date().getTime())
            .toString(16), 16)
          var reference = nacl.to_hex(Base58.decode(response.data
            .reference))
          var fee = strAddZero(parseInt(0.00001 * 100000000).toString(
            16), 16)
          var spk = nacl.to_hex(Base58.decode(publicKey))
          var head = '0000000d'
          var txGroupId = '00000000'
          let haveAssetId = strAddZero(parseInt(obj.haveAssetId).toString(16), 16);
          let wantAssetId = strAddZero(parseInt(obj.wantAssetId).toString(16), 16);
          let amount = strAddZero(parseInt(math.number(math.multiply(math.bignumber(obj.amount), 100000000))).toString(16), 24);
          let price = strAddZero(parseInt(math.number(math.multiply(math.bignumber(obj.price), 100000000))).toString(16), 24);
          var signStr = head + timestamp + txGroupId + reference + spk + haveAssetId + wantAssetId + amount + price + fee;
          signStr = Base58.encode(nacl.from_hex(signStr))

          var trBytes = Base58.decode(signStr)
          var c = nacl.crypto_sign_detached(trBytes, kp.signSk)
          var buffer1 = new Uint8Array(trBytes)
          var buffer2 = new Uint8Array(c)
          var signature = Base58.encode(buffer2)
          var tmp = new Uint8Array(buffer1.byteLength + buffer2
            .byteLength)
          tmp.set(buffer1, 0)
          tmp.set(buffer2, buffer1.byteLength)
          // console.log(Base58.encode(tmp))

          Vue.axios.post('transactions/process', Base58.encode(tmp))
            .then((response) => {
              resolve({
                data: response.data,
                signature: signature
              })
            }).catch(function (error) {
              console.log(error);
              if (error.response) {
                reject(error.response.data)
              }
            })
        } else {
          console.log("地址未激活")
          alert("地址未激活")
        }
      })
    })
  })
  return result
}
// 撤销订单
export const delOrder = async function (addressInfo, orderId) {
  var result = await new Promise((resolve, reject) => {
    nacl_factory.instantiate(function (nacl) {
      Vue.axios.get('addresses/' + addressInfo.address).then((response) => {
        // console.log(response);
        if (response.data.reference) {
          var privateKeyHex = nacl.to_hex(Base58.decode(addressInfo
            .privateKey))
          var kp = nacl.crypto_sign_seed_keypair(nacl.from_hex(
            privateKeyHex))
          var publicKey = Base58.encode(kp.signPk)
          var timestamp = strAddZero(parseInt(new Date().getTime())
            .toString(16), 16)
          var reference = nacl.to_hex(Base58.decode(response.data
            .reference))
          var fee = strAddZero(parseInt(0.00001 * 100000000).toString(
            16), 16)
          var spk = nacl.to_hex(Base58.decode(publicKey))
          var head = '0000000e'
          var txGroupId = '00000000'
          var oId = nacl.to_hex(Base58.decode(orderId));
          var signStr = head + timestamp + txGroupId + reference + spk + oId + fee;
          signStr = Base58.encode(nacl.from_hex(signStr))

          var trBytes = Base58.decode(signStr)
          var c = nacl.crypto_sign_detached(trBytes, kp.signSk)
          var buffer1 = new Uint8Array(trBytes)
          var buffer2 = new Uint8Array(c)
          var signature = Base58.encode(buffer2)
          var tmp = new Uint8Array(buffer1.byteLength + buffer2
            .byteLength)
          tmp.set(buffer1, 0)
          tmp.set(buffer2, buffer1.byteLength)
          // console.log(Base58.encode(tmp))

          Vue.axios.post('transactions/process', Base58.encode(tmp))
            .then((response) => {
              resolve({
                data: response.data,
                signature: signature
              })
            }).catch(function (error) {
              console.log(error);
              if (error.response) {
                reject(error.response.data)
              }
            })
        } else {
          console.log("地址未激活")
          alert("地址未激活")
        }
      })
    })
  })
  return result
}

export const encryptPwd = function (plaintText, key, salt) {
  key = hardenKey(salt, key, 10000)
  var text = CryptoJS.AES.encrypt(plaintText, key).toString();
  return text;
}

export const decryptPwd = function (ciphertext, key, salt) {
  key = hardenKey(salt, key, 10000)
  return CryptoJS.AES.decrypt(ciphertext, key).toString(CryptoJS.enc.Utf8);
}

export const format = function (shijianchuo) {
  //shijianchuo是整数，否则要parseInt转换
  var time = new Date(shijianchuo);
  var y = time.getFullYear();
  var m = time.getMonth() + 1;
  var d = time.getDate();
  var h = time.getHours();
  var mm = time.getMinutes();
  var s = time.getSeconds();
  return y + '-' + add0(m) + '-' + add0(d) + ' ' + add0(h) + ':' + add0(mm) + ':' + add0(s);
}

function hardenKey(salt, key, rounds) {
  return hashRounds(key + salt, rounds);
}

function hashRounds(s, n) {
  var os = s;
  for (var i = 0; i < n; i++) {
    s = SHA256.hash(s + os);
  }
  return s;
}

const appendBuffer = (buffer1, buffer2) => {
  buffer1 = new Uint8Array(buffer1)
  buffer2 = new Uint8Array(buffer2)
  var tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength)
  tmp.set(buffer1, 0)
  tmp.set(buffer2, buffer1.byteLength)
  return tmp
}

function strAddZero(str, length) {
  var len = str.length
  for (var i = 0; i < length - len; i++) {
    str = '0' + str
  }
  return str
}

function strToHexCharCode(str) {
  if (str === '') {
    return ''
  }
  var hexCharCode = []
  for (var i = 0; i < str.length; i++) {
    hexCharCode.push((str.charCodeAt(i)).toString(16))
  }
  return hexCharCode.join('')
}

function add0(m) {
  return m < 10 ? '0' + m : m
}
