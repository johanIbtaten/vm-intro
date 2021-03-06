var eventBus = new Vue()

Vue.component('product', {
    props: {
      premium: {
        type: Boolean,
        required: true
      }
    },
    template: `
     <div class="product">
          
        <div class="product-image">
          <img :src="image" />
        </div>
  
        <div class="product-info">
            <h1>{{ product }}</h1>
            <p v-show="onSale">{{ onSalePrint }}</p>
            <p>{{ description }}<span v-if="onSale"> / On Sale !</span></p>
            <a :href="link">Link</a>
            <ul>
              <li v-for="(size) in sizes" :key="size">{{ size }}</li>
              <li v-for="n in 3" >Loop</li>
            </ul>
            <p v-if="inStock">In Stock</p>
            <p v-else :class="{lineThrough: !inStock}">Out of Stock</p>
  
            <info-tabs :shipping="shipping" :details="details"></info-tabs>
  
            <div class="color-box"
                 v-for="(variant, index) in variants" 
                 :key="variant.variantId"
                 :style="{ backgroundColor: variant.variantColor }"
                 @mouseover="updateProduct(index)"
                 >
            </div> 
  
            <button 
              v-on:click="addToCart" 
              :disabled="!inStock"
              :class="{ disabledButton: !inStock }"
            >
              Add to cart
            </button>

            <button 
              @click="removeFromCart" 
              v-show="inStock"
            >
              Remove from cart
            </button>
  
         </div> 

         <product-tabs :reviews="reviews" id="product-tab"></product-tabs>
      
      </div>
     `,
    data() {
      return {
          product: 'Socks',
          description: 'A pair of warm, fuzzy socks',
          link: '#product-tab',
          onSale: true,
          sizes: ['S', 'M', 'L'],
          onSale: true,
          brand: 'Vue Mastery',
          selectedVariant: 0,
          details: ['80% cotton', '20% polyester', 'Gender-neutral'],
          variants: [
            {
              variantId: 2234,
              variantColor: 'green',
              variantImage: 'https://www.vuemastery.com/images/challenges/vmSocks-green-onWhite.jpg',
              variantQuantity: 10     
            },
            {
              variantId: 2235,
              variantColor: 'blue',
              variantImage: 'https://www.vuemastery.com/images/challenges/vmSocks-blue-onWhite.jpg',
              variantQuantity: 0     
            }
          ],
          reviews: []
      }
    },
      methods: {
        addToCart() {
            this.$emit('add-to-cart', this.variants[this.selectedVariant].variantId)
        },
        removeFromCart() {
          this.$emit('remove-from-cart', this.variants[this.selectedVariant].variantId)
        },
        updateProduct(index) {  
            this.selectedVariant = index
        }
      },
      computed: {
          title() {
              return this.brand + ' ' + this.product  
          },
          image(){
              return this.variants[this.selectedVariant].variantImage
          },
          inStock(){
              return this.variants[this.selectedVariant].variantQuantity
          },
          shipping() {
            if (this.premium) {
              return "Free"
            }
              return 2.99
          },
          onSalePrint() {
            return this.brand + ' ' + this.product + ' onSale'
          },
      },
      mounted() {
        eventBus.$on('review-submitted', productReview => {
          this.reviews.push(productReview)
        })
      }
  })


  Vue.component('product-review', {
    template: `
    <form class="review-form" @submit.prevent="onSubmit">

      <p>
        <label for="name">Name:</label>
        <input id="name" v-model="name">
      </p>

      <p>
        <label for="review">Review:</label>      
        <textarea id="review" v-model="review"></textarea>
      </p>

      <p>
        <label for="rating">Rating:</label>
        <select id="rating" v-model.number="rating">
          <option>5</option>
          <option>4</option>
          <option>3</option>
          <option>2</option>
          <option>1</option>
        </select>
      </p>

      <div class="recommendation">
        <p>Would you recommend this product ?</p>
        <div>
          <input type="radio" id="yes" value="yes" v-model="recommendation">
          <label for="yes">Yes</label>        
        </div>
        <div>
          <input type="radio" id="no" value="no" v-model="recommendation">
          <label for="no">No</label>
        </div>
      </div>
      <p>
        <input type="submit" value="Submit">  
      </p>    
  
    </form>
    `,
    data() {
      return {
        name: null,
        review: null,
        rating: null,
        recommendation: 'yes',
        errors: []
      }
    },
    methods: {
      onSubmit() {
        this.errors = []
        if (this.name && this.review && this.rating) {
          let productReview = {
            name: this.name,
            review: this.review,
            rating: this.rating
          }
          eventBus.$emit('review-submitted', productReview)
          this.name = null
          this.review = null
          this.rating = null
        }
        else {
          if(!this.name) this.errors.push("Name required.")
          if(!this.review) this.errors.push("Review required.")
          if(!this.rating) this.errors.push("Rating required.")
        }
      }
    }
  })

  Vue.component('product-tabs', {
    props: {
      reviews: {
        type: Array,
        required: false
      }
    },
    template: `
      <div>
      
        <ul>
          <span class="tabs" 
                :class="{ activeTab: selectedTab === tab }"
                v-for="(tab, index) in tabs"
                @click="selectedTab = tab"
                :key="tab"
          >{{ tab }}</span>
        </ul>

        <div v-show="selectedTab === 'Reviews'">
            <p v-if="!reviews.length">There are no reviews yet.</p>
            <ul v-else>
                <li v-for="(review, index) in reviews" :key="index">
                  <p>{{ review.name }}</p>
                  <p>Rating:{{ review.rating }}</p>
                  <p>{{ review.review }}</p>
                </li>
            </ul>
        </div>

        <div v-show="selectedTab === 'Make a Review'">
          <product-review></product-review>
        </div>
    
      </div>
    `,
    data() {
      return {
        tabs: ['Reviews', 'Make a Review'],
        selectedTab: 'Reviews'
      }
    }
  })

  Vue.component('info-tabs', {
    props: {
      shipping: {
        required: true
      },
      details: {
        type: Array,
        required: true
      }
    },
    template: `
      <div>
      
        <ul>
          <span class="tabs" 
                :class="{ activeTab: selectedTab === tab }"
                v-for="(tab, index) in tabs"
                @click="selectedTab = tab"
                :key="tab"
          >{{ tab }}</span>
        </ul>

        <div v-show="selectedTab === 'Shipping'">
          <p>{{ shipping }}</p>
        </div>

        <div v-show="selectedTab === 'Details'">
          <product-details :details="details"></product-details>          
        </div>
    
      </div>
    `,
    data() {
      return {
        tabs: ['Shipping', 'Details'],
        selectedTab: 'Shipping'
      }
    }
  })

  Vue.component('product-details', {
    props: {
      details: {
        type: Array,
        required: true
      }
    },
    template: `
      <ul>
        <li v-for="detail in details">{{ detail }}</li>
      </ul>
    `
  })
  
  var app = new Vue({
      el: '#app',
      data: {
        premium: true,
        cart: []
      },
      methods: {
        updateCart(id) {
          this.cart.push(id)
        },
        removeItemCart(id) {
          if (this.cart.indexOf(id) != -1) { 
            this.cart.splice(this.cart.indexOf(id), 1) 
          }             
        }
      }
  })