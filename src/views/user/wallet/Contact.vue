<template>
  <div class="contact-list">
    <van-cell v-for="item,index in contactsList" :key="index" :title="item.name" :label="item.address" center @click="onclickContact(item.address)">
      <template #right-icon>
        <van-icon name="edit" class="right-icon" @click.stop="edit('edit',index,item)" />
        <van-icon name="delete-o" class="right-icon" @click.stop="edit('del',index,item)" />
      </template>
    </van-cell>

    <van-button round block type="info" class="add" @click="edit">{{$t('user.contact.add')}}</van-button>

    <van-dialog v-model="show" :title="$t('user.contact.add')" show-cancel-button :before-close="beforeClose" :confirmButtonText="$t('common.btnConfirm')" :cancelButtonText="$t('common.btnCancel')">
      <van-field label-width='4rem' v-model="name" maxlength="20" :label="$t('user.contact.name')" />
      <van-field label-width='4rem' v-model="address" maxlength="34" :label="$t('user.contact.address')" />
    </van-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      name: '',
      address: '',
      show: false,
      contactsList: this.$mcf.getStorage('contactsList'),
      contactsIndex: '',
      creator: this.$route.query.creator,
    }
  },
  methods: {
    edit(type, index, contact) {
      if (type === 'del') {
        this.$dialog.confirm({
          title: '',
          message: `${this.$t('user.contact.remove')}<br>${contact.name}<br>${contact.address}`,
          confirmButtonText: this.$t('common.btnConfirm'),
          cancelButtonText: this.$t('common.btnCancel')
        })
          .then(() => {
            this.contactsList.splice(index, 1)
            localStorage.setItem('contactsList', JSON.stringify(this.contactsList))
          })
          .catch(() => {

          });
        return false
      }

      if (type === 'edit') {
        this.contactsIndex = index
        this.name = contact.name
        this.address = contact.address
      }
      this.show = !this.show
    },
    async beforeClose(action, done) {
      if (action === 'confirm') {
        if (!this.name || !this.address) {
          this.$notify({ type: 'danger', message: this.$t('user.contact.error1') })
          done(false)
          return false
        }
        let isValidated = (await this.$api.addressesValidate(this.address)).data
        if (!isValidated) {
          this.$notify({ type: 'danger', message: this.$t('user.contact.error2') })
          done(false)
          return false
        }
        let contactsInfo = {
          name: this.name,
          address: this.address
        }
        if (this.contactsIndex || this.contactsIndex === 0) {
          this.contactsList[this.contactsIndex] = contactsInfo
        } else {
          this.contactsList.push(contactsInfo)
        }
        localStorage.setItem('contactsList', JSON.stringify(this.contactsList))
        this.contactsIndex = ''
        this.name = ''
        this.address = ''
        done()
      } else {
        done()
      }
    },
    onclickContact(recipient) {
      this.$router.push({
        path: '/user/wallet/transfer',
        query: {
          creator: this.creator,
          recipient
        }
      })
    }
  },

}
</script>

<style lang="less" scoped>
.contact-list {
  padding-bottom: 60px;
}
.right-icon {
  font-size: 20px;
  padding: 0 5px;
}
.add {
  position: fixed;
  width: 90%;
  left: 5%;
  bottom: 15px;
}
::v-deep .van-cell__title {
  overflow: hidden;
}
::v-deep .van-cell__label {
  overflow: scroll;
}
::-webkit-scrollbar {
  /*隐藏滚轮*/
  display: none;
}
</style>