<template>
  <image-gallery :imageItems="popularImages"
                 :loading="loadingNewImages"
                 :end="popularImagesEnd"
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
  name: 'Popular',
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
      popularImages: state => state.images.popular,
      popularImagesEnd: state => state.images.popularEnd,
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
      if (this.popularImages && this.popularImages.length > 0) {
        await this.$store.dispatch('fetchPopular', this.popularImages[this.popularImages.length - 1].score)
        this.loadingNewImages = false
      } else {
        await this.$store.dispatch('fetchPopular', null)
        this.loadingNewImages = false
      }
    }
  }
}
</script>
