<template>
  <image-gallery :imageItems="popularImages.data" :authenticated="auth.authenticated"></image-gallery>
</template>

<script>
import ImageGallery from '@/components/ImageGallery'
import { mapState } from 'vuex'

export default {
  name: 'Popular',
  components: {
    'image-gallery': ImageGallery
  },
  computed: {
    ...mapState({
      popularImages: state => state.images.popular,
      auth: state => state.auth
    })
  },
  created () {
    this.$store.dispatch('checkAuthenticated')
    this.$store.dispatch('fetchRecents')
  }
}
</script>
