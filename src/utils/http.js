import axios from 'axios'
// import qs from 'querystring'
import { showLoading, hideLoading } from '@/utils/toast'
import { Notify } from 'vant';

// 创建axios实例
// 创建请求时可以用的配置选项
var instance = axios.create({ timeout: 20000 });
// axios的全局配置
instance.defaults.headers.post['Content-Type'] = 'text/plain';

// 添加请求拦截器

instance.interceptors.request.use(
    config => {
        // console.log(config)
        if (config.showLoading) {
            showLoading('loading')
        }
        return config
    },
    err => {
        return Promise.reject(err)
    })

// 添加响应拦截器
instance.interceptors.response.use(
    response => {
        hideLoading()
        return response
    },
    error => {
        hideLoading()
        const { response } = error
        if (response) {
            console.log(response)
            errorHandle(response.status, response.data)
            return Promise.reject(response)
        } else {
            if (error.message.includes('timeout')) {
                console.log('请求超时')
                Notify(window.vm.$t('mcf.timeoutError'))
            } else {
                console.log()
                if (error.message === 'Network Error') {
                    Notify(window.vm.$t('mcf.networkError'))
                } else {
                    Notify(error.message)
                }
            }
            return Promise.reject(error)
        }

    }
);
const errorHandle = (status, other) => {
    console.log(other)
    switch (status) {
        case 400:
            console.log("请求失败")
            console.log(window.vm.$i18n.locale)
            if (window.vm.$i18n.locale === 'zh') {
                if (other.message === 'transaction invalid: NO_BALANCE') {
                    Notify('余额不足')
                } else if (other.message === 'transaction invalid: INVALID_AMOUNT') {
                    Notify('数量不正确')
                }
            } else {
                Notify(other.message)
            }

            break;
        case 401:
            console.log("认证失败")
            break;
        case 403:
            console.log("token校验失败")
            break;
        case 404:
            console.log("请求的资源不存在")
            break;
        default:
            console.log(status)
            break;

    }
}

export default instance;