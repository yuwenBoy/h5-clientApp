 <template>
   <view class="flash-goods-page">
     <!-- 加载状态 -->
     <view class="loading-container" v-if="loading">
       <view class="loading-spinner"></view>
       <view class="loading-text">加载中...</view>
     </view>
     
     <!-- 商品内容 -->
     <template v-else>
       <!-- 轮播图 -->
       <view class="swiper-wrap">
         <swiper class="swiper" :indicator-dots="true" circular :autoplay="false">
           <swiper-item v-for="(img, idx) in images" :key="idx">
             <image class="swiper-img" :src="img" mode="aspectFill" @click="previewImage(idx)" />
           </swiper-item>
         </swiper>
       </view>

       <!-- 商品信息 -->
       <view class="goods-info">
         <view class="price-box">
           <text class="price">¥{{ Number(currentPrice || 0).toFixed(2) }}</text>
           <text class="old-price" v-if="goods.originalPrice">¥{{ goods.originalPrice }}</text>
         </view>

         <!-- 商品名称 + 加入购物车 / 加减 对齐 -->
         <view class="name-cart-row">
           <view class="goods-name">{{ goods.name }}</view>

           <!-- 已有购物车记录 → 显示加减 -->
           <view class="num-box" v-if="cartCount > 0">
             <view class="num-btn" @click.stop="isBusinessOpen ? cutNum() : showClosedToast()" :class="{ disabled: buyNum <= 1 || !isBusinessOpen }">-</view>
             <view class="num-text">{{ buyNum }}</view>
             <view class="num-btn" @click.stop="isBusinessOpen ? addNum() : showClosedToast()" :class="{ disabled: buyNum >= goods.stock || !isBusinessOpen }">+</view>
           </view>

           <!-- 无购物车记录 → 显示加入购物车 -->
           <view class="add-cart-btn" :class="{ disabled: !isBusinessOpen }" @click="isBusinessOpen ? toAddCart() : showClosedToast()">
             加入购物车
           </view>
         </view>

         <view class="sales">已售 {{ goods.sales }}件</view>
       </view>

       <!-- 商品详情 -->
       <view class="detail-section" v-if="paramsList.length">
         <view class="title">商品详情</view>
         <view class="param-item">
           <view class="label">商品描述</view>
           <view class="value">{{ goods.description || '暂无描述' }}</view>
         </view>
         <view class="param-item" v-for="(item, idx) in displayParamsList" :key="idx">
           <view class="label">{{ item.label }}</view>
           <view class="value">{{ item.value }}</view>
         </view>
         <view class="toggle-btn" v-if="paramsList.length > 4 && !showAllParams" @click="toggleShowAll">
           <text class="price-icon">💰</text> 查看全部
         </view>
       </view>

       <!-- 底部占位 -->
       <view class="bottom-space"></view>

       <!-- 门店休息提示条（淘宝闪购风格） -->
      <view class="store-closed-notice" v-if="!isBusinessOpen">
        <uni-icons type="info-filled" size="14" color="#ff4d4f" />
        <text class="notice-text">门店{{ storeInfo.status == 0 || storeInfo.status == '0' ? '已打烊' : '休息中' }}，营业时间 {{ storeInfo.business_hours || '09:00-22:00' }}</text>
      </view>

      <!-- 加入购物车动画元素 -->
      <view class="add-cart-animation" v-if="showAddCartAnimation" :style="animationStyle"></view>
     <!-- 底部结算栏 -->
     <view class="submit-bar" :class="{ 'cart-open': showCart, 'store-closed': !isBusinessOpen }">
       <!-- 结算栏主体 -->
       <view class="submit-content" @click="isBusinessOpen ? toggleCart() : showClosedToast()">
         <view class="cart-icon" :class="{ active: cartCount > 0, disabled: !isBusinessOpen }">
           <image class="cart-img" src="/static/img/cart.png" mode="aspectFill" />
           <view class="cart-badge" v-if="cartCount > 0">{{ cartCount }}</view>
         </view>
         <view class="price-info">
           <view class="price-row" v-if="cartCount > 0">
             <text class="total" :class="{ disabled: !isBusinessOpen }">¥{{ cartTotalPrice.toFixed(2) }}</text>
             <text class="delivery-fee">配送费¥{{ storeInfo.delivery_fee || 5 }}</text>
           </view>
           <view class="price-row" v-else>
             <text class="empty-tip" :class="{ disabled: !isBusinessOpen }">未选购商品</text>
           </view>
         </view>
       </view>
       <view class="btn-settle" :class="{ disabled: !canSubmit || !isBusinessOpen, 'store-closed-btn': !isBusinessOpen }" :disabled="!canSubmit || !isBusinessOpen" @click="isBusinessOpen ? toSettle() : showClosedToast()">
         {{ settleBtnText }}
       </view>
     </view>
     </template>

     <!-- 规格选择弹窗 -->
    <uni-spec-popup 
      :visible="showSpecPopup"
      :goods="goods"
      :specGroups="specGroups"
      @confirm="handleSpecConfirm"
      @close="closeSpecPopup"
    />

    <!-- 购物车弹窗 -->
    <view v-if="showCart">
      <view class="cart-overlay" @click="toggleCart"></view>
      <view class="cart-popup-taobao">
        <view class="cart-header">
          <view class="cart-header-left">
            <text class="header-title">已选商品</text>
            <text class="cart-total">共{{ cartCount }}件</text>
          </view>
          <view class="clear-btn" @click="clearCart">
            <uni-icons type="trash" size="14" color="#999"></uni-icons>
            <text>清空</text>
          </view>
        </view>
        <scroll-view scroll-y class="cart-list">
          <view class="cart-item" v-for="(item, index) in cartList" :key="index">
            <image :src="item.img" class="item-img" mode="aspectFill" />
            <view class="item-info">
              <text class="item-name">{{ item.name }}</text>
              <text class="item-spec" v-if="item.specText">{{ item.specText }}</text>
              <text class="item-price">¥{{ Number(item.price || 0).toFixed(2) }}</text>
            </view>
            <view class="item-stepper">
              <view class="btn-minus" @click="updateCartItemQuantity(item, item.count - 1)">-</view>
              <view class="item-quantity">{{ item.count }}</view>
              <view class="btn-plus" @click="updateCartItemQuantity(item, item.count + 1)">+</view>
            </view>
          </view>
          <view class="cart-empty" v-if="cartList.length === 0">
            <text>购物车为空</text>
          </view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

 <script>

