<template>
  <image-gallery :imageItems="recentImages"
                 :loading="loadingNewImages"
                 :end="recentImagesEnd"
                 @imageViewed="onClickThumbnail"
                 @imageLiked="onClickLike"
                 @imageSaved="onClickSave"
                 @fetchImages="onFetchImages"
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
      loadingNewImages: false
    }
  },
  computed: {
    ...mapState({
      recentImages: state => state.images.recents,
      recentImagesEnd: state => state.images.recentsEnd,
      auth: state => state.auth
    })
  },
  created () {
    this.$store.dispatch('checkAuthenticated')
  },
  methods: {
    onClickThumbnail (image) {
      this.$store.dispatch('triggerImageViewed', image)
    },
    onClickLike (image) {
      this.$store.dispatch('triggerImageLiked', image)
    },
    onClickSave (image) {
      this.$store.dispatch('triggerImageSaved', image)
    },
    async onFetchImages () {
      this.loadingNewImages = true
      if (this.recentImages && this.recentImages.length > 0) {
        await this.$store.dispatch('fetchRecents', this.recentImages[this.recentImages.length - 1].uploaded_at)
        this.loadingNewImages = false
      } else {
        await this.$store.dispatch('fetchRecents', null)
        this.loadingNewImages = false
      }
    }
  }
}
</script>
