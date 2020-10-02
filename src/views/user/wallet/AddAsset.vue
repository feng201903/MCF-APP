<template>
  <div>
    <div class="search">
      <mt-search v-model="search" cancel-text="取消" placeholder="搜索"></mt-search>
    </div>
    <div class="asset-list" ref="cityList">
      <mt-index-list>
        <mt-index-section v-for="(item,index) in assetsListSort" :key="index" :index="item.assetTp">
          <mt-cell v-for="(list,indexList) in item.data" :key="indexList" :title="list.name">
            <img :src="list.logo">
            <div class="mint-cell-title">
              <label class="mint-checklist-label">
                <span class="mint-checkbox">
                  <input type="checkbox" class="mint-checkbox-input" :value="list.assetId" v-model="arrAssetId">
                  <span class="mint-checkbox-core"></span>
                </span>
                <span class="mint-checkbox-label"></span>
              </label>
            </div>
          </mt-cell>
        </mt-index-section>
      </mt-index-list>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      assetsList: '',
      arrAssetId: JSON.parse(localStorage.getItem('assetIds-' + this.$route.query.address)) || [],
      search: ''
    }
  },
  computed: {
    assetsListSort () {
      let map = {}
      let dest = []
      let assetsList
      if (this.search) {
        assetsList = this.assetsList.filter(item => {
          var reg = new RegExp(this.search, 'gi')
          return reg.test(item.name)
        })
      } else {
        assetsList = this.assetsList
      }
      for (let i = 0; i < assetsList.length; i++) {
        let ai = assetsList[i]
        ai.logo = JSON.parse(ai.data).logo
        let assetTp = ai.name[0]
        if (!map[assetTp]) {
          dest.push({
            assetTp: assetTp,
            data: [ai]
          })
          map[assetTp] = ai
        } else {
          for (let j = 0; j < dest.length; j++) {
            let dj = dest[j]
            if (dj.assetTp === assetTp) {
              dj.data.push(ai)
              break
            }
          }
        }
      }
      // console.log(dest)
      return dest.sort(function (x, y) {
        return x.assetTp.localeCompare(y.assetTp)
      })
    },
    newArrAssetId () {
      return this.arrAssetId
    }
  },
  methods: {
    getAssetsList () {
      let allAsset = JSON.parse(localStorage.getItem('allAsset')) || []
      if (allAsset.length <= 0) {
        this.axios.get('assets?includeData=true&limit=0&offset=0&reverse=false').then((response) => {
          // console.log(response.data)
          this.assetsList = response.data
          localStorage.setItem('allAsset', JSON.stringify(response.data))
        }).catch((err) => {
          console.log(err)
        })
      } else {
        this.assetsList = allAsset
      }
    }
  },
  created () {
    this.getAssetsList()
  },
  watch: {
    arrAssetId (newValue, oldValue) {
      localStorage.setItem('assetIds-' + this.$route.query.address, JSON.stringify(newValue))
    },
    search (newValue, oldValue) {
      this.getAssetsList()
    }
  }
}
</script>

<style lang="less" scoped>
/deep/ .mint-cell {
  //   background-color: #dddddd;
  color: #888888;
  margin: 5px 0px;
}
/deep/ .mint-cell-value img {
  width: 40px;
  position: absolute;
  left: 0px;
}
/deep/ .mint-cell-text {
  margin-left: 50px;
}
input[type="checkbox"] {
  zoom: 200%;
}
.search {
  height: 52px;
  position: fixed;
  left: 0px;
  top: 41px;
  width: 100%;
}
.asset-list {
  margin-top: 55px;
  // height: 300px;
}
</style>