export default {
  components: {
  },
  data() {
    return {
      goodsId: null,
      goods: {
        name: '',
        price: 0,
        originalPrice: 0,
        sales: 0,
        stock: 0,
        image: '',
        images: [],
        description: '',
        storeId: ''
      },
      hasSpec: false,
      specGroups: [],
      selected: {},
      currentPrice: 0,
      buyNum: 1,
      showSpecPopup: false,
      paramsList: [],
     loading: false,
     showAllParams: false,

     goodsInfoFromStore: null,
     showAddCartAnimation: false,
     animationStyle: {},
     cartList: [],
     showCart: false,
     storeInfo: {
       delivery_fee: 5,
       min_order_amount: 30,
       status: 1,
       business_hours: '09:00-22:00'
     }
    }
  },
   computed: {
    images() {
      return this.goods.images && this.goods.images.length > 0 ? this.goods.images : [this.goods.image]
    },
    selectedSpecText() {
      let arr = []
      this.specGroups.forEach(g => {
        const item = g.options.find(i => i.optionId === this.selected[g.attrId])
        if (item) arr.push(item.optionName)
      })
      return arr.join(' ')
    },
    displayParamsList() {
      if (this.showAllParams || this.paramsList.length <= 4) {
        return this.paramsList
      }
      return this.paramsList.slice(0, 4)
    },
    totalPrice() {
      try {
        const price = parseFloat(this.currentPrice) || 0
        const num = parseInt(this.buyNum) || 0
        return price * num
      } catch (error) {
        console.error('计算商品总价失败:', error)
        return 0
      }
    },
    cartCount() {
      try {
        return this.cartList.reduce((sum, item) => sum + (item.count || 0), 0)
      } catch (error) {
        console.error('获取购物车数量失败:', error)
        return 0
      }
    },
    // 购物车商品总价（用于起送金额计算）
    cartTotalPrice() {
      try {
        return this.cartList.reduce((sum, item) => sum + (item.price * item.count), 0)
      } catch (error) {
        return 0
      }
    },
    // 是否可以结算（满足起送金额）
    canSubmit() {
      return this.cartCount > 0 && this.cartTotalPrice >= (this.storeInfo.min_order_amount || 30)
    },
    // 结算按钮文字
    settleBtnText() {
      // 门店未营业时
      if (!this.isBusinessOpen) {
        return this.storeInfo.status == 0 || this.storeInfo.status == '0' ? '门店已打烊' : '门店休息中'
      }
      if (this.cartCount === 0) return '去结算'
      const minAmount = this.storeInfo.min_order_amount || 30
      if (this.cartTotalPrice < minAmount) {
        return `差¥${(minAmount - this.cartTotalPrice).toFixed(1)}起送`
      }
      return '去结算'
    },
    // 门店是否营业中
    isBusinessOpen() {
      const status = this.storeInfo.status
      // 如果有明确的状态字段（支持字符串和数字）
      if (status === 1 || status === '1') return true
      if (status === 0 || status === '0' || status === 2 || status === '2') return false
      // 否则根据营业时间判断
      return this.checkBusinessTime()
    },
    // 检查营业时间
    checkBusinessTime() {
      const now = new Date()
      const hours = now.getHours()
      const minutes = now.getMinutes()
      const currentMinutes = hours * 60 + minutes
      
      const businessHours = this.storeInfo.business_hours || '09:00-22:00'
      const [startStr, endStr] = businessHours.split('-')
      
      if (!startStr || !endStr) return true
      
      const [startHour, startMin] = startStr.split(':').map(Number)
      const [endHour, endMin] = endStr.split(':').map(Number)
      
      const startMinutes = startHour * 60 + startMin
      const endMinutes = endHour * 60 + endMin
      
      return currentMinutes >= startMinutes && currentMinutes < endMinutes
    }
  },
   mounted() {
     console.log('mounted执行了，goodsId:', this.goodsId)
     // 如果goodsId不存在，尝试从路由参数中获取
     if (!this.goodsId) {
       this.goodsId = this.$Route.query.id
       console.log('从路由参数中获取goodsId:', this.goodsId)
     }
     if (this.goodsId) {
       this.getGoodsDetail()
     }
   },
   
   onLoad(options) {
     console.log('onLoad执行了，options:', options)
     this.goodsId = options.id
     // 接收从门店详情页传递过来的商品信息
     if (options.goodsInfo) {
       try {
         const goodsInfo = JSON.parse(options.goodsInfo)
         // 保存商品信息，用于后续处理
         this.goodsInfoFromStore = goodsInfo
       } catch (error) {
         console.error('解析商品信息失败:', error)
       }
     }
   },
   
  onShow() {
    // 同步购物车数据（从本地存储获取最新数据）
    this.cartList = uni.getStorageSync('cartList') || []
    
    // 获取门店信息（从本地存储获取）
    const storeInfo = uni.getStorageSync('storeInfo')
    if (storeInfo) {
      this.storeInfo = storeInfo
    }
    
    if (this.goodsId) {
      this.checkCartStatus()
    }
  },
   methods: {
     async getGoodsDetail() {
       if (this.loading) return
       this.loading = true
       try {
         const { result } = await this.$request.post(this.$apis.goods.detail, { goodsId: this.goodsId })
         
         // 处理基本信息
         const basicInfo = result.basicInfo || {}
         
         // 处理商品规格
         const productSpecs = result.productSpecs || []
         
         // 设置默认规格
         let defaultSpec = productSpecs[0] || {}
         
         this.goods = {
           id: basicInfo.id,
           name: basicInfo.productName || '',
           price: parseFloat(defaultSpec.price || 0),
           originalPrice: 0,
           sales: 0,
           stock: parseInt(defaultSpec.stock || 999),
           image: this.$utils.processImageUrl(basicInfo.imageUrl),
           images: [this.$utils.processImageUrl(basicInfo.imageUrl)],
           description: basicInfo.description || '',
           storeId: basicInfo.storeId,
           defaultSpec: defaultSpec
         }
         
         // 更新当前价格
         this.currentPrice = this.goods.price
         
         // 处理商品规格
         this.processProductSpecs(productSpecs)
         
         // 处理动态属性
         const dynamicAttributes = result.dynamicAttributes || []
         console.log('dynamicAttributes:', JSON.stringify(dynamicAttributes, null, 2))
         
         // 找到口味属性并打印详细信息
         const tasteAttr = dynamicAttributes.find(attr => attr.attributeName === '口味')
         if (tasteAttr) {
           console.log('口味属性:', JSON.stringify(tasteAttr, null, 2))
           console.log('口味value:', tasteAttr.value)
           console.log('口味values:', JSON.stringify(tasteAttr.values, null, 2))
         }
         
         // 找到菜系属性并打印详细信息
         const cuisineAttr = dynamicAttributes.find(attr => attr.attributeName === '菜系')
         if (cuisineAttr) {
           console.log('菜系属性:', JSON.stringify(cuisineAttr, null, 2))
           console.log('菜系value:', cuisineAttr.value)
           console.log('菜系values:', JSON.stringify(cuisineAttr.values, null, 2))
         }
         
         // 找到主料/辅料属性并打印详细信息
         const mainAttr = dynamicAttributes.find(attr => attr.attributeName === '主料')
         if (mainAttr) {
           console.log('主料属性:', JSON.stringify(mainAttr, null, 2))
         }
         const subAttr = dynamicAttributes.find(attr => attr.attributeName === '辅料')
         if (subAttr) {
           console.log('辅料属性:', JSON.stringify(subAttr, null, 2))
         }
         this.processDynamicAttributes(dynamicAttributes)
       } catch (error) {
         uni.showToast({
           title: '获取商品详情失败',
           icon: 'none'
         })
       } finally {
         this.loading = false
         // 加载完成后检查购物车状态
         this.checkCartStatus()
       }
     },
     
    // 检查购物车状态
    checkCartStatus() {
      if (!this.goodsId) return
      
      // 获取本地购物车数据并更新到data中
      this.cartList = uni.getStorageSync('cartList') || []
      
      // 检查是否有当前商品的购物车记录
      const cartItem = this.cartList.find(item => item.productId === this.goodsId)
      
      // 如果有购物车记录，更新购买数量和当前价格
      if (cartItem) {
        this.buyNum = cartItem.count || 1
        this.currentPrice = cartItem.price || this.goods.price || 0
        
        // 确保已经选择了规格
        if (Object.keys(this.selected).length === 0 && this.specGroups.length > 0) {
          this.initDefaultSpec()
        }
      }
    },
     

     
     // 递归查找选项（支持嵌套结构）
     findOptionById(options, id) {
       for (let option of options) {
         if (option.id == id) {
           return option
         }
         if (option.children && option.children.length > 0) {
           const found = this.findOptionById(option.children, id)
           if (found) return found
         }
       }
       return null
     },
     
     // 处理动态属性
     processDynamicAttributes(attributes) {
       this.paramsList = []
       
       attributes.forEach(attr => {
         // attributeType: 1=文本, 2=级联, 3=下拉, 4=多选
         if (attr.attributeType === 2 || attr.attributeType === 3 || attr.attributeType === 4) {
           // 对于单选和多选类型，添加到参数列表中显示
           if (attr.value || attr.values) {
             let displayValue = '暂无'
             
             if (attr.values && attr.values.length > 0) {
               // 对于多选类型，显示选中的选项
               if (attr.attributeType === 4) {
                 if (attr.value) {
                   // 处理多选情况，value是逗号分隔的ID列表或对象数组
                   if (Array.isArray(attr.value)) {
                     // value是对象数组
                     const selectedLabels = attr.value.map(item => {
                       if (typeof item === 'object' && item !== null) {
                         return item.value || item.label || ''
                       } else if (typeof item === 'string') {
                         // 递归查找选项（支持深层嵌套）
                         const selectedValue = this.findOptionById(attr.values, item.trim())
                         return selectedValue ? (selectedValue.value || selectedValue.label || item) : item
                       }
                       return ''
                     }).filter(Boolean)
                     displayValue = selectedLabels.join('、') || '暂无'
                   } else {
                     // value是逗号分隔的ID列表
                     const valueIds = String(attr.value).split(',')
                     const selectedLabels = valueIds.map(id => {
                       // 递归查找选项（支持深层嵌套）
                       const selectedValue = this.findOptionById(attr.values, id.trim())
                       
                       // 优先使用value字段，如果为空则使用label字段
                       return selectedValue ? (selectedValue.value || selectedValue.label || id) : id
                     }).filter(label => label)
                     
                     displayValue = selectedLabels.join('、') || '暂无'
                   }
                 } else {
                   // 如果没有value，但有values，显示所有选项
                   displayValue = attr.values.map(v => v.value || v.label || '').filter(Boolean).join('、')
                 }
              } else if (attr.value) {
             // 处理value是对象的情况（后端直接返回选中的值）
             if (typeof attr.value === 'object' && !Array.isArray(attr.value)) {
              // 对于级联类型，需要查找对应的选项并显示其子选项
              if (attr.attributeType === 2) {
                const valueId = attr.value.id
                const parentId = attr.value.parent_id
                // 根据ID查找完整选项信息
                const selectedValue = this.findOptionById(attr.values, String(valueId))
                
                if (selectedValue) {
                  // 如果找到的值有子选项，显示子选项（解决后端只存父选项问题）
                  if (selectedValue.children && selectedValue.children.length > 0) {
                    const childLabels = selectedValue.children.map(child => child.value || child.label || '').filter(Boolean)
                    if (childLabels.length > 0) {
                      displayValue = childLabels.join('、')
                    } else {
                      displayValue = selectedValue.value || selectedValue.label || attr.value.value || attr.value.id || '暂无'
                    }
                  } else {
                    // 如果没有子选项，检查是否有 parent_id，说明这是一个子选项
                    if (parentId) {
                      // 这是一个子选项，查找其父选项下所有子选项（获取同级选项）
                      const siblingOptions = attr.values.filter(v => v.parent_id === parentId)
                      if (siblingOptions.length > 0) {
                        // 显示所有同级子选项（包括当前选中的）
                        const siblingLabels = siblingOptions.map(opt => opt.value || opt.label || '').filter(Boolean)
                        displayValue = siblingLabels.join('、')
                      } else {
                        displayValue = attr.value.value || attr.value.label || '暂无'
                      }
                    } else {
                      // 父选项但没有子选项，查找 attr.values 中 parent_id 等于当前 id 的子选项
                      const childOption = attr.values.find(v => v.parent_id === valueId)
                      if (childOption) {
                        displayValue = childOption.value || childOption.label || '暂无'
                      } else {
                        displayValue = selectedValue.value || selectedValue.label || attr.value.value || attr.value.id || '暂无'
                      }
                    }
                  }
                } else {
                  displayValue = attr.value.value || attr.value.label || attr.value.id || '暂无'
                }
              } else {
                  const valueId = attr.value.id
                  // 根据ID查找完整选项信息
                  const selectedValue = this.findOptionById(attr.values, String(valueId))
                  
                  if (selectedValue) {
                    // 如果找到的值有子选项，显示子选项（解决后端只存父选项问题）
                    if (selectedValue.children && selectedValue.children.length > 0) {
                      const childLabels = selectedValue.children.map(child => child.value || child.label || '').filter(Boolean)
                     if (childLabels.length > 0) {
                       displayValue = childLabels.join('、')
                     } else {
                       displayValue = selectedValue.value || selectedValue.label || attr.value.value || attr.value.id || '暂无'
                     }
                   } else {
                     displayValue = selectedValue.value || selectedValue.label || attr.value.value || attr.value.id || '暂无'
                   }
                } else {
                  displayValue = attr.value.value || attr.value.label || attr.value.id || '暂无'
                }
                }
              } else {
                // 处理单选情况，value是单个ID或逗号分隔的ID列表
                const valueIds = String(attr.value).split(',')
                const selectedLabels = valueIds.map(id => {
                  // 递归查找选项（支持深层嵌套）
                  const selectedValue = this.findOptionById(attr.values, id.trim())
                  
                  // 如果找到的值有子选项，显示子选项（解决后端只存父选项问题）
                  if (selectedValue) {
                    if (selectedValue.children && selectedValue.children.length > 0) {
                      // 显示所有子选项
                      const childLabels = selectedValue.children.map(child => child.value || child.label || '').filter(Boolean)
                      if (childLabels.length > 0) {
                        return childLabels.join('、')
                      }
                    }
                    return selectedValue.value || selectedValue.label || id
                  } else {
                    return id
                  }
                }).filter(label => label)
                
                displayValue = selectedLabels.join('、') || '暂无'
              }
            } else {
                // 如果没有value，但有values，显示所有选项
                // 优先使用value字段
                displayValue = attr.values.map(v => v.value || v.label || '').filter(Boolean).join('、')
              }
             } else if (attr.value) {
               // 处理value是对象的情况
               if (typeof attr.value === 'object' && attr.value !== null) {
                 if (Array.isArray(attr.value)) {
                   // value是对象数组
                   const selectedLabels = attr.value.map(item => {
                     if (typeof item === 'object' && item !== null) {
                       return item.value || item.label || ''
                     } else {
                       return String(item)
                     }
                   }).filter(Boolean)
                   displayValue = selectedLabels.join('、') || '暂无'
                 } else {
                   // value是单个对象
                   displayValue = attr.value.value || attr.value.label || '暂无'
                 }
               } else {
                 displayValue = attr.value
               }
             }
             
             this.paramsList.push({
               label: attr.attributeName,
               value: displayValue
             })
           }
         } else {
           // 参数类型 (1=文本)
           if (attr.value || attr.attributeName) {
             let displayValue = '暂无'
             
             // 优先处理value字段
             if (attr.value) {
               // value可能是字符串（直接存储的文本值，如主料辅料）
               if (typeof attr.value === 'string') {
                 displayValue = attr.value
               } else if (typeof attr.value === 'object') {
                 // value是对象（可能是 {id, value} 结构）
                 if (Array.isArray(attr.value)) {
                   const selectedLabels = attr.value.map(item => {
                     if (typeof item === 'object' && item !== null) {
                       return item.value || item.label || ''
                     } else {
                       return String(item)
                     }
                   }).filter(Boolean)
                   displayValue = selectedLabels.join('、') || '暂无'
              } else {
                // 单个对象，取value或label字段，如果都为空则取id字段
                displayValue = attr.value.value || attr.value.label || attr.value.id || '暂无'
              }
               } else {
                 displayValue = String(attr.value)
               }
             }
             
             this.paramsList.push({
               label: attr.attributeName,
               value: displayValue
             })
           }
         }
       })
       
       // 只有当specGroups为空时才初始化默认规格
       if (this.specGroups.length === 0) {
         this.initDefaultSpec()
       }
     },
     
     // 处理商品规格
    processProductSpecs(specs) {
      if (specs && specs.length > 0) {
        // 处理第一个规格的attrs
        const firstSpec = specs[0]
        if (firstSpec.attrs && firstSpec.attrs.length > 0) {
          // 按attrId分组
          const attrGroups = {}
          firstSpec.attrs.forEach(attr => {
            if (!attrGroups[attr.attrId]) {
              attrGroups[attr.attrId] = {
                attrId: attr.attrId,
                attrName: attr.attrName,
                options: []
              }
            }
            // 检查是否已存在相同的optionId
            const existingOption = attrGroups[attr.attrId].options.find(item => item.optionId === attr.optionId)
            if (!existingOption) {
              attrGroups[attr.attrId].options.push({
                optionId: attr.optionId,
                optionName: attr.optionName
              })
            }
          })
          
          // 转换为数组并添加到specGroups
          this.specGroups = Object.values(attrGroups)
          this.hasSpec = this.specGroups.length > 0
        }
      }
    },
     
     initDefaultSpec() {
      this.specGroups.forEach(g => {
        if (g.options && g.options.length) {
          this.selected[g.attrId] = g.options[0].optionId
        }
      })
      this.calcPrice()
    },
     
     selectSpec(gid, iid) {
       this.selected[gid] = iid
       this.calcPrice()
     },
     
     calcPrice() {
       if (this.specGroups.length === 0) {
         this.currentPrice = this.goods.price
         return
       }
       // 这里暂时使用固定价格，实际需要从规格中获取
       this.currentPrice = this.goods.price || 0
     },
     
     toAddCart() {
       if (this.hasSpec) {
         this.openSpecPopup()
         return
       }
       // 没有规格，直接加入购物车
       this.handleSpecConfirm({
         selected: this.selected,
         specText: '',
         buyNum: this.buyNum,
         currentPrice: this.currentPrice
       })
     },
     
     openSpecPopup() {
       this.showSpecPopup = true
     },
     
     closeSpecPopup() {
       this.showSpecPopup = false
     },
     
    handleSpecConfirm(data) {
      try {
        const { selected, specText, buyNum, currentPrice } = data

        // 获取当前选中的规格ID（与门店页保持一致）
        const specId = this.goods.defaultSpec ? this.goods.defaultSpec.specId : null

        // 构建购物车项（与门店页数据结构保持一致）
        const cartItem = {
          productId: this.goodsId,
          name: this.goods.name,
          img: this.goods.image,
          price: currentPrice,
          specId: specId,
          specText: specText,
          count: buyNum,
          storeId: this.goods.storeId
        }

        // 获取本地购物车数据
        let cartList = uni.getStorageSync('cartList') || []

        // 检查是否已存在相同商品和规格（与门店页保持一致的判断逻辑）
        const existingIndex = cartList.findIndex(item =>
          item.productId === this.goodsId && 
          item.specId === specId && 
          item.specText === specText
        )

        if (existingIndex >= 0) {
          // 已存在，增加数量
          cartList[existingIndex].count += buyNum
        } else {
          // 不存在，添加新项
          cartList.push(cartItem)
        }

        // 保存到本地存储
        uni.setStorageSync('cartList', cartList)
        
        // 保存门店信息到本地存储（用于起送金额计算）
        uni.setStorageSync('storeInfo', this.storeInfo)

        // 更新data中的cartList
        this.cartList = cartList

        // 更新本地状态
        this.selected = selected
        this.buyNum = buyNum
        this.currentPrice = currentPrice

        // 触发加入购物车动画
        this.triggerAddCartAnimation()

         // 不自动弹出购物车弹窗
       } catch (error) {
         uni.showToast({
           title: '加入购物车失败',
           icon: 'none'
         })
       }
     },
     
    // 更新购物车中的商品数量
    updateCartItem() {
      try {
        const specText = this.selectedSpecText
        const currentPrice = this.currentPrice || this.goods.price || 0
        const specId = this.goods.defaultSpec ? this.goods.defaultSpec.specId : null
        
        // 获取本地购物车数据
        let cartList = uni.getStorageSync('cartList') || []
        
        // 找到当前商品的购物车记录（与门店页保持一致的判断逻辑）
        const existingIndex = cartList.findIndex(item => 
          item.productId === this.goodsId && 
          item.specId === specId && 
          item.specText === specText
        )
        
        if (existingIndex >= 0) {
          // 已存在，更新数量
          cartList[existingIndex].count = this.buyNum
        } else {
          // 不存在，添加新项（与门店页数据结构保持一致）
          const cartItem = {
            productId: this.goodsId,
            name: this.goods.name,
            img: this.goods.image,
            price: currentPrice,
            specId: specId,
            specText: specText,
            count: this.buyNum,
            storeId: this.goods.storeId
          }
          cartList.push(cartItem)
        }
        
        // 保存到本地存储
        uni.setStorageSync('cartList', cartList)
        
        // 保存门店信息到本地存储（用于起送金额计算）
        uni.setStorageSync('storeInfo', this.storeInfo)
        
        // 更新data中的cartList
        this.cartList = cartList
      } catch (error) {
        console.error('更新购物车失败:', error)
      }
    },
     
     // 触发加入购物车动画
     triggerAddCartAnimation() {
          // 显示动画元素
          this.showAddCartAnimation = true
          
          // 设置动画样式
          this.animationStyle = {
            position: 'fixed',
            top: '50%',
            left: '50%',
            width: '50px',
            height: '50px',
            backgroundImage: `url(${this.goods.image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            borderRadius: '50%',
            zIndex: '9999',
            transform: 'translate(-50%, -50%)',
            transition: 'all 0.8s cubic-bezier(0.215, 0.61, 0.355, 1)'
          }
          
          // 延迟设置最终位置（模拟飞行效果）
          setTimeout(() => {
            this.animationStyle = {
              ...this.animationStyle,
              top: '90%',
              left: '70rpx',
              width: '30px',
              height: '30px',
              opacity: '0'
            }
          }, 100)
          
          // 动画结束后隐藏元素
          setTimeout(() => {
            this.showAddCartAnimation = false
          }, 900)
        },
     
     getSelectedSpecId() {
       if (!this.hasSpec) return null
       const specIds = Object.values(this.selected).join(',')
       return specIds
     },
     
     addNum() {
       if (this.buyNum >= this.goods.stock) {
         uni.showToast({
           title: '库存不足',
           icon: 'none'
         })
         return
       }
       
       // 如果有规格，需要先选择规格
       if (this.hasSpec && Object.keys(this.selected).length === 0) {
         this.openSpecPopup()
         return
       }
       
       this.buyNum++
       
       // 更新购物车数据
       this.updateCartItem()
       
       // 触发加入购物车动画
       this.triggerAddCartAnimation()
     },
     
     cutNum() {
       if (this.buyNum <= 1) {
         // 数量减到0，从购物车中移除
         this.removeFromCart()
         return
       }
       
       this.buyNum--
       
       // 更新购物车数据
       this.updateCartItem()
     },
     
     // 从购物车中移除商品
     removeFromCart() {
       try {
         // 获取本地购物车数据
         let cartList = uni.getStorageSync('cartList') || []
         
         // 找到当前商品的购物车记录
         const specText = this.selectedSpecText
         const existingIndex = cartList.findIndex(item => 
           item.productId === this.goodsId && item.specText === specText
         )
         
         if (existingIndex >= 0) {
           // 从购物车中移除
           cartList.splice(existingIndex, 1)
           // 保存到本地存储
           uni.setStorageSync('cartList', cartList)
           
           // 更新data中的cartList
           this.cartList = cartList
           
           // 重置购买数量
           this.buyNum = 1
           // 重置选中的规格
           this.selected = {}
         }
       } catch (error) {
         console.error('移除失败:', error)
       }
     },
     
     toggleShowAll() {
       this.showAllParams = !this.showAllParams
     },
     
     previewImage(index) {
       uni.previewImage({
         current: this.images[index],
         urls: this.images,
         indicator: 'number',
         loop: true
       })
     },
     
     toSettle() {
       const params = {
         goodsId: this.goodsId,
         specId: this.hasSpec ? Object.values(this.selected).join(',') : null,
         quantity: this.buyNum,
         storeId: this.goods.storeId
       }
       uni.navigateTo({
         url: `/pages/order/confirm?params=${encodeURIComponent(JSON.stringify(params))}`
       })
     },
     
     // 立即购买
     buyNow() {
       if (this.hasSpec) {
         this.openSpecPopup()
         return
       }
       // 没有规格，直接跳转到订单确认页
       this.toSettle()
     },
     
     // 切换购物车显示状态
    toggleCart() {
      // 未选购商品时，不弹出购物车弹窗
      if (this.cartCount === 0) {
        return
      }
      this.showCart = !this.showCart
    },
    
    // 门店打烊提示
    showClosedToast() {
      const statusText = this.storeInfo.status == 0 || this.storeInfo.status == '0' ? '已打烊' : '休息中'
      uni.showToast({
        title: `门店${statusText}，暂无法下单`,
        icon: 'none',
        duration: 2000
      })
    },
     
    // 更新购物车商品数量
    updateCartItemQuantity(item, quantity) {
      if (quantity < 1) {
        // 数量为0，移除商品
        this.removeCartItem(item)
        return
      }
      
      try {
        // 获取本地购物车数据
        let cartList = uni.getStorageSync('cartList') || []
        
        // 找到对应商品（使用 productId 和 specText 匹配，与门店页保持一致）
        const index = cartList.findIndex(cartItem => 
          cartItem.productId === item.productId && 
          cartItem.specText === item.specText
        )
        if (index >= 0) {
          // 更新数量
          cartList[index].count = quantity
          // 保存到本地存储
          uni.setStorageSync('cartList', cartList)
          // 更新data中的cartList
          this.cartList = cartList
        }
      } catch (error) {
        console.error('更新购物车数量失败:', error)
      }
    },
     
    // 从购物车中移除商品
    removeCartItem(item) {
      try {
        // 获取本地购物车数据
        let cartList = uni.getStorageSync('cartList') || []

        // 找到对应商品并移除（使用 productId 和 specText 匹配，与门店页保持一致）
        cartList = cartList.filter(cartItem => 
          !(cartItem.productId === item.productId && cartItem.specText === item.specText)
        )

        // 保存到本地存储
        uni.setStorageSync('cartList', cartList)

        // 更新data中的cartList
        this.cartList = cartList

        // 如果购物车为空，关闭弹窗
        if (cartList.length === 0) {
          this.showCart = false
          this.buyNum = 1
          this.selected = {}
        }
      } catch (error) {
        console.error('移除购物车商品失败:', error)
      }
    },
     
     // 清空购物车
     clearCart() {
       uni.showModal({

         title: '确认清空',
         content: '确定要清空购物车吗？',
         success: (res) => {
           if (res.confirm) {
             // 清空本地购物车数据
             uni.setStorageSync('cartList', [])
             // 更新data中的cartList
             this.cartList = []
             // 重置购买数量
             this.buyNum = 1
             // 重置选中的规格
             this.selected = {}
             // 关闭购物车弹窗
             this.showCart = false
             uni.showToast({
               title: '购物车已清空',
               icon: 'success'
             })
           }
         }
       })
     },
     
     // 减少购物车中商品的数量
     decreaseCartItem(index) {
       if (this.cartList[index].quantity > 1) {
         // 减少数量
         this.cartList[index].quantity--
       } else {
         // 数量为1时，从购物车中移除
         this.cartList.splice(index, 1)
       }
       // 保存到本地存储
       uni.setStorageSync('cartList', this.cartList)
     },
     
     // 增加购物车中商品的数量
     increaseCartItem(index) {
       // 增加数量
       this.cartList[index].quantity++
       // 保存到本地存储
       uni.setStorageSync('cartList', this.cartList)
     }
   }
 }
 </script>

 <style lang="scss" scoped>
 /* 淘宝闪购 1:1 */
 .flash-goods-page {
   background: #f5f5f5;
   padding-bottom: 120rpx;
 }

 .loading-container {
   display: flex;
   flex-direction: column;
   justify-content: center;
   align-items: center;
   min-height: 100vh;
   background: #f5f5f5;
 }
 
 .loading-spinner {
   width: 60rpx;
   height: 60rpx;
   border: 8rpx solid #f3f3f3;
   border-top: 8rpx solid #ff6b35;
   border-radius: 50%;
   animation: spin 1s linear infinite;
   margin-bottom: 20rpx;
 }
 
 .loading-text {
   font-size: 28rpx;
   color: #666;
 }
 
 @keyframes spin {
   0% { transform: rotate(0deg); }
   100% { transform: rotate(360deg); }
 }

 /* 轮播 */
 .swiper-wrap {
   width: 100%;
   height: 700rpx;
   background: #fff;
 }
 .swiper {
   width: 100%;
   height: 100%;
 }
 .swiper-img {
   width: 100%;
   height: 100%;
   display: block;
 }

 /* 商品信息 */
 .goods-info {
   background: #fff;
   padding: 30rpx;
   margin-top: 10rpx;
 }
 .price-box {
   display: flex;
   align-items: baseline;
   margin-bottom: 20rpx;
 }
 .price {
   font-size: 48rpx;
   color: #ff6b35;
   font-weight: bold;
 }
 .old-price {
   font-size: 26rpx;
   color: #999;
   text-decoration: line-through;
   margin-left: 16rpx;
 }

 /* 名称 + 购物车/加减 对齐 */
 .name-cart-row {
   display: flex;
   align-items: center;
   justify-content: space-between;
   margin-bottom: 16rpx;
 }
 .goods-name {
   font-size: 34rpx;
   color: #333;
   line-height: 1.4;
   flex: 1;
   margin-right: 20rpx;
 }

 .sales {
   font-size: 24rpx;
   color: #999;
 }

 /* 加入购物车按钮 */
 .add-cart-btn {
   padding: 12rpx 24rpx;
   background: #fff0f2;
   color: #ff6b35;
   border-radius: 6rpx;
   font-size: 24rpx;
   white-space: nowrap;
   transition: all 0.3s;
 }

 .add-cart-btn:active {
   background: #ffe0e4;
 }

 /* 数量加减 */
 .num-box {
   display: flex;
   align-items: center;
   border: 1rpx solid #e8e8e8;
   border-radius: 4rpx;
 }
 .num-btn {
   width: 50rpx;
   height: 50rpx;
   background: #f5f5f5;
   display: flex;
   align-items: center;
   justify-content: center;
   font-size: 28rpx;
   color: #666;
   transition: all 0.3s;
 }

 .num-btn.disabled {
   color: #d9d9d9;
   background: #f5f5f5;
 }

 .num-text {
   width: 60rpx;
   text-align: center;
   font-size: 28rpx;
   border-left: 1rpx solid #e8e8e8;
   border-right: 1rpx solid #e8e8e8;
 }

 /* 按钮样式 */
 .buy-now-btn {
   height: 88rpx;
   border-radius: 44rpx;
   display: flex;
   align-items: center;
   justify-content: center;
   font-size: 32rpx;
   font-weight: 500;
   margin-bottom: 16rpx;
   transition: all 0.3s;
   background: #ff6b35;
   color: #fff;
 }

 .buy-now-btn:active {
   background: #ff5a3d;
 }

 /* 商品详情 */
 .detail-section {
   background: #fff;
   margin-top: 10rpx;
   padding: 30rpx;
 }
 .title {
   font-size: 30rpx;
   font-weight: bold;
   color: #333;
   margin-bottom: 20rpx;
 }
 .param-item {
   display: flex;
   padding: 16rpx 0;
   border-bottom: 1rpx solid #f5f5f5;
   font-size: 26rpx;
 }
 .label {
   width: 140rpx;
   color: #999;
 }
 .value {
  flex: 1;
  color: #333;
}

/* 查看全部按钮 */
.toggle-btn {
  text-align: center;
  color: #999;
  font-size: 28rpx;
  padding: 20rpx 0;
  margin-top: 10rpx;
  border-top: 1rpx solid #f5f5f5;
  cursor: pointer;
}

.toggle-btn:active {
  background-color: #f5f5f5;
}

.price-icon {
  margin-right: 8rpx;
  font-size: 28rpx;
  vertical-align: middle;
}

/* 底部 */
 .bottom-space {
   height: 120rpx;
 }
 
 /* 底部结算栏 */
 .submit-bar {
   position: fixed;
   left: 0;
   right: 0;
   bottom: 0;
   height: 100rpx;
   background: #fff;
   display: flex;
   align-items: center;
   justify-content: space-between;
   padding: 0 30rpx;
   box-shadow: 0 -2rpx 10rpx rgba(0,0,0,0.05);
   z-index: 999;
 }
 
 .submit-content {
   flex: 1;
   display: flex;
   align-items: center;
 }
 
 .cart-icon {
   position: relative;
   width: 80rpx;
   height: 80rpx;
   margin-right: 20rpx;
   display: flex;
   align-items: center;
   justify-content: center;
 }
 
 .cart-img {
   width: 100%;
   height: 100%;
   opacity: 0.4;
 }
 
 .cart-icon.active .cart-img {
   opacity: 1;
   animation: pulse 0.5s ease-in-out;
 }
 
 @keyframes pulse {
   0% {
     transform: scale(1);
   }
   50% {
     transform: scale(1.1);
   }
   100% {
     transform: scale(1);
   }
 }
 
 .cart-badge {
   position: absolute;
   top: -8rpx;
   right: -8rpx;
   min-width: 36rpx;
   height: 36rpx;
   background: #ff4d4f;
   color: #fff;
   font-size: 22rpx;
   border-radius: 18rpx;
   display: flex;
   align-items: center;
   justify-content: center;
   padding: 0 10rpx;
 }
 
 .price-info {
   flex: 1;
 }
 
 .price-row {
   display: flex;
   align-items: baseline;
   gap: 16rpx;
 }
 
 .total {
   font-size: 40rpx;
   font-weight: bold;
   color: #333;
 }
 
 .delivery-fee {
   font-size: 24rpx;
   color: #999;
 }
 
 .empty-tip {
   font-size: 28rpx;
   color: #999;
 }
 
 .btn-settle {
   min-width: 180rpx;
   height: 72rpx;
   background: #ff6b35;
   color: #fff;
   font-size: 28rpx;
   font-weight: bold;
   border-radius: 8rpx;
   display: flex;
   align-items: center;
   justify-content: center;
   transition: all 0.3s;
 }
 
 .btn-settle:active {
   transform: scale(0.95);
 }
 
 .btn-settle.disabled {
   background: #ccc;
   cursor: not-allowed;
 }

 .btn-settle.store-closed-btn {
   background: #999;
   color: #fff;
 }

 .submit-bar.store-closed .cart-icon.disabled .cart-img {
   opacity: 0.3;
 }

 .submit-bar.store-closed .total.disabled,
 .submit-bar.store-closed .empty-tip.disabled {
   color: #999;
 }

 /* 门店休息提示条（淘宝闪购风格） */
 .store-closed-notice {
   background: #fff8f0;
   padding: 20rpx 30rpx;
   display: flex;
   align-items: center;
   gap: 12rpx;
   margin-bottom: 10rpx;
   border-top: 1rpx solid #fff1e6;
   border-bottom: 1rpx solid #fff1e6;
 }

 .store-closed-notice .notice-text {
   font-size: 26rpx;
   color: #ff4d4f;
 }

 .add-cart-btn.disabled {
   background: #f5f5f5;
   color: #999;
 }

 /* 加入购物车动画 */
 .add-cart-animation {
   pointer-events: none;
 }

 /* 购物车弹窗 */
 .cart-overlay {
   position: fixed;
   top: 0;
   left: 0;
   right: 0;
   bottom: 0;
   background: rgba(0, 0, 0, 0.5);
   z-index: 998;
 }

 .cart-popup-taobao {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 100rpx;
    background: #fff;
    border-radius: 20rpx 20rpx 0 0;
    max-height: 60vh;
    box-shadow: 0 -4rpx 20rpx rgba(0,0,0,0.1);
    animation: slideUpCart 0.3s ease-out;
    z-index: 998;
    overflow: hidden;
  }

 .cart-header {
   display: flex;
   justify-content: space-between;
   align-items: center;
   padding: 30rpx;
   border-bottom: 1rpx solid #eee;
 }

 .cart-header-left {
   display: flex;
   align-items: center;
   gap: 16rpx;
 }

 .header-title {
   font-size: 30rpx;
   font-weight: bold;
   color: #333;
 }

 .cart-total {
   font-size: 24rpx;
   color: #999;
 }

 .clear-btn {
   display: flex;
   align-items: center;
   gap: 8rpx;
   font-size: 24rpx;
   color: #999;
 }

 .cart-list {
   padding: 0 30rpx;
   max-height: 50vh;
   overflow-y: auto;
 }

 .cart-item {
   display: flex;
   align-items: center;
   padding: 24rpx 0;
   border-bottom: 1rpx solid #f5f5f5;
 }

 .item-img {
   width: 100rpx;
   height: 100rpx;
   border-radius: 8rpx;
   margin-right: 20rpx;
 }

 .item-info {
   flex: 1;
   display: flex;
   flex-direction: column;
   gap: 8rpx;
 }

 .item-name {
   font-size: 28rpx;
   color: #333;
   font-weight: bold;
 }

 .item-spec {
   font-size: 24rpx;
   color: #999;
 }

 .item-price {
   font-size: 28rpx;
   color: #ff6b35;
   font-weight: bold;
 }

 .item-stepper {
   display: flex;
   align-items: center;
   gap: 16rpx;
 }

 .btn-minus, .btn-plus {
   width: 48rpx;
   height: 48rpx;
   border-radius: 50%;
   display: flex;
   align-items: center;
   justify-content: center;
   font-size: 32rpx;
 }

 .btn-minus {
   border: 2rpx solid #e0e0e0;
   color: #666;
 }

 .btn-plus {
   background: #ff6b35;
   color: #fff;
 }

 .stepper-num {
   min-width: 40rpx;
   text-align: center;
   font-size: 28rpx;
   font-weight: bold;
 }

 /* 购物车打开时的样式 */
 .submit-bar.cart-open {
   transform: translateY(0);
 }

 .submit-bar.cart-open .submit-content {
   z-index: 1000;
 }

 /* 规格弹窗 */
 .spec-popup {
   position: fixed;
   left: 0;
   top: 0;
   right: 0;
   bottom: 0;
   z-index: 999;
   display: flex;
   align-items: flex-end;
 }
 .mask {
   position: absolute;
   left: 0;
   top: 0;
   right: 0;
   bottom: 0;
   background: rgba(0,0,0,0.6);
 }
 .popup {
   background: #fff;
   border-radius: 24rpx 24rpx 0 0;
   width: 100%;
   max-height: 70vh;
   position: relative;
   animation: up 0.3s ease;
 }
 @keyframes up {
   from {transform: translateY(100%);}
   to {transform: translateY(0);}
 }
 .popup-header {
   display: flex;
   padding: 30rpx;
   position: relative;
 }
 .pop-img {
   width: 160rpx;
   height: 160rpx;
   border-radius: 12rpx;
   margin-right: 20rpx;
 }
 .pop-info {
   flex: 1;
   display: flex;
   flex-direction: column;
   justify-content: center;
 }
 .pop-price {
   font-size: 40rpx;
   color: #ff6b35;
   font-weight: bold;
   margin-bottom: 10rpx;
 }
 .close {
   position: absolute;
   right: 30rpx;
   top: 30rpx;
   font-size: 40rpx;
   color: #999;
 }
 .popup-body {
   padding: 0 30rpx;
   max-height: 40vh;
 }
 .attr-group {
   margin-bottom: 30rpx;
 }
 .attr-title {
   font-size: 28rpx;
   font-weight: bold;
   margin-bottom: 20rpx;
 }
 .options {
   display: flex;
   flex-wrap: wrap;
   gap: 16rpx;
 }
 .option {
   padding: 14rpx 28rpx;
   background: #f5f5f5;
   border-radius: 8rpx;
   font-size: 26rpx;
   border: 2rpx solid transparent;
 }
 .option.active {
   background: #fff0f2;
   color: #ff6b35;
   border-color: #ff6b35;
 }
 .popup-footer {
   padding: 20rpx 30rpx;
 }
 .btn-confirm {
   width: 100%;
   height: 80rpx;
   background: #ff6b35;
   color: #fff;
   border-radius: 40rpx;
   display: flex;
   align-items: center;
   justify-content: center;
   font-size: 30rpx;
 }
 </style>
