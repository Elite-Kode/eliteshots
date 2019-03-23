<template>
  <image-gallery :imageItems="recentImages.data" :authenticated="auth.authenticated"></image-gallery>
</template>

<script>
import ImageGallery from '@/components/ImageGallery'
import { mapState } from 'vuex'

export default {
  name: 'Recents',
  components: {
    'image-gallery': ImageGallery
  },
  computed: {
    ...mapState({
      recentImages: state => state.images.recents,
      auth: state => state.auth
    })
  },
  created () {
    this.$store.dispatch('checkAuthenticated')
    this.$store.dispatch('fetchRecents')
  }
}
</script>
