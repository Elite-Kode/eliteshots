<template>
  <image-gallery :imageItems="recentImages.data" :page="currentPage"
                 :totalPages=recentImages.pageCount @pageChange="onPageChange"
                 :authenticated="auth.authenticated"></image-gallery>
</template>

<script>
import ImageGallery from '@/components/ImageGallery'
import { mapState } from 'vuex'

export default {
  name: 'Recents',
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
      recentImages: state => state.images.recents,
      auth: state => state.auth
    })
  },
  created () {
    if (this.$router.currentRoute.name === 'recents-page') {
      this.currentPage = parseInt(this.$router.currentRoute.params.pageNumber)
    }
    this.$store.dispatch('checkAuthenticated')
    this.$store.dispatch('fetchRecents', this.currentPage)
  },
  methods: {
    onPageChange (page) {
      this.$router.push({ name: 'recents-page', params: { pageNumber: page } })
      this.currentPage = page
      this.$store.dispatch('fetchRecents', this.currentPage)
    }
  }
}
</script>
