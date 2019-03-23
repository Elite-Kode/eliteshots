<template>
  <image-gallery :imageItems="curatedImages.data" :authenticated="auth.authenticated"></image-gallery>
</template>

<script>
import ImageGallery from '@/components/ImageGallery'
import { mapState } from 'vuex'

export default {
  name: 'Curated',
  components: {
    'image-gallery': ImageGallery
  },
  computed: {
    ...mapState({
      curatedImages: state => state.images.curated,
      auth: state => state.auth
    })
  },
  created () {
    this.$store.dispatch('checkAuthenticated')
    this.$store.dispatch('fetchCurated')
  }
}
</script>
