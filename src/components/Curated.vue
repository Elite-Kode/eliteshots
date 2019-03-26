<template>
  <image-gallery :imageItems="curatedImages.data" :page="currentPage"
                 :totalPages=curatedImages.pageCount @pageChange="onPageChange"
                 :authenticated="auth.authenticated"></image-gallery>
</template>

<script>
import ImageGallery from '@/components/ImageGallery'
import { mapState } from 'vuex'

export default {
  name: 'Curated',
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
      curatedImages: state => state.images.curated,
      auth: state => state.auth
    })
  },
  created () {
    if (this.$router.currentRoute.name === 'curated-page') {
      this.currentPage = parseInt(this.$router.currentRoute.params.pageNumber)
    }
    this.$store.dispatch('checkAuthenticated')
    this.$store.dispatch('fetchCurated', this.currentPage)
  },
  methods: {
    onPageChange (page) {
      this.$router.push({ name: 'curated-page', params: { pageNumber: page } })
      this.currentPage = page
      this.$store.dispatch('fetchCurated', this.currentPage)
    }
  }
}
</script>
