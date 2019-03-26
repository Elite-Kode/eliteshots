<template>
  <image-gallery :imageItems="popularImages.data" :page="currentPage"
                 :totalPages=popularImages.pageCount @pageChange="onPageChange"
                 :authenticated="auth.authenticated"></image-gallery>
</template>

<script>
import ImageGallery from '@/components/ImageGallery'
import { mapState } from 'vuex'

export default {
  name: 'Popular',
  components: {
    'image-gallery': ImageGallery
  },
  data () {
    return {
      currentPage: 1
    }
  },
  computed: {
    ...mapState({
      popularImages: state => state.images.popular,
      auth: state => state.auth
    })
  },
  created () {
    if (this.$router.currentRoute.name === 'popular-page') {
      this.currentPage = parseInt(this.$router.currentRoute.params.pageNumber)
    }
    this.$store.dispatch('checkAuthenticated')
    this.$store.dispatch('fetchPopular', this.currentPage)
  },
  methods: {
    onPageChange (page) {
      this.$router.push({ name: 'popular-page', params: { pageNumber: page } })
      this.currentPage = page
      this.$store.dispatch('fetchPopular', this.currentPage)
    }
  }
}
</script>
