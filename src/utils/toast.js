import { Toast } from 'vant'

let loadingCount = 0

const startLoading = message => {
    Toast.loading({
        message,
        forbidClick: true,
        duration: 0,
        overlay: true
    });
};

const endLoading = () => {
    Toast.clear()
};

export const showLoading = () => {
    if (loadingCount === 0) {
        startLoading();
    }
    loadingCount += 1;
};

export const hideLoading = () => {
    if (loadingCount <= 0) {
        return;
    }
    loadingCount -= 1;
    if (loadingCount === 0) {
        endLoading();
    }
};